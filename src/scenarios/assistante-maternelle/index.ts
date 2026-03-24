import {
  type CmgAssmatComputed,
  computeCmgAssmatEmploiDirectMonthly,
} from "../../shared/cmg-assmat-emploi-direct";
import {
  computeCreditGardeHorsDomicileAnnual,
  readCreditGardeHorsDomicileParams,
} from "../../shared/credit-garde-hors-domicile";
import { getRulePack } from "../../shared/load-rules";
import type { ScenarioResultBase } from "../types";

/**
 * Coût employeur mensuel (salaire + cotisations) pour la garde chez l’assistante maternelle agréée.
 * CMG : soit saisie (`monthlyCmgPaidEur`), soit calculée si `monthlyHouseholdIncomeForCmgEur` est fourni.
 */
export type AssistanteMaternelleInput = {
  monthlyEmploymentCostEur?: number;
  monthlyHouseholdIncomeForCmgEur?: number;
  householdChildRank?: number;
  monthlyCmgPaidEur?: number;
  childrenCount?: number;
  custody?: "full" | "shared";
};

export type AssistanteMaternelleTrace = {
  monthlyEmploymentCostEur: number;
  monthlyCmgEur: number;
  cmgSource: "saisie" | "calcul_pack";
  cmgDetail?: CmgAssmatComputed;
  annualEligibleExpenseForCreditEur: number;
  annualCreditGardeHorsDomicileEur: number;
  monthlyCreditEquivalentEur: number;
  netMonthlyCashAfterCmgEur: number;
  netMonthlyBurdenAfterCreditEur: number;
};

export type AssistanteMaternelleResult = ScenarioResultBase & {
  scenarioSlug: "assistante-maternelle";
  trace?: AssistanteMaternelleTrace;
};

export function computeAssistanteMaternelle(
  input: AssistanteMaternelleInput,
): AssistanteMaternelleResult {
  const pack = getRulePack();
  const meta = { rulePackVersion: pack.version, effectiveFrom: pack.effectiveFrom };

  const rawCost = input.monthlyEmploymentCostEur;
  if (rawCost === undefined || rawCost === null || Number.isNaN(rawCost)) {
    return {
      scenarioSlug: "assistante-maternelle",
      status: "stub",
      notes: [
        "Saisir `monthlyEmploymentCostEur` (coût employeur mensuel : salaire + cotisations) et soit `monthlyCmgPaidEur`, soit `monthlyHouseholdIncomeForCmgEur` pour calculer le CMG.",
      ],
      meta,
    };
  }
  if (rawCost < 0) {
    return {
      scenarioSlug: "assistante-maternelle",
      status: "stub",
      notes: ["`monthlyEmploymentCostEur` doit être ≥ 0."],
      meta,
    };
  }

  const monthlyEmploymentCostEur = rawCost;
  const childrenCount = Math.max(1, Math.floor(input.childrenCount ?? 1));
  const custody = input.custody === "shared" ? "shared" : "full";
  const rank = Math.max(1, Math.floor(input.householdChildRank ?? 1));

  const hasExplicitCmg =
    input.monthlyCmgPaidEur !== undefined &&
    input.monthlyCmgPaidEur !== null &&
    !Number.isNaN(input.monthlyCmgPaidEur);
  const hasIncomeForFormula =
    input.monthlyHouseholdIncomeForCmgEur !== undefined &&
    input.monthlyHouseholdIncomeForCmgEur !== null &&
    !Number.isNaN(input.monthlyHouseholdIncomeForCmgEur);

  if (!hasExplicitCmg && !hasIncomeForFormula) {
    return {
      scenarioSlug: "assistante-maternelle",
      status: "stub",
      notes: [
        "Pour un calcul partiel : fournir `monthlyCmgPaidEur` (avis CAF) **ou** `monthlyHouseholdIncomeForCmgEur` pour appliquer la formule du pack (CMG emploi direct assmat).",
      ],
      meta,
    };
  }

  let monthlyCmgEur = 0;
  let cmgSource: "saisie" | "calcul_pack" = "saisie";
  let cmgDetail: CmgAssmatComputed | undefined;

  if (hasExplicitCmg) {
    monthlyCmgEur = Math.max(0, input.monthlyCmgPaidEur!);
    cmgSource = "saisie";
  } else {
    const computed = computeCmgAssmatEmploiDirectMonthly(pack, {
      monthlyHouseholdIncomeEur: input.monthlyHouseholdIncomeForCmgEur!,
      monthlyCostOfCareEur: monthlyEmploymentCostEur,
      householdChildRank: rank,
    });
    if (!computed) {
      return {
        scenarioSlug: "assistante-maternelle",
        status: "stub",
        notes: [
          "Règle `cmg-emploi-direct-assistante-maternelle-2026-04` introuvable dans le pack.",
        ],
        meta,
      };
    }
    monthlyCmgEur = computed.monthlyCmgEur;
    cmgSource = "calcul_pack";
    cmgDetail = computed;
  }

  const creditParams = readCreditGardeHorsDomicileParams(pack);
  const creditAnnual = creditParams
    ? computeCreditGardeHorsDomicileAnnual(creditParams, {
        monthlyParticipationEur: monthlyEmploymentCostEur,
        monthlyCmgEur: monthlyCmgEur,
        childrenCount,
        custody,
      })
    : { annualEligibleExpenseEur: 0, annualCreditEur: 0 };

  const monthlyCreditEquivalentEur = creditAnnual.annualCreditEur / 12;
  const netMonthlyCashAfterCmgEur = monthlyEmploymentCostEur - monthlyCmgEur;
  const netMonthlyBurdenAfterCreditEur = netMonthlyCashAfterCmgEur - monthlyCreditEquivalentEur;

  const notes: string[] = [
    "Garde chez une assistante maternelle agréée : crédit d’impôt **frais de garde hors du domicile** (CGI art. 200 quater B), pas le crédit emploi à domicile — aligné BOFiP / Service-Public pour ce mode.",
    "Calcul partiel : plafonds salaire / indemnités d’entretien et non-cumuls (PreParE, etc.) ne sont pas tous intégrés — voir pack et `docs/research/`.",
  ];
  if (!creditParams) {
    notes.push(
      "Avertissement : règle `credit-impot-garde-hors-domicile` absente du pack — crédit d’impôt à 0.",
    );
  }

  return {
    scenarioSlug: "assistante-maternelle",
    status: "partial",
    notes,
    meta,
    trace: {
      monthlyEmploymentCostEur,
      monthlyCmgEur,
      cmgSource,
      cmgDetail: cmgDetail ?? undefined,
      annualEligibleExpenseForCreditEur: creditAnnual.annualEligibleExpenseEur,
      annualCreditGardeHorsDomicileEur: creditAnnual.annualCreditEur,
      monthlyCreditEquivalentEur,
      netMonthlyCashAfterCmgEur,
      netMonthlyBurdenAfterCreditEur,
    },
  };
}
