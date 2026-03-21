import { describe, expect, it } from "vitest";
import { incomeTaxBaremeFr2026 } from "./bareme-fr-2026";
import {
  annualNetTaxableFromGrossSalaryEur,
  estimateFrenchIncomeTax2026,
} from "./estimate-fr-2026";

describe("estimateFrenchIncomeTax2026", () => {
  it("DR-07 § 2.3 : RNI 30 000 €, 1 part, TMI 30 % (barème continu ; léger écart vs arrondis SP)", () => {
    const r = estimateFrenchIncomeTax2026({
      annualNetTaxableIncomeEur: 30_000,
      householdTaxParts: 1,
      filing: "individual",
    });
    expect(r.quotientEur).toBe(30_000);
    expect(r.marginalIncomeTaxRate).toBe(0.3);
    expect(r.incomeTaxGrossAnnualEur).toBe(2103.99);
    expect(r.decoteAnnualEur).toBe(0);
  });

  it("zone décote : IR brut modéré → décote > 0", () => {
    const r = estimateFrenchIncomeTax2026({
      annualNetTaxableIncomeEur: 25_236.36,
      householdTaxParts: 1,
      filing: "individual",
    });
    expect(r.incomeTaxGrossAnnualEur).toBe(1500);
    expect(r.decoteAnnualEur).toBeGreaterThan(0);
    expect(r.warnings).toContain("income_tax_decote_zone_tmi_nonlinear_dr07");
  });
});

describe("annualNetTaxableFromGrossSalaryEur", () => {
  it("abattement 10 % borné min / max (DR-07)", () => {
    const low = annualNetTaxableFromGrossSalaryEur(5000, incomeTaxBaremeFr2026);
    expect(low).toBe(5000 - 509);
    const mid = annualNetTaxableFromGrossSalaryEur(50_000, incomeTaxBaremeFr2026);
    expect(mid).toBe(45_000);
  });
});
