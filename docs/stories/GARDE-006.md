# GARDE-006 — Skill : `SKILL.md`, `simulate.mjs`, ZIP distillat

## Links

- [`docs/packaging/README.md`](../packaging/README.md)
- [`INITIAL_SPEC.md`](../INITIAL_SPEC.md) § 4, § 8

## User / product value

Archive **Agent Skills** prête à l’emploi : instructions, **Node `simulate.mjs`**, `config/`, code `src/scenarios/`, **sans** `docs/research/`.

## Scope

**Inclus** : dossier `skill/`, `scripts/skill-simulate-entry.ts`, `scripts/package-skill.ts`, `bun run package:skill`, CI vérifiant le ZIP et un smoke `node …/simulate.mjs`.

**Exclus** : moteur métier complet (reste stub).

## Acceptance criteria

1. `bun run package:skill` produit le ZIP attendu.
2. Le ZIP contient `SKILL.md`, `scripts/simulate.mjs`, `config/rules.fr-2026.json`, pas `docs/research/`.
3. `node scripts/simulate.mjs <slug>` fonctionne depuis le dossier décompressé.

## Done checklist

- [x] Implémentation
- [x] `SPRINT_PLAN.md`
- [x] Commit `GARDE-006: …`
