import {
  type CmgGardeDomicileComputed,
  computeCmgGardeDomicileEmploiDirectMonthly,
} from "../../shared/cmg-garde-domicile-emploi-direct";
import {
  computeCreditEmploiDomicileAnnual,
  readCreditEmploiDomicileParams,
} from "../../shared/credit-emploi-domicile";
import { getRulePack } from "../../shared/load-rules";
import type { ScenarioResultBase } from "../types";

/**
 * Garde à domicile par employeur direct (Pajemploi) : CMG « emploi direct garde à domicile »
 * et crédit d’impôt **emploi à domicile** (CGI 199 sexdecies), pas le crédit « garde hors domicile ».
 */
export type NounouDomicileInput = {
  monthlyEmploymentCostEur?: number;
  monthlyHouseholdIncomeForCmgEur?: number;
  householdChildRank?: number;
  monthlyCmgPaidEur?: number;
  /** Enfants pris en compte pour les majorations de plafond du crédit emploi à domicile. */
  childrenCountForCreditCeiling?: number;
  custody?: "full" | "shared";
};

export type NounouDomicileTrace = {
  monthlyEmploymentCostEur: number;
  monthlyCmgEur: number;
  cmgSource: "saisie" | "calcul_pack";
  cmgDetail?: CmgGardeDomicileComputed;
  annualEligibleExpenseForCreditEur: number;
  annualCeilingExpenseForCreditEur: number;
  annualCreditEmploiDomicileEur: number;
  monthlyCreditEquivalentEur: number;
  netMonthlyCashAfterCmgEur: number;
  netMonthlyBurdenAfterCreditEur: number;
};

export type NounouDomicileResult = ScenarioResultBase & {
  scenarioSlug: "nounou-domicile";
  trace?: NounouDomicileTrace;
};

export function computeNounouDomicile(input: NounouDomicileInput): NounouDomicileResult {
  const pack = getRulePack();
  const meta = { rulePackVersion: pack.version, effectiveFrom: pack.effectiveFrom };

  const rawCost = input.monthlyEmploymentCostEur;
  if (rawCost === undefined || rawCost === null || Number.isNaN(rawCost)) {
    return {
      scenarioSlug: "nounou-domicile",
      status: "stub",
      notes: [
        "Saisir `monthlyEmploymentCostEur` (coût employeur mensuel : salaire + cotisations) et soit `monthlyCmgPaidEur`, soit `monthlyHouseholdIncomeForCmgEur` pour le CMG.",
      ],
      meta,
    };
  }
  if (rawCost < 0) {
    return {
      scenarioSlug: "nounou-domicile",
      status: "stub",
      notes: ["`monthlyEmploymentCostEur` doit être ≥ 0."],
      meta,
    };
  }

  const monthlyEmploymentCostEur = rawCost;
  const custody = input.custody === "shared" ? "shared" : "full";
  const rank = Math.max(1, Math.floor(input.householdChildRank ?? 1));
  const childrenCountForCeiling = Math.max(0, Math.floor(input.childrenCountForCreditCeiling ?? 1));

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
      scenarioSlug: "nounou-domicile",
      status: "stub",
      notes: [
        "Pour un calcul partiel : fournir `monthlyCmgPaidEur` **ou** `monthlyHouseholdIncomeForCmgEur` (formule CMG garde à domicile).",
      ],
      meta,
    };
  }

  let monthlyCmgEur = 0;
  let cmgSource: "saisie" | "calcul_pack" = "saisie";
  let cmgDetail: CmgGardeDomicileComputed | undefined;

  if (hasExplicitCmg) {
    monthlyCmgEur = Math.max(0, input.monthlyCmgPaidEur!);
    cmgSource = "saisie";
  } else {
    const computed = computeCmgGardeDomicileEmploiDirectMonthly(pack, {
      monthlyHouseholdIncomeEur: input.monthlyHouseholdIncomeForCmgEur!,
      monthlyCostOfCareEur: monthlyEmploymentCostEur,
      householdChildRank: rank,
    });
    if (!computed) {
      return {
        scenarioSlug: "nounou-domicile",
        status: "stub",
        notes: ["Règle `cmg-emploi-direct-garde-domicile-2026-04` introuvable dans le pack."],
        meta,
      };
    }
    monthlyCmgEur = computed.monthlyCmgEur;
    cmgSource = "calcul_pack";
    cmgDetail = computed;
  }

  const creditParams = readCreditEmploiDomicileParams(pack);
  const creditAnnual = creditParams
    ? computeCreditEmploiDomicileAnnual(creditParams, {
        monthlyEmploymentCostEur: monthlyEmploymentCostEur,
        monthlyCmgEur: monthlyCmgEur,
        childrenCountForCeiling,
        custody,
      })
    : {
        annualEligibleExpenseEur: 0,
        annualCreditEur: 0,
        annualCeilingExpenseEur: 0,
      };

  const monthlyCreditEquivalentEur = creditAnnual.annualCreditEur / 12;
  const netMonthlyCashAfterCmgEur = monthlyEmploymentCostEur - monthlyCmgEur;
  const netMonthlyBurdenAfterCreditEur = netMonthlyCashAfterCmgEur - monthlyCreditEquivalentEur;

  const notes: string[] = [
    "Crédit d’impôt **emploi à domicile** (CGI art. 199 sexdecies) — **non cumulable** avec le crédit « frais de garde hors du domicile » (CGI art. 200 quater B) pour les mêmes dépenses.",
    "Calcul partiel : prise en charge partielle des cotisations (50 % dans le pack CMG) et plafonds détaillés non intégrés ligne à ligne — voir `docs/research/`.",
  ];
  if (!creditParams) {
    notes.push(
      "Avertissement : règle `credit-impot-emploi-domicile-plafonds` absente du pack — crédit d’impôt à 0.",
    );
  }

  return {
    scenarioSlug: "nounou-domicile",
    status: "partial",
    notes,
    meta,
    trace: {
      monthlyEmploymentCostEur,
      monthlyCmgEur,
      cmgSource,
      cmgDetail: cmgDetail ?? undefined,
      annualEligibleExpenseForCreditEur: creditAnnual.annualEligibleExpenseEur,
      annualCeilingExpenseForCreditEur: creditAnnual.annualCeilingExpenseEur,
      annualCreditEmploiDomicileEur: creditAnnual.annualCreditEur,
      monthlyCreditEquivalentEur,
      netMonthlyCashAfterCmgEur,
      netMonthlyBurdenAfterCreditEur,
    },
  };
}
