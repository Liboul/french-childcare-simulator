import { getRulePack } from "../../shared/load-rules";
import type { ScenarioResultBase } from "../types";

/** Squelette — champs à ajouter (seul ou co-famille). */
export type NounouDomicileInput = Record<string, never>;

export type NounouDomicileResult = ScenarioResultBase & { scenarioSlug: "nounou-domicile" };

export function computeNounouDomicile(input: NounouDomicileInput): NounouDomicileResult {
  void input;
  const pack = getRulePack();
  return {
    scenarioSlug: "nounou-domicile",
    status: "stub",
    notes: ["Moteur nounou non implémenté — tableau : pack + SMIC de référence"],
    meta: { rulePackVersion: pack.version, effectiveFrom: pack.effectiveFrom },
  };
}
