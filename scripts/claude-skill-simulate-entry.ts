/**
 * Bundled entry for the Claude.ai skill (`scripts/simulate.mjs`).
 * Build: `bun run build:claude-skill-runner`
 */
import { readFileSync } from "node:fs";
import { calculateScenario, ScenarioValidationError } from "../harness/handle-calculate";

function usage(): never {
  console.error(
    "Usage: node scripts/simulate.mjs <scenario.json>  |  node scripts/simulate.mjs -  < scenario.json",
  );
  process.exit(1);
}

function isScenarioValidationError(e: unknown): e is ScenarioValidationError {
  return (
    e instanceof Error &&
    e.name === "ScenarioValidationError" &&
    "issues" in e &&
    Array.isArray((e as ScenarioValidationError).issues)
  );
}

const arg = process.argv[2];
if (!arg) usage();

let raw: unknown;
try {
  if (arg === "-") {
    raw = JSON.parse(readFileSync(0, "utf8"));
  } else {
    raw = JSON.parse(readFileSync(arg, "utf8"));
  }
} catch (e) {
  console.error(JSON.stringify({ error: "invalid_json", message: String(e) }, null, 2));
  process.exit(1);
}

try {
  const result = calculateScenario(raw);
  console.log(JSON.stringify(result, null, 2));
} catch (e) {
  if (isScenarioValidationError(e)) {
    console.error(JSON.stringify({ error: "validation_failed", issues: e.issues }, null, 2));
    process.exit(1);
  }
  console.error(JSON.stringify({ error: "internal_error", message: String(e) }, null, 2));
  process.exit(1);
}
