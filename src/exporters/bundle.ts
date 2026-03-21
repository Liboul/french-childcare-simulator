import type { RulePack } from "../config/schema";
import type { ScenarioInput, ScenarioResult } from "../scenario/types";
import {
  collectReferencedRuleIdsForExport,
  collectSourcesFromPackByRuleIds,
} from "./collect-sources";
import type { ScenarioExportBundle } from "./types";

export function buildScenarioExportBundle(
  pack: RulePack,
  hypotheses: ScenarioInput,
  result: ScenarioResult,
  meta?: { title?: string },
): ScenarioExportBundle {
  const ruleIds = collectReferencedRuleIdsForExport(result);
  return {
    meta: {
      title: meta?.title,
      generatedAtIso: new Date().toISOString(),
      documentFormatVersion: "1.0.0",
    },
    packSummary: {
      version: pack.version,
      effectiveFrom: pack.effectiveFrom,
      effectiveTo: pack.effectiveTo,
    },
    hypotheses,
    result,
    ruleSources: collectSourcesFromPackByRuleIds(pack, ruleIds),
  };
}
