# DR-01 — Rapport de recherche (CMG & CAF)

> **Source :** Export Gemini (MHTML) converti en Markdown le 2026-03-21.  
> **Avertissement :** Vérifier toute règle et tout montant sur les sources officielles (CAF, Service-Public, Légifrance, URSSAF) avant usage en production.  
> **Lien d’origine :** Gemini share `https://gemini.google.com/share/7c72dee1293a`

---

# Rapport de recherche : Architecture et paramétrage du Complément de mode de garde (CMG) pour l'exercice 2026

## 1. Executive summary

L'année 2026 consolide la réforme majeure de la Prestation d'accueil du jeune enfant (PAJE). Le Complément de libre choix du mode de garde (CMG) achève sa transition d'un système de forfaits fixes vers un calcul proportionnel par taux d'effort pour l'emploi direct. Ce rapport détaille les paramètres critiques : revalorisation au 1er avril 2026 du coût horaire de référence à 10,50 € pour la garde à domicile, nouveaux plafonds de ressources issus de l'arrêté du 18 décembre 2025, et généralisation de la déclaration nominative par enfant pour les assistantes maternelles. Il intègre désormais les spécificités de cotisation pour l'Alsace-Moselle et les barèmes propres à Mayotte et aux autres DROM.  

## 2. Mode mapping

La simulation du coût net repose sur une correspondance stricte entre les modes de garde et les catégories CAF/MSA.

