# Conventions — scénarios, scripts, helpers

Ce document fixe les **noms** et **emplacements** pour que l’agent et les humains retrouvent vite le code, conformément à [`INITIAL_SPEC.md`](./INITIAL_SPEC.md) § 12.

## Identifiants de scénario (slug)

| Scénario produit               | Slug (dossier / préfixe)   |
| ------------------------------ | -------------------------- |
| Crèche publique                | `creche-publique`          |
| Crèche + berceau employeur     | `creche-berceau-employeur` |
| Assistante maternelle          | `assistante-maternelle`    |
| Nounou (seul ou co-famille(s)) | `nounou-domicile`          |

Les variantes (co-famille, etc.) sont des **paramètres** ou des **sous-types** documentés dans le Markdown du scénario, pas obligatoirement de nouveaux slugs au premier niveau.

## Arborescence cible

```
src/
  scenarios/
    <slug>/
      index.ts          # compute<Scenario>PascalCase + types entrée/sortie
      render-table.ts   # renderBilanTableau (nom exporté canonique)
      params.md         # (optionnel) doc paramètres ; peut aussi vivre sous docs/
  shared/               # helpers réutilisables (net depuis brut, etc.)
scripts/
  scenarios/
    <slug>.ts           # Point d’entrée CLI minimal (appelle src/scenarios/.../index)
```

## Noms de fichiers

- **Fonction principale** : `compute` + `PascalCase` du slug sans tirets, ex. `computeCrechePublique`.
- **Rendu tableau** : fichier `render-table.ts`, export **`renderBilanTableau`** (nom exact attendu par le skill).
- **Script CLI** : `scripts/scenarios/<slug>.ts` (même slug que le dossier).

## Paquets skill

- L’archive skill embarque le **distillat** (code, `config/`, doc paramètres) — **pas** `docs/research/`. Voir [`packaging/README.md`](packaging/README.md).
- **Cursor (projet local)** : après `package:skill`, `bun run link:cursor-skill` — même fichier, section « Cursor ».
- Chaque scénario livré dans le ZIP doit inclure le **script** et le **code source** correspondant sous un chemin prévisible, ex. `scenarios/<slug>/` (détail dans la story de packaging).

## Config

- Fichiers versionnés sous `config/` avec année ou identifiant, ex. `rules.fr-2026.json`, `income-tax-bareme.fr-2026.json`.

## Tests

- `src/scenarios/<slug>/*.test.ts` (ou fichier unique `index.test.ts` au début).
