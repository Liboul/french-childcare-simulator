/**
 * Entrée bundlée en `scripts/simulate.mjs` pour le package skill (Node, sans Bun).
 */
import { computeAssistanteMaternelle } from "../src/scenarios/assistante-maternelle/index";
import { renderBilanTableau as renderAssistanteMaternelle } from "../src/scenarios/assistante-maternelle/render-table";
import { computeCrecheBerceauEmployeur } from "../src/scenarios/creche-berceau-employeur/index";
import { renderBilanTableau as renderCrecheBerceau } from "../src/scenarios/creche-berceau-employeur/render-table";
import { computeCrechePublique } from "../src/scenarios/creche-publique/index";
import { renderBilanTableau as renderCrechePublique } from "../src/scenarios/creche-publique/render-table";
import { computeNounouDomicile } from "../src/scenarios/nounou-domicile/index";
import { renderBilanTableau as renderNounou } from "../src/scenarios/nounou-domicile/render-table";
import { SCENARIO_SLUGS } from "../src/scenarios/registry";
import pkg from "../package.json" with { type: "json" };

const slug = process.argv[2];

if (slug === undefined || slug === "-h" || slug === "--help") {
  console.log(
    JSON.stringify(
      {
        error: "usage",
        message: "node scripts/simulate.mjs <slug>",
        slugs: [...SCENARIO_SLUGS],
        engineVersion: pkg.version,
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

let out: Out;

switch (slug) {
  case "creche-publique": {
    const result = computeCrechePublique({});
    out = { result, tableau: renderCrechePublique(result), meta: metaFromResult(result) };
    break;
  }
  case "creche-berceau-employeur": {
    const result = computeCrecheBerceauEmployeur({});
    out = { result, tableau: renderCrecheBerceau(result), meta: metaFromResult(result) };
    break;
  }
  case "assistante-maternelle": {
    const result = computeAssistanteMaternelle({});
    out = {
      result,
      tableau: renderAssistanteMaternelle(result),
      meta: metaFromResult(result),
    };
    break;
  }
  case "nounou-domicile": {
    const result = computeNounouDomicile({});
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
