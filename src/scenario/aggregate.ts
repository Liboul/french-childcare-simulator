import { computeBrutMonthlyCost } from "../childcare/brut-monthly-cost";
import type { RulePack } from "../config/schema";
import { estimateCmgMonthlyEur } from "../family-allowances/cmg/estimate";
import { estimateEmploiDomicileTaxCreditAnnual } from "../tax-credits/emploi-domicile";
import { estimateGardeHorsDomicileTaxCreditAnnual } from "../tax-credits/garde-hors-domicile";
import { taxCreditKindForChildcareMode } from "../tax-credits/types";
import { brutInputReferencedRuleIds } from "../uncertainty/brut-rule-refs";
import { buildUncertaintyReport } from "../uncertainty/report";
import { appendStep, emptyTrace } from "../trace/trace";
import type { ScenarioInput, ScenarioResult, ScenarioTaxCreditContext } from "./types";

const MONTHS_PER_TAX_YEAR = 12;
const EMPLOYER_DELTA_EPSILON_EUR = 0.01;

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function defaultTaxCreditContext(): ScenarioTaxCreditContext {
  return {
    childQualifiesForHorsDomicileCredit: true,
    sharedCustodyHalvedOutsideHomeCeiling: false,
    outsideHomeAnnualEmployerAidDeductibleEur: 0,
    taxUnitDependentChildrenForEmploymentCeiling: 1,
    prefundedCesuAnnualEur: 0,
    sharedCustodyHalvedEmploymentIncrements: false,
  };
}

/**
 * Chaîne brut mensuel → CMG → crédit d’impôt (routé par mode) → reste à charge équivalent.
 * Pas de TMI : le « disponible » repose sur `baselineDisposableIncomeMonthlyEur` fourni par l’appelant.
 */
