import type { ScenarioStubResult } from "../types";

/** Squelette — champs à ajouter dans les stories suivantes. */
export type CrechePubliqueInput = Record<string, never>;

export type CrechePubliqueResult = ScenarioStubResult & { scenarioSlug: "creche-publique" };

export function computeCrechePublique(input: CrechePubliqueInput): CrechePubliqueResult {
  void input;
  return {
    scenarioSlug: "creche-publique",
    status: "stub",
    notes: ["Moteur non implémenté — squelette GARDE-005"],
  };
}
