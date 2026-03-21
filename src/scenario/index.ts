export { computeScenarioSnapshot } from "./aggregate";
export { buildLimitationHints } from "./limitation-hints";
export { buildScenarioMeta } from "./scenario-meta";
export {
  ScenarioValidationError,
  safeParseScenarioInput,
  scenarioInputSchema,
} from "./scenario-input.schema";
export type {
  LimitationHint,
  ScenarioCmgInput,
  ScenarioIncomeTaxInput,
  ScenarioInput,
  ScenarioMeta,
  ScenarioResult,
  ScenarioSnapshot,
  ScenarioTaxCreditContext,
} from "./types";
