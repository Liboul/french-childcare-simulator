# Paramètres — crèche / berceau employeur

## Vue d’ensemble

Même **mode de garde en structure** que la crèche publique pour le **crédit d’impôt F8** et la **CMG structure** : la saisie `monthlyParticipationEur` est la **part familiale** (facture).

En plus, l’**aide employeur** annuelle permet d’appliquer le **seuil d’exonération** par enfant (`avantage-employeur-creche-seuil-exoneration` dans le pack, DR-03 / jurisprudence — règle en `todoVerify`).

## Entrées (`CrecheBerceauEmployeurInput`)

| Champ                               | Obligatoire                        | Sens                                                                                            |
| ----------------------------------- | ---------------------------------- | ----------------------------------------------------------------------------------------------- |
| `monthlyParticipationEur`           | Oui pour **partial**               | € / mois — part payée par le foyer (comme crèche publique). **Agent** : proposer d’estimer si inconnu (voir `INTAKE.md` du skill, `params.md` crèche publique). |
| `monthlyCmgStructureEur`            | Non                                | CMG structure (mensuel).                                                                         |
| `childrenCount`                     | Non (défaut `1`)                   | Enfants pour lesquels **ces dépenses de garde en structure** ouvrent le plafond F8 (multiplicateur des plafonds « par enfant ») — pas forcément tous les enfants du foyer. |
| `custody`                           | Non                                | `full` \| `shared`.                                                                             |
| `annualEmployerChildcareAidEur`     | Non                                | € / an — aide employeur pour cette garde (0 si inconnue).                                       |
| `childrenCountForEmployerThreshold` | Non                                | Nombre d’enfants pour le plafond **1 830 € × n** (défaut = `childrenCount`).                    |
| `revenuNetImposableEur`             | Non (avec `nombreParts`)           | € / an — avec `nombreParts` : `trace.creditVsIrBrutSatellite` (crédit F8 vs IR brut indicatif). |
| `nombreParts`                       | Non (avec `revenuNetImposableEur`) | Parts — **toujours** avec `revenuNetImposableEur`.                                              |
| `prefinancedCesuEmployerUses`       | Non (défaut `false`)               | CESU préfinancés employeur pour la garde ? Si `true`, **`prefinancedCesuMode` obligatoire**.      |
| `prefinancedCesuAnnualEur`          | Non                                | € / an — montant CESU employeur (trace).                                                         |
| `prefinancedCesuMode`               | Si CESU oui                        | `on_top` \| `substitutes_constant_employer_cost` — en plus de `annualEmployerChildcareAidEur`, ou même enveloppe. |
| `childcareProviderAcceptsCesu`      | Non                              | La crèche accepte-t-elle les CESU ? **Agent** : poser la question. |
| `prefinancedCesuAvailableForChildcareFraction` | Non (défaut 1)      | Entre **0** et **1** — part du volume CESU employeur **utilisable pour cette garde** si une partie sert à d’autres services. |

## Cohérence participation / CMG (identique crèche publique)

- **Facture nette déjà** : `monthlyParticipationEur` = net à payer, **`monthlyCmgStructureEur: 0`**.
- **Facture brute + CMG ventilée** : participation et CMG cohérentes avec la facture.
- **Si les deux sont non nuls** : le moteur rappelle de vérifier qu’on n’est pas en « double » saisie (participation déjà nette + CMG). Détail : `src/scenarios/creche-publique/params.md` (section **Cohérence participation / CMG**).

## Règle pack `credit-impot-garde-hors-domicile`

Même lecture que pour la crèche publique : `rate`, plafonds par enfant et garde, et surtout **`deductCmgFromBase`** (retrait de la CMG de la base éligible ou non). Voir le tableau dans `src/scenarios/creche-publique/params.md` (**Règle pack `credit-impot-garde-hors-domicile`**).

## Trace — équivalents mensuels (F8)

- `monthlyCreditEquivalentEur` = crédit annuel F8 ÷ **12** : mensualisation pédagogique (voir `params.md` crèche publique, **Trace**).

## Limites

- Impact sur le **brut / avantages en nature** côté paie au-delà du seuil : **estimation** d’imposition, pas calcul de bulletin.
- Prise en charge employeur **non** déduite du crédit F8 si la **participation** saisie est **déjà** la part nette famille (cohérent avec BOFiP : assiette des frais réellement payés par le contribuable).

## CESU préfinancé employeur

- Le **seuil d’exonération / excédent** sur l’aide employeur reste calculé sur **`annualEmployerChildcareAidEur`** seul. Le **total soutien employeur** (`trace.totalEmployerChildcareSupportAnnualEur`) = aide annuelle + CESU si `prefinancedCesuMode` = `on_top`.
- **Agent (intake)** : toujours poser la question CESU et le mode **en plus** vs **même enveloppe** — `INTAKE.md` du skill.
