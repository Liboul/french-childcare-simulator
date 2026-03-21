# GARDE-027 — Quickstarts par canal (`docs/shipping/`)

| Field     | Value                |
| --------- | -------------------- |
| **Epic**  | E4 — Packaging       |
| **Links** | **GARDE-018**, DR-05 |

## User / product value

Un nouveau contributeur ou utilisateur avancé suit **une page courte** par environnement sans relire tout le hub.

## Scope

**In scope**

- Fichiers dédiés, ex. `docs/shipping/quickstart-claude-code.md`, `quickstart-claude-ai-skill.md`, `quickstart-openai-gpt.md`, `quickstart-gemini.md` (noms ajustables).
- Liens depuis `docs/shipping/README.md` ; mentions « vérifier la doc fournisseur » pour UI qui bouge.

**Out of scope**

- Vidéos ou captures d’écran obligatoires (optionnel).

## Acceptance criteria

1. Chaque quickstart va du **zéro** à un **premier calcul** réussi (local ou tunnel/API selon le canal).
2. Aucun duplicate massif : renvoyer au hub pour sécurité / conformité.
3. `bun run ci` ; commit `GARDE-027` ; sprint log à la clôture.

## Deep research

Non.

## Done checklist

- [ ] Story spec
- [ ] Fichiers + index mis à jour
- [ ] Commit `GARDE-027`
- [ ] Sprint log
