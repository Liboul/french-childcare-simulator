/**
 * Builds the harness skill (`package:harness-skill`) and symlinks it into
 * `.cursor/skills/` for Cursor project skills. See docs/shipping/README.md § Cursor.
 */
import { mkdir, rm, symlink } from "node:fs/promises";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const root = join(import.meta.dir, "..");
const skillName = "comparatif-modes-garde-fr-2026";

const pack = spawnSync("bun", ["run", "package:harness-skill"], {
  cwd: root,
  stdio: "inherit",
});
if (pack.status !== 0) {
  process.exit(pack.status ?? 1);
}

const skillsDir = join(root, ".cursor", "skills");
const linkPath = join(skillsDir, skillName);
/** Interpreted relative to `skillsDir` (Node symlink semantics). */
const linkTarget = join("..", "..", "dist", "harness-skill", skillName);

await mkdir(skillsDir, { recursive: true });
await rm(linkPath, { recursive: false, force: true });
await symlink(linkTarget, linkPath);

console.log(`Cursor project skill: ${linkPath} → ${linkTarget} (relative to ${skillsDir})`);
