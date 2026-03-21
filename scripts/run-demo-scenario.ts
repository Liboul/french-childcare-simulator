import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import rulesFr2026 from "../config/rules.fr-2026.json" with { type: "json" };
import { parseRulePack } from "../src/config/parse";
import { computeScenarioSnapshot } from "../src/scenario/aggregate";
import type { ScenarioInput } from "../src/scenario/types";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const scenarioArg = process.argv[2];
if (!scenarioArg) {
  console.error("Usage: bun run scripts/run-demo-scenario.ts <chemin/scenario.json>");
  process.exit(1);
}

const scenarioPath = scenarioArg.startsWith("/") ? scenarioArg : join(root, scenarioArg);
const input = JSON.parse(readFileSync(scenarioPath, "utf8")) as ScenarioInput;

const packResult = parseRulePack(rulesFr2026);
if (!packResult.ok) {
  throw new Error(packResult.error);
}

const result = computeScenarioSnapshot(packResult.data, input);
const out = {
  snapshot: result.snapshot,
  warnings: result.warnings,
  uncertainty: {
    flags: result.uncertainty.flags,
    referencedRulesPendingVerification: result.uncertainty.referencedRulesPendingVerification,
  },
};
console.log(JSON.stringify(out, null, 2));
