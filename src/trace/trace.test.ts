import { describe, expect, it } from "vitest";
import { CALCULATION_BLOCK_LABEL } from "./calculation-block";
import { appendStep, emptyTrace } from "./trace";
import type { CalculationStep } from "./calculation-step";
import type { SourceRef } from "./source-ref";

const spF8: SourceRef = {
  id: "sp-f8",
  title: "Crédit d'impôt pour frais de garde d'enfants",
  url: "https://www.service-public.fr/particuliers/vosdroits/F8",
};

describe("CalculationTrace", () => {
  it("builds an ordered trace with sources", () => {
    const step1: CalculationStep = {
      id: "brut-creche",
      block: "B",
      order: 1,
      label: "Coût brut mensuel crèche",
      formula: "heures * tarif_horaire",
      ruleId: "TODO-VERIFY-tarif",
      sources: [],
    };

    const step2: CalculationStep = {
      id: "credit-garde",
      block: "E",
      order: 2,
      label: "Crédit d'impôt garde",
      formula: "min(0.5 * base_eligible, plafond)",
      narrative: "Base et plafond issus du barème officiel.",
      sources: [spF8],
    };

    let trace = emptyTrace();
    trace = appendStep(trace, step1);
    trace = appendStep(trace, step2);

    expect(trace.steps).toHaveLength(2);
    expect(trace.steps[0]?.block).toBe("B");
    expect(trace.steps[1]?.sources[0]?.url).toContain("service-public.fr");
    expect(CALCULATION_BLOCK_LABEL["G"]).toBe("Résultat final");
  });
});
