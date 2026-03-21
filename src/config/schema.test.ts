import { describe, expect, it } from "vitest";
import example from "../../config/rules.example.json" with { type: "json" };
import rulesFr2026 from "../../config/rules.fr-2026.json" with { type: "json" };
import { findRule } from "./find-rule";
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

  it("accepts rules.fr-2026.json and exposes expected parameters", () => {
    const result = parseRulePack(rulesFr2026);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const { data } = result;
    expect(data.version).toBe("2026.1.0");
    expect(data.effectiveFrom).toBe("2026-01-01");
    expect(data.rules.length).toBeGreaterThan(10);

    const smic = findRule(data, "tarif-smic-horaire-metropole-2026");
    expect(smic?.parameters).toMatchObject({ hourlyGrossEur: 12.02 });

    const credit = findRule(data, "credit-impot-garde-hors-domicile");
    expect(credit?.parameters).toMatchObject({
      maxEligibleExpensePerChildFullCustodyEur: 3500,
      rate: 0.5,
    });

    const cmgDom = findRule(data, "cmg-emploi-direct-garde-domicile-2026-04");
    expect(cmgDom?.parameters).toMatchObject({
      hourlyReferenceCostEur: 10.5,
      maxHourlySalaryCountedEur: 15.18,
    });

    const cesuPrefinanceCap = findRule(data, "cesu-prefinance-plafond-aide-financiere-employeur");
    expect(cesuPrefinanceCap?.parameters).toMatchObject({
      maxAnnualAidPerBeneficiaryEur: 2540,
      previousMaxAnnualAidPerBeneficiaryEurUntil2024: 2421,
    });
  });
});
