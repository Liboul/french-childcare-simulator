# GARDE-015 — Spike harness fournisseur (DR-05) + ADR

| Field     | Value                                                                                                                                        |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| **Epic**  | E4 — Packaging                                                                                                                               |
| **Links** | [`DR-05`](../research/DR-05-PROVIDER-HARNESS.md), [`SPRINT_PLAN.md`](../SPRINT_PLAN.md), **GARDE-012** (exports JSON), **GARDE-017** (démos) |

## User / product value

La décision **où brancher** le moteur (Agent Skills, ChatGPT, Gemini, API seule) est **documentée et versionnée** : pas d’ambiguïté entre « code métier » et « enveloppe » vendeur. Le spike s’appuie sur la recherche **DR-05** déjà consignée dans le dépôt.

## Scope

**In scope**

- ADR `docs/architecture/ADR-0001-pluggable-provider-harness.md` : contexte, options, **décision**, conséquences, lien DR-05.
- `docs/architecture/README.md` : index des ADR.
- Mise à jour [Story completion log](../SPRINT_PLAN.md).

**Out of scope (GARDE-016)**

- Implémentation concrète des Skills / GPT / manifestes OAuth, prompts marketplace.

## Acceptance criteria

1. ADR lisible, statut **Accepted** (recherche DR-05 prise comme input spike).
2. Sprint log + commit `GARDE-015`.

## Deep research

**DR-05** : déjà sous [`docs/research/DR-05-PROVIDER-HARNESS.md`](../research/DR-05-PROVIDER-HARNESS.md) — pas de nouveau prompt obligatoire pour fermer cette story.

## Done checklist

- [x] Story spec
- [x] ADR + index architecture
- [x] Sprint log
- [x] Commit `GARDE-015`
