/**
 * Assemble a Claude Skill folder + ZIP for upload (claude.ai) or sharing.
 * See docs/shipping/README.md § Anthropic — packager et publier.
 */
import { copyFile, mkdir, readdir, rm } from "node:fs/promises";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const root = join(import.meta.dir, "..");
const skillName = "comparatif-modes-garde-fr-2026";
const bundleRoot = join(root, "dist", "claude-skill");
const outDir = join(bundleRoot, skillName);

await rm(bundleRoot, { recursive: true, force: true });
await mkdir(join(outDir, "examples"), { recursive: true });

const fileCopies: [string, string][] = [
  [join(root, "harness/claude/SKILL.md"), join(outDir, "SKILL.md")],
  [join(root, "harness/claude/REFERENCE.md"), join(outDir, "REFERENCE.md")],
  [join(root, "harness/INTAKE.md"), join(outDir, "INTAKE.md")],
  [join(root, "harness/openapi.yaml"), join(outDir, "openapi.yaml")],
  [join(root, "harness/scenario-input.schema.json"), join(outDir, "scenario-input.schema.json")],
];

for (const [from, to] of fileCopies) {
  await copyFile(from, to);
}

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

console.log(`Claude skill bundle: ${outDir}`);
console.log(`ZIP (upload to claude.ai Skills): ${zipPath}`);
