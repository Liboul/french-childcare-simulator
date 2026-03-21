# Livraison — harness par fournisseur

Ce guide complète la **recherche marché** [`DR-05`](../research/DR-05-PROVIDER-HARNESS.md) par des **étapes concrètes pour ce dépôt**. L’**ADR** [`ADR-0001`](../architecture/ADR-0001-pluggable-provider-harness.md) rappelle que le **moteur** vit dans `src/` + `config/` ; le dossier [`harness/`](../../harness/README.md) fournit API de dev, OpenAPI et une ébauche de Skill.

**Important :** les portails évoluent (noms, review, URLs). Vérifier toujours la **documentation officielle** du fournisseur avant une mise en production.

---

## Synthèse

| Fournisseur   | Usage typique _de ce repo_                  | Besoin d’API HTTPS déployée ?                        |
| ------------- | ------------------------------------------- | ---------------------------------------------------- |
| **Anthropic** | Claude **Code** + clone + Bun (recommandé)  | Optionnel (MCP / HTTP si tu exposes `harness:serve`) |
| **OpenAI**    | **Custom GPT** + **Action** OpenAPI         | **Oui** pour les utilisateurs sans clone du dépôt    |
| **Google**    | **Gem** + function calling vers ton backend | **Oui** (même contrat que l’OpenAPI du repo)         |

---

## Anthropic (Claude)

### Piste A — Claude Code / workspace avec le dépôt (**recommandée**)

1. Cloner ce repo, installer les deps (`bun install`).
2. Lire [`harness/claude/SKILL.md`](../../harness/claude/SKILL.md) : il décrit l’exécution **dans le repo** (`bun run demo:scenario`, imports `src/`).
3. **Installation locale type Skill** : placer une copie du dossier contenant `SKILL.md` là où Claude Code charge les skills (souvent `~/.claude/skills/<nom>/` — confirmer sur la doc Anthropic actuelle).
4. Vérifier que **Bun** est disponible dans l’environnement où l’agent exécute les commandes.

**Limite :** un **ZIP Skill** uploadé sur **claude.ai** sans le reste du dépôt ne contient **pas** le moteur TypeScript : tu n’auras que des instructions, sauf si tu relies une **API** ou du **code exécutable** inclus dans le skill selon les capacités du produit (voir DR-05).

### Packager l’archive (ZIP) depuis ce repo

1. `bun install` (une fois).
2. `bun run package:claude-skill`
   - Dossier assemblé : `dist/claude-skill/comparatif-modes-garde-fr-2026/` (`SKILL.md`, `REFERENCE.md`, `openapi.yaml`, `examples/*.json`).
   - Archive prête à l’upload : **`dist/comparatif-modes-garde-fr-2026-skill.zip`**.
3. Nécessite la commande système **`zip`** (macOS / Linux : souvent déjà présente).

### Publier sur **claude.ai** (compte individuel)

