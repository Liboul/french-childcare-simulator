# Paramètres — crèche publique

## Ordre de modélisation (projet)

1. **Crèche publique** (ce scénario) — structure, CMG « structure », crédit d’impôt hors domicile.
2. **Assistante maternelle** — CMG emploi direct, cotisations, indemnités.
3. **Nounou à domicile** — PAJE / CESU, CMG domicile, crédit emploi à domicile, non-cumuls.
4. **Crèche / berceau employeur** — avantage en nature, exonération, coût employeur.

## Entrées (`CrechePubliqueInput`)

| Champ                     | Obligatoire                    | Unité                  | Sens                                                                                                                                                                                                                       |
| ------------------------- | ------------------------------ | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `monthlyParticipationEur` | Oui pour un calcul **partial** | € / mois               | Part payée ou due au titre de la garde en **structure** (facture / avis). Doit être **cohérent** avec la façon dont vous saisissez la CMG (voir ci-dessous).                                                               |
| `monthlyCmgStructureEur`  | Non (défaut `0`)               | € / mois               | Montant mensuel de **complément mode de garde** pour ce mode « structure » (avis CAF / MSA). Si la facture est **déjà nette** de la CMG, laisser **0** et mettre dans `monthlyParticipationEur` uniquement le net à payer. |
| `childrenCount`           | Non (défaut `1`)               | entier ≥ 1             | Nombre d’enfants pris en compte pour les **plafonds** du crédit d’impôt (garde hors domicile).                                                                                                                             |
| `custody`                 | Non (défaut `"full"`)          | `"full"` \| `"shared"` | Garde alternée : plafonds **réduits** pour le crédit d’impôt (paramètres du pack).                                                                                                                                         |

## Comportement moteur (GARDE-008)

- Ne **recalcule pas** le barème PSU : la participation est une **saisie** (ou une estimation externe, ex. monenfant.fr).
- **Crédit d’impôt** : taux, plafonds par enfant et déduction CMG sur la base éligible selon la règle `credit-impot-garde-hors-domicile` du pack.
- **Non-cumuls** (CESU, autres modes) : voir règles qualitatives dans le pack et `docs/research/` — pas d’arbitrage automatique ici.
