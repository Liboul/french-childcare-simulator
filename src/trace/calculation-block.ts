/**
 * Engine segments from INITIAL_SPEC (MODÈLE DE CALCUL).
 * A — Profil foyer; B — Mode de garde; C — Avantages employeur;
 * D — Aides CAF / CMG; E — Crédits d’impôt; F — Fiscalité; G — Résultat final.
 */
export const CALCULATION_BLOCKS = ["A", "B", "C", "D", "E", "F", "G"] as const;

export type CalculationBlock = (typeof CALCULATION_BLOCKS)[number];

export const CALCULATION_BLOCK_LABEL: Record<CalculationBlock, string> = {
  A: "Profil foyer",
  B: "Profil mode de garde",
  C: "Avantages employeur",
  D: "Aides CAF / CMG",
  E: "Crédits d'impôt",
  F: "Fiscalité",
  G: "Résultat final",
};
