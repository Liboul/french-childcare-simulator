import type { ScenarioStubResult } from "../types";

/** Squelette — champs à ajouter (seul ou co-famille). */
export type NounouDomicileInput = Record<string, never>;

export type NounouDomicileResult = ScenarioStubResult & { scenarioSlug: "nounou-domicile" };

export function computeNounouDomicile(input: NounouDomicileInput): NounouDomicileResult {
  void input;
  return {
    scenarioSlug: "nounou-domicile",
    status: "stub",
    notes: ["Moteur non implémenté — squelette GARDE-005"],
  };
}
