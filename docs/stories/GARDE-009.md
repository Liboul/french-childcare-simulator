# GARDE-009 — Crédits d’impôt garde / emploi à domicile (DR-02)

| Field     | Value                                                                                                                                             |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Epic**  | E2 — Engine                                                                                                                                       |
| **Links** | [`INITIAL_SPEC.md`](../INITIAL_SPEC.md), [`DR-02`](../research/DR-02-CREDIT-IMPOT.md), **GARDE-005** (`config/rules.fr-2026.json`), **GARDE-008** |

## User / product value

Le moteur estime les **crédits d’impôt** liés à la garde d’enfants à partir du **pack** : garde **hors du domicile** (CGI 200 quater B) et **emploi à domicile** (CGI 199 sexdecies), avec assiette nette (CMG, aides employeur dont CESU préfinancé), plafonds et **non-cumul** qualitatif entre les deux régimes pour un même mode de garde.

## Scope

**In scope**

- `estimateGardeHorsDomicileTaxCreditAnnual(pack, children[])` : assiette = dépenses éligibles − CMG (si règle) − aides employeur à déduire (si règle), par enfant qualifié ; taux et plafonds depuis `credit-impot-garde-hors-domicile`.
- `estimateEmploiDomicileTaxCreditAnnual(pack, input)` : assiette = dépenses éligibles − **CESU préfinancé** (montant fourni par l’appelant, ex. `describeEmployerPrefundedCesuAnnual`) ; plafond depuis `credit-impot-emploi-domicile-plafonds` (standard + majorations enfants, plafond max global).
- `taxCreditKindForChildcareMode(mode)` : routage **emploi à domicile** vs **garde hors domicile** (non-cumul BOFiP / DR-02).

**Out of scope**

- TMI / quotient / revenu net après impôt (agrégation **GARDE-010**).
- Année « première embauche directe » (plafonds F12 spécifiques) : paramètres présents dans le JSON mais non appliqués ici → avertissement optionnel si besoin ultérieur.
- Garde handicap / APA, personnes âgées (majorations plafond emploi à domicile).

## Acceptance criteria

1. Tests : garde hors domicile — dépenses 4 000 €, pas d’aides, garde complète → base plafonnée 3 500 €, crédit 1 750 €.
2. Tests : même cas avec 800 € de CMG annuelle déductible → base 3 200 €, crédit 1 600 €.
3. Tests : résidence alternée (plafond demi-tranche) → base max 1 750 €, crédit 875 €.
4. Tests : emploi à domicile — 20 000 € de dépenses, 1 enfant, 1 000 € préfinancé → plafond 13 500 €, assiette 19 000 € → crédit 6 750 €.
5. `bun run ci` ; commit `GARDE-009` ; ligne sprint log.

## Technical notes

- Module `src/tax-credits/` ; segment trace `tax_credits` pour étapes futures (ce story ne construit pas encore `CalculationTrace` complet).

## Deep research

DR-02 et paramètres déjà dans le pack ; pas de nouveau prompt.

## Done checklist

- [x] Story spec
- [x] Code + tests
- [x] Commit `GARDE-009`
- [x] Sprint log
