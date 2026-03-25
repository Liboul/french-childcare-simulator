import { describe, expect, it } from "bun:test";
import {
  computeNounouEmployerCostFromHourly,
  computePatronalChargesFromGrossMonthlyEur,
} from "./nounou-employer-cost-from-hourly";

describe("nounou-employer-cost-from-hourly", () => {
  it("cotisations = min(brut×44,696%+5, brut×47,396%)", () => {
    const brut = 1155.44;
    const { chargesEur } = computePatronalChargesFromGrossMonthlyEur(brut);
    const a = brut * 0.44696 + 5;
    const b = brut * 0.47396;
    expect(chargesEur).toBe(Math.round(Math.min(a, b) * 100) / 100);
  });

  it("terrain validation — ordres de grandeur (±1 €)", () => {
    const r = computeNounouEmployerCostFromHourly({
      hourlyGrossRateEur: 15,
      weeklyHoursFullTime: 40,
      householdShareFraction: 0.4444,
      includeIcp: true,
      monthlyMealAllowanceEur: 0,
    });
    expect(Math.abs(r.computedMonthlyGrossSalaryEur - 1156)).toBeLessThanOrEqual(1);
    expect(Math.abs(r.computedMonthlyPatronalChargesEur - 521)).toBeLessThanOrEqual(1);
    expect(Math.abs(r.computedMonthlyIcpEur - 116)).toBeLessThanOrEqual(1);
    expect(Math.abs(r.monthlyEmploymentCostEur - 1793)).toBeLessThanOrEqual(1);
  });
});
