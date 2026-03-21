import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { safeParseScenarioInput } from "./scenario-input.schema";

describe("safeParseScenarioInput", () => {
  it("rejette un objet sans brutInput", () => {
    const r = safeParseScenarioInput({ household: { taxYear: 2026 }, cmg: { cumul: {} } });
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.issues.some((i) => i.path.join(".") === "brutInput")).toBe(true);
  });

  it("rejette incomeTax avec net et brut simultanés", () => {
    const r = safeParseScenarioInput({
      household: { taxYear: 2026 },
      brutInput: { mode: "creche_privee", monthlyParticipationEur: 500 },
      cmg: {
        cumul: {},
        annualReferenceIncomeN2Eur: 20_000,
        structureDependentChildren: 1,
        childAgeBand: "under3",
        monthlyStructureExpenseEur: 500,
        hourlyCrecheFeeEur: 9,
      },
      incomeTax: {
        annualNetTaxableIncomeEur: 30_000,
        annualGrossSalaryEur: 40_000,
        householdTaxParts: 1,
        filing: "individual",
      },
    });
    expect(r.ok).toBe(false);
  });

  it("accepte incomeTax avec seulement annualHouseholdIncomeAfterIncomeTaxEur", () => {
    const r = safeParseScenarioInput({
      household: { taxYear: 2026 },
      brutInput: { mode: "creche_privee", monthlyParticipationEur: 500 },
      cmg: {
        cumul: {},
        annualReferenceIncomeN2Eur: 20_000,
        structureDependentChildren: 1,
        childAgeBand: "under3",
        monthlyStructureExpenseEur: 500,
        hourlyCrecheFeeEur: 9,
      },
      incomeTax: { annualHouseholdIncomeAfterIncomeTaxEur: 40_000 },
    });
    expect(r.ok).toBe(true);
  });

  it("accepte chaque fichier JSON sous docs/demo-scenarios/", () => {
    const dir = join(process.cwd(), "docs", "demo-scenarios");
    const names = readdirSync(dir).filter((f) => f.endsWith(".json"));
    expect(names.length).toBeGreaterThan(0);
    for (const name of names) {
      const raw = JSON.parse(readFileSync(join(dir, name), "utf8"));
      const r = safeParseScenarioInput(raw);
      expect(r.ok, `fixture ${name}`).toBe(true);
    }
  });
});
