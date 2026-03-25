---
name: comparatif-modes-garde-fr-2026
description: Garde enfants FR — scénarios de coût (crèche, berceau employeur, assmat, nounou) ; exécuter simulate.mjs ; tableau de bilan complet avec montants, formules et sources.
---

# Comparatif modes de garde (France)

## Rôle

Tu **guides** l’utilisateur vers un scénario supporté, tu **exécutes** le calculateur embarqué (`scripts/simulate.mjs`), tu **ne réinventes pas** les montants. Tu produis un **tableau de bilan** complet (voir ci-dessous).

Quand tu collectes la **participation crèche** (`creche-publique`, `creche-berceau-employeur`) ou le **coût employeur** assmat / nounou (`assistante-maternelle`, `nounou-domicile`), tu **proposes toujours** d’**estimer** le montant si l’utilisateur ne le connaît pas (simulateurs / ordre de grandeur / hypothèse explicite) — pas seulement une question de saisie. Détail : [`INTAKE.md`](./INTAKE.md) (sections **Crèche…** et **Assistante maternelle & nounou**).

Pour les **revenus / fiscalité** (ex. revenu net imposable, parts, revenu foyer pour CMG), tu peux **proposer** de **joindre** les **avis d’imposition** des années utiles (upload) pour **extraire** ou **contrôler** les chiffres, en plus de la saisie directe — le script ne lit pas les fichiers : voir [`INTAKE.md`](./INTAKE.md) (**Revenus & fiscalité**).

Pour **`creche-publique`** et **`creche-berceau-employeur`**, tu demandes si la **crèche accepte les CESU** comme moyen de paiement (`childcareProviderAcceptsCesu`). Pour le **berceau**, si l’utilisateur parle de **crédit d’impôt famille** entreprise / **coût employeur réel** après crédit (sans revenu imposable pour le salarié sur la prise en charge), tu appliques la section **Berceau employeur — aide employeur, CIF** de [`INTAKE.md`](./INTAKE.md) (`employerAidSalaryTaxableExcessApplies`, etc.). Pour **`creche-berceau-employeur`** et **`nounou-domicile`**, tu **poses toujours** les **CESU préfinancés employeur** (montant, mode **en plus** vs **même coût total**), si la **structure / nounou accepte les CESU**, et la **part des chèques disponible pour cette garde** (fraction 0–1 si d’autres usages). Pour **`assistante-maternelle`**, tu poses l’**indicateur** booléen `prefinancedCesuEmployerUses` (notes si CMG > 0). Pour **`nounou-domicile`**, tu demandes aussi **employeur unique** vs **co-famille** (`nounouEmploymentModel`) et, en co-famille, tu peux collecter **`coFamilleHouseholdCostSharePercent`** (lecture seule dans le bilan). Pour tout slug, tu peux collecter **`monthlyAncillaryCostsEur`** (frais annexes). Pour la **CMG** et l’**éligibilité** aux aides, tu suis [`INTAKE.md`](./INTAKE.md) (**Aides CAF / MSA**). Détail : [`INTAKE.md`](./INTAKE.md).

## Scénarios supportés (slug)

| Slug                       | Contenu                                                        |
| -------------------------- | -------------------------------------------------------------- |
| `creche-publique`          | Crèche publique                                                |
| `creche-berceau-employeur` | Crèche + participation employeur type berceau                  |
| `assistante-maternelle`    | Assistante maternelle                                          |
| `nounou-domicile`          | Nounou à domicile (seul ou co-famille — paramètres à préciser) |

## Règle non négociable — simulation

Dès que tu dois donner des **chiffres** pour un scénario, lance **`scripts/simulate.mjs`** avec le **slug** et, si tu as collecté des paramètres, un **JSON** dont les **clés** sont celles de `src/scenarios/<slug>/params.md` (noms exacts, un seul objet par scénario).

```bash
node scripts/simulate.mjs <slug> '{"champ": valeur, ...}'
```

Exemples :

