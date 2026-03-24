# Paramètres — crèche / berceau employeur

## Vue d’ensemble

Même **mode de garde en structure** que la crèche publique pour le **crédit d’impôt F8** et la **CMG structure** : la saisie `monthlyParticipationEur` est la **part familiale** (facture).

En plus, l’**aide employeur** annuelle permet d’appliquer le **seuil d’exonération** par enfant (`avantage-employeur-creche-seuil-exoneration` dans le pack, DR-03 / jurisprudence — règle en `todoVerify`).

## Entrées (`CrecheBerceauEmployeurInput`)

| Champ                               | Obligatoire                        | Sens                                                                                            |
| ----------------------------------- | ---------------------------------- | ----------------------------------------------------------------------------------------------- |
| `monthlyParticipationEur`           | Oui pour **partial**               | € / mois — part payée par le foyer (comme crèche publique).                                     |
| `monthlyCmgStructureEur`            | Non                                | CMG structure (mensuel).                                                                        |
| `childrenCount`                     | Non (défaut `1`)                   | Pour plafonds F8.                                                                               |
| `custody`                           | Non                                | `full` \| `shared`.                                                                             |
| `annualEmployerChildcareAidEur`     | Non                                | € / an — aide employeur pour cette garde (0 si inconnue).                                       |
| `childrenCountForEmployerThreshold` | Non                                | Nombre d’enfants pour le plafond **1 830 € × n** (défaut = `childrenCount`).                    |
| `revenuNetImposableEur`             | Non (avec `nombreParts`)           | € / an — avec `nombreParts` : `trace.creditVsIrBrutSatellite` (crédit F8 vs IR brut indicatif). |
| `nombreParts`                       | Non (avec `revenuNetImposableEur`) | Parts — **toujours** avec `revenuNetImposableEur`.                                              |

## Limites

- Impact sur le **brut / avantages en nature** côté paie au-delà du seuil : **estimation** d’imposition, pas calcul de bulletin.
- Prise en charge employeur **non** déduite du crédit F8 si la **participation** saisie est **déjà** la part nette famille (cohérent avec BOFiP : assiette des frais réellement payés par le contribuable).
