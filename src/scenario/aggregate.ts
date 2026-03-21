import { computeBrutMonthlyCost } from "../childcare/brut-monthly-cost";
import type { RulePack } from "../config/schema";
import { estimateCmgMonthlyEur } from "../family-allowances/cmg/estimate";
import { estimateEmploiDomicileTaxCreditAnnual } from "../tax-credits/emploi-domicile";
import { estimateGardeHorsDomicileTaxCreditAnnual } from "../tax-credits/garde-hors-domicile";
import { taxCreditKindForChildcareMode } from "../tax-credits/types";
import { brutInputReferencedRuleIds } from "../uncertainty/brut-rule-refs";
import { buildUncertaintyReport } from "../uncertainty/report";
import { appendStep, emptyTrace } from "../trace/trace";
import {
  annualNetTaxableFromGrossSalaryEur,
  estimateFrenchIncomeTax2026,
  incomeTaxBaremeFr2026,
} from "../income-tax";
import type { FrenchIncomeTaxEstimate2026 } from "../income-tax/estimate-fr-2026";
import { buildIncomeTaxLimitationHints } from "./income-tax-hints";
import { buildLimitationHints } from "./limitation-hints";
import { buildScenarioMeta } from "./scenario-meta";
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
 * IR / TMI (GARDE-019) : optionnel via `incomeTax` + barème `config/income-tax-bareme.fr-2026.json`.
 */
