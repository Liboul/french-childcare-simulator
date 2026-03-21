import { describe, expect, it } from "vitest";
import rulesFr2026 from "../../config/rules.fr-2026.json" with { type: "json" };
import { parseRulePack } from "../config/parse";
import { computeScenarioSnapshot } from "../scenario/aggregate";

const packResult = parseRulePack(rulesFr2026);
if (!packResult.ok) {
  throw new Error(packResult.error);
}
const pack = packResult.data;

const baseNounou = {
  household: { taxYear: 2026 },
  cmg: {
    cumul: {},
    monthlyReferenceIncomeEur: 4000,
    householdEffortRank: 1,
    hourlyDeclaredGrossEur: 12,
    heuresParMois: 80,
  },
} as const;

describe("invariants monétaires (GARDE-030)", () => {
  it("nounou à domicile : hausse du brut horaire augmente le brut mensuel", () => {
    const low = computeScenarioSnapshot(pack, {
      ...baseNounou,
      brutInput: {
        mode: "nounou_domicile",
        hourlyGrossEur: 10,
        hoursPerMonth: 80,
        employerShareOfGross: 0.42,
      },
    });
    const high = computeScenarioSnapshot(pack, {
      ...baseNounou,
      brutInput: {
        mode: "nounou_domicile",
        hourlyGrossEur: 15,
        hoursPerMonth: 80,
        employerShareOfGross: 0.42,
      },
    });
    expect(high.snapshot.monthlyBrutEur).toBeGreaterThan(low.snapshot.monthlyBrutEur);
  });
});