| Catégorie Produit         | Terminologie Officielle                | Type de financement               |
| ------------------------- | -------------------------------------- | --------------------------------- |
| **Nounou à domicile**     | Garde d'enfants à domicile (Salarié)   | CMG Emploi Direct (Taux d'effort) |
| **Nounou partagée**       | Garde d'enfants à domicile (Co-emploi) | CMG Emploi Direct (Quote-part)    |
| **Assistante maternelle** | Assistant maternel agréé               | CMG Emploi Direct (Taux d'effort) |
| **MAM**                   | Assistant maternel (en Maison)         | CMG Emploi Direct (Individuel)    |
| **Micro-crèche privée**   | Établissement (EAJE) hors PSU          | CMG Structure (Barème Tranches)   |
| **Crèche publique / PSU** | Établissement conventionné PSU         | PSU (Tarification directe)        |

_Notes : En 2026, le métier de garde à domicile est officiellement désigné sous le terme « assistant parental » dans la convention collective._

## 3. CMG — Garde à domicile

Depuis septembre 2025, le calcul n'est plus forfaitaire mais proportionnel aux revenus.  

### Conditions d'éligibilité

- **Âge** : Jusqu'à 6 ans (étendu à 12 ans pour les familles monoparentales depuis septembre 2025).

- **Activité** : Activité professionnelle minimale requise pour les deux parents, sauf dispenses (étudiants, bénéficiaires de l'AAH ou du RSA en parcours d'insertion).  

- **Volume** : Minimum de 16 heures de garde par mois via une structure habilitée.

### Montants et barèmes (2026)

Le calcul suit la formule nationale de taux d'effort :  

**Formule (taux d’effort, emploi direct) :**  
`CMG = Coût de la garde × (1 − (Revenu mensuel × Taux d’effort) / Coût horaire de référence)`

**Paramètres au 1er avril 2026 :**

- **Coût horaire de référence (CHR)** : 10,50 €.  

- **Plafond horaire éligible** : 15,18 € (montant maximal du salaire horaire pris en compte).  

- **Revenu mensuel** : Utilisation d'un plancher à 814,62 € et d'un plafond à 8 500 € pour le calcul.  

| Nombre d'enfants à charge | Taux d'Effort (Garde à domicile) |
| ------------------------- | -------------------------------- |
| 1 enfant                  | 0,1238 %                         |
| 2 enfants                 | 0,1032 %                         |
| 3 enfants                 | 0,0826 %                         |
| 4 à 7 enfants             | 0,0620 %                         |
| 8 enfants et plus         | 0,0412 %                         |

**Prise en charge des cotisations (50 %) :**

- Enfant < 3 ans : 526 € / mois (estimation avril 2026).  

- Enfant 3-6 ans : 264 € / mois (estimation avril 2026).  

## 4. CMG — Assistante maternelle

### Conditions de salaire (Plafond Journalier 2026)

Le salaire journalier brut ne doit pas dépasser 5 fois le SMIC horaire par enfant.  

- **SMIC horaire 2026** : 12,02 €.

- **Plafond journalier** : 60,10 € brut (12,02 € × 5).

- **Indemnités d'entretien** : Minimum de 3,83 € pour une journée de 9h de garde.  

### Montant (Taux d'effort)

- **CHR (Coût horaire de référence)** : 4,85 €.  

- **Plafond horaire de prise en charge** : 8,00 €.

- **Cotisations sociales** : Prise en charge intégrale (100 %).  

| Nombre d'enfants à charge | Taux d'Effort (Assistant maternel) |
| ------------------------- | ---------------------------------- |
| 1 enfant                  | 0,0619 %                           |
| 2 enfants                 | 0,0516 %                           |
| 3 enfants                 | 0,0413 %                           |

### Réforme fratries (Janvier 2026)

Depuis le 25 janvier 2026, les parents employeurs de fratries confiées à la même assistante maternelle doivent effectuer une déclaration Pajemploi distincte par enfant. Cette mesure permet une individualisation des droits au CMG et des plafonds de cotisations.

## 5. CMG — MAM

Les règles applicables en Maison d'assistants maternels (MAM) sont identiques à celles de l'assistant maternel à domicile. L'aide à l'investissement de la CAF pour l'ouverture d'une MAM est fixée à 6 000 € en 2026, sans impact sur le calcul du CMG versé aux parents.  

## 6. CMG — Établissements / crèche / halte-garderie

Concerne les micro-crèches et crèches familiales non financées par la PSU.

### Barème Structure (Tranches de ressources N-2)

Le calcul repose sur trois tranches de ressources annuelles (revenus 2024 pour le droit 2026) fixées par l'arrêté du 18 décembre 2025.  

| Nombre d'enfants | Tranche 1 (<=) | Tranche 2 (<=) | Tranche 3 (>) |
| ---------------- | -------------- | -------------- | ------------- |
| 1 enfant         | 24 333 €       | 54 075 €       | 54 075 €      |
| 2 enfants        | 27 786 €       | 61 751 €       | 61 751 €      |
| 3 enfants        | 31 239 €       | 69 427 €       | 69 427 €      |

Note : Ces plafonds sont majorés de 40 % pour les familles monoparentales.  

### Montants mensuels (Jusqu'au 31/03/2026)

- **Enfant < 3 ans** : T1 (984,26 €) / T2 (848,47 €) / T3 (712,72 €).  

- **Enfant 3-6 ans** : T1 (492,13 €) / T2 (424,24 €) / T3 (356,36 €).  

- **Tarif horaire micro-crèche** : Ne doit pas dépasser 10 € / heure pour ouvrir droit à l'aide.  

- **Reste à charge** : Un minimum de 15 % de la dépense reste à la charge de la famille.

## 7. Cas particuliers et territorialité

### 7.1. Nounou partagée et résidence alternée

- **Garde partagée** : Deux familles emploient le même salarié. Chaque famille signe son propre contrat et déclare sa quote-part d'heures.  

- **Résidence alternée (Réforme 12/2025)** : Chaque parent peut désormais percevoir son propre CMG pour les heures d'accueil dont il assume la charge financière.

### 7.2. Régime Alsace-Moselle

Dans les départements du Bas-Rhin, du Haut-Rhin et de la Moselle, le calcul du salaire net (utilisé pour déterminer le reste à charge) est impacté par le régime local.

- **Cotisation maladie** : Le taux de la cotisation salariale supplémentaire est maintenu à 1,3 % pour 2026.

- **Impact employeur** : Ce taux spécifique réduit le salaire net perçu par le salarié à brut égal par rapport au régime général, impactant le coût de la garde pris en compte par Pajemploi.

### 7.3. Départements et Régions d'Outre-Mer (DOM)

- **DROM (Général)** : Les plafonds de ressources sont identiques à la métropole, incluant la majoration de 40 % pour parents isolés.

- **Spécificités Mayotte 2026** :
  - Le PMSS est corrigé à 3 022 € au 1er janvier 2026.

  - Barème Structure Mayotte (Micro-crèche) : Pour un enfant < 3 ans, les aides plafonnent à 847,13 € (T1) contre 984,26 € en métropole.  

## 8. Non-cumul & interactions

| Prestation A | Prestation B                | Interaction                         | Source |
| ------------ | --------------------------- | ----------------------------------- | ------ |
| **CMG**      | **PreParE (Taux plein)**    | **Non-cumul** (cessation totale)    |
| **CMG**      | **PreParE (50 % ou moins)** | **Montant CMG divisé par 2**        |
| **CMG**      | **APL**                     | **Cumul intégral** (CMG non déduit) |
| **CMG**      | **AAH / AEEH**              | **Majoration de 30 %** du CMG       |

 

## 9. Unknowns & follow-ups

- **Congé de naissance (Juillet 2026)** : Nouveau congé d'un ou deux mois indemnisé (70 % du net). Les modalités exactes de cumul avec le CMG seront précisées par décret au printemps 2026.  

- **Revalorisation BMAF** : Prévue à 0,9 % au 1er avril 2026, mais des analyses économiques suggèrent un ajustement possible à 0,8 % selon les chiffres définitifs de l'inflation.  

## 10. Source index

1. Parent-Employeur-Zen : Revalorisation CMG avril 2026 (19/03/2026).  

2. Légifrance : Arrêté du 18 décembre 2025 (Plafonds ressources 2026).  

3. URSSAF : Réforme résidence alternée et droits individuels (06/11/2025).  

4. URSSAF : Guide du nouveau calcul par taux d'effort.  

5. URSSAF : Pajemploi - déclaration par enfant fratries (25/01/2026).

6. La Gazette France : Cotisation Alsace-Moselle 2026 (06/01/2026).

7. LégiSocial : Plafond Sécurité Sociale Mayotte 2026 (16/12/2025).  

8. CAF.fr : Complément de mode de garde à Mayotte (Paramètres 2026).
