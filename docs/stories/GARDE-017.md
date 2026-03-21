# GARDE-017 — Scénarios de démo + table des sources officielles

| Field     | Value                                                                                                             |
| --------- | ----------------------------------------------------------------------------------------------------------------- |
| **Epic**  | E4 — Packaging / démo                                                                                             |
| **Links** | [`INITIAL_SPEC.md`](../INITIAL_SPEC.md), **GARDE-012** (exports), **GARDE-014** (matrice), `config/rules.fr-2026` |

## User / product value

Le dépôt fournit des **scénarios reproductibles** (JSON alignés sur `ScenarioInput`), une **table de sources officielles** pour les démos / audits, et un **script** qui exécute un scénario contre le pack 2026 et affiche le snapshot (sans harness GPT).

## Scope

**In scope**

- `docs/demo-scenarios/*.json` : au moins **3** fichiers valides (`ScenarioInput` seul, sans champs hors type).
- `docs/demo-scenarios/README.md` : objectif, usage du script, liste des scénarios.
- `docs/SOURCES_OFFICIELLES.md` : tableau thème → titre → URL (priorité Service-Public / Légifrance / CAF cités dans le pack).
- `scripts/run-demo-scenario.ts` + `package.json` script `demo:scenario`.
- Test : chaque fixture JSON charge et `computeScenarioSnapshot` sans erreur.
- `tsconfig.json` inclut `scripts/**/*.ts` pour le typecheck.

**Out of scope**

- Harness Agent Skills / OpenAI (**GARDE-015**–**016**), PDF.

## Acceptance criteria

1. `bun run demo:scenario docs/demo-scenarios/nounou-domicile-couple-2026.json` affiche un JSON lisible (snapshot + warnings count ou détail court).
2. Tests verts ; commit `GARDE-017` ; sprint log.

## Deep research

Non.

## Done checklist

- [x] Story spec
- [x] Code + tests + docs
- [x] Commit `GARDE-017`
- [x] Sprint log
