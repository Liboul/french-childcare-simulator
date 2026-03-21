import { describe, expect, it } from "vitest";
import rulesFr2026 from "../../config/rules.fr-2026.json" with { type: "json" };
import { parseRulePack } from "../config/parse";
import { computeScenarioSnapshot } from "../scenario/aggregate";
import { brutInputReferencedRuleIds } from "./brut-rule-refs";
import { engineWarningsToFlags } from "./engine-warnings";
import { listTodoVerifyRules } from "./pack-todo-verify";
import { readPajemploiIndicativeRates } from "./pajemploi-variant";
import { buildUncertaintyReport } from "./report";

const packResult = parseRulePack(rulesFr2026);
if (!packResult.ok) {
  throw new Error(packResult.error);
}
const pack = packResult.data;

describe("readPajemploiIndicativeRates", () => {
  it("DR-03 vs DR-04 → parts employeur distinctes", () => {
    const a = readPajemploiIndicativeRates(pack, "dr03");
    const b = readPajemploiIndicativeRates(pack, "dr04");
    expect(a.ok && b.ok).toBe(true);
    if (!a.ok || !b.ok) return;
    expect(a.employerShareOfGrossApprox).toBe(0.42);
    expect(b.employerShareOfGrossApprox).toBe(0.25);
    expect(a.warnings).toContain("pajemploi_variant_explicitly_selected:dr03");
    expect(b.warnings).toContain("pajemploi_variant_explicitly_selected:dr04");
  });
});

describe("buildUncertaintyReport", () => {
  it("référence une règle todoVerify → elle apparaît", () => {
    const r = buildUncertaintyReport(pack, {
      engineWarnings: [
        "scenario_annual_tax_credit_uses_brut_x12_as_eligible_expense_simplification",
      ],
      referencedRuleIds: ["garde-partagee-majoration-simultanes-dr04"],
    });
    expect(
      r.referencedRulesPendingVerification.some(
        (x) => x.id === "garde-partagee-majoration-simultanes-dr04",
      ),
    ).toBe(true);
    expect(r.flags.some((f) => f.code.includes("scenario_annual_tax_credit"))).toBe(true);
  });
});

describe("listTodoVerifyRules", () => {
  it("liste non vide sur le pack 2026", () => {
    const list = listTodoVerifyRules(pack);
    expect(list.length).toBeGreaterThan(0);
  });
});

describe("engineWarningsToFlags", () => {
  it("classe info vs warning", () => {
    const f = engineWarningsToFlags([
      "scenario_annual_tax_credit_uses_brut_x12_as_eligible_expense_simplification",
      "employer_childcare_support_differs_from_reference_scenario",
    ]);
    expect(f.find((x) => x.code.includes("scenario_annual"))?.severity).toBe("info");
    expect(f.find((x) => x.code.includes("employer_childcare"))?.severity).toBe("warning");
  });
});

describe("brutInputReferencedRuleIds + scénario partagé", () => {
  it("nounou partagée → règle majoration référencée", () => {
    const ids = brutInputReferencedRuleIds({
      mode: "nounou_partagee",
      hourlyGrossEur: 12,
      hoursPerMonth: 80,
      simultaneousChildrenCount: 2,
      householdShareOfSalary: 0.5,
      employerShareOfGross: 0.42,
    });
    expect(ids).toContain("garde-partagee-majoration-simultanes-dr04");
  });

  it("computeScenarioSnapshot inclut cette règle dans uncertainty", () => {
    const r = computeScenarioSnapshot(pack, {
      household: { taxYear: 2026 },
      brutInput: {
        mode: "nounou_partagee",
        hourlyGrossEur: 12,
        hoursPerMonth: 80,
        simultaneousChildrenCount: 2,
        householdShareOfSalary: 0.5,
        employerShareOfGross: 0.42,
      },
      cmg: {
        cumul: {},
        monthlyReferenceIncomeEur: 4000,
        householdEffortRank: 1,
        hourlyDeclaredGrossEur: 12,
        heuresParMois: 80,
      },
    });
    expect(
      r.uncertainty.referencedRulesPendingVerification.some(
        (x) => x.id === "garde-partagee-majoration-simultanes-dr04",
      ),
    ).toBe(true);
  });
});
