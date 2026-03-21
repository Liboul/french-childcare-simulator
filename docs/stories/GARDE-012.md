# GARDE-012 — Exports JSON, HTML, CSV (hypothèses, calculs, sources)

| Field     | Value                                                                                                                             |
| --------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **Epic**  | E3 — Outputs                                                                                                                      |
| **Links** | [`INITIAL_SPEC.md`](../INITIAL_SPEC.md) § Format de sortie, **GARDE-010** / **GARDE-011**, **GARDE-005** (`config/rules.fr-2026`) |

## User / product value

Un scénario calculé peut être **sérialisé** pour audit ou affichage : **JSON** structuré (hypothèses + résultat + trace + incertitude), **CSV** tabulaire (métriques, trace, sources), **HTML** lisible (tableaux, sections) — avec **sources** issues du pack pour les règles référencées.

## Scope

**In scope**

- `buildScenarioExportBundle(pack, hypotheses, result, meta?)` : méta (titre, horodatage, version de format), résumé pack, hypothèses (`ScenarioInput`), résultat complet, `ruleSources` agrégées depuis les règles référencées (trace + `uncertainty`).
- `exportScenarioBundleToJson(bundle)` — `JSON.stringify` indenté.
- `exportScenarioBundleToCsv(bundle)` — CSV unique multi-table via colonne `table` (`metric`, `warning`, `trace`, `flag`, `pending_rule`, `source`).
- `exportScenarioBundleToHtml(bundle)` — document HTML minimal, échappement des textes utilisateur.
- Module `src/exporters/` + export barrel racine.

**Out of scope**

- Export PDF (hors périmètre produit), i18n, CSS avancé, téléchargement fichier navigateur (consommateur appelle les fonctions).

## Acceptance criteria

1. Test : JSON parseable, contient `result.snapshot.mode` et `hypotheses`.
2. Test : CSV contient une ligne `metric` pour `monthlyBrutEur` et une ligne `trace`.
3. Test : HTML contient le titre échappé et une ligne de trace.
4. `bun run ci` ; commit `GARDE-012` ; sprint log.

## Deep research

Non.

## Done checklist

- [x] Story spec
- [x] Code + tests
- [x] Commit `GARDE-012`
- [x] Sprint log
