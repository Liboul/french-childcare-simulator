import type { ScenarioStubResult } from "../types";

/** Squelette — champs à ajouter dans les stories suivantes. */
export type AssistanteMaternelleInput = Record<string, never>;

export type AssistanteMaternelleResult = ScenarioStubResult & {
  scenarioSlug: "assistante-maternelle";
};

export function computeAssistanteMaternelle(
  input: AssistanteMaternelleInput,
): AssistanteMaternelleResult {
  void input;
  return {
    scenarioSlug: "assistante-maternelle",
    status: "stub",
    notes: ["Moteur non implémenté — squelette GARDE-005"],
  };
}
