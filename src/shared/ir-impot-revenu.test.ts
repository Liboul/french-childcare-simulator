import { describe, expect, test } from "bun:test";
import rulesFr2026 from "../../config/rules.fr-2026.json" with { type: "json" };
import { parseRulePack } from "../config/parse";
import {
  computeIrFoyerSimplifie,
  computeIrProgressiveParPart,
  computeTmiMarginalQuotient,
  readIrBaremeParams,
} from "./ir-impot-revenu";

describe("ir-impot-revenu (DR-07 barème)", () => {
  const parsed = parseRulePack(rulesFr2026);
  if (!parsed.ok) throw new Error(String(parsed.error));
  const params = readIrBaremeParams(parsed.data);
  if (!params) throw new Error("readIrBaremeParams");

  test("TMI — cas célibataire 30 000 € / part (DR-07 §2.3)", () => {
    expect(computeTmiMarginalQuotient(params, 30_000)).toBe(0.3);
  });

  test("TMI — tranches basses et hautes", () => {
    expect(computeTmiMarginalQuotient(params, 10_000)).toBe(0);
    expect(computeTmiMarginalQuotient(params, 12_000)).toBe(0.11);
    expect(computeTmiMarginalQuotient(params, 11600)).toBe(0);
    expect(computeTmiMarginalQuotient(params, 200_000)).toBe(0.45);
  });

  test("IR par part — cohérent avec l’exemple DR-07 §2.3 (tolérance arrondis)", () => {
    const irParPart = computeIrProgressiveParPart(params, 30_000);
    expect(Math.abs(irParPart - 2103.58)).toBeLessThan(1);
  });

  test("computeIrFoyerSimplifie — 30 000 €, 1 part", () => {
    const r = computeIrFoyerSimplifie(params, {
      revenuNetImposableEur: 30_000,
      nombreParts: 1,
    });
    expect(r).not.toBeNull();
    if (!r) return;
    expect(r.quotientFamilial).toBe(30_000);
    expect(r.tmi).toBe(0.3);
    expect(Math.abs(r.irBrutEur - 2103.58)).toBeLessThan(1);
    expect(r.warnings.length).toBeGreaterThan(0);
  });

  test("entrées invalides → null", () => {
    expect(
      computeIrFoyerSimplifie(params, { revenuNetImposableEur: 10_000, nombreParts: 0 }),
    ).toBeNull();
  });
});
