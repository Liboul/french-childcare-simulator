# GARDE-025 — Exploitation publique du harness (auth, limites, confidentialité)

| Field     | Value                                                             |
| --------- | ----------------------------------------------------------------- |
| **Epic**  | E4 — Packaging                                                    |
| **Links** | **GARDE-016**, `docs/shipping/README.md`, DR-05 (store / privacy) |

## User / product value

Réduit le risque d’exposer `harness:serve` tel quel sur Internet : **clé API**, **rate limiting**, **données personnelles** traitées de façon consciente.

## Scope

**In scope**

- Document **opérationnel** : en-tête attendu, reverse-proxy, journalisation minimale, RGPD (résumé + renvoi juridique externe si besoin).
- Implémentation **optionnelle mais recommandée** : middleware Bun vérifiant une clé (`HARNESS_API_KEY`) + réponse **429** basique si seuil dépassé (ou doc-only si hors temps — à marquer dans le sprint log).

**Out of scope**

- Politique de confidentialité juridiquement revue pour un produit commercial.

## Acceptance criteria

1. `docs/shipping/` ou `harness/README` contient une **checklist pré-prod** exploitable.
2. Si code : tests ou script manuel documenté ; pas de régression des appels locaux sans clé **ou** variable désactivée par défaut (comportement explicite).
3. `bun run ci` ; commit `GARDE-025` ; sprint log à la clôture.

## Deep research

Non (conformité légale = responsabilité éditeur).

## Done checklist

- [ ] Story spec
- [ ] Doc + code optionnel
- [ ] Commit `GARDE-025`
- [ ] Sprint log
