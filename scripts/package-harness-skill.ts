/**
 * Assemble a harness Agent Skill folder + ZIP for upload (e.g. claude.ai, Codex) or sharing.
 * Builds `scripts/simulate.mjs` first (GARDE-035). See docs/shipping/README.md.
 */
import { copyFile, mkdir, readdir, rm } from "node:fs/promises";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const root = join(import.meta.dir, "..");
const skillName = "comparatif-modes-garde-fr-2026";
const bundleRoot = join(root, "dist", "harness-skill");
const outDir = join(bundleRoot, skillName);

const buildRunner = spawnSync(
  "bun",
  ["run", join(root, "scripts", "build-harness-skill-runner.ts")],
  {
    cwd: root,
    stdio: "inherit",
  },
);
if (buildRunner.status !== 0) {
  process.exit(buildRunner.status ?? 1);
}

await rm(bundleRoot, { recursive: true, force: true });
await mkdir(join(outDir, "examples"), { recursive: true });
await mkdir(join(outDir, "scripts"), { recursive: true });

const fileCopies: [string, string][] = [
  [join(root, "harness/skill/SKILL.md"), join(outDir, "SKILL.md")],
  [join(root, "harness/skill/REFERENCE.md"), join(outDir, "REFERENCE.md")],
  [join(root, "harness/INTAKE.md"), join(outDir, "INTAKE.md")],
  [join(root, "harness/scenario-input.schema.json"), join(outDir, "scenario-input.schema.json")],
];

for (const [from, to] of fileCopies) {
  await copyFile(from, to);
}

await copyFile(
  join(root, "dist", "harness-skill-runner", "simulate.mjs"),
  join(outDir, "scripts", "simulate.mjs"),
);

const demoDir = join(root, "docs", "demo-scenarios");
const demos = (await readdir(demoDir)).filter((f) => f.endsWith(".json"));
for (const f of demos) {
  await copyFile(join(demoDir, f), join(outDir, "examples", f));
}

const zipName = `${skillName}-skill.zip`;
const zipPath = join(root, "dist", zipName);
await rm(zipPath, { force: true });

const zip = spawnSync("zip", ["-r", zipPath, skillName], {
  cwd: bundleRoot,
  stdio: "inherit",
});

if (zip.status !== 0) {
  console.error(
    "zip command failed (install zip, or compress manually):",
    join(bundleRoot, skillName),
  );
  process.exit(zip.status ?? 1);
}

console.log(`Harness skill bundle: ${outDir}`);
console.log(`ZIP (Agent Skills–compatible hosts): ${zipPath}`);
