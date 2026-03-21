# ADR-0001 — Moteur TypeScript portable et harness fournisseur branchable

- **Statut :** Accepted
- **Date :** 2026-03-21
- **Contexte produit :** [`INITIAL_SPEC.md`](../INITIAL_SPEC.md), stories **GARDE-012** / **GARDE-017**
- **Recherche :** [`DR-05-PROVIDER-HARNESS.md`](../research/DR-05-PROVIDER-HARNESS.md)

## Contexte

Le comparatif de modes de garde repose sur un **moteur de calcul déterministe** (TypeScript, tests, pack de règles). Le livrable « agent » peut prendre plusieurs formes selon le canal : **Agent Skills** (format ouvert, ex. Anthropic / OpenAI Codex), **MCP**, **ChatGPT** (GPT + Actions / Apps), **Gemini** (Gems + function calling), ou **API directe** sans LLM. Les offres évoluent vite (noms, APIs dépréciées, review stores).

Il faut séparer clairement :

1. **Cœur métier** — calculs, cumuls, traces, exports JSON/CSV/HTML, scénarios reproductibles.
2. **Harness** — instructions, outils, OAuth, packaging spécifique à un fournisseur.

## Décision

1. **Source de vérité du calcul** : le dépôt `french-childcare-costs` (dossier `src/`, `config/rules.*.json`, tests). Aucune logique fiscale « critique » résidant uniquement dans un prompt propriétaire sans équivalent testé ici.

2. **Surface d’intégration** : exposer le moteur via des **contrats stables** déjà alignés sur les livrables repo :
   - entrée : `ScenarioInput` (cf. `src/scenario/types.ts`) ;
   - sortie : `ScenarioResult` + optionnellement `buildScenarioExportBundle` (**GARDE-012**) ;
   - script CLI de démo : `bun run demo:scenario` (**GARDE-017**).

3. **Cible MVP harness (recommandation DR-05)** : privilégier **OpenAI** pour un premier déploiement grand public (Custom GPT avec Actions et/ou App ChatGPT + schéma OpenAPI / function calling), compte tenu de la maturité documentaire et des flux de publication décrits dans DR-05. Cette cible **n’interdit pas** des harness secondaires (ZIP Agent Skills + MCP, Gemini function calling).

4. **Pluralisme** : les harness sont **jetables / remplaçables** ; une évolution fournisseur ne doit pas imposer de fork du moteur. Les artefacts spécifiques (ZIP Skill, manifeste OAuth, etc.) vivent hors du cœur ou dans un dossier dédié futur (**GARDE-016**).

5. **API HTTP : utile mais non obligatoire** : le serveur `POST /v1/calculate` (**GARDE-016**) n’est **pas** une condition du produit. Dès que l’agent dispose du **dépôt** et d’un runtime (**Bun**), il peut exécuter le moteur **directement** — par exemple `bun run demo:scenario`, appels à `computeScenarioSnapshot` depuis le code, ou tests. Ce mode convient aux **IDE agent avec clone** (**Cursor**, **Cowork**, environnements type « workspace », etc.). **L’API reste pertinente** lorsque le runtime conversationnel **ne peut pas** exécuter le repo (ex. **Custom GPT** avec **Actions** uniquement vers HTTPS, utilisateurs sans environnement de dev, intégrations distantes). En résumé : **cœur toujours dans le repo** ; **HTTP = une option de bridge**, pas l’unique façon de « harnesser » le moteur.

## Options considérées (synthèse)

| Option                      | Intérêt                           | Limite                                      |
| --------------------------- | --------------------------------- | ------------------------------------------- |
| Anthropic Skills + MCP      | Orchestration + outils ouverts    | UX déploiement / exécution code selon canal |
| OpenAI GPT / Apps + Actions | Diffusion large, function calling | Contraintes store, OAuth, politiques OpenAI |
| Google Gems + API           | Intégration Workspace             | Moins de « store » tiers équivalent         |
| API HTTP seule (sans LLM)   | Maximum de contrôle               | Pas de conversational packaging             |

Le détail des critères, sources et risques de renommage est dans **DR-05**.

## Conséquences

- **Positives** : audits possibles sur JSON + trace ; même moteur pour démo CLI, exports, exécution **in-repo** par l’agent **ou** GPT/Skill derrière API selon le canal.
- **Négatives** : chaque canal nécessite un **effort d’implémentation harness** (GARDE-016) et du suivi des dépréciations annoncées (ex. Assistants API OpenAI, cf. DR-05).
- **Risque atténué** : dépendance fournisseur confinée au harness, pas aux formules CMG / crédits / plafonds.

## Suivi

- **GARDE-016** : artefacts dans [`harness/`](../harness/README.md) (serveur `POST /v1/calculate`, `openapi.yaml`, instructions GPT, `skill/SKILL.md`). Poursuivre selon besoins (auth, déploiement, ZIP harness skill).
- Réviser cet ADR si DR-05 est **supplanté** par une recherche plus récente ou si la cible MVP change.
