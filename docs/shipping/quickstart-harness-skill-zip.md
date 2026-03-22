# Quickstart — ZIP harness skill (ex. claude.ai)

Objectif : utiliser le **skill uploadé** quand tu **n’as pas** le dépôt sur la machine.

1. Sur ta machine de build : `bun run package:harness-skill` → récupère `dist/comparatif-modes-garde-fr-2026-skill.zip`.
2. Hôte Agent Skills (ex. [claude.ai](https://claude.ai)) → **Settings** → **Skills** (intitulé exact selon la doc du moment) → **Upload** le ZIP.
3. Active **l’exécution de code** (intitulé exact selon la doc du fournisseur) : le skill s’appuie sur **`scripts/simulate.mjs`** (Node, bundle autonome).
4. Le modèle doit lancer **`node scripts/simulate.mjs <scenario.json>`** (voir `SKILL.md` dans l’archive) ; pas d’API HTTP requise pour ce canal.

Fichiers dans le ZIP utiles au modèle : **`SKILL.md`**, **`INTAKE.md`**, **`REFERENCE.md`**, **`scripts/simulate.mjs`**, **`examples/*.json`**, **`scenario-input.schema.json`**, **`research/`** (rapports **DR-*.md** + **`README.md`** — sources optionnelles ; les montants restent ceux de **`simulate.mjs`**).

Pour une intégration **HTTPS** (Custom GPT, etc.), le contrat OpenAPI reste dans le dépôt : [`harness/openapi.yaml`](../../harness/openapi.yaml) — il n’est **pas** inclus dans le ZIP harness skill (**GARDE-035**).
