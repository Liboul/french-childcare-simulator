# Distillat (ce ZIP contient)

Version courte du document **packaging** du dépôt (`docs/packaging/README.md`) :

- **Inclus** : `config/`, code `src/scenarios/`, instructions (`SKILL.md`, `INTAKE.md`, ce fichier), `scripts/simulate.mjs`.
- **Exclu des archives skill** : dossier **`docs/research/`** (rapports DR longs et prompts). Ces documents restent dans le dépôt Git pour **audit** et **mise à jour** des règles ; le **distillat** utile à l’agent est ici : barèmes dans `config/`, logique et doc dans `src/scenarios/`.

## Crédit d’impôt garde et IR (anti double comptage)

Le **reste à charge** après crédit (`netMonthlyBurdenAfterCreditEur` dans la trace) intègre **déjà** le crédit d’impôt modélisé pour le scénario. Si l’utilisateur fournit `revenuNetImposableEur` et `nombreParts`, la sortie peut inclure `creditVsIrBrutSatellite` : comparaison **indicative** du crédit annuel avec un **IR brut simplifié** (sans décote ni plafonnement QF). Une part du crédit peut excéder l’IR brut (crédit **remboursable**) : ce n’est pas une erreur. **Ne pas** soustraire une deuxième fois le crédit garde d’un « disponible » dérivé de l’IR.
