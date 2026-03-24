import { describe, expect, test } from "bun:test";
import { creditImpotVsIrBrutIndicatif } from "./credit-vs-ir-brut";

describe("creditImpotVsIrBrutIndicatif", () => {
  test("crédit inférieur à l’IR : tout imputable, pas d’excédent remboursable", () => {
    const r = creditImpotVsIrBrutIndicatif({ annualCreditImpotEur: 800, irBrutEur: 2000 });
    expect(r.creditImputableCommeReductionIrEur).toBe(800);
    expect(r.excedentRemboursableEur).toBe(0);
    expect(r.notes.length).toBe(0);
  });

  test("crédit supérieur à l’IR brut : imputable plafonné, surplus remboursable", () => {
    const r = creditImpotVsIrBrutIndicatif({ annualCreditImpotEur: 3000, irBrutEur: 2100 });
    expect(r.creditImputableCommeReductionIrEur).toBe(2100);
    expect(r.excedentRemboursableEur).toBe(900);
    expect(r.notes.length).toBeGreaterThan(0);
  });
});
