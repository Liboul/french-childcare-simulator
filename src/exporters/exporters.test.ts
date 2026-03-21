import { describe, expect, it } from "vitest";
import rulesFr2026 from "../../config/rules.fr-2026.json" with { type: "json" };
import { parseRulePack } from "../config/parse";
import { computeScenarioSnapshot } from "../scenario/aggregate";
import { buildScenarioExportBundle } from "./bundle";
import { exportScenarioBundleToCsv } from "./csv-export";
import { exportScenarioBundleToHtml } from "./html-export";
import { exportScenarioBundleToJson } from "./json-export";

const packResult = parseRulePack(rulesFr2026);
if (!packResult.ok) {
  throw new Error(packResult.error);
}
const pack = packResult.data;

function sampleScenario() {
  const hypotheses = {
    household: { taxYear: 2026 },
    brutInput: {
      mode: "nounou_domicile" as const,
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
  const result = computeScenarioSnapshot(pack, hypotheses);
  return { hypotheses, result };
}

describe("buildScenarioExportBundle + exports", () => {
  it("JSON parseable avec hypothèses et snapshot", () => {
    const { hypotheses, result } = sampleScenario();
    const bundle = buildScenarioExportBundle(pack, hypotheses, result, {
      title: "Test export",
    });
    const json = exportScenarioBundleToJson(bundle);
    const parsed = JSON.parse(json) as {
      hypotheses: { brutInput: { mode: string } };
      result: { snapshot: { mode: string } };
    };
    expect(parsed.hypotheses.brutInput.mode).toBe("nounou_domicile");
    expect(parsed.result.snapshot.mode).toBe("nounou_domicile");
  });

  it("CSV contient metric monthlyBrutEur et une ligne trace", () => {
    const { hypotheses, result } = sampleScenario();
    const bundle = buildScenarioExportBundle(pack, hypotheses, result);
    const csv = exportScenarioBundleToCsv(bundle);
    expect(csv).toContain("metric,snapshot.monthlyBrutEur,");
    expect(csv).toMatch(/\ntrace,/);
    expect(csv).toContain("scenario_brut_monthly");
  });

  it("HTML contient titre échappé et une étape de trace", () => {
    const { hypotheses, result } = sampleScenario();
    const bundle = buildScenarioExportBundle(pack, hypotheses, result, {
      title: "Rapport <garde>",
    });
    const html = exportScenarioBundleToHtml(bundle);
    expect(html).toContain("Rapport &lt;garde&gt;");
    expect(html).toContain("scenario_brut_monthly");
    expect(html).not.toContain("<garde>");
  });
});
