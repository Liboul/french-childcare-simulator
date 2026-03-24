# Sprint plan — Garde d’enfants (France), orientation agent

## Document purpose

Ce document définit les **objectifs de sprint**, le **backlog**, les **accords de travail**, la **délégation deep research** et les **garde-fous** pour la réimplémentation décrite dans [`INITIAL_SPEC.md`](./INITIAL_SPEC.md).

---

## Sprint metadata (à remplir par sprint)

| Field              | Value                                                                                                                          |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| **Product goal**   | Skill et code minimal pour **guider un agent** sur les scénarios de garde (bilans, sources, tableau obligatoire), France 2026. |
| **Sprint length**  | _ex. 2 semaines_                                                                                                               |
| **Sprint dates**   | _YYYY-MM-DD → YYYY-MM-DD_                                                                                                      |
| **Capacity**       | _points ou jours-dev_                                                                                                          |
| **Release target** | _ex. « Toolchain + squelette scénarios + SKILL.md »_                                                                           |

---

## Conventions

- **Epics** regroupent des résultats ; **stories** sont des livrables démontrables.
- **Identifiants** : préfixe **`GARDE-###`** ; les commits référencent la story : `GARDE-042: description courte`.
- **Points** (optionnel) : échelle cohérente (ex. Fibonacci) ; **Spike** si la découverte domine.
- **Dépendances** : explicites ; stories bloquées indiquées.
- **Definition of Done** : voir ci-dessous ; s’applique à chaque story sauf Spike avec critère de sortie différent.
- **Sprint plan** : document **vivant** ; mise à jour à la clôture d’une story ([Story completion log](#story-completion-log)).

### Code layout vs `INITIAL_SPEC`

La spec utilise des **blocs** (foyer, fiscalité, etc.) pour la lecture humaine. Le **code** suit des **frontières métier** (`src/scenarios/`, `src/shared/`, `config/…`), pas une lettre de lettre la spec. Les traces et exports peuvent **mapper** vers le vocabulaire du tableau de bilan.

---

## Tech stack

| Choice                        | Decision                                                                                |
| ----------------------------- | --------------------------------------------------------------------------------------- |
| **Language**                  | **TypeScript** (code, tests, scripts) sauf exception documentée en story.               |
| **Runtime & package manager** | **[Bun](https://bun.sh)** : `bun run`, lockfile.                                        |
| **Tests**                     | **[Bun test](https://bun.sh/docs/cli/test)** (`bun test ./src` pour exclure `./trash/`) |
| **Linting**                   | **ESLint** + TypeScript                                                                 |
| **Formatting**                | **Prettier**                                                                            |
| **Types**                     | **TypeScript strict** ; typecheck en CI                                                 |

---

## Definition of Done (global)

Une story est **terminée** lorsque **tous** les points suivants sont vrais :

1. **Spec de story** : `docs/stories/GARDE-###.md` (template ci-dessous).
2. **Implémentation** alignée sur la spec et [`INITIAL_SPEC.md`](./INITIAL_SPEC.md) (traçabilité, sources, pas de cumul illégal).
3. **Tests** automatisés pour le nouveau comportement ; la suite existante reste verte.
4. **Commit** : au moins un message avec `GARDE-###`.
5. **Incertitude** : règles non vérifiées signalées (`todoVerify`, variante, branche explicite).
6. **Sprint plan** : ligne ajoutée dans [Story completion log](#story-completion-log) (même commit ou commit suivant immédiat).

---

## Story completion log

| Story ID      | Completed (date) | Outcome & notes                                                                                                                                                                                                            |
| ------------- | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **GARDE-001** | 2026-03-24       | Done. Reset dépôt + nouvelle [`INITIAL_SPEC.md`](./INITIAL_SPEC.md) agent-first ; ancien code dans `./trash/` (gitignored).                                                                                                |
| **GARDE-002** | 2026-03-24       | Done. Toolchain Bun + TS strict + `bun test` + ESLint + Prettier + CI `bun run ci` ; `src/` minimal ; [`SPRINT_PLAN.md`](./SPRINT_PLAN.md), [`CONVENTIONS.md`](./CONVENTIONS.md), [`CONTRIBUTING.md`](../CONTRIBUTING.md). |
| **GARDE-003** | 2026-03-24       | Done. Zod `rulePackSchema`, `parseRulePack`, `findRule` ; `config/rules.example.json` + `config/rules.fr-2026.json` (réimport) ; tests [`docs/stories/GARDE-003.md`](./stories/GARDE-003.md).                              |
| **GARDE-004** | 2026-03-24       | Done. Réimport `docs/research/` (+ `prompts/`) ; [`packaging/README.md`](./packaging/README.md) et [`research/README.md`](./research/README.md) (DR hors package skill, distillat dedans) ; spec + sprint alignés.         |

---

## Working agreement : spec story avant code

Au **début** de chaque story : **rédiger ou mettre à jour** `docs/stories/GARDE-###.md`.

| Section                  | Contenu                                                                                         |
| ------------------------ | ----------------------------------------------------------------------------------------------- |
| **Story ID & title**     | `GARDE-###` + une ligne                                                                         |
| **Links**                | Epic, stories liées, `INITIAL_SPEC`                                                             |
| **User / product value** | Problème résolu                                                                                 |
| **Scope**                | Inclus / exclu                                                                                  |
| **Acceptance criteria**  | Numérotés, testables                                                                            |
| **Technical notes**      | Modules, formes de données, cas limites                                                         |
| **Deep research**        | Oui/Non ; si Oui, **propriétaire** exécute le prompt **DR-** hors agent ; lien `docs/research/` |
| **Test plan**            | Cas, fixtures, chemins négatifs                                                                 |
| **Risks & mitigations**  | Dont fiscal / légal                                                                             |
| **Done checklist**       | Reprend la DoD                                                                                  |
| **Sprint plan**          | Ligne dans le log ci-dessus                                                                     |

---

## Guard rails (développement assisté par IA)

1. **Pas de règles fiscales silencieuses** : coefficients et plafonds dans la config avec source, ou `TODO-VERIFY` sans faux défaut.
2. **Une seule source de vérité** pour les chiffres : `config/` versionné.
3. **Traçabilité** : étapes de calcul (formule, id de règle, référence source) avant polish UI.
4. **Tests avant merge** : argent, cumuls, au moins un chemin par grand segment de trace.
5. **Petits commits** ; message `GARDE-###`.
6. **Revue** : story vs `INITIAL_SPEC` (transparence, contraintes).
7. **Pas de scope creep** : refactor seulement si nécessaire à la story.
8. **Hygiène sprint** : clôture = log + backlog cohérents.
9. **Deep research** : si le pack officiel est requis, le **propriétaire** lance le prompt **DR-** dans un outil externe ; l’agent ne remplace pas cette étape.

---

## Deep research : quand et comment

**Deep research** = vérification systématique sur sources **officielles** (Service-Public, CAF, impots.gouv, URSSAF, collectivités), non-cumuls, plafonds 2026.

**Passage obligatoire** : si la recherche est nécessaire, le **propriétaire du projet** exécute le prompt **DR-** dans un outil externe ; le dépôt stocke le résultat sous **`docs/research/`** (rapports **DR-\*.md** et **`prompts/`**).

**Packaging** : ces livrables restent un **outil de travail dans le dépôt**. Le **package skill** (ZIP ou équivalent) **n’inclut pas** les deep research brutes : il embarque le **distillat** nécessaire à la simulation (`config/`, code, doc paramètres / scénarios). Détail : [`packaging/README.md`](./packaging/README.md).

---

## Delivery model : moteur + skill

| Layer               | Role                                                                                                                                                   |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Cœur**            | Fonctions scénario, `config/`, tests, JSON structuré, `renderBilanTableau`                                                                             |
| **Harness / skill** | Instructions, scripts, INTAKE, exemples ; **contenu packagé = distillat** (pas `docs/research/`) — voir [`packaging/README.md`](./packaging/README.md) |

---

## Epic map (cible)

| Epic                    | Goal                                                                                            |
| ----------------------- | ----------------------------------------------------------------------------------------------- |
| **E0 — Foundation**     | Repo, TS, Bun, `bun test`, lint, CI, conventions                                                |
| **E1 — Rules & data**   | `config/` + `docs/research/` (DR dans le dépôt pour audit ; distillat seul dans le skill)       |
| **E2 — Scénarios**      | Une fonction + script + doc par scénario (voir [`CONVENTIONS.md`](./CONVENTIONS.md))            |
| **E3 — Shared helpers** | Net depuis brut, IR simplifié, etc. — scripts + doc                                             |
| **E4 — Packaging**      | Skill (ZIP / repo) : **distillat** + instructions ; pas les DR ; FAQ tableau / « Que puis-je… » |

---

## Backlog (stories) — à affiner

| ID            | Title                                                                 | Epic | Notes               |
| ------------- | --------------------------------------------------------------------- | ---- | ------------------- |
| **GARDE-001** | Reset + `INITIAL_SPEC` agent-first                                    | E0   | Done                |
| **GARDE-002** | Bootstrap : Bun, TS, `bun test`, ESLint, Prettier, CI, `src/` minimal | E0   | Done                |
| **GARDE-003** | Schéma config règles + parse (Zod)                                    | E1   | Done                |
| **GARDE-004** | `docs/research/` réintégré + politique packaging (distillat ≠ DR)     | E1   | Done                |
| **GARDE-005** | Squelette `src/scenarios/` : 4 scénarios + `renderBilanTableau` stub  | E2   |                     |
| **GARDE-006** | Skill : `SKILL.md`, `simulate.mjs`, ZIP **sans** `docs/research/`     | E4   | Distillat seulement |

---

## Risk register (résumé)

| Risk                       | Mitigation                                     |
| -------------------------- | ---------------------------------------------- |
| Paramètres 2026 incomplets | Config datée + `as of` dans les sorties        |
| Tarifs locaux inconnus     | Paramètres + doc ; DR par territoire si besoin |
| Sur-couche IA              | Garde-fous + `TODO-VERIFY`                     |
| Erreurs de cumul           | Tests + trace                                  |

---

## References

- [`INITIAL_SPEC.md`](./INITIAL_SPEC.md)
- [`CONVENTIONS.md`](./CONVENTIONS.md)
- [`packaging/README.md`](./packaging/README.md) — contenu du package skill (distillat)
- Stories : `docs/stories/GARDE-###.md` (template dans la story)