export function computeScenarioSnapshot(pack: RulePack, input: ScenarioInput): ScenarioResult {
  const warnings: string[] = [];
  warnings.push("scenario_annual_tax_credit_uses_brut_x12_as_eligible_expense_simplification");

  const taxCtx: ScenarioTaxCreditContext = { ...defaultTaxCreditContext(), ...input.taxCredit };

  let trace = emptyTrace();
  let order = 0;

  const brut = computeBrutMonthlyCost(pack, input.household, input.brutInput);
  const monthlyBrutEur = brut.monthlyBrutEur;
  const annualBrutEur = round2(monthlyBrutEur * MONTHS_PER_TAX_YEAR);

  order += 1;
  trace = appendStep(trace, {
    id: "scenario_brut_monthly",
    segment: "childcare",
    order,
    label: "Coût brut mensuel du mode de garde",
    formula: "Σ lignes coût (salaire, cotisations, participation…)",
    narrative:
      "Montant hors aides publiques et hors impôt ; annualisation ×12 pour alignement crédit d’impôt.",
    sources: [],
  });

  const cmgReq = { ...input.cmg, mode: input.brutInput.mode };
  const cmg = estimateCmgMonthlyEur(pack, cmgReq);
  const monthlyCmgEur = cmg.monthlyCmgEur;
  const annualCmgEur = round2(monthlyCmgEur * MONTHS_PER_TAX_YEAR);
  warnings.push(...cmg.warnings);

  order += 1;
  trace = appendStep(trace, {
    id: "scenario_cmg",
    segment: "family_allowances",
    order,
    label: "CMG (estimation)",
    formula: "estimateCmgMonthlyEur × 12",
    ruleId: cmg.ruleIds[0],
    narrative: `Statut CMG : ${cmg.status}.`,
    sources: [],
  });

  const kind = taxCreditKindForChildcareMode(input.brutInput.mode);
  let annualTaxCreditEur = 0;
  let taxRuleIds: string[] = [];

  if (kind === "garde_hors_domicile") {
    const tc = estimateGardeHorsDomicileTaxCreditAnnual(pack, [
      {
        annualEligiblePaidExpensesEur: annualBrutEur,
        annualCmgReceivedEur: annualCmgEur,
        annualEmployerAidDeductibleFromBaseEur: taxCtx.outsideHomeAnnualEmployerAidDeductibleEur,
        sharedCustodyHalvedCeiling: taxCtx.sharedCustodyHalvedOutsideHomeCeiling,
        qualifiesAgeAndCharge: taxCtx.childQualifiesForHorsDomicileCredit,
      },
    ]);
    annualTaxCreditEur = tc.totalCreditEur;
    taxRuleIds = tc.ruleIds;
    warnings.push(...tc.warnings);
  } else if (kind === "emploi_domicile") {
    const tc = estimateEmploiDomicileTaxCreditAnnual(pack, {
      annualQualifyingExpensesEur: annualBrutEur,
      taxUnitDependentChildrenCount: taxCtx.taxUnitDependentChildrenForEmploymentCeiling,
      prefundedCesuAnnualEur: taxCtx.prefundedCesuAnnualEur,
      sharedCustodyHalvedIncrements: taxCtx.sharedCustodyHalvedEmploymentIncrements,
    });
    annualTaxCreditEur = tc.creditEur;
    taxRuleIds = tc.ruleIds;
    warnings.push(...tc.warnings);
  }

  order += 1;
  trace = appendStep(trace, {
    id: "scenario_tax_credit",
    segment: "tax_credits",
    order,
    label: "Crédit d'impôt annuel (estimation)",
    formula:
      kind === "garde_hors_domicile"
        ? "estimateGardeHorsDomicileTaxCreditAnnual"
        : "estimateEmploiDomicileTaxCreditAnnual",
    narrative: `Routage : ${kind}. Assiette annuelle simplifiée = coût brut annuel.`,
    sources: [],
  });

  const netHouseholdBurdenAnnualEur = round2(
    Math.max(0, annualBrutEur - annualCmgEur - annualTaxCreditEur),
  );
  const netHouseholdBurdenMonthlyEur = round2(netHouseholdBurdenAnnualEur / MONTHS_PER_TAX_YEAR);

  let employerSupportDeltaAnnualEur: number | null = null;
  if (
    input.declaredEmployerChildcareSupportAnnualEur != null &&
    input.referenceEmployerChildcareSupportAnnualEur != null
  ) {
    employerSupportDeltaAnnualEur = round2(
      input.declaredEmployerChildcareSupportAnnualEur -
        input.referenceEmployerChildcareSupportAnnualEur,
    );
    if (Math.abs(employerSupportDeltaAnnualEur) > EMPLOYER_DELTA_EPSILON_EUR) {
      warnings.push("employer_childcare_support_differs_from_reference_scenario");
    }
  }

  const disposableIncomeMonthlyEur =
    input.baselineDisposableIncomeMonthlyEur != null
      ? round2(input.baselineDisposableIncomeMonthlyEur - netHouseholdBurdenMonthlyEur)
      : null;

  order += 1;
  trace = appendStep(trace, {
    id: "scenario_net_burden",
    segment: "summary",
    order,
    label: "Reste à charge équivalent (foyer)",
    formula: "max(0, brut_annuel − CMG_annuel − crédit_impôt_annuel) ; mensuel = ÷12",
    narrative:
      "Crédit d’impôt traité comme allègement monétaire équivalent ; pas d’impôt sur le revenu marginal modélisé ici.",
    sources: [],
  });

  const snapshot = {
    mode: input.brutInput.mode,
    monthlyBrutEur,
    annualBrutEur,
    monthlyCmgEur,
    annualCmgEur,
    cmgStatus: cmg.status,
    annualTaxCreditEur,
    taxCreditKind: kind,
    netHouseholdBurdenAnnualEur,
    netHouseholdBurdenMonthlyEur,
    disposableIncomeMonthlyEur,
    employerSupportDeltaAnnualEur,
  };

  const referencedRuleIds = [
    ...new Set([...brutInputReferencedRuleIds(input.brutInput), ...cmg.ruleIds, ...taxRuleIds]),
  ];
  const uncertainty = buildUncertaintyReport(pack, {
    engineWarnings: warnings,
    referencedRuleIds,
  });

  return { snapshot, trace, warnings, uncertainty };
}
