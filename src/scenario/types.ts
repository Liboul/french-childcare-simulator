import type { BrutCostInput, ChildcareMode } from "../childcare/model";
import type { CmgEstimateRequest, CmgEstimateStatus } from "../family-allowances/cmg/types";
import type { HouseholdProfile } from "../household/types";
import type { UncertaintyReport } from "../uncertainty/types";
import type { CalculationTrace } from "../trace/trace";
import type { TaxCreditKind } from "../tax-credits/types";

/** Identité de build pour audit et support (GARDE-026). */
export type ScenarioMeta = {
  engineVersion: string;
  rulePackVersion: string;
  rulePackEffectiveFrom: string;
};

/** Champs CMG sans `mode` : le mode est toujours `brutInput.mode`. */
export type ScenarioCmgInput = Omit<CmgEstimateRequest, "mode">;

/** Paramètres IR / quotient pour GARDE-019 (DR-07). */
export type ScenarioIncomeTaxInput = {
  /** Revenu net imposable annuel foyer (€) — prime sur le brut dérivé. */
  annualNetTaxableIncomeEur?: number;
  /** Salaires bruts annuels foyer (€) — RNI via abattement 10 % min/max (`config/income-tax-bareme.fr-2026.json`). */
  annualGrossSalaryEur?: number;
  /** Requis si `annualNetTaxableIncomeEur` ou `annualGrossSalaryEur` est renseigné. */
  householdTaxParts?: number;
  /** Requis pour l’estimation IR si assiette (net ou brut) renseignée. */
  filing?: "individual" | "joint";
  /**
   * Revenu annuel foyer après IR (hors crédit garde modélisé ici) — base recommandée pour le disponible mensuel ÷12.
   */
  annualHouseholdIncomeAfterIncomeTaxEur?: number;
  /**
   * Salaires nets annuels foyer déclarés (bulletins, après cotisations sociales, avant IR) — pour reporting ; n’alimente pas le barème IR.
   */
  annualNetSalaryFromPayslipsEur?: number;
  /**
   * Si true avec `baselineDisposableIncomeMonthlyEur` : la base est déjà nette d’IR (ex. alignée sur le PAS) ;
   * ne pas soustraire l’estimation IR annuelle au disponible.
   */
  monthlyResourcesAlreadyAccountForIncomeTax?: boolean;
};

/** Contexte crédit d’impôt pour l’agrégateur (une ligne enfant / foyer simplifié). */
export type ScenarioTaxCreditContext = {
  childQualifiesForHorsDomicileCredit: boolean;
  sharedCustodyHalvedOutsideHomeCeiling: boolean;
  outsideHomeAnnualEmployerAidDeductibleEur: number;
  taxUnitDependentChildrenForEmploymentCeiling: number;
  prefundedCesuAnnualEur: number;
  sharedCustodyHalvedEmploymentIncrements: boolean;
};

export type ScenarioInput = {
  household: HouseholdProfile;
  brutInput: BrutCostInput;
  cmg: ScenarioCmgInput;
  /** Surcharges du contexte crédit ; défauts raisonnables pour un enfant éligible. */
  taxCredit?: Partial<ScenarioTaxCreditContext>;
  /** Base « disponible » mensuelle avant ce mode (revenu après impôt restant au foyer, saisie utilisateur). */
  baselineDisposableIncomeMonthlyEur?: number;
  /** Soutien employeur pour ce scénario (€/an), saisi pour comparaison. */
  declaredEmployerChildcareSupportAnnualEur?: number;
  /** Référence pour comparer les scénarios (« coût employeur constant »). */
  referenceEmployerChildcareSupportAnnualEur?: number;
  /** Estimation IR / TMI / disponible (barème versionné, DR-07). */
  incomeTax?: ScenarioIncomeTaxInput;
};

export type ScenarioSnapshot = {
  mode: ChildcareMode;
  monthlyBrutEur: number;
  annualBrutEur: number;
  /** Assiette mensuelle ×12 pour le crédit d’impôt emploi à domicile (peut différer du brut si DR-06). */
  monthlyBrutTaxCreditAssietteEur: number;
  annualBrutTaxCreditAssietteEur: number;
  monthlyCmgEur: number;
  annualCmgEur: number;
  cmgStatus: CmgEstimateStatus;
  annualTaxCreditEur: number;
  taxCreditKind: TaxCreditKind;
  /** Coût équivalent foyer après CMG et crédit d’impôt (année, simplifié). */
  netHouseholdBurdenAnnualEur: number;
  netHouseholdBurdenMonthlyEur: number;
  disposableIncomeMonthlyEur: number | null;
  employerSupportDeltaAnnualEur: number | null;
  /**
   * `true` lorsque déclaré **et** référence employeur sont tous deux renseignés : l’écart
   * `employerSupportDeltaAnnualEur` compare deux hypothèses et **ne modifie pas** `netHouseholdBurden*`.
   */
  employerSupportIsComparisonScenario: boolean;
  /** Écho `incomeTax.annualGrossSalaryEur` + mensuel ÷12 ; null si non saisi. */
  householdGrossSalaryAnnualEur: number | null;
  householdGrossSalaryMonthlyEur: number | null;
  /** Écho `incomeTax.annualNetSalaryFromPayslipsEur` + mensuel ; null si non saisi (≠ revenu après IR). */
  householdNetSalaryAnnualEur: number | null;
  householdNetSalaryMonthlyEur: number | null;
  /** Écho `incomeTax.annualHouseholdIncomeAfterIncomeTaxEur` + mensuel ; null si non saisi. */
  householdIncomeAfterIncomeTaxAnnualEur: number | null;
  householdIncomeAfterIncomeTaxMonthlyEur: number | null;
  /** Présent si `incomeTax` fourni — hors plafonnement QF et hors autres crédits / réductions. */
  estimatedIncomeTaxGrossAnnualEur: number | null;
  estimatedIncomeTaxNetAfterDecoteAnnualEur: number | null;
  marginalIncomeTaxRate: number | null;
  incomeTaxQuotientEur: number | null;
};

/** @see `buildLimitationHints` — GARDE-022 */
export type LimitationHint = {
  code: string;
  messageFr: string;
  docUrl?: string;
};

export type ScenarioResult = {
  snapshot: ScenarioSnapshot;
  trace: CalculationTrace;
  warnings: string[];
  uncertainty: UncertaintyReport;
  meta: ScenarioMeta;
  limitationHints: LimitationHint[];
  /**
   * Messages FR lorsque `disposableIncomeMonthlyEur` est `null` malgré un bloc `incomeTax` :
   * champs manquants, distinction net bulletin vs après IR, réserves sur l’estimation IR.
   */
  incomeTaxDisposableHintsFr: string[];
};
