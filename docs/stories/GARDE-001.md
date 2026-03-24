# GARDE-001 — Reset dépôt + INITIAL_SPEC agent-first

## Links

- [`INITIAL_SPEC.md`](../INITIAL_SPEC.md)
- Commit : reset `main` avec `INITIAL_SPEC` réécrite ; ancien arbre dans `./trash/` (gitignored).

## User / product value

Repartir sur une base **légère** et **orientée agent** pour les scénarios de garde et le tableau de bilan obligatoire.

## Scope

**Inclus** : nouvelle spec produit, README racine, `.gitignore` pour `./trash/`.

**Exclus** : code moteur, harness, research (réimport ultérieur).

## Acceptance criteria

1. `docs/INITIAL_SPEC.md` décrit les quatre scénarios cibles, le triple livrable script + code + doc paramètres, le tableau bilan, la FAQ skill, et le mode opératoire sprint.
2. `./trash/` contient l’ancienne base locale (hors git par défaut).
3. Commit avec message `GARDE-001: …`.

## Deep research

Non.

## Done checklist

- [x] Spec livrée
- [x] Commit
- [x] Ligne dans `SPRINT_PLAN.md` (Story completion log)