1. Ouvre [Claude](https://claude.ai) → **Settings** (paramètres du compte).
2. Section **Capabilities** : activer ce qui est requis pour ton usage (**Code execution** / outils si tu t’appuies sur du code ou HTTP — intitulés exacts selon la doc Anthropic du moment).
3. **Skills** (ou équivalent) → **Upload** / ajouter un skill → choisir **`dist/comparatif-modes-garde-fr-2026-skill.zip`**.
4. Après upload : le skill apparaît dans tes capacités ; invoque-le ou laisse Claude le proposer selon le sujet.
5. **Sans API** : le skill guide l’entretien et le JSON, mais **ne calcule pas** tout seul — prévoir **Piste B** ou un utilisateur qui exécute le repo en local.

### Publier en **Claude Code** (dépôt sur la machine)

1. Cloner ce repo, `bun install`.
2. Enregistrer le skill là où Claude Code charge les skills (souvent `~/.claude/skills/<nom>/` — vérifier la [doc Anthropic](https://docs.anthropic.com) / l’aide produit pour le chemin exact).
3. **Lien symbolique** pratique (un seul `SKILL.md` à maintenir dans le repo) :

   ```bash
   ln -sf /CHEMIN/VERS/CE/REPO/harness/claude ~/.claude/skills/comparatif-modes-garde-fr-2026
   ```

4. Redémarrer ou recharger Claude Code si nécessaire ; travailler **dans le clone** pour que `bun run demo:scenario` et `src/` soient disponibles.

### Entreprise (workspace)

Les admins peuvent **provisionner** un skill pour tous les utilisateurs du workspace (voir annonces / doc Anthropic **workspace skills**). Le livrable reste le même dossier ou ZIP ; la procédure passe par la console admin.

### Piste B — API + MCP / outil HTTP

1. Déployer le même service que pour OpenAI (voir ci-dessous) : `POST /v1/calculate`.
2. Configurer un **connecteur MCP** ou l’outil HTTP Claude pour appeler cette URL (détails côté doc Anthropic ; principes dans DR-05 § MCP).

**Fichiers utiles :** [`harness/openapi.yaml`](../../harness/openapi.yaml), [`harness/handle-calculate.ts`](../../harness/handle-calculate.ts).

---

## OpenAI (ChatGPT)

### Custom GPT avec **Action** (OpenAPI)

1. **Backend** : exposer publiquement **`POST /v1/calculate`** (et idéalement `GET /health`) en **HTTPS**. Le schéma attendu est dans [`harness/openapi.yaml`](../../harness/openapi.yaml).
2. **Dev local** : `bun run harness:serve` puis tunnel (ex. ngrok, cloudflared) vers `8787` — **uniquement pour essais**, pas pour données sensibles sans durcissement.
3. Dans ChatGPT : **Create a GPT** → **Actions** → importer / coller l’OpenAPI (URL du schéma hébergé ou schéma statique aligné sur le fichier du repo).
4. **Instructions** : reprendre / adapter [`harness/instructions/gpt-custom-instructions.fr.md`](../../harness/instructions/gpt-custom-instructions.fr.md) ; exemples utilisateur : [`harness/prompts/example-user-messages.fr.md`](../../harness/prompts/example-user-messages.fr.md).
5. **Publication** (GPT Store / partage) : prévoir **politique de confidentialité** et conformité aux règles OpenAI si des **données utilisateur** transitent vers ton API (voir DR-05 § store / review).

**Sécurité :** le serveur d’exemple **n’implémente pas d’authentification** ; ajouter clé API, rate limiting et TLS en production.

### ChatGPT **Apps** (répertoire développeur)

Flux plus lourd (**OAuth 2.1 PKCE**, review Directory). Le **contrat** métier peut rester le même (`openapi.yaml`) ; suivre la doc développeur OpenAI **Apps** (DR-05 en résume les contraintes).

---

## Google (Gemini)

### Gem + **function calling**

1. Déployer un endpoint HTTPS compatible avec le corps/réponse décrits dans `openapi.yaml` (même logique que pour OpenAI).
2. Dans **Google AI Studio** (ou équivalent), déclarer une **fonction** dont les paramètres correspondent à un **`ScenarioInput`** JSON (ou un wrapper `{ "scenario": { ... } }` si tu simplifies le binding).
3. Production : souvent **Vertex AI** / facturation GCP — voir doc Google pour quotas et clés.

**Limite :** pas d’équivalent « Skill ZIP » unique côté Google comme Anthropic ; l’intégration passe surtout par **API + instructions** du Gem (DR-05 § Google).

---

## Sécurité et exploitation

- Ne pas exposer `harness:serve` sur Internet sans **auth** et **HTTPS**.
- Le moteur traite des **données familiales / fiscales** saisies par l’utilisateur : RGPD, rétention, journalisation — à traiter selon ton hébergeur et ton usage.
- Mettre en place **surveillance** et **limites de débit** sur l’endpoint public.

---

## Vérification rapide

| Étape              | Commande / action                                                            |
| ------------------ | ---------------------------------------------------------------------------- |
| Moteur OK en local | `bun run ci`                                                                 |
| Scénario fichier   | `bun run demo:scenario docs/demo-scenarios/nounou-domicile-couple-2026.json` |
| API locale         | `bun run harness:serve` puis `GET /health`, `POST /v1/calculate`             |

---

## Références internes

- [`harness/README.md`](../../harness/README.md) — API locale, OpenAPI, lien ADR.
- [`docs/SOURCES_OFFICIELLES.md`](../SOURCES_OFFICIELLES.md) — liens fiscaux pour les réponses utilisateur.
- **Recherche plateformes :** [`DR-05`](../research/DR-05-PROVIDER-HARNESS.md).
