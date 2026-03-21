import { describe, expect, it } from "vitest";
import example from "../../config/rules.example.json" with { type: "json" };
import { parseRulePack } from "./parse";
import { rulePackSchema } from "./schema";

describe("rulePackSchema", () => {
  it("accepts the example config", () => {
    const result = parseRulePack(example);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.version).toBe("0.0.0");
      expect(result.data.rules).toHaveLength(0);
    }
  });

  it("rejects invalid URL", () => {
    const bad = {
      version: "1",
      effectiveFrom: "2026-01-01",
      sources: [],
      rules: [
        {
          id: "x",
          label: "test",
          category: "autre",
          sources: [{ id: "a", title: "t", url: "not-a-url" }],
        },
      ],
    };
    const result = parseRulePack(bad);
    expect(result.ok).toBe(false);
  });

  it("rejects rule without sources when todoVerify is false", () => {
    const bad = {
      version: "1",
      effectiveFrom: "2026-01-01",
      rules: [
        {
          id: "x",
          label: "test",
          category: "autre" as const,
          sources: [],
        },
      ],
    };
    expect(() => rulePackSchema.parse(bad)).toThrow();
  });

  it("allows todoVerify without sources", () => {
    const good = {
      version: "1",
      effectiveFrom: "2026-01-01",
      rules: [
        {
          id: "x",
          label: "test",
          category: "autre" as const,
          sources: [],
          todoVerify: true,
        },
      ],
    };
    const result = parseRulePack(good);
    expect(result.ok).toBe(true);
  });
});
