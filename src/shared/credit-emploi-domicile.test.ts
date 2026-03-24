import { describe, expect, it } from "bun:test";
import { getRulePack } from "./load-rules";
import {
  computeCreditEmploiDomicileAnnual,
  readCreditEmploiDomicileParams,
} from "./credit-emploi-domicile";

describe("credit-emploi-domicile", () => {
  it("applies 50% under annual ceiling with CMG deducted from base", () => {
    const pack = getRulePack();
    const pp = readCreditEmploiDomicileParams(pack);
    expect(pp).not.toBeNull();
    const out = computeCreditEmploiDomicileAnnual(pp!, {
      monthlyEmploymentCostEur: 2000,
      monthlyCmgEur: 400,
      childrenCountForCeiling: 1,
      custody: "full",
    });
    expect(out.annualCeilingExpenseEur).toBe(13500);
    const annualNetUncapped = 2000 * 12 - 400 * 12;
    expect(out.annualEligibleExpenseEur).toBe(13500);
    expect(out.annualCreditEur).toBe(0.5 * 13500);
    expect(annualNetUncapped).toBeGreaterThan(13500);
  });

  it("halves per-child increment when custody is shared", () => {
    const pack = getRulePack();
    const pp = readCreditEmploiDomicileParams(pack)!;
    const full = computeCreditEmploiDomicileAnnual(pp, {
      monthlyEmploymentCostEur: 1000,
      monthlyCmgEur: 0,
      childrenCountForCeiling: 1,
      custody: "full",
    });
    const shared = computeCreditEmploiDomicileAnnual(pp, {
      monthlyEmploymentCostEur: 1000,
      monthlyCmgEur: 0,
      childrenCountForCeiling: 1,
      custody: "shared",
    });
    expect(shared.annualCeilingExpenseEur).toBeLessThan(full.annualCeilingExpenseEur);
  });
});
