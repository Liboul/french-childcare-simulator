import { describe, expect, it } from "bun:test";
import { getRulePack } from "./load-rules";
import { computeCmgGardeDomicileEmploiDirectMonthly } from "./cmg-garde-domicile-emploi-direct";

describe("cmg-garde-domicile-emploi-direct", () => {
  it("uses CHR 10,50 € and domicile effort rates from pack", () => {
    const pack = getRulePack();
    const out = computeCmgGardeDomicileEmploiDirectMonthly(pack, {
      monthlyHouseholdIncomeEur: 3500,
      monthlyCostOfCareEur: 1200,
      householdChildRank: 1,
    });
    expect(out).not.toBeNull();
    expect(out!.boundedIncomeEur).toBe(3500);
    const ratio = (3500 * 0.001238) / 10.5;
    expect(out!.ratioParentEffort).toBeCloseTo(ratio, 5);
    expect(out!.monthlyCmgEur).toBeCloseTo(1200 * (1 - ratio), 1);
  });
});
