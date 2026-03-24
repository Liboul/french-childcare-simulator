import { getRulePack } from "../../shared/load-rules";
import type { ScenarioResultBase } from "../types";

/** Squelette — champs à ajouter dans les stories suivantes. */
export type AssistanteMaternelleInput = Record<string, never>;

export type AssistanteMaternelleResult = ScenarioResultBase & {
  scenarioSlug: "assistante-maternelle";
};

export function computeAssistanteMaternelle(
  input: AssistanteMaternelleInput,
): AssistanteMaternelleResult {
  void input;
  const pack = getRulePack();
  return {
    scenarioSlug: "assistante-maternelle",
    status: "stub",
    notes: ["Moteur assmat non implémenté — tableau : pack + SMIC de référence"],
    meta: { rulePackVersion: pack.version, effectiveFrom: pack.effectiveFrom },
  };
}
