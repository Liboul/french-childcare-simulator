# Scénarios de démonstration

Chaque fichier `*.json` est un **`ScenarioInput`** valide pour `computeScenarioSnapshot(pack, input)` (voir `src/scenario/types.ts`).

## Exécution rapide

Depuis la racine du dépôt :

```bash
bun run demo:scenario docs/demo-scenarios/nounou-domicile-couple-2026.json
```

Le script charge `config/rules.fr-2026.json`, calcule le scénario et imprime le **snapshot**, les **warnings** et un résumé de l’**incertitude** sur la sortie standard.

## Fichiers

| Fichier                              | Idée métier courte                                          |
| ------------------------------------ | ----------------------------------------------------------- |
| `nounou-domicile-couple-2026.json`   | Emploi à domicile, couple, CMG + crédit emploi à domicile   |
| `micro-creche-bas-revenus-2026.json` | Micro-crèche éligible, CMG structure + crédit hors domicile |
| `assistante-maternelle-2026.json`    | Assmat, crédit garde hors domicile                          |

Pour un export complet (JSON / CSV / HTML), utiliser `buildScenarioExportBundle` depuis le code applicatif (**GARDE-012**).
