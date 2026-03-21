# Quickstart — claude.ai (skill ZIP)

Objectif : utiliser le **skill uploadé** quand tu **n’as pas** le dépôt sur la machine.

1. Sur ta machine de build : `bun run package:claude-skill` → récupère `dist/comparatif-modes-garde-fr-2026-skill.zip`.
2. [Claude](https://claude.ai) → **Settings** → **Skills** (intitulé exact selon la doc du moment) → **Upload** le ZIP.
3. Active les capacités nécessaires (**code execution** / connecteurs HTTP si tu appelles une API — selon produit).
4. **Sans API déployée** : le skill guide la collecte et le JSON mais **ne calcule pas** seul ; il faut soit coller le résultat de `bun run demo:scenario` exécuté ailleurs, soit brancher un **POST /v1/calculate** HTTPS (voir [`PRODUCTION-HARNESS.md`](./PRODUCTION-HARNESS.md)).

Fichiers dans le ZIP utiles au modèle : **`INTAKE.md`**, **`REFERENCE.md`**, **`examples/*.json`**, **`openapi.yaml`**, **`scenario-input.schema.json`**.
