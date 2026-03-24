import type { RuleEntry, RulePack } from "./schema";

export function findRule(pack: RulePack, id: string): RuleEntry | undefined {
  return pack.rules.find((r) => r.id === id);
}
