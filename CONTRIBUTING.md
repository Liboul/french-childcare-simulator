# Contribuer

## Prérequis

- [Bun](https://bun.sh)
- Ce dépôt cloné

## Commandes

```bash
bun install
bun run ci
```

`bun run ci` exécute : typecheck, ESLint, Prettier (check), tests Vitest.

## Règles métier et chiffres

- **Aucun** plafond, taux ou exclusion fiscale / sociale **inventé**. Les valeurs viennent de `config/rules.*.json` avec **sources** officielles ou **`todoVerify: true`** sans faire passer le défaut pour une vérité juridique.
- Une règle nouvelle ou modifiée = mise à jour du pack + tests + mention dans [`CHANGELOG.md`](CHANGELOG.md) (voir [GARDE-028](docs/stories/GARDE-028.md)).
- Recherche approfondie : suivre [`docs/SPRINT_PLAN.md`](docs/SPRINT_PLAN.md) (prompts **DR-** dans `docs/research/prompts/`).

## Stories et commits

- Les livraisons suivent les specs `docs/stories/GARDE-###.md` et le plan sprint.
- Message de commit : préfixe **`GARDE-###:`** quand une story est concernée.

## Schéma API / harness

- Après modification de `src/scenario/scenario-input.schema.ts`, régénérer : **`bun run schema:scenario`** et committer `harness/scenario-input.schema.json`.
- **Cursor** : skill harness en local (non versionné) — **`bun run setup:cursor-harness-skill`** ; détail dans [`docs/shipping/README.md`](docs/shipping/README.md) § Cursor.

## Documentation produit

- Spec initiale : [`docs/INITIAL_SPEC.md`](docs/INITIAL_SPEC.md)
- Sources à citer côté utilisateur : [`docs/SOURCES_OFFICIELLES.md`](docs/SOURCES_OFFICIELLES.md)

Ce projet fournit une **aide à la simulation**, pas un conseil fiscal ou juridique personnalisé.
