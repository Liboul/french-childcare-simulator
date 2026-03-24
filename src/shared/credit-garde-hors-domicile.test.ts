import { describe, expect, it } from "bun:test";
import { getRulePack } from "./load-rules";
import {
  computeCreditGardeHorsDomicileAnnual,
  readCreditGardeHorsDomicileParams,
} from "./credit-garde-hors-domicile";

describe("credit-garde-hors-domicile", () => {
  it("caps eligible at 3500 € / enfant (garde pleine) and credit at 1750 € / enfant", () => {
    const pack = getRulePack();
    const pp = readCreditGardeHorsDomicileParams(pack);
    expect(pp).not.toBeNull();
    const out = computeCreditGardeHorsDomicileAnnual(pp!, {
      monthlyParticipationEur: 400,
      monthlyCmgEur: 0,
      childrenCount: 1,
      custody: "full",
    });
    expect(out.annualEligibleExpenseEur).toBe(3500);
    expect(out.annualCreditEur).toBe(1750);
  });

  it("deducts CMG from annual base when pack says so", () => {
    const pack = getRulePack();
    const pp = readCreditGardeHorsDomicileParams(pack)!;
    const out = computeCreditGardeHorsDomicileAnnual(pp, {
      monthlyParticipationEur: 200,
      monthlyCmgEur: 50,
      childrenCount: 1,
      custody: "full",
    });
    expect(out.annualEligibleExpenseEur).toBe(1800);
    expect(out.annualCreditEur).toBe(900);
  });
});
