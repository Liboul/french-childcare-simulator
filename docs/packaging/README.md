# Packaging du skill — périmètre

## Principe

Le **package livré à l’agent** (archive skill, ou équivalent) contient le **minimum nécessaire** pour **exécuter et expliquer** les simulations de scénarios : code, **`config/`** (barèmes et règles sourcées), documentation des paramètres par scénario, instructions (`SKILL.md`, etc.).

Il **n’embarque pas** les **deep research** complètes (`docs/research/DR-*.md`, prompts **DR-\***). Ces documents restent dans le **dépôt** pour **rédaction, audit et mises à jour** ; ils alimentent le **distillat** qui, lui, est présent dans le package.

## Distillat (ce qui doit être dans le package)

- **`config/rules.*.json`** : chiffres et identifiants de règles, avec sources ou `todoVerify`.
- **Code** des scénarios et helpers (`src/…`), plus scripts d’entrée exposés au skill.
- **Documentation agent** : paramètres par scénario (Markdown), FAQ « Que puis-je faire avec ce skill ? », obligation du tableau de bilan (voir [`INITIAL_SPEC.md`](../INITIAL_SPEC.md)).
- Éventuellement un **fichier ou dossier dédié** (ex. `distill/` ou sections dans `SKILL.md`) qui résume **non-cumuls, ordre d’imputation, inconnues** — sans reproduire la longueur d’un rapport DR.

## Hors package

- **`docs/research/`** (rapports DR longs, prompts de recherche).
- **`./trash/`**, artefacts CI internes, schémas de dev non requis à l’exécution.

Les URLs **officielles** citées dans les calculs viennent surtout du **pack de règles** et des **lignes de trace** ; le distillat peut renvoyer vers les mêmes liens sans dupliquer tout le travail de recherche.

## Génération dans le dépôt

Sources des instructions : dossier **`skill/`** (`SKILL.md`, `INTAKE.md`, `REFERENCE.md`, `DISTILLAT.md`).

```bash
bun run package:skill
```

Produit `dist/skill-stage/comparatif-modes-garde-fr-2026/` et **`dist/comparatif-modes-garde-fr-2026-skill.zip`**. L’archive contient notamment **`scripts/simulate.mjs`** (Node, bundle), **`src/scenarios/`**, **`src/config/`** (parse / schéma) et **`src/shared/`** (chargement du pack), mais **pas** `docs/research/`.
