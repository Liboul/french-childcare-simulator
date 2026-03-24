# Paramètres — nounou à domicile (emploi direct)

## Fiscalité

- **CMG** : mode « emploi direct — garde à domicile » (`cmg-emploi-direct-garde-domicile-2026-04`).
- **Crédit d’impôt** : **emploi à domicile** (CGI art. 199 sexdecies, Service-Public F12), **pas** le crédit « frais de garde hors du domicile » (F8). Non-cumul avec F8 pour les mêmes dépenses (voir `nonCumulWithCreditGardeHorsDomicile` dans le pack).

## Entrées (`NounouDomicileInput`)

| Champ                             | Obligatoire           | Sens                                                                              |
| --------------------------------- | --------------------- | --------------------------------------------------------------------------------- |
| `monthlyEmploymentCostEur`        | Oui pour **partial**  | € / mois — coût employeur (salaire + cotisations).                                |
| `monthlyCmgPaidEur`               | Conditionnel          | € / mois — CMG si connue ; sinon `monthlyHouseholdIncomeForCmgEur` pour calculer. |
| `monthlyHouseholdIncomeForCmgEur` | Conditionnel          | Revenu pour le barème CMG.                                                        |
| `householdChildRank`              | Non (défaut `1`)      | Rang de l’enfant pour les taux d’effort CMG.                                      |
| `childrenCountForCreditCeiling`   | Non (défaut `1`)      | Nombre d’enfants pour les **majorations** du plafond du crédit emploi à domicile. |
| `custody`                         | Non (défaut `"full"`) | Garde alternée : majorations **réduites** (moitié par enfant dans le moteur).     |

## Limites

- Cotisations sociales : prise en charge CAF (50 % dans le pack CMG) non ventilée en ligne séparée dans ce scénario.
- Co-gardes / co-employeurs : pas de répartition multi-foyers dans cette story.
