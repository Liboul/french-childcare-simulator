import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseRulePack } from "../config/parse";
import type { RulePack } from "../config/schema";

let cached: RulePack | undefined;

function resolveRulesPath(): string {
  const here = dirname(fileURLToPath(import.meta.url));
  const candidates = [
    join(here, "..", "config", "rules.fr-2026.json"),
    join(here, "..", "..", "config", "rules.fr-2026.json"),
    join(process.cwd(), "config", "rules.fr-2026.json"),
  ];
  for (const p of candidates) {
    if (existsSync(p)) return p;
  }
  throw new Error(`config/rules.fr-2026.json introuvable (essayé : ${candidates.join(", ")})`);
}

/** Pack 2026 parsé et mis en cache (chemins relatifs à l’emplacement du module ou `process.cwd()`). */
export function getRulePack(): RulePack {
  if (cached) return cached;
  const path = resolveRulesPath();
  const raw: unknown = JSON.parse(readFileSync(path, "utf8"));
  const parsed = parseRulePack(raw);
  if (!parsed.ok) {
    throw new Error(`Rule pack invalide : ${parsed.error}`);
  }
  cached = parsed.data;
  return cached;
}

/** Pour les tests : réinitialiser le cache. */
export function resetRulePackCacheForTests(): void {
  cached = undefined;
}
