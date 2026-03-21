# GARDE-019 — IR / TMI pour le revenu disponible

| Field     | Value                                                                                                 |
| --------- | ----------------------------------------------------------------------------------------------------- |
| **Epic**  | E2 — Engine                                                                                           |
| **Links** | [`INITIAL_SPEC.md`](../INITIAL_SPEC.md), **GARDE-010**, DR-02 / sources impôt ; pas d’encodage ad hoc |

## User / product value

Le résultat se rapproche de la promesse spec (**revenu disponible final**) au lieu de dépendre uniquement d’une base saisie (`baselineDisposableIncomeMonthlyEur`).

## Scope

**In scope**

- Modèle explicite (TMI réelle **ou** approximation documentée **ou** tranches paramétrables dans le pack) + trace.
- Paramètres versionnés ; branches d’incertitude si la loi / barèmes ne sont pas figés.

**Out of scope**

- Simulation IR complète tous crédits ; conseil personnalisé définitif.

## Acceptance criteria

1. Le scénario peut produire un **disponible** cohérent avec le modèle choisi, documenté dans la trace et les warnings.
2. Aucun plafond / taux codé en dur hors `config/` + sources ou `todoVerify`.
3. Tests sur au moins 2 profils (ex. bas / moyen revenu) ; `bun run ci` ; sprint log à la clôture.

## Deep research

**Oui** — barèmes IR, abattements pertinents, interaction avec crédits déjà modélisés ; déléguer au besoin via prompts research existants ou nouveau prompt ciblé.

## Done checklist

- [ ] Story spec
- [ ] Implémentation + tests
- [ ] Commit `GARDE-019`
- [ ] Sprint log
