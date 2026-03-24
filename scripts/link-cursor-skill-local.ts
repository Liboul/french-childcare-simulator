/**
 * Usage local uniquement : crée le symlink `.cursor/skills/<skill>/` → `dist/skill-stage/<skill>/`.
 * Prérequis : `bun run package:skill` (CI : ne pas appeler ce script).
 */
import { mkdir, rm, stat, symlink } from "node:fs/promises";
import { join } from "node:path";

const root = join(import.meta.dir, "..");
const skillFolderName = "comparatif-modes-garde-fr-2026";
const staged = join(root, "dist", "skill-stage", skillFolderName);
const cursorSkillsDir = join(root, ".cursor", "skills");
const linkPath = join(cursorSkillsDir, skillFolderName);
const relTarget = join("..", "..", "dist", "skill-stage", skillFolderName);

try {
  await stat(staged);
} catch (e: unknown) {
  const err = e as { code?: string };
  if (err.code === "ENOENT") {
    console.error("Dossier skill absent. Lance d’abord : bun run package:skill");
    process.exit(1);
  }
  throw e;
}

await mkdir(cursorSkillsDir, { recursive: true });
await rm(linkPath, { force: true });
await symlink(relTarget, linkPath);
console.log(`Symlink : ${linkPath} -> ${relTarget}`);
