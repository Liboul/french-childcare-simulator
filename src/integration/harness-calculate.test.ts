import { describe, expect, it } from "vitest";
import rulesFr2026 from "../../config/rules.fr-2026.json" with { type: "json" };
import { calculateScenario, ScenarioValidationError } from "../../harness/handle-calculate";
import type { ScenarioInput } from "../scenario/types";

describe("harness calculateScenario", () => {
  it("calcule un scénario démo nounou", () => {
    const input: ScenarioInput = {
      household: { taxYear: 2026 },
      brutInput: {
        mode: "nounou_domicile",
        hourlyGrossEur: 12,
        hoursPerMonth: 80,
        employerShareOfGross: 0.42,
      },
      cmg: {
        cumul: {},
        monthlyReferenceIncomeEur: 4000,
        householdEffortRank: 1,
        hourlyDeclaredGrossEur: 12,
        heuresParMois: 80,
      },
    };
    const r = calculateScenario(input);
    expect(r.snapshot.mode).toBe("nounou_domicile");
    expect(r.snapshot.netHouseholdBurdenAnnualEur).toBeGreaterThanOrEqual(0);
    expect(r.trace.steps.length).toBeGreaterThan(0);
    expect(r.meta.engineVersion).toMatch(/^\d+\.\d+\.\d+/u);
    expect(r.meta.rulePackVersion).toBe(rulesFr2026.version);
    expect(Array.isArray(r.limitationHints)).toBe(true);
  });

  it("rejette un corps non-objet", () => {
    expect(() => calculateScenario(null)).toThrow("request_body_must_be_a_json_object");
    expect(() => calculateScenario([])).toThrow("request_body_must_be_a_json_object");
  });

  it("rejette un JSON objet qui ne valide pas ScenarioInput", () => {
    expect(() => calculateScenario({ household: { taxYear: 2026 } })).toThrow(
      ScenarioValidationError,
    );
  });
});
