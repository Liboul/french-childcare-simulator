# GARDE-004 — Réintégrer `docs/research/` et figer la politique de packaging

## Links

- [`docs/packaging/README.md`](../packaging/README.md)
- [`INITIAL_SPEC.md`](../INITIAL_SPEC.md) § 3–4

## User / product value

- **Dépôt** : retrouver les **deep research** et **prompts DR** pour maintenir la config et auditer les règles.
- **Produit** : clarifier que le **skill** embarque le **distillat** (config + code + doc agent), **pas** les DR complètes.

## Scope

**Inclus** : copie de `docs/research/` (DR + `prompts/`) depuis l’ancienne base, `docs/research/README.md`, `docs/packaging/README.md`, mise à jour de [`SPRINT_PLAN.md`](../SPRINT_PLAN.md) et alignement [`INITIAL_SPEC.md`](../INITIAL_SPEC.md).

**Exclus** : script de packaging skill, ZIP (GARDE-006).

## Acceptance criteria

1. `docs/research/` contient les fichiers DR et prompts (réimport depuis `./trash/`).
2. `docs/research/README.md` explique rôle DR **dépôt** vs **hors package skill**.
3. `docs/packaging/README.md` liste distillat vs hors package.
4. Sprint plan reflète cette politique (section packaging / E4).

## Deep research

Non (réimport de matériel existant).

## Done checklist

- [x] Fichiers + doc
- [x] `SPRINT_PLAN.md` (log + backlog)
- [x] Commit `GARDE-004: …`