export function computeScenarioSnapshot(pack: RulePack, input: ScenarioInput): ScenarioResult {
  const meta = buildScenarioMeta(pack);
  const warnings: string[] = [];
  warnings.push("scenario_annual_tax_credit_uses_brut_x12_as_eligible_expense_simplification");

  const taxCtx: ScenarioTaxCreditContext = { ...defaultTaxCreditContext(), ...input.taxCredit };

  let trace = emptyTrace();
  let order = 0;

  const brut = computeBrutMonthlyCost(pack, input.household, input.brutInput);
  const monthlyBrutEur = brut.monthlyBrutEur;
  const annualBrutEur = round2(monthlyBrutEur * MONTHS_PER_TAX_YEAR);
  const monthlyBrutTaxCreditAssietteEur = brut.monthlyTaxCreditAssietteEur;
  const annualBrutTaxCreditAssietteEur = round2(
    monthlyBrutTaxCreditAssietteEur * MONTHS_PER_TAX_YEAR,
  );

  if (
    input.brutInput.mode === "nounou_domicile" &&
    (input.brutInput.householdShareOfEmploymentCost ?? 1) < 1
  ) {
    warnings.push("nounou_domicile_shared_employment_align_cmg_with_household_declaration_to_caf");
  }

  const domicileExtras =
    input.brutInput.mode === "nounou_domicile" || input.brutInput.mode === "nounou_partagee"
      ? input.brutInput.domicileComplementaryCosts
      : undefined;
  if (domicileExtras) {
    const any =
      (domicileExtras.fraisTransportMensuelEur ?? 0) > 0 ||
      (domicileExtras.provisionCongesPayesMensuelEur ?? 0) > 0 ||
      (domicileExtras.depensesCotisablesLisseesMensuelEur ?? 0) > 0 ||
      (domicileExtras.depensesHorsCreditImpotLisseesMensuelEur ?? 0) > 0;
    if (any) {
      warnings.push("domicile_complementary_align_cmg_pajemploi_declaration_dr06");
    }
    if ((domicileExtras.provisionCongesPayesMensuelEur ?? 0) > 0) {
      warnings.push("domicile_provision_cp_fiscal_timing_dr06");
    }
    if ((domicileExtras.depensesCotisablesLisseesMensuelEur ?? 0) > 0) {
      warnings.push("domicile_cotisable_lisse_assiette_ci_uncertainty_dr06");
    }
    if ((domicileExtras.depensesHorsCreditImpotLisseesMensuelEur ?? 0) > 0) {
      warnings.push("domicile_excluded_from_tax_credit_included_in_brut_dr06");
    }
    const tb = domicileExtras.fraisTransportBase;
    const ft = domicileExtras.fraisTransportMensuelEur;
    if (tb != null && tb !== "non" && (ft == null || ft <= 0)) {
      warnings.push(
        "domicile_transport_navigo_or_forfait_missing_monthly_eur_consult_iledefrance_mobilites",
      );
    }
  }

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
      annualQualifyingExpensesEur: annualBrutTaxCreditAssietteEur,
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
    narrative:
      kind === "emploi_domicile" &&
      Math.abs(annualBrutTaxCreditAssietteEur - annualBrutEur) > EMPLOYER_DELTA_EPSILON_EUR
        ? `Routage : ${kind}. Assiette crédit d’impôt = brut annuel ajusté (DR-06, ≠ brut foyer total).`
        : `Routage : ${kind}. Assiette annuelle simplifiée = coût brut annuel.`,
    sources: [],
  });

  const netHouseholdBurdenAnnualEur = round2(
    Math.max(0, annualBrutEur - annualCmgEur - annualTaxCreditEur),
  );
  const netHouseholdBurdenMonthlyEur = round2(netHouseholdBurdenAnnualEur / MONTHS_PER_TAX_YEAR);

  let incomeTaxEstimate: FrenchIncomeTaxEstimate2026 | null = null;
  const it = input.incomeTax;
  if (it) {
    const hasNet = it.annualNetTaxableIncomeEur != null;
    const hasGross = it.annualGrossSalaryEur != null;
    if (hasNet || hasGross) {
      const parts = it.householdTaxParts!;
      const filing = it.filing!;
      const rni = hasNet
        ? it.annualNetTaxableIncomeEur!
        : annualNetTaxableFromGrossSalaryEur(it.annualGrossSalaryEur!, incomeTaxBaremeFr2026);
      incomeTaxEstimate = estimateFrenchIncomeTax2026({
        annualNetTaxableIncomeEur: rni,
        householdTaxParts: parts,
        filing,
      });
      warnings.push(...incomeTaxEstimate.warnings);
    }
    if (input.household.taxYear !== incomeTaxBaremeFr2026.taxYear) {
      warnings.push("income_tax_bareme_2026_used_tax_year_mismatch");
    }
  }

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

  let disposableIncomeMonthlyEur: number | null = null;
  const afterIrAnnual = it?.annualHouseholdIncomeAfterIncomeTaxEur;
  if (afterIrAnnual != null) {
    disposableIncomeMonthlyEur = round2(
      afterIrAnnual / MONTHS_PER_TAX_YEAR - netHouseholdBurdenMonthlyEur,
    );
  } else if (input.baselineDisposableIncomeMonthlyEur != null) {
    const baseline = input.baselineDisposableIncomeMonthlyEur;
    const irMonthly = incomeTaxEstimate
      ? round2(incomeTaxEstimate.incomeTaxNetAfterDecoteAnnualEur / MONTHS_PER_TAX_YEAR)
      : 0;
    const skipIrOnBaseline = it?.monthlyResourcesAlreadyAccountForIncomeTax === true;
    if (incomeTaxEstimate != null && !skipIrOnBaseline) {
      disposableIncomeMonthlyEur = round2(baseline - irMonthly - netHouseholdBurdenMonthlyEur);
      warnings.push("income_tax_subtracted_from_baseline_verify_not_double_with_pas_dr07");
    } else {
      disposableIncomeMonthlyEur = round2(baseline - netHouseholdBurdenMonthlyEur);
    }
  }

  order += 1;
  trace = appendStep(trace, {
    id: "scenario_net_burden",
    segment: "summary",
    order,
    label: "Reste à charge équivalent (foyer)",
    formula: "max(0, brut_annuel − CMG_annuel − crédit_impôt_annuel) ; mensuel = ÷12",
    narrative:
      incomeTaxEstimate != null
        ? "Crédit d’impôt traité comme allègement monétaire équivalent ; IR barème estimé séparément (DR-07, hors plafonnement QF)."
        : "Crédit d’impôt traité comme allègement monétaire équivalent ; IR foyer optionnel via `incomeTax`.",
    sources: [],
  });

  const snapshot = {
    mode: input.brutInput.mode,
    monthlyBrutEur,
    annualBrutEur,
    monthlyBrutTaxCreditAssietteEur,
    annualBrutTaxCreditAssietteEur,
    monthlyCmgEur,
    annualCmgEur,
    cmgStatus: cmg.status,
    annualTaxCreditEur,
    taxCreditKind: kind,
    netHouseholdBurdenAnnualEur,
    netHouseholdBurdenMonthlyEur,
    disposableIncomeMonthlyEur,
    employerSupportDeltaAnnualEur,
    estimatedIncomeTaxGrossAnnualEur: incomeTaxEstimate?.incomeTaxGrossAnnualEur ?? null,
    estimatedIncomeTaxNetAfterDecoteAnnualEur:
      incomeTaxEstimate?.incomeTaxNetAfterDecoteAnnualEur ?? null,
    marginalIncomeTaxRate: incomeTaxEstimate?.marginalIncomeTaxRate ?? null,
    incomeTaxQuotientEur: incomeTaxEstimate?.quotientEur ?? null,
  };

  const referencedRuleIds = [
    ...new Set([...brutInputReferencedRuleIds(input.brutInput), ...cmg.ruleIds, ...taxRuleIds]),
  ];
  const uncertainty = buildUncertaintyReport(pack, {
    engineWarnings: warnings,
    referencedRuleIds,
  });

  const limitationHints = [
    ...buildLimitationHints({
      mode: input.brutInput.mode,
      cmgStatus: cmg.status,
      cmgWarnings: cmg.warnings,
    }),
    ...buildIncomeTaxLimitationHints(incomeTaxEstimate),
  ];

  return { snapshot, trace, warnings, uncertainty, meta, limitationHints };
}
