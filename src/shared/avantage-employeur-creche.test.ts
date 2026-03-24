import { describe, expect, it } from "bun:test";
import {
  computeEmployerChildcareAidTaxableExcessAnnual,
  readAvantageEmployeurCrecheParams,
} from "./avantage-employeur-creche";
import { getRulePack } from "./load-rules";

describe("avantage-employeur-creche", () => {
  it("reads exempt threshold from pack", () => {
    const p = readAvantageEmployeurCrecheParams(getRulePack());
    expect(p?.exemptAnnualAmountPerChildEur).toBe(1830);
  });

  it("splits exempt vs taxable excess", () => {
    const out = computeEmployerChildcareAidTaxableExcessAnnual(1830, 2000, 1);
    expect(out.exemptPortionAnnualEur).toBe(1830);
    expect(out.taxableExcessAnnualEur).toBe(170);
  });
});
