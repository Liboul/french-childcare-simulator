# Intake — ordre des questions

1. **Slug** : `creche-publique` \| `creche-berceau-employeur` \| `assistante-maternelle` \| `nounou-domicile`.
2. **Paramètres** : pour **chaque** champ, lire `src/scenarios/<slug>/params.md` (noms exacts, unités).
3. **Lancer le calculateur** avec un **objet JSON** contenant **uniquement** ces champs (types : nombres finis, entiers positifs où indiqué, `custody` = `"full"` \| `"shared"`).

## Passer les paramètres à `simulate.mjs`

**Un seul script** ; les clés **diffèrent par slug** — pas de mélange.

| Mode                          | Exemple                                                                                                                                    |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **3ᵉ argument** (chaîne JSON) | `node scripts/simulate.mjs creche-publique '{"monthlyParticipationEur":300}'`                                                              |
| **Variable d’environnement**  | `SIMULATE_INPUT='{"monthlyEmploymentCostEur":800,"monthlyHouseholdIncomeForCmgEur":3000}' node scripts/simulate.mjs assistante-maternelle` |
| **Stdin** (3ᵉ arg = `-`)      | `echo '{"monthlyParticipationEur":280}' \| node scripts/simulate.mjs creche-publique -`                                                    |

Sans JSON (ou `{}`) : le moteur tourne avec **stub** si les champs obligatoires pour un calcul partiel manquent.

## Si ça échoue

- **`error: "json_parse"`** : JSON invalide — corriger la chaîne.
- **`error: "validation"`** : clé inconnue, mauvais type, ou valeur hors contrainte — lire `issues` et **`allowedKeys`** dans la sortie ; recouper avec `params.md`.

Ensuite : présenter le **tableau** (`tableau.lignes`) et le **résultat** (`result`) à l’utilisateur.
