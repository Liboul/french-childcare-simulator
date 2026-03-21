import { describe, expect, it } from "vitest";
import { calculateScenario } from "../../harness/handle-calculate";
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
  });

  it("rejette un corps non-objet", () => {
    expect(() => calculateScenario(null)).toThrow("request_body_must_be_a_json_object");
    expect(() => calculateScenario([])).toThrow("request_body_must_be_a_json_object");
  });
});
