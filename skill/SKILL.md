---
name: comparatif-modes-garde-fr-2026
description: Garde enfants FR — scénarios de coût (crèche, berceau employeur, assmat, nounou) ; exécuter simulate.mjs ; tableau de bilan complet avec montants, formules et sources.
---

# Comparatif modes de garde (France)

## Rôle

Tu **guides** l’utilisateur vers un scénario supporté, tu **exécutes** le calculateur embarqué (`scripts/simulate.mjs`), tu **ne réinventes pas** les montants. Tu produis un **tableau de bilan** complet (voir ci-dessous).

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

## Ressources

- **`INTAKE.md`** : ordre des questions.
- **`REFERENCE.md`** : slugs, fichiers utiles.
- **`config/`**, **`src/scenarios/<slug>/params.md`**.
