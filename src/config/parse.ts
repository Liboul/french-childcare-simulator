import { type RulePack, rulePackSchema } from "./schema";

export type ParseResult = { ok: true; data: RulePack } | { ok: false; error: string };

export function parseRulePack(input: unknown): ParseResult {
  const parsed = rulePackSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.message };
  }
  return { ok: true, data: parsed.data };
}
