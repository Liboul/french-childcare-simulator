import rulesFr2026 from "../config/rules.fr-2026.json" with { type: "json" };
import { parseRulePack } from "../src/config/parse";
import { computeScenarioSnapshot } from "../src/scenario/aggregate";
import type { ScenarioInput, ScenarioResult } from "../src/scenario/types";

const packResult = parseRulePack(rulesFr2026);
if (!packResult.ok) {
  throw new Error(`Rule pack invalid: ${packResult.error}`);
}
const pack = packResult.data;

/**
 * Point d’entrée harness : même logique que `scripts/run-demo-scenario.ts`, exposé pour HTTP / outils.
 */
export function calculateScenario(input: unknown): ScenarioResult {
  if (input === null || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("request_body_must_be_a_json_object");
  }
  return computeScenarioSnapshot(pack, input as ScenarioInput);
}
