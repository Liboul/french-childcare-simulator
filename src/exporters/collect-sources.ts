import { findRule } from "../config/find-rule";
import type { RulePack, SourceRefConfig } from "../config/schema";
import type { ScenarioResult } from "../scenario/types";

/** Règles citées dans la trace (`ruleId`) ou listées comme `todoVerify` référencées. */
export function collectReferencedRuleIdsForExport(result: ScenarioResult): string[] {
  const ids = new Set<string>();
  for (const step of result.trace.steps) {
    if (step.ruleId) ids.add(step.ruleId);
  }
  for (const r of result.uncertainty.referencedRulesPendingVerification) {
    ids.add(r.id);
  }
  return [...ids];
}

export function collectSourcesFromPackByRuleIds(
  pack: RulePack,
  ruleIds: readonly string[],
): SourceRefConfig[] {
  const seenUrl = new Set<string>();
  const out: SourceRefConfig[] = [];
  for (const id of ruleIds) {
    const rule = findRule(pack, id);
    if (!rule) continue;
    for (const s of rule.sources) {
      if (seenUrl.has(s.url)) continue;
      seenUrl.add(s.url);
      out.push(s);
    }
  }
  return out;
}
