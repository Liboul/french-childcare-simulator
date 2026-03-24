# Référence rapide

## Slugs

`creche-publique` · `creche-berceau-employeur` · `assistante-maternelle` · `nounou-domicile`

## Fichiers par scénario

- `src/scenarios/<slug>/index.ts` — fonction `compute*`
- `src/scenarios/<slug>/render-table.ts` — `renderBilanTableau`
- `src/scenarios/<slug>/params.md` — paramètres à documenter

## Config

- `config/rules.fr-2026.json` — pack de règles (sources, plafonds) pour alimenter le moteur.

## Script

```bash
node scripts/simulate.mjs <slug>
```

## Dépôt Git (contributeurs)

Rebuild du package (ZIP + `dist/skill-stage/`), lien **Cursor** projet et prérequis : **`docs/packaging/README.md`** à la racine du dépôt (section « Cursor »).
