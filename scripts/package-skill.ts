/**
 * Assemble le dossier skill + ZIP (distillat uniquement — pas `docs/research/`).
 */
import { spawnSync } from "node:child_process";
import { copyFile, cp, mkdir, rm, stat, unlink } from "node:fs/promises";
import { join } from "node:path";

const root = join(import.meta.dir, "..");
const skillFolderName = "comparatif-modes-garde-fr-2026";
const stageRoot = join(root, "dist", "skill-stage");
const outDir = join(stageRoot, skillFolderName);

await rm(stageRoot, { recursive: true, force: true });
await mkdir(join(outDir, "scripts"), { recursive: true });
await mkdir(join(outDir, "config"), { recursive: true });

const build = spawnSync(
  "bun",
  [
    "build",
    join(root, "scripts", "skill-simulate-entry.ts"),
    "--outfile",
    join(outDir, "scripts", "simulate.mjs"),
    "--target",
    "node",
    "--packages",
    "bundle",
  ],
  { cwd: root, stdio: "inherit" },
);
if (build.status !== 0) {
  process.exit(build.status ?? 1);
}

const skillDocs: [string, string][] = [
  [join(root, "skill", "SKILL.md"), join(outDir, "SKILL.md")],
  [join(root, "skill", "INTAKE.md"), join(outDir, "INTAKE.md")],
  [join(root, "skill", "REFERENCE.md"), join(outDir, "REFERENCE.md")],
  [join(root, "skill", "DISTILLAT.md"), join(outDir, "DISTILLAT.md")],
];
for (const [from, to] of skillDocs) {
  await copyFile(from, to);
}

await copyFile(
  join(root, "config", "rules.fr-2026.json"),
  join(outDir, "config", "rules.fr-2026.json"),
);
await copyFile(
  join(root, "config", "rules.example.json"),
  join(outDir, "config", "rules.example.json"),
);

await cp(join(root, "src", "config"), join(outDir, "src", "config"), { recursive: true });
await unlink(join(outDir, "src", "config", "schema.test.ts")).catch((e: unknown) => {
  const err = e as { code?: string };
  if (err.code !== "ENOENT") throw e;
});
await cp(join(root, "src", "shared"), join(outDir, "src", "shared"), { recursive: true });
await unlink(join(outDir, "src", "shared", "load-rules.test.ts")).catch((e: unknown) => {
  const err = e as { code?: string };
  if (err.code !== "ENOENT") throw e;
});
await cp(join(root, "src", "scenarios"), join(outDir, "src", "scenarios"), { recursive: true });
await unlink(join(outDir, "src", "scenarios", "scenarios.test.ts")).catch((e: unknown) => {
  const err = e as { code?: string };
  if (err.code !== "ENOENT") throw e;
});

if (!(await stat(join(outDir, "scripts", "simulate.mjs"))).isFile()) {
  console.error("Missing scripts/simulate.mjs");
  process.exit(1);
}

const zipName = `${skillFolderName}-skill.zip`;
const zipPath = join(root, "dist", zipName);
await rm(zipPath, { force: true });

const zip = spawnSync("zip", ["-r", zipPath, skillFolderName], {
  cwd: stageRoot,
  stdio: "inherit",
});
if (zip.status !== 0) {
  console.error("zip failed; output folder:", outDir);
  process.exit(zip.status ?? 1);
}

try {
  await stat(join(outDir, "research"));
  console.error("research/ must not be in skill bundle");
  process.exit(1);
} catch (e: unknown) {
  const err = e as { code?: string };
  if (err.code !== "ENOENT") throw e;
}

console.log(`Skill folder: ${outDir}`);
console.log(`ZIP: ${zipPath}`);
