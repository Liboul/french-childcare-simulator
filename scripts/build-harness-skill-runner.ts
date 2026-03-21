/**
 * Produces a single Node-runnable bundle for the harness skill (`scripts/simulate.mjs` in the packaged folder).
 */
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const root = join(import.meta.dir, "..");
const outDir = join(root, "dist", "harness-skill-runner");
const outfile = join(outDir, "simulate.mjs");
const entry = join(root, "scripts", "harness-skill-simulate-entry.ts");

await mkdir(outDir, { recursive: true });

const r = spawnSync(
  "bun",
  ["build", entry, "--outfile", outfile, "--target", "node", "--packages", "bundle"],
  { cwd: root, stdio: "inherit" },
);

if (r.status !== 0) {
  process.exit(r.status ?? 1);
}

console.log(`Harness skill runner: ${outfile}`);
