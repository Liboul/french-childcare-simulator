# Paramètres — assistante maternelle (agréée)

## Contexte fiscal (résumé)

La garde **chez l’assistante maternelle agréée** est traitée comme des **frais de garde hors du domicile** du foyer : crédit d’impôt **CGI art. 200 quater B** (Service-Public F8), **pas** le crédit « emploi à domicile » (199 sexdecies), pour ce qui est du mode présenté ici.

## Entrées (`AssistanteMaternelleInput`)

| Champ                             | Obligatoire                    | Sens                                                                                                         |
| --------------------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| `monthlyEmploymentCostEur`        | Oui pour un calcul **partial** | € / mois — coût employeur (salaire + cotisations salariales et patronales) pour la garde.                    |
| `monthlyCmgPaidEur`               | Conditionnel                   | € / mois — CMG emploi direct **déjà connu** (avis CAF). Si renseigné, le moteur **ne recalcule pas** le CMG. |
| `monthlyHouseholdIncomeForCmgEur` | Conditionnel                   | € / mois — revenu pris en compte pour le **barème CMG** (si pas de `monthlyCmgPaidEur`).                     |
| `householdChildRank`              | Non (défaut `1`)               | Rang de l’enfant dans le foyer pour le **taux d’effort** (1er, 2e, 3e enfant à charge dans le barème pack).  |
| `childrenCount`                   | Non (défaut `1`)               | Nombre d’enfants pour les **plafonds** du crédit d’impôt hors domicile.                                      |
| `custody`                         | Non (défaut `"full"`)          | `"full"` \| `"shared"` — plafonds crédit d’impôt.                                                            |

## Comportement

- **CMG** : soit **saisie** directe, soit **calcul** via la règle `cmg-emploi-direct-assistante-maternelle-2026-04` (formule DR-01 dans le pack).
- **Crédit d’impôt** : règle `credit-impot-garde-hors-domicile` (déduction CMG sur l’assiette si paramétré).
- Indemnités d’entretien / repas, plafonds journaliers de salaire, non-cumuls PreParE : **pas** intégrés exhaustivement dans cette story — voir règles `todoVerify` du pack.
