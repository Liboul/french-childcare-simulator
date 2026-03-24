import { describe, expect, it } from "bun:test";
import { getRulePack, resetRulePackCacheForTests } from "./load-rules";

describe("load-rules (GARDE-007)", () => {
  it("parses config/rules.fr-2026.json and caches the pack", () => {
    resetRulePackCacheForTests();
    const a = getRulePack();
    const b = getRulePack();
    expect(a.version).toMatch(/^\d+\.\d+\.\d+/);
    expect(a.effectiveFrom).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(a).toBe(b);
  });
});
