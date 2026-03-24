/**
 * Entrée bundlée en `scripts/simulate.mjs` pour le package skill (Node, sans Bun).
 *
 * Entrées JSON (même schéma que les `compute*` par slug) :
 * - 3ᵉ argument : chaîne JSON
 * - ou `SIMULATE_INPUT` (chaîne JSON)
 * - ou `-` comme 3ᵉ argument + JSON sur stdin
 * Sinon `{}` (stub si le scénario l’exige).
 */
import { readFileSync } from "node:fs";
import { computeAssistanteMaternelle } from "../src/scenarios/assistante-maternelle/index";
import { renderBilanTableau as renderAssistanteMaternelle } from "../src/scenarios/assistante-maternelle/render-table";
import { computeCrecheBerceauEmployeur } from "../src/scenarios/creche-berceau-employeur/index";
import { renderBilanTableau as renderCrecheBerceau } from "../src/scenarios/creche-berceau-employeur/render-table";
import { computeCrechePublique } from "../src/scenarios/creche-publique/index";
import { renderBilanTableau as renderCrechePublique } from "../src/scenarios/creche-publique/render-table";
import { computeNounouDomicile } from "../src/scenarios/nounou-domicile/index";
import { renderBilanTableau as renderNounou } from "../src/scenarios/nounou-domicile/render-table";
import { SCENARIO_SLUGS } from "../src/scenarios/registry";
import {
  simulateInputAllowedKeysBySlug,
  validateSimulateInput,
} from "../src/scenarios/simulate-input";
import pkg from "../package.json" with { type: "json" };

function readJsonInputFromCli(): {
  raw: string | undefined;
  source: "argv" | "env" | "stdin" | "none";
} {
  const a3 = process.argv[3];
  if (a3 === "-") {
    try {
      const s = readFileSync(0, "utf8").trim();
      return { raw: s.length ? s : "{}", source: "stdin" };
    } catch {
      return { raw: undefined, source: "none" };
    }
  }
  if (a3 !== undefined && a3 !== "") {
    return { raw: a3, source: "argv" };
  }
  const env = process.env.SIMULATE_INPUT;
  if (env !== undefined && env !== "") {
    return { raw: env, source: "env" };
  }
  return { raw: undefined, source: "none" };
}

function parseJsonPayload(
  raw: string | undefined,
): { ok: true; value: unknown } | { ok: false; message: string } {
  if (raw === undefined) {
    return { ok: true, value: {} };
  }
  try {
    return { ok: true, value: JSON.parse(raw) as unknown };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, message: msg };
  }
}

const slug = process.argv[2];

if (slug === undefined || slug === "-h" || slug === "--help") {
  console.log(
    JSON.stringify(
      {
        error: "usage",
        message:
          "node scripts/simulate.mjs <slug> [json| -]   — JSON optionnel : champs par slug (voir params.md). Sinon {} ou SIMULATE_INPUT.",
        slugs: [...SCENARIO_SLUGS],
        engineVersion: pkg.version,
        inputModes: [
          "3e argument : chaîne JSON (ex. '{\"monthlyParticipationEur\":300}')",
          "variable d'environnement SIMULATE_INPUT (JSON)",
          "3e argument '-' : lire le JSON sur stdin",
        ],
        allowedKeysBySlug: simulateInputAllowedKeysBySlug,
      },
      null,
      2,
    ),
  );
  process.exit(slug === undefined ? 1 : 0);
}

type Out = {
  result: unknown;
  tableau: unknown;
  meta: { engineVersion: string; rulePackVersion: string; effectiveFrom: string };
};

function metaFromResult(result: {
  meta: { rulePackVersion: string; effectiveFrom: string };
}): Out["meta"] {
  return {
    engineVersion: pkg.version,
    rulePackVersion: result.meta.rulePackVersion,
    effectiveFrom: result.meta.effectiveFrom,
  };
}

const jsonFromCli = readJsonInputFromCli();
const parsedPayload = parseJsonPayload(jsonFromCli.raw);
if (!parsedPayload.ok) {
  console.log(
    JSON.stringify(
      {
        error: "json_parse",
        message: parsedPayload.message,
        source: jsonFromCli.source,
      },
      null,
      2,
    ),
  );
  process.exit(1);
}

const validated = validateSimulateInput(slug, parsedPayload.value);
if (!validated.ok) {
  console.log(
    JSON.stringify(
      {
        error: "validation",
        slug,
        issues: validated.issues,
        allowedKeys: simulateInputAllowedKeysBySlug[slug] ?? [],
        hint: "Clés strictes par slug : pas de champs supplémentaires ; types conformes à params.md.",
      },
      null,
      2,
    ),
  );
  process.exit(1);
}

const input = validated.data;

let out: Out;

switch (slug) {
  case "creche-publique": {
    const result = computeCrechePublique(input);
    out = { result, tableau: renderCrechePublique(result), meta: metaFromResult(result) };
    break;
  }
  case "creche-berceau-employeur": {
    const result = computeCrecheBerceauEmployeur(input);
    out = { result, tableau: renderCrecheBerceau(result), meta: metaFromResult(result) };
    break;
  }
  case "assistante-maternelle": {
    const result = computeAssistanteMaternelle(input);
    out = {
      result,
      tableau: renderAssistanteMaternelle(result),
      meta: metaFromResult(result),
    };
    break;
  }
  case "nounou-domicile": {
    const result = computeNounouDomicile(input);
    out = { result, tableau: renderNounou(result), meta: metaFromResult(result) };
    break;
  }
  default:
    console.log(
      JSON.stringify(
        {
          error: "unknown_slug",
          message: `Unknown slug: ${slug}`,
          slugs: [...SCENARIO_SLUGS],
        },
        null,
        2,
      ),
    );
    process.exit(1);
}

console.log(JSON.stringify(out, null, 2));
