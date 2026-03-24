import { describe, expect, test } from "bun:test";
import { monthlyCashflowAfterAides } from "./monthly-cashflow-after-aides";

describe("monthlyCashflowAfterAides", () => {
  test("mensualise le crédit annuel et déduit du cash après CMG", () => {
    const r = monthlyCashflowAfterAides({
      monthlyGrossCostEur: 1000,
      monthlyCmgEur: 200,
      annualCreditImpotEur: 1200,
    });
    expect(r.monthlyCreditEquivalentEur).toBe(100);
    expect(r.netMonthlyCashAfterCmgEur).toBe(800);
    expect(r.netMonthlyBurdenAfterCreditEur).toBe(700);
  });
});
