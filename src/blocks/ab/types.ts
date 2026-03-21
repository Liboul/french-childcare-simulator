/**
 * Bloc A — profil foyer (minimal pour GARDE-006 ; enrichissement ultérieur au fil des stories moteur).
 */
export type HouseholdProfile = {
  /** Année civile d’imposition / de simulation (ex. 2026). */
  taxYear: number;
};

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
 * Bloc B — paramètres de coût brut par mode (hors aides / impôts).
 * `employerShareOfGross` : part des cotisations patronales **exprimée en fraction du salaire brut**
 * (ex. 0,25 pour 25 %). Aucune valeur imposée par le moteur — voir `cotisations-pajemploi-taux-indicatifs-dr03-dr04`.
 */
export type BrutCostInput =
  | {
      mode: "nounou_domicile";
      hourlyGrossEur: number;
      hoursPerMonth: number;
      employerShareOfGross: number;
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
      monthlyParticipationEur: number;
    };

export type BrutCostLine = {
  label: string;
  amountEur: number;
};

export type BrutCostResult = {
  monthlyBrutEur: number;
  lines: BrutCostLine[];
};