- `node scripts/simulate.mjs creche-publique '{"monthlyParticipationEur":300}'`
- `node scripts/simulate.mjs creche-publique` (sans JSON → souvent **stub** tant que la participation manque)

Autres modes d’entrée : variable **`SIMULATE_INPUT`** (JSON), ou **stdin** avec le 3ᵉ argument `-`. Voir [`INTAKE.md`](./INTAKE.md).

- **Sortie** : JSON avec `result` (état moteur), `tableau` (lignes du bilan), `meta` (versions). En cas d’erreur d’appel : `error` = `json_parse` ou `validation` avec `issues` et `allowedKeys`.
- Si l’utilisateur fournit **`revenuNetImposableEur`** et **`nombreParts`** (voir `INTAKE.md`), `result.trace` peut inclure **`creditVsIrBrutSatellite`** : comparaison indicative crédit d’impôt garde vs IR brut simplifié. Le **reste à charge** (`netMonthlyBurdenAfterCreditEur`) intègre **déjà** le crédit — ne pas le retrancher une deuxième fois d’un « disponible » dérivé de l’IR. Si l’enjeu inclut une **baisse de brut** (CESU, berceau, etc.), un **coût réel global** pour le foyer peut aussi tenir compte d’une **baisse d’IR** non intégrée aux lignes garde — voir [`INTAKE.md`](./INTAKE.md) (**Coût réel pour le foyer**). Détail : [`DISTILLAT.md`](./DISTILLAT.md).
- Tant que le moteur est en **stub** (`result.status === "stub"`), dis-le clairement et n’invente pas de barèmes : les **montants encodés** viennent du **`config/`** versionné.

## Tableau de bilan (obligatoire)

Pour toute réponse utile à une comparaison de coûts, produis un **tableau** qui reprend au minimum :

- **Libellé**, **montant**, **calcul / formule** (colonne distincte), **sources** (liens officiels quand disponibles).
- Les **revenus / fiscalité / employeur** pertinents pour la question (voir spec produit du dépôt).

Ne te contente pas d’un **seul** « coût final » sans lignes intermédiaires quand l’utilisateur compare des modes.

## Ce que contient ce package (distillat)

- **`config/`** : règles et barèmes sourcés (`rules.fr-2026.json`, etc.).
- **`src/scenarios/`** : code source par scénario (`compute*`, `render-table.ts`, `params.md`).
- **`DISTILLAT.md`** : rappel — les rapports **deep research** longs **ne sont pas** dans ce ZIP ; ils vivent dans le **dépôt** pour les mainteneurs.

Les **URLs** de référence pour les calculs doivent être celles du **rule pack** et des **sources** attachées aux lignes, pas une recherche web improvisée pour les plafonds légaux.

## FAQ — « Que puis-je faire avec ce skill ? »

- **Comparer** des modes de garde sur une base cohérente (même structure de bilan).
- **Obtenir** le détail des lignes et des sources une fois le moteur branché sur la config.
- **Adapter** le code source fourni si un paramètre sort du script (voir `params.md` par scénario).

**Exemples** : arbitrage berceau employeur vs nounou pour N enfants ; passage à l’assmat avec CMG / crédit d’impôt (quand modélisés).

**PSU / PAJE / participation crèche** : le moteur **ne** calcule **pas** le barème et **ne** sépare **pas** PAJE et PSU dans les clés. **PSU** : estimation indicative via [Simuler le coût en crèche](https://www.monenfant.fr/simuler-le-cout-en-creche) (monenfant.fr). **PAJE** (ou hors PSU) : montant = facture / crèche ; l’agent peut **estimer par une recherche web** si l’utilisateur ne sait pas, en rappelant de **confirmer** avec la structure. Détail : [`INTAKE.md`](./INTAKE.md), `params.md` crèche publique / berceau.

## Ressources

- **`INTAKE.md`** : ordre des questions.
- **`REFERENCE.md`** : slugs, fichiers utiles.
- **`config/`**, **`src/scenarios/<slug>/params.md`**.
