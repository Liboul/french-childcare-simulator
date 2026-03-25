import {
  type CmgAssmatComputed,
  computeCmgAssmatEmploiDirectMonthly,
} from "../../shared/cmg-assmat-emploi-direct";
import { appendCreditVsIrSatellite } from "../../shared/credit-vs-ir-brut";
import type { CreditVsIrBrutSatellite } from "../../shared/credit-vs-ir-brut";
import {
  isExplicitMonthlyCmgProvided,
  isIncomeProvidedForCmgFormula,
  resolveCmgFromEmploymentInput,
} from "../../shared/cmg-from-employment-input";
import {
  computeCreditGardeHorsDomicileAnnual,
  readCreditGardeHorsDomicileParams,
} from "../../shared/credit-garde-hors-domicile";
import {
  normalizeChildrenCountForCredit,
  normalizeCustody,
  normalizeHouseholdChildRank,
} from "../../shared/household";
import { appendCesuPrefinanceCmgCompatibilityNotes } from "../../shared/cesu-cmg-compatibility-notes";
import { getRulePack } from "../../shared/load-rules";
import { monthlyCashflowAfterAides } from "../../shared/monthly-cashflow-after-aides";
import type { ScenarioResultBase } from "../types";

/**
 * Coût employeur mensuel (salaire + cotisations) pour la garde chez l’assistante maternelle agréée.
 * CMG : soit saisie (`monthlyCmgPaidEur`), soit calculée si `monthlyHouseholdIncomeForCmgEur` est fourni (saisie prioritaire si les deux sont renseignés).
 */
export type AssistanteMaternelleInput = {
  /** Coût employeur mensuel (salaire + cotisations) — même assiette approximative pour CMG pack et crédit F8 ; voir `params.md`. */
  monthlyEmploymentCostEur?: number;
  monthlyHouseholdIncomeForCmgEur?: number;
  householdChildRank?: number;
  monthlyCmgPaidEur?: number;
  /** Plafonds crédit F8 : enfants pour lesquels ces dépenses ouvrent le plafond (≠ obligatoirement tous les enfants du foyer). */
  childrenCount?: number;
  custody?: "full" | "shared";
  revenuNetImposableEur?: number;
  nombreParts?: number;
  /** CESU préfinancé employeur (information) — interaction CMG : voir règle pack si CMG > 0. */
  prefinancedCesuEmployerUses?: boolean;
  monthlyAncillaryCostsEur?: number;
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
  creditVsIrBrutSatellite?: CreditVsIrBrutSatellite;
  monthlyAncillaryCostsEur: number;
  estimatedMonthlyHouseholdCashOutEur: number;
  /** Présent si l’utilisateur a répondu sur le CESU préfinancé employeur (alerte non-cumul CMG). */
  prefinancedCesuEmployerUses?: boolean;
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
  const childrenCount = normalizeChildrenCountForCredit(input.childrenCount);
  const custody = normalizeCustody(input.custody);
  const rank = normalizeHouseholdChildRank(input.householdChildRank);

  const resolved = resolveCmgFromEmploymentInput({
    monthlyCmgPaidEur: input.monthlyCmgPaidEur,
    monthlyHouseholdIncomeForCmgEur: input.monthlyHouseholdIncomeForCmgEur,
    monthlyEmploymentCostEur,
    householdChildRank: rank,
    computeFromPack: (args) => computeCmgAssmatEmploiDirectMonthly(pack, args),
  });
  if (resolved === null) {
    return {
      scenarioSlug: "assistante-maternelle",
      status: "stub",
      notes: [
        "Pour un calcul partiel : fournir `monthlyCmgPaidEur` (avis CAF) **ou** `monthlyHouseholdIncomeForCmgEur` pour appliquer la formule du pack (CMG emploi direct assmat).",
      ],
      meta,
    };
  }
  if (resolved.kind === "missing_rule") {
    return {
      scenarioSlug: "assistante-maternelle",
      status: "stub",
      notes: ["Règle `cmg-emploi-direct-assistante-maternelle-2026-04` introuvable dans le pack."],
      meta,
    };
  }

  let monthlyCmgEur: number;
  let cmgSource: "saisie" | "calcul_pack";
  let cmgDetail: CmgAssmatComputed | undefined;
  if (resolved.kind === "saisie") {
    monthlyCmgEur = resolved.monthlyCmgEur;
    cmgSource = "saisie";
  } else {
    monthlyCmgEur = resolved.monthlyCmgEur;
    cmgSource = "calcul_pack";
    cmgDetail = resolved.detail;
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

  const { monthlyCreditEquivalentEur, netMonthlyCashAfterCmgEur, netMonthlyBurdenAfterCreditEur } =
    monthlyCashflowAfterAides({
      monthlyGrossCostEur: monthlyEmploymentCostEur,
      monthlyCmgEur,
      annualCreditImpotEur: creditAnnual.annualCreditEur,
    });

  const monthlyAncillaryCostsEur = Math.max(0, input.monthlyAncillaryCostsEur ?? 0);
  const estimatedMonthlyHouseholdCashOutEur = netMonthlyBurdenAfterCreditEur + monthlyAncillaryCostsEur;

  const notes: string[] = [
    "Garde chez une assistante maternelle agréée : crédit d’impôt **frais de garde hors du domicile** (CGI art. 200 quater B), pas le crédit emploi à domicile — aligné BOFiP / Service-Public pour ce mode.",
    "Calcul partiel : plafonds salaire / indemnités d’entretien et non-cumuls (PreParE, etc.) ne sont pas tous intégrés — voir pack et `docs/research/`.",
    "Même montant `monthlyEmploymentCostEur` pour CMG et base F8 (approximation, postes non ventilés) ; taux et `deductCmgFromBase` : règle `credit-impot-garde-hors-domicile` — voir `params.md`.",
  ];
  if (
    isExplicitMonthlyCmgProvided(input.monthlyCmgPaidEur) &&
    isIncomeProvidedForCmgFormula(input.monthlyHouseholdIncomeForCmgEur)
  ) {
    notes.push(
      "CMG saisi et revenu pour barème tous deux fournis : seul le **CMG saisi** est utilisé ; le revenu est ignoré pour le calcul CMG — voir `params.md` (Priorité saisie / revenu).",
    );
  }
  if (!creditParams) {
    notes.push(
      "Avertissement : règle `credit-impot-garde-hors-domicile` absente du pack — crédit d’impôt à 0.",
    );
  }
  notes.push(
    ...appendCesuPrefinanceCmgCompatibilityNotes(pack, {
      prefinancedCesuEmployerUses: input.prefinancedCesuEmployerUses === true,
      monthlyCmgEur,
    }),
  );
  if (monthlyAncillaryCostsEur > 0) {
    notes.push(
      "Frais annexes : effort total mensuel = reste à charge après crédit + `monthlyAncillaryCostsEur`.",
    );
  }

  const { satellite, extraNotes } = appendCreditVsIrSatellite(
    pack,
    creditAnnual.annualCreditEur,
    input,
  );
  if (extraNotes.length > 0) {
    notes.push(...extraNotes);
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
      monthlyAncillaryCostsEur,
      estimatedMonthlyHouseholdCashOutEur,
      ...(input.prefinancedCesuEmployerUses !== undefined
        ? { prefinancedCesuEmployerUses: input.prefinancedCesuEmployerUses === true }
        : {}),
      ...(satellite ? { creditVsIrBrutSatellite: satellite } : {}),
    },
  };
}
