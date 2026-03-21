export const CHILDCARE_MODES = [
  "nounou_domicile",
  "nounou_partagee",
  "assistante_maternelle",
  "mam",
  "creche_publique",
  "creche_privee",
  "creche_inter_entreprises",
] as const;

export type ChildcareMode = (typeof CHILDCARE_MODES)[number];

/**
 * Base utilisée pour renseigner `fraisTransportMensuelEur` (traçabilité harness).
 * Les montants en € ne sont **pas** figés dans le moteur : consulter les tarifs en vigueur (ex. Île-de-France Mobilités pour Navigo).
 */
export type DomicileTransportBaseKind =
  | "non"
  | "navigo_mois_plein"
  | "navigo_demi_tarif"
  | "navigo_zones_limitees"
  | "autre";

/**
 * Coûts complémentaires garde à domicile (particulier employeur) — voir `docs/research/DR-06-EMPLOI-DOMICILE-COUTS-COMPLEMENTAIRES.md`.
 * Tous optionnels ; montants saisis **au niveau du foyer** (déjà quote-part en garde partagée).
 */
export type DomicileComplementaryCostsInput = {
  /** Remboursement transport (obligation légale de prise en charge possible) — inclus dans l’assiette crédit d’impôt. */
  fraisTransportMensuelEur?: number;
  /**
   * Comment le montant transport a été retenu (questions harness). Si ≠ `non`, fournir `fraisTransportMensuelEur` > 0
   * (tarif officiel consulté, ex. Navigo mois plein vs demi-tarif / zones limitées sur le site IDFM).
   */
  fraisTransportBase?: DomicileTransportBaseKind;
  /**
   * Lissage volontaire de trésorerie (≠ obligation légale) — **exclu** de l’assiette crédit d’impôt dans ce moteur (imputation fiscale à la prise réelle).
   */
  provisionCongesPayesMensuelEur?: number;
  /**
   * Postes soumis à cotisations, lissés au mois (ex. ICCP, ICP, indemnités CP à la prise) — inclus dans l’assiette CI ; incertitudes BOFiP : warning.
   */
  depensesCotisablesLisseesMensuelEur?: number;
  /**
   * Ex. indemnité de licenciement lissée — **inclus** dans le brut foyer, **exclu** de l’assiette crédit d’impôt (DR-06 §7).
   */
  depensesHorsCreditImpotLisseesMensuelEur?: number;
};

/**
 * Paramètres de coût brut par mode (hors aides publiques et impôts).
 * `employerShareOfGross` : part des cotisations patronales **exprimée en fraction du salaire brut**
 * (ex. 0,25 pour 25 %). Aucune valeur imposée par le moteur — voir `cotisations-pajemploi-taux-indicatifs-dr03-dr04`.
 */
export type BrutCostInput =
  | {
      mode: "nounou_domicile";
      hourlyGrossEur: number;
      hoursPerMonth: number;
      employerShareOfGross: number;
      /**
       * Quote-part du coût d’emploi (salaire brut + cotisations patronales) supportée par **ce** foyer,
       * lorsque la nounou est partagée avec un ou plusieurs autres foyers (ex. 0,5 pour 50 % / 50 %).
       * `hourlyGrossEur` et `hoursPerMonth` décrivent alors le **contrat total** avant répartition ; omis = 1.
       */
      householdShareOfEmploymentCost?: number;
      domicileComplementaryCosts?: DomicileComplementaryCostsInput;
    }
  | {
      mode: "nounou_partagee";
      hourlyGrossEur: number;
      hoursPerMonth: number;
      /** Nombre d’enfants accueillis en même temps par la même assistante (≥ 1). */
      simultaneousChildrenCount: number;
      /** Quote-part du coût salarial payée par ce foyer (0–1), ex. 0,5 pour 50/50. */
      householdShareOfSalary: number;
      employerShareOfGross: number;
      domicileComplementaryCosts?: DomicileComplementaryCostsInput;
    }
  | {
      mode: "assistante_maternelle";
      hourlyGrossEur: number;
      hoursPerMonth: number;
      careDaysPerMonth: number;
      indemniteEntretienEurPerDay: number;
      employerShareOfGross: number;
    }
  | {
      mode: "mam";
      hourlyGrossEur: number;
      hoursPerMonth: number;
      careDaysPerMonth: number;
      indemniteEntretienEurPerDay: number;
      structureParticipationEurPerMonth: number;
      employerShareOfGross: number;
    }
  | {
      mode: "creche_publique" | "creche_privee" | "creche_inter_entreprises";
      /**
       * Part payée par le foyer (facture réelle). En **PSU** (publique, inter-entreprises, privée conventionnée),
       * c’est la *participation familiale* barémée (le moteur ne calcule pas le barème — `docs/research/DR-08-PSU-CRECHE-PART-FAMILLE.md`).
       * Micro-crèche **hors PSU** : montant contractuel (CMG structure si éligible, voir DR-01).
       */
      monthlyParticipationEur: number;
    };

export type BrutCostLine = {
  label: string;
  amountEur: number;
};

export type BrutCostResult = {
  monthlyBrutEur: number;
  lines: BrutCostLine[];
  /**
   * Assiette mensuelle pour le crédit d’impôt emploi à domicile (≤ `monthlyBrutEur` si postes exclus, DR-06).
   * Égal à `monthlyBrutEur` lorsqu’il n’y a pas de coûts complémentaires ou pas d’exclusion.
   */
  monthlyTaxCreditAssietteEur: number;
};
