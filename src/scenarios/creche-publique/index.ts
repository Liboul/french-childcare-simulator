import { getRulePack } from "../../shared/load-rules";
import type { ScenarioResultBase } from "../types";

/** Squelette — champs à ajouter dans les stories suivantes. */
export type CrechePubliqueInput = Record<string, never>;

export type CrechePubliqueResult = ScenarioResultBase & { scenarioSlug: "creche-publique" };

export function computeCrechePublique(input: CrechePubliqueInput): CrechePubliqueResult {
  void input;
  const pack = getRulePack();
  return {
    scenarioSlug: "creche-publique",
    status: "stub",
    notes: [
      "Moteur garde non implémenté — le tableau reprend déjà le pack et le SMIC de référence",
    ],
    meta: { rulePackVersion: pack.version, effectiveFrom: pack.effectiveFrom },
  };
}
