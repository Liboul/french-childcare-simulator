import { getRulePack } from "../../shared/load-rules";
import type { ScenarioResultBase } from "../types";

/** Squelette — champs à ajouter dans les stories suivantes. */
export type CrecheBerceauEmployeurInput = Record<string, never>;

export type CrecheBerceauEmployeurResult = ScenarioResultBase & {
  scenarioSlug: "creche-berceau-employeur";
};

export function computeCrecheBerceauEmployeur(
  input: CrecheBerceauEmployeurInput,
): CrecheBerceauEmployeurResult {
  void input;
  const pack = getRulePack();
  return {
    scenarioSlug: "creche-berceau-employeur",
    status: "stub",
    notes: ["Moteur berceau / employeur non implémenté — tableau : pack + SMIC de référence"],
    meta: { rulePackVersion: pack.version, effectiveFrom: pack.effectiveFrom },
  };
}
