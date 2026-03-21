# GARDE-006 — Blocs A–B : foyer + mode ; coût brut par mode

| Field     | Value                                                                                                                                                   |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Epic**  | E2 — Engine                                                                                                                                             |
| **Links** | [`INITIAL_SPEC.md`](../INITIAL_SPEC.md) (blocs A–B, coût brut), **GARDE-005** (`config/rules.fr-2026.json`), [`DR-04`](../research/DR-04-COUT-MODES.md) |

## User / product value

Le moteur peut agréger les **entrées foyer / mode** et produire un **coût brut mensuel** par scénario, en s’appuyant sur les paramètres versionnés (SMIC, majorations garde partagée) sans implémenter encore CMG, crédits ou blocs C–G.

## Scope

**In scope**

- Types **Bloc A** (profil fiscal minimal : année d’imposition, effectifs indicatifs) et **Bloc B** (mode de garde + paramètres de coût).
- Fonction `computeBrutMonthlyCost(rulePack, input)` : brut mensuel + lignes élémentaires (salaire, indemnités, cotisations patronales indicatives, participation structure).
- Lecture de règles du pack : SMIC métropole, majoration garde partagée (`garde-partagee-majoration-simultanes-dr04`).
- **Aucun taux de cotisation patronale par défaut** issu de DR-03 vs DR-04 : le **callsite fournit** `employerShareOfGross` pour les modes emploi direct (garde rail GARDE-005 / `cotisations-pajemploi-taux-indicatifs-dr03-dr04`).

**Out of scope**

- Blocs C–G, trace `CalculationStep` détaillée, PAJE/CMG, plafonds fiscaux.

## Acceptance criteria

1. Tous les modes produit INITIAL_SPEC sont représentés dans le type d’entrée (au minimum comme discriminant union).
2. Nounou à domicile : `brut = salaire brut mensuel + part patronale explicite`.
3. Garde partagée : majoration DR-04 (+10 % par enfant gardé en simultané au-delà du premier) lue dans le pack, coût familial = quote-part du total majoré + cotisations sur la part salariale de la famille.
4. Assistante maternelle / MAM : salaire + indemnités d’entretien (montants **utilisateur**) + cotisations patronales sur le salaire uniquement (simplification DR-04) ; MAM ajoute participation structure mensuelle.
5. Crèches (publique / privée / inter-entreprises) : brut = participation mensuelle saisie (tarif local ou contrat).
6. Tests Vitest sur au moins nounou domicile + garde partagée + assmat ; `bun run ci` vert.

## Technical notes

- Le pack **GARDE-005** reste la source pour SMIC et majoration ; les indemnités d’entretien volontairement **saisies** tant que `cmg-indemnite-entretien-assmat-dr01-dr04` est `todoVerify`.
- `HouseholdProfile` reste volontairement minimal (année fiscale) ; champs CAF/quotient seront enrichis en stories suivantes.

## Deep research

Non (repose sur DR-04 déjà intégré en GARDE-005).

## Test plan

- Garde partagée 2 enfants simultanés, 50/50 : vérifier coefficient 1,1 sur la base salariale avant quote-part.
- Assmat : 0 jour / indemnité 0 → seulement salaire + charges.

## Risks & mitigations

- Simplification cotisations (assiette salaire seul) : documentée ; affinage URSSAF plus tard.
- Majoration `todoVerify` dans le pack : le test utilise la valeur actuelle du JSON ; si la règle change, le test doit être mis à jour consciemment.

## Done checklist

- [x] Story spec (this file)
- [x] Implémentation + tests
- [x] Commit `GARDE-006`
- [x] Sprint plan completion log updated

## Sprint plan

Après clôture : ligne dans [`SPRINT_PLAN.md`](../SPRINT_PLAN.md).
