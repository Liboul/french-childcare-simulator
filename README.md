# french-childcare-costs

Comparaison des **coûts réels** des modes de garde en France — **orientée agent** (scripts, bilans, sources). La spec produit est **[`docs/INITIAL_SPEC.md`](docs/INITIAL_SPEC.md)**.

| Doc                                                    | Rôle                                            |
| ------------------------------------------------------ | ----------------------------------------------- |
| [`docs/SPRINT_PLAN.md`](docs/SPRINT_PLAN.md)           | Sprints, DoD, backlog                           |
| [`docs/packaging/README.md`](docs/packaging/README.md) | Contenu du **skill** (distillat, pas les DR)    |
| [`docs/CONVENTIONS.md`](docs/CONVENTIONS.md)           | Nommage scénarios et chemins code               |
| [`CONTRIBUTING.md`](CONTRIBUTING.md)                   | Installation, `bun run ci`, commits `GARDE-###` |

Ancienne base locale (non versionnée par défaut) : **`./trash/`** — retirer `/trash/` de `.gitignore` pour la versionner.

## Développement

```bash
bun install
bun run ci
```

Scénarios (stub) : `bun run scenario:creche-publique` (ou `creche-berceau-employeur`, `assistante-maternelle`, `nounou-domicile`).

**Packaging skill** : `bun run package:skill` → `dist/comparatif-modes-garde-fr-2026-skill.zip` (distillat, pas `docs/research/`). **Cursor (local)** : après ce build, `bun run link:cursor-skill` recrée le symlink `.cursor/skills/comparatif-modes-garde-fr-2026` → `dist/skill-stage/…` — détails dans [`docs/packaging/README.md`](docs/packaging/README.md). Prochaines stories : **moteur métier** par scénario — voir [`docs/SPRINT_PLAN.md`](docs/SPRINT_PLAN.md).
