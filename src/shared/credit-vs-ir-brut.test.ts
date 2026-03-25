import { describe, expect, test } from "bun:test";
import { computeCreditVsIrBrutSatellite, creditImpotVsIrBrutIndicatif } from "./credit-vs-ir-brut";
import { getRulePack } from "./load-rules";

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

describe("computeCreditVsIrBrutSatellite — notes agent (RNI figé, coût réel global)", () => {
  test("notes mentionnent baisse de brut, IR non recalculé et diminution d’IR hors lignes garde", () => {
    const pack = getRulePack();
    const sat = computeCreditVsIrBrutSatellite(pack, 1750, {
      revenuNetImposableEur: 45_000,
      nombreParts: 2,
    });
    expect(sat).not.toBeNull();
    const text = sat!.notes.join(" ");
    expect(text).toContain("baisse de brut");
    expect(text).toContain("diminution d’IR");
    expect(text).toContain("coût réel global");
  });
});
