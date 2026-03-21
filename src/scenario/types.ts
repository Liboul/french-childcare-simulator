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
};
