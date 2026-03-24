import type { ScenarioStubResult } from "../types";

/** Squelette — champs à ajouter dans les stories suivantes. */
export type CrecheBerceauEmployeurInput = Record<string, never>;

export type CrecheBerceauEmployeurResult = ScenarioStubResult & {
  scenarioSlug: "creche-berceau-employeur";
};

export function computeCrecheBerceauEmployeur(
  input: CrecheBerceauEmployeurInput,
): CrecheBerceauEmployeurResult {
  void input;
  return {
    scenarioSlug: "creche-berceau-employeur",
    status: "stub",
    notes: ["Moteur non implémenté — squelette GARDE-005"],
  };
}
