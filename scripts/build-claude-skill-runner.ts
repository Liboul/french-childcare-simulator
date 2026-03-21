/**
 * Produces a single Node-runnable bundle for the Claude skill (`scripts/simulate.mjs`).
 */
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const root = join(import.meta.dir, "..");
const outDir = join(root, "dist", "claude-skill-runner");
const outfile = join(outDir, "simulate.mjs");
const entry = join(root, "scripts", "claude-skill-simulate-entry.ts");

await mkdir(outDir, { recursive: true });

const r = spawnSync(
  "bun",
  ["build", entry, "--outfile", outfile, "--target", "node", "--packages", "bundle"],
  { cwd: root, stdio: "inherit" },
);

if (r.status !== 0) {
  process.exit(r.status ?? 1);
}

console.log(`Claude skill runner: ${outfile}`);
