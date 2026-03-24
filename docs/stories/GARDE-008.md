# GARDE-008 — Crèche publique : calcul partiel + roadmap des 4 scénarios

## Links

- [`INITIAL_SPEC.md`](../INITIAL_SPEC.md) § 3
- [`params.md`](../../src/scenarios/creche-publique/params.md)

## User / product value

Premier scénario **non vide** : participation familiale, CMG saisie, **crédit d’impôt** hors domicile à partir du pack — avec tableau de bilan explicite.

## Roadmap d’implémentation (ordre fixé)

| #   | Scénario                     | Rationale                                                                                  |
| --- | ---------------------------- | ------------------------------------------------------------------------------------------ |
| 1   | **Crèche publique**          | Structure + CMG « structure » + crédit F8 — sans emploi direct ni avantage employeur.      |
| 2   | **Assistante maternelle**    | CMG emploi direct, cotisations, indemnités (DR-01 / DR-04).                                |
| 3   | **Nounou à domicile**        | PAJE, CESU, crédit 199 sexdecies, non-cumuls — le plus chargé côté dispositifs.            |
| 4   | **Crèche berceau employeur** | Avantage en nature, seuils d’exonération, lien brut / employeur — à caler après les bases. |

## Scope (cette story)

**Inclus** : `computeCrechePublique` **partial** si `monthlyParticipationEur` fourni ; trace ; `buildCrechePubliqueLignes` ; module `credit-garde-hors-domicile` ; tests ; `params.md`.

**Exclus** : barème PSU, micro-crèche hors PSU, Mayotte, cumul exhaustif avec d’autres aides.

## Acceptance criteria

1. Stub si pas de participation ; partial avec trace sinon.
2. Crédit d’impôt aligné sur `credit-impot-garde-hors-domicile` (déduction CMG si paramètre `deductCmgFromBase`).
3. Tableau : participation, CMG, trésorerie après CMG, base éligible, crédit équivalent mensuel, effort net.
4. `bun run ci` vert.

## Done checklist

- [x] Implémentation
- [x] `SPRINT_PLAN.md`
- [x] Commit `GARDE-008: …`
