/** Ligne du tableau de bilan (INITIAL_SPEC § 6.2). */
export type BilanLigneSource = { id: string; title: string; url: string };

export type BilanLigne = {
  libelle: string;
  montantEur: number;
  calcul: string;
  sources: BilanLigneSource[];
};

export type BilanTableau = {
  scenarioSlug: string;
  periode: "mois" | "an";
  lignes: BilanLigne[];
};
