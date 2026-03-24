import { describe, expect, it } from "bun:test";
import { getRulePack } from "./load-rules";
import { computeCmgAssmatEmploiDirectMonthly } from "./cmg-assmat-emploi-direct";

describe("cmg-assmat-emploi-direct", () => {
  it("matches DR-01-style formula for a reference case", () => {
    const pack = getRulePack();
    const out = computeCmgAssmatEmploiDirectMonthly(pack, {
      monthlyHouseholdIncomeEur: 3000,
      monthlyCostOfCareEur: 800,
      householdChildRank: 1,
    });
    expect(out).not.toBeNull();
    expect(out!.boundedIncomeEur).toBe(3000);
    const ratio = (3000 * 0.000619) / 4.85;
    expect(out!.ratioParentEffort).toBeCloseTo(ratio, 5);
    expect(out!.monthlyCmgEur).toBeCloseTo(800 * (1 - ratio), 1);
  });
});
