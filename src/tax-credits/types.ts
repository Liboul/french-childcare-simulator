import type { ChildcareMode } from "../childcare/model";

export type TaxCreditKind = "garde_hors_domicile" | "emploi_domicile";

/** Une ligne enfant pour le crédit « garde hors du domicile » (200 quater B). */
export type GardeHorsDomicileChildInput = {
  /** Dépenses annuelles éligibles payées (hors aides), avant déductions. */
  annualEligiblePaidExpensesEur: number;
  /** CMG (ou aide assimilée) perçue pour cet enfant sur l’année, si déductible selon le pack. */
  annualCmgReceivedEur: number;
  /**
   * Aides employeur à déduire de l’assiette (ex. part exonérée crèche, CESU préfinancé lié à cette garde).
   * L’appelant agrège les montants pertinents (DR-02).
   */
  annualEmployerAidDeductibleFromBaseEur: number;
  /** Résidence alternée : plafonds dépenses / crédit divisés par deux (pack). */
  sharedCustodyHalvedCeiling: boolean;
  /** Enfant de moins de 6 ans au 1er janvier et à charge (CGI art. 196) — sinon crédit nul pour la ligne. */
  qualifiesAgeAndCharge: boolean;
};

export type GardeHorsDomicileChildLine = {
  netBaseBeforeCapEur: number;
  cappedBaseEur: number;
  creditEur: number;
};

export type GardeHorsDomicileTaxCreditResult = {
  perChild: GardeHorsDomicileChildLine[];
  totalCreditEur: number;
  ruleIds: string[];
  warnings: string[];
};

export type EmploiDomicileTaxCreditInput = {
  /** Salaire + cotisations éligibles (annuel), avant déduction préfinancé. */
  annualQualifyingExpensesEur: number;
  /** Nombre d’enfants à charge du foyer servant à la majoration de plafond (cas standard F12). */
  taxUnitDependentChildrenCount: number;
  /** Montant CESU préfinancé employeur à retrancher de l’assiette (ex. `describeEmployerPrefundedCesuAnnual`). */
  prefundedCesuAnnualEur: number;
  /** Majorations de plafond divisées par deux (résidence alternée). */
  sharedCustodyHalvedIncrements: boolean;
};

export type EmploiDomicileTaxCreditResult = {
  netBaseBeforeCapEur: number;
  expenseCeilingEur: number;
  cappedBaseEur: number;
  creditEur: number;
  ruleIds: string[];
  warnings: string[];
};

export function taxCreditKindForChildcareMode(mode: ChildcareMode): TaxCreditKind {
  switch (mode) {
    case "nounou_domicile":
    case "nounou_partagee":
      return "emploi_domicile";
    case "assistante_maternelle":
    case "mam":
    case "creche_publique":
    case "creche_privee":
    case "creche_inter_entreprises":
      return "garde_hors_domicile";
    default: {
      const _exhaustive: never = mode;
      return _exhaustive;
    }
  }
}
