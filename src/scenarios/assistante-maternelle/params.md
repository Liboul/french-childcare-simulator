# Paramètres — assistante maternelle (agréée)

## Contexte fiscal (résumé)

La garde **chez l’assistante maternelle agréée** est traitée comme des **frais de garde hors du domicile** du foyer : crédit d’impôt **CGI art. 200 quater B** (Service-Public F8), **pas** le crédit « emploi à domicile » (199 sexdecies), pour ce qui est du mode présenté ici.

## Entrées (`AssistanteMaternelleInput`)

| Champ                             | Obligatoire                        | Sens                                                                                                                                 |
| --------------------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `monthlyEmploymentCostEur`        | Oui pour un calcul **partial**     | € / mois — **coût employeur** (salaire + cotisations) pour la garde. Voir **Cohérence coût / CMG** et **Assiette unique (approximation)**. |
| `monthlyCmgPaidEur`               | Conditionnel                       | € / mois — CMG emploi direct **déjà connu** (avis CAF). Si renseigné, le moteur **ne recalcule pas** le CMG à partir du revenu.        |
| `monthlyHouseholdIncomeForCmgEur` | Conditionnel                       | € / mois — revenu pour le **barème CMG** (uniquement si pas de CMG saisi — voir **Priorité saisie / revenu**).                        |
| `householdChildRank`              | Non (défaut `1`)                   | Rang de l’enfant pour le **taux d’effort** CMG dans le barème pack (1er, 2e, 3e… enfant à charge).                                   |
| `childrenCount`                   | Non (défaut `1`)                   | Nombre d’enfants pour les **plafonds** du crédit F8 (multiplicateur des plafonds « par enfant »). Ce n’est **pas** obligatoirement le nombre total d’enfants du foyer : si un seul enfant est confié à l’assmat pour ce calcul, saisir `1` en général. |
| `custody`                         | Non (défaut `"full"`)              | `"full"` \| `"shared"` — plafonds crédit d’impôt.                                                                                    |
| `revenuNetImposableEur`           | Non (avec `nombreParts`)           | € / an — avec `nombreParts` : `trace.creditVsIrBrutSatellite`.                                                                        |
| `nombreParts`                     | Non (avec `revenuNetImposableEur`) | — **toujours** avec `revenuNetImposableEur`.                                                                                         |

## Priorité saisie / revenu (CMG)

Si **`monthlyCmgPaidEur` et `monthlyHouseholdIncomeForCmgEur` sont tous deux fournis**, le moteur utilise **uniquement le CMG saisi** ; le revenu est **ignoré** pour le calcul du CMG (`resolveCmgFromEmploymentInput` dans le code).

## Cohérence coût / CMG

- **Attendu** : `monthlyEmploymentCostEur` = coût employeur **avant** aide (ce que le modèle soustrait ensuite avec la CMG pour la trésorerie).
- **Erreur fréquente** : saisir un coût **déjà diminué** de la CMG **et** une CMG non nulle → double prise en compte de l’aide (trésorerie et, selon le pack, base du crédit). Dans ce cas : soit saisir le **coût brut** + CMG, soit le **reste seul** avec **`monthlyCmgPaidEur: 0`** (et utiliser le revenu uniquement si vous voulez un CMG calculé).

## Assiette unique (approximation)

Le moteur utilise le **même** montant mensuel (`monthlyEmploymentCostEur`) comme **coût de garde** pour la formule CMG (pack) et comme **base** du crédit F8 (après traitement pack / `deductCmgFromBase`). En réalité, la répartition salaire / indemnités d’entretien / repas peut affecter les plafonds et l’éligibilité : ce détail **n’est pas** modélisé ligne à ligne — voir notes du résultat et règles `todoVerify` du pack.

## Règle pack `credit-impot-garde-hors-domicile`

Même logique que pour les crèches en structure : taux, plafonds par enfant et garde, et **`deductCmgFromBase`** (retrait de la CMG de la base éligible au crédit ou non). Tableau des paramètres : `src/scenarios/creche-publique/params.md` (**Règle pack `credit-impot-garde-hors-domicile`**).

## Trace (`partial`) — équivalents mensuels

- `monthlyCreditEquivalentEur` = crédit d’impôt annuel ÷ **12** : mensualisation **pédagogique**, pas le calendrier réel des avances / restitutions. Voir aussi `src/shared/monthly-cashflow-after-aides.ts`.

## Comportement

- **Agent (intake)** : pour `monthlyEmploymentCostEur`, ne pas seulement demander le montant — **proposer** d’estimer (simulateur Urssaf / emploi à domicile, ordre de grandeur salaire + cotisations, ou hypothèse explicite) si l’utilisateur ne le connaît pas ; voir `INTAKE.md` du skill.
- **CMG** : soit **saisie** directe, soit **calcul** via la règle `cmg-emploi-direct-assistante-maternelle-2026-04` (formule DR-01 dans le pack).
- **Crédit d’impôt** : règle `credit-impot-garde-hors-domicile` (déduction CMG sur l’assiette si `deductCmgFromBase` dans le pack).
- Indemnités d’entretien / repas, plafonds journaliers de salaire, non-cumuls PreParE : **pas** intégrés exhaustivement dans cette story — voir règles `todoVerify` du pack et `docs/research/`.
