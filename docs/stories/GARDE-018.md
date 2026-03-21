# GARDE-018 — Runbooks livraison par fournisseur (harness)

| Field     | Value                                                                                                                                         |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **Epic**  | E4 — Packaging                                                                                                                                |
| **Links** | [ADR-0001](../architecture/ADR-0001-pluggable-provider-harness.md), [DR-05](../research/DR-05-PROVIDER-HARNESS.md), **GARDE-016**, `harness/` |

## User / product value

Une **documentation de livraison** centralisée explique **comment publier ou utiliser** le comparatif selon le canal (Claude Code / Skill, ChatGPT Custom GPT, Gemini), avec **checklists**, liens vers les **artefacts du repo**, et **avertissements** (HTTPS, auth, limites d’un ZIP sans moteur). Réduit l’ambiguïté entre « recherche DR-05 » et « pas à pas pour ce dépôt ».

## Scope

**In scope**

- `docs/shipping/README.md` : vue d’ensemble + sections **Anthropic**, **OpenAI**, **Google** + sécurité / vérification.
- Mise à jour **SPRINT_PLAN** (backlog + story completion log).
- Lien depuis [`harness/README.md`](../../harness/README.md) vers `docs/shipping/`.

**Out of scope**

- Hébergement managé officiel du projet, secrets, CI de déploiement cloud (story ultérieure possible).
- Revue juridique confidentialité / politique GPT Store.

## Acceptance criteria

1. Un contributeur trouve en ≤2 clics depuis `harness/README` la marche à suivre par fournisseur.
2. Chaque section cite les **chemins de fichiers** du repo et renvoie à **DR-05** pour le contexte marché.
3. `bun run ci` ; commit `GARDE-018` ; sprint log.

## Deep research

Non (s’appuie sur **DR-05** déjà présent).

## Done checklist

- [x] Story spec
- [x] `docs/shipping/` + sprint plan + lien harness
- [x] Commit `GARDE-018`
- [x] Sprint log
