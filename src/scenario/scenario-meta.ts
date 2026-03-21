import type { RulePack } from "../config/schema";
import { ENGINE_VERSION } from "../engine-version";
import type { ScenarioMeta } from "./types";

export function buildScenarioMeta(pack: RulePack): ScenarioMeta {
  return {
    engineVersion: ENGINE_VERSION,
    rulePackVersion: pack.version,
    rulePackEffectiveFrom: pack.effectiveFrom,
  };
}
