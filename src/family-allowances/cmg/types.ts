import type { ChildcareMode } from "../../childcare/model";

/** User-declared interaction with other benefits (DR-01 / pack `cmg-non-cumul-et-majorations`). */
export type CmgCumulInput = {
  /** PreParE à taux plein : non-cumul CMG (montant 0). */
  receivesPrepareFull?: boolean;
  /** PreParE à 50 % ou moins : CMG divisé par 2. */
  receivesPreparePartial?: boolean;
  /** AAH ou AEEH : majoration du plafond d’aide (+30 % dans le pack). */
  receivesAahOrAeeh?: boolean;
};

export type CmgEstimateStatus = "ok" | "ineligible" | "unsupported";

export type CmgEstimateResult = {
  status: CmgEstimateStatus;
  /** Aide CMG mensuelle estimée (0 si ineligible / unsupported). */
  monthlyCmgEur: number;
  /** Règles du pack ayant servi au calcul (ids). */
  ruleIds: string[];
  /** Avertissements (extrapolation, barème dépassé, etc.). */
  warnings: string[];
  /** Sous-branche métier pour la trace. */
  branch:
    | "emploi_direct_garde_domicile"
    | "emploi_direct_assmat_mam"
    | "structure_microcreche"
    | "none";
};

export type CmgEstimateRequest = {
  mode: ChildcareMode;
  cumul: CmgCumulInput;
  /** Revenu mensuel de référence pour la formule emploi direct (sera borné par le pack). */
  monthlyReferenceIncomeEur?: number;
  /**
   * Rang d’enfant pour le barème de taux d’effort (1 = premier enfant à charge pour ce barème, etc.).
   */
  householdEffortRank?: number;
  /** Salaire horaire brut déclaré (avant plafond CMG). */
  hourlyDeclaredGrossEur?: number;
  heuresParMois?: number;
  /** Structure : revenus annuels de référence N-2 (€). */
  annualReferenceIncomeN2Eur?: number;
  /** Nombre d’enfants à charge pour les tranches (1–3+ ; au-delà, tranche 3 reprise avec avertissement). */
  structureDependentChildren?: number;
  isSingleParentHousehold?: boolean;
  childAgeBand?: "under3" | "age3to6";
  /** Dépense mensuelle de garde (structure) pour plafond RAC 15 %. */
  monthlyStructureExpenseEur?: number;
  territory?: "metropole" | "mayotte";
  /** Tarif horaire réel micro-crèche (élégibilité ≤ 10 €). */
  hourlyCrecheFeeEur?: number;
};
