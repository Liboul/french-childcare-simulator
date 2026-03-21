import rulesFr2026 from "../config/rules.fr-2026.json" with { type: "json" };
import { parseRulePack } from "../src/config/parse";
import { computeScenarioSnapshot } from "../src/scenario/aggregate";
import {
  ScenarioValidationError,
  safeParseScenarioInput,
} from "../src/scenario/scenario-input.schema";
import type { ScenarioInput, ScenarioResult } from "../src/scenario/types";

const packResult = parseRulePack(rulesFr2026);
if (!packResult.ok) {
  throw new Error(`Rule pack invalid: ${packResult.error}`);
}
const pack = packResult.data;

/**
 * Point d’entrée harness : même logique que `scripts/run-demo-scenario.ts`, exposé pour HTTP / outils.
 * Valide le JSON avec le schéma Zod (GARDE-020) avant calcul.
 */
export function calculateScenario(input: unknown): ScenarioResult {
  if (input === null || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("request_body_must_be_a_json_object");
  }
  const parsed = safeParseScenarioInput(input);
  if (!parsed.ok) {
    throw new ScenarioValidationError(parsed.issues);
  }
  return computeScenarioSnapshot(pack, parsed.data);
}

/** Calcul sans re-validation (appels internes déjà typés). */
export function calculateScenarioFromParsed(input: ScenarioInput): ScenarioResult {
  return computeScenarioSnapshot(pack, input);
}

export { ScenarioValidationError } from "../src/scenario/scenario-input.schema";
