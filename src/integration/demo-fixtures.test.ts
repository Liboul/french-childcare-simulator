import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import rulesFr2026 from "../../config/rules.fr-2026.json" with { type: "json" };
import { parseRulePack } from "../config/parse";
import { computeScenarioSnapshot } from "../scenario/aggregate";
import type { ScenarioInput } from "../scenario/types";

const packResult = parseRulePack(rulesFr2026);
if (!packResult.ok) {
  throw new Error(packResult.error);
}
const pack = packResult.data;

const DEMO_FIXTURES = [
  "docs/demo-scenarios/nounou-domicile-couple-2026.json",
  "docs/demo-scenarios/micro-creche-bas-revenus-2026.json",
  "docs/demo-scenarios/assistante-maternelle-2026.json",
] as const;

describe("docs/demo-scenarios fixtures", () => {
  it.each(DEMO_FIXTURES)("%s : computeScenarioSnapshot ok, RAC ≥ 0", (rel) => {
    const path = join(process.cwd(), rel);
    const input = JSON.parse(readFileSync(path, "utf8")) as ScenarioInput;
    const r = computeScenarioSnapshot(pack, input);
    expect(r.snapshot.netHouseholdBurdenAnnualEur).toBeGreaterThanOrEqual(0);
    expect(r.snapshot.mode).toBe(input.brutInput.mode);
  });
});
