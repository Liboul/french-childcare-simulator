# Contribuer

## Prérequis

- [Bun](https://bun.sh)
- Dépôt cloné

## Commandes

```bash
bun install
bun run ci
```

Archive skill (ZIP) : `bun run package:skill` — voir [`docs/packaging/README.md`](docs/packaging/README.md).

**Skill Cursor dans l’éditeur (local, hors CI)** : après `package:skill`, exécuter `bun run link:cursor-skill` pour que le symlink versionné sous `.cursor/skills/` pointe vers `dist/skill-stage/comparatif-modes-garde-fr-2026/`. Sans dossier `dist/` (non versionné), lancer d’abord `package:skill`. Même section « Cursor » dans [`docs/packaging/README.md`](docs/packaging/README.md).

`bun run ci` exécute : typecheck, ESLint, Prettier (check), tests (`bun test ./src` — limite explicite au dépôt courant, pas `./trash/src`).

## Règles métier et chiffres

Les plafonds, taux et exclusions fiscales / sociales doivent provenir de **`config/`** avec **sources** officielles ou **`todoVerify`**, jamais inventés. Les rapports **`docs/research/`** servent à rédiger la config ; l’**archive skill** n’embarque pas les DR, seulement le **distillat** — voir [`docs/packaging/README.md`](docs/packaging/README.md).

## Stories et commits

- Specs : `docs/stories/GARDE-###.md` ; plan : [`docs/SPRINT_PLAN.md`](docs/SPRINT_PLAN.md).
- Message de commit : préfixe **`GARDE-###:`** lorsqu’une story est concernée.

## Conventions de code

- [`docs/CONVENTIONS.md`](docs/CONVENTIONS.md) (slugs scénarios, chemins `src/scenarios/`).

Ce projet fournit une **aide à la simulation**, pas un conseil fiscal ou juridique personnalisé.
