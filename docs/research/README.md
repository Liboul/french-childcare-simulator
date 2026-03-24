# Deep research (DR) — usage dépôt vs packaging

## Rôle dans le dépôt

Ce répertoire regroupe les **recherches approfondies** (thèmes **DR-01** à **DR-08**, etc.) et les **prompts** utilisés pour les produire ou les mettre à jour. Elles servent à :

- valider et documenter les règles avant encodage dans **`config/`** ;
- tracer les **sources officielles** et les **zones d’incertitude** ;
- guider le **propriétaire du projet** lorsqu’une relance externe est nécessaire.

## Ce qui ne va pas dans le package skill

Les fichiers **`DR-*.md`** et **`prompts/`** ne sont **pas** copiés dans l’**archive skill** livrée à l’utilisateur final / à l’agent en contexte restreint. Voir [`docs/packaging/README.md`](../packaging/README.md).

## Ce qui alimente la simulation côté package

Le **distillat** : principalement **`config/rules.*.json`** (paramètres sourcés), le **code** et la **doc paramètres** par scénario — pas la prose complète des DR.

Quand une règle est intégrée au moteur, les **liens** et **identifiants** utiles doivent rester accessibles via la config et les traces de calcul, pas uniquement via ces rapports.
