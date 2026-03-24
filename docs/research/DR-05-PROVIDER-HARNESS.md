> **Architecture :** décision structurante consignée en [ADR-0001 — Moteur portable et harness branchable](../architecture/ADR-0001-pluggable-provider-harness.md).

# Research brief (refined prompt)

**Decision we are informing:** Can we **package domain logic as a portable skill-like artifact** and **ship it through each vendor’s own “agent harnesses”** (surfaces where the model gets richer affordances than plain browser chat), instead of maintaining a **custom harness** (our app, our file access, our tool host)?

**Minimum harness capability (non-negotiable for our ship path):** The environment must be able to **run our logic**, not only static instructions + RAG. Concretely we need **at least one** of: **(a)** hosted or local **script / code execution** (sandbox or user machine) that can run bundled code, or **(b)** first-class **outbound HTTP / tool calls** to our (or the user’s) API so the model can obtain computed results. Surfaces that only attach files and answer from context **without** execution or callable tools are **out of scope** as a primary harness unless paired with function-calling, Actions, MCP, or equivalent.

**Definitions (locked for this doc — revise only if product names or policies change):**

- **Skill-equivalent:** The vendor’s first-class unit for reusable **behavior**: instructions plus optional **assets** (files, tool manifests, OpenAPI specs). Labels differ (Skill, Custom GPT, Gem, Copilot “agent,” etc.); we compare by **what the runtime can do**, not the trademark.
- **Harness:** The **combined runtime** available to the model in a given product: **tools, policies, identity, and execution environment**. For our ship path, a harness must satisfy the **minimum harness capability** above (script execution and/or model-initiated HTTP/tools). A **consumption surface** is UI where the user chats but **our logic cannot run** (no tools, no code, no Actions) — useful for docs/support, not for shipping the calculator as the product.
- **Marketplace:** Any **discoverable catalog** (store, directory, admin gallery) where a third party can list an offering. Distinct from **private distribution** (ZIP, link, Git) and from **API-only registration** (developer console without end-user search).
- **Authorization:** **Who** may enable a tool, **how secrets are issued** (OAuth 2 / PKCE, API key, workload identity, mutual TLS), **where tokens live** (vendor vault, our server, enterprise IdP, user’s machine), and **admin gates** (allowlists, DLP, consent screens). This determines whether our backend can trust a request as coming from an entitled user or org.
- **Billing (tied to auth + marketplace):** Split deliberately into **(i) model usage** — who pays the lab (end-user subscription, developer API key, org pool) — and **(ii) our revenue** — whether the **platform pays us** (revenue share, SKUs, grants) or we **bill separately** (SaaS, usage on our API, enterprise contract). Marketplace presence does not imply platform-mediated **(ii)**.

**Non-goals (scope control):** We are **not** cataloging every vertical SaaS that added a chat widget, every open-weight inference host, or every **RAG-only** assistant builder. Tier C is a **watchlist**, not an exhaustive market map. EU regulatory detail stays in other DRs unless it changes a harness choice.

**Questions to answer per provider (and for any additional providers we add):**

| Theme                        | What we need documented                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Upload / registration**    | Exact path: UI steps, CLI, API, manifest format, limits (size, review). Mirror in **Setup playbooks** as numbered steps.                                                                                                                                                                                                                                                                                                                                                             |
| **Marketplace**              | Is there searchable discovery? Who can publish? Review rules?                                                                                                                                                                                                                                                                                                                                                                                                                        |
| **Org vs account vs device** | Can admins push the artifact org-wide? Per-group? Only self-serve per user? Local-only (e.g. `~/.vendor/skills`)?                                                                                                                                                                                                                                                                                                                                                                    |
| **Surfaces**                 | Web, mobile, desktop app, IDE / CLI, API-only playground — which exist and which load the skill-equivalent.                                                                                                                                                                                                                                                                                                                                                                          |
| **Harness mapping**          | For each major surface, does it qualify as a harness (file access, sandbox, MCP, etc.)? What is the closest analogue to **Claude Code / “co-worker with repo access”**?                                                                                                                                                                                                                                                                                                              |
| **Execution & API**          | Does this surface support **script/code execution**, **model-initiated HTTP** (Actions, built-in fetch, MCP), or **only** retrieval over uploads? Which path matches our engine (e.g. TS in sandbox vs remote JSON API)?                                                                                                                                                                                                                                                             |
| **Authorization**            | How does the user or org **consent** and how are **credentials** handled: API keys in developer config, **OAuth 2 / PKCE** (ChatGPT as client), **mutual TLS**, **service accounts**, **Workspace / Entra / IAM** scopes, **BYO bearer** on our server, etc.? Who stores tokens (vendor vs us vs enterprise IdP)? Any **admin allowlists** or **policy gates**?                                                                                                                      |
| **Billing / monetization**   | Does the provider’s **marketplace or platform** support **billing the client on our behalf** (e.g. listing fees, rev share, add-on SKUs billed through the vendor, enterprise app licensing)? Or is the store **distribution-only** / free listings while **we** bill via our own backend (API metering, OAuth-linked accounts, external subscription)? Note **who pays for model usage** (end user’s ChatGPT plan vs our API key vs org allotment) separately from **who pays us**. |
| **Other harness types**      | IDE agents, Slack/Teams bots, cloud workstations, BYO host + API — what is worth listing for “ship without building our UI”?                                                                                                                                                                                                                                                                                                                                                         |

**Provider scope:** **Tier A (must cover):** Anthropic, OpenAI, Google. **Tier B (explicitly add):** at minimum Microsoft (Copilot / M365 / GitHub), Amazon (Q / Bedrock agents), and any other major chat+API vendors (e.g. Meta AI business surfaces, Mistral, xAI) **plus** **harness carriers** that are not model labs (e.g. Cursor, Windsurf, Continue, enterprise gateways) where skills/MCP/rules are how users consume behavior.

**Success criteria for this document:** A **provider × dimension matrix** (upload, marketplace, org control, surfaces, harness class, skill scope, **execution/API path**, **auth model**, **billing / who charges whom**) with **primary sources and retrieval dates**; **numbered setup playbooks** for each **Tier A** harness we might ship on (end-user clicks + org admin + API); plus a **short recommendation**: which harnesses are realistic for shipping our packaged skill **without** a bespoke product shell.

---

# Plan to improve this research

Work the doc in this order; tick items in Git when a slice is done.

1. [x] **Lock vocabulary** — Finalize definitions of _harness_, _skill-equivalent_, _marketplace_, **authorization**, **billing**, and **minimum harness capability**; add **non-goals**. _(Done 2026-03-24 — see “Definitions” above.)_
2. [x] **Freeze provider list** — Table of providers (Tier A/B/C) with one sentence each on why they are in scope. _(Done 2026-03-24 — see “Provider inventory” below.)_
3. [x] **Per-provider fact pass (Tier A)** — Standard dimensions filled for Anthropic, OpenAI, Google. _(Done 2026-03-24 — snapshot table below; Tier B still TBD.)_
4. [x] **Harness taxonomy** — Classes + Tier A mapping + gaps. _(Done 2026-03-24 — see below.)_
5. [x] **Cross-vendor comparison** — Expanded table columns. _(Done 2026-03-24 — “Comparison table” section.)_
6. [x] **Ship-path recommendation** — Refreshed for harness classes + minimum capability (2026-03-24); narrow again after Tier B.
7. [ ] **Sources and drift** — Add primary URLs + retrieval dates for **new** rows (OpenAI GPT builder payments evolution, Anthropic org Skills help, Tier B); re-verify Assistants API / Responses API timeline.
8. [x] **Setup playbooks (Tier A)** — Numbered how-to for each distinct harness (Claude.ai, Claude Code, Claude org, Claude API, ChatGPT GPT+Actions, ChatGPT App, OpenAI API, Gemini Gem, Gemini API / AI Studio / Vertex). _(Done 2026-03-24 — see [# Setup playbooks (Tier A)](#setup-playbooks-tier-a).)_
9. [ ] **Setup playbooks (Tier B)** — Same structure for Microsoft, Amazon, IDE hosts once Step 3 (Tier B) facts exist.

**Next action:** Tier B fact pass + Tier B setup playbooks (Steps 3/9); Step 7 sources.

---

# Provider inventory (Step 2)

_Frozen list for this research cycle. Tier C = watchlist only._

| Tier  | Provider / product line                                                                                        | Why in scope for “ship skill via provider harness”                                                                                                               |
| ----- | -------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A** | **Anthropic** (Claude.ai, Claude Code, API)                                                                    | First-class **Skills**, MCP, org provisioning; closest reference for “folder skill + execution.”                                                                 |
| **A** | **OpenAI** (ChatGPT, Apps, API, Codex)                                                                         | **Custom GPTs**, **ChatGPT Apps**, function-calling; largest end-user distribution; GPT Store / builder economics documented.                                    |
| **A** | **Google** (Gemini Apps, AI Studio, Vertex)                                                                    | **Gems** + **Gemini API** function calling; Workspace footprint; no third-party Gemini “app store” today.                                                        |
| **B** | **Microsoft** (Copilot, M365 Copilot, Copilot Studio, GitHub Copilot)                                          | Enterprise distribution; **agents / connectors** patterns; potential org-wide deployment.                                                                        |
| **B** | **Amazon** (Amazon Q, Bedrock Agents, Tool use)                                                                | Regulated-industry and AWS-native deployments; agent + tool-use model parallels function-calling.                                                                |
| **B** | **IDE & agent hosts** (e.g. **Cursor**, **Windsurf**, **Continue**, **GitHub Copilot Chat** in-editor)         | **MCP**, rules, or skills live on the **machine/repo**; users already in “harness” context.                                                                      |
| **B** | **API-first labs** (**Mistral**, **xAI**, **Cohere**, **Meta** Llama API / business surfaces where applicable) | Same integration pattern as Gemini/OpenAI API (**BYO harness**); matters if we standardize on “API + OpenAPI tools only.”                                        |
| **C** | **Perplexity**, **character.ai**, niche assistants, SMB “AI app” builders                                      | End-user reach in places; typically **no** stable third-party tool/skill marketplace comparable to ChatGPT/Claude; revisit only if we target a specific channel. |

---

# Per-provider fact pass — Tier A snapshot (Step 3)

_Concise answers for the dimensions in the research brief. Narrative detail remains in sections [# Anthropic](#anthropic) through [# Google](#google). Tier B: **not filled** in this pass._

| Dimension                    | Anthropic                                                                                                                                                                                                                                         | OpenAI                                                                                                                                                                                                                                                                                                                                                                                                | Google                                                                                                                                                                         |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Upload / registration**    | ZIP via **Customize → Skills** (after **Settings → Capabilities**: enable code execution); Claude Code: `~/.claude/skills/`; org: **Organization settings → Skills**; **Skills API** `POST /v1/skills`. See [playbooks](#setup-playbooks-tier-a). | **Create GPT** in ChatGPT UI; **ChatGPT App** via developer registration + OpenAPI/MCP manifest + review.                                                                                                                                                                                                                                                                                             | **Gem** in Gemini Apps; **Vertex / Gemini API** = tools in API requests. See [playbooks](#setup-playbooks-tier-a).                                                             |
| **Marketplace**              | **No** end-user **searchable third-party Skill Store** comparable to GPT Store; distribution is **ZIP / org provision / API**, not a public skill bazaar.                                                                                         | **GPT Store** (Custom GPTs, reviewed); **ChatGPT App** discovery after approval.                                                                                                                                                                                                                                                                                                                      | **No** third-party Gemini extension marketplace; Gems shared via **Drive / org settings**, not a global store.                                                                 |
| **Org vs user vs device**    | **Org owners** can provision skills org-wide (Team/Enterprise); users may disable per user. Claude Code skills are **per machine** (`~/.claude/skills`).                                                                                          | **Team/Enterprise** admin controls for which GPTs/apps are allowed; GPTs also **per-user** creation. API keys **per project/developer account**.                                                                                                                                                                                                                                                      | Workspace **admin** can control Gem sharing; otherwise per-user Gems; **GCP project** owns API keys and quotas for Vertex.                                                     |
| **Surfaces**                 | Claude.ai (web), Claude Code, **API** (`container.skills`). Workbench: **not** a skill execution channel.                                                                                                                                         | ChatGPT (web/mobile/desktop app where available), **API** (function-calling / Responses). **Codex / CLI** products = separate harness (Tier B detail).                                                                                                                                                                                                                                                | Gemini Apps (web/mobile), **AI Studio**, **Vertex** API.                                                                                                                       |
| **Claude Code–class analog** | **Claude Code** itself.                                                                                                                                                                                                                           | **No single public clone** of Claude Code from OpenAI; closest mix: **ChatGPT desktop**, **connector Apps**, **API+local host**, **Codex-style CLI** (verify naming/features per current OpenAI docs).                                                                                                                                                                                                | **No** first-party “repo-native” Claude Code equivalent in consumer Gemini; **Cloud / IDE** integrations are indirect; **API+host** is the portable pattern.                   |
| **Execution / API**          | **Yes:** code execution (when enabled) + **MCP / HTTP-style tools** + scripts in skill folder (Claude Code / container).                                                                                                                          | **Yes:** **GPT Actions** and **ChatGPT Apps** (HTTP from ChatGPT to our server); **Code Interpreter** is OpenAI-hosted (not our TS bundle); **API** function-calling = our server executes logic.                                                                                                                                                                                                     | **Gem alone:** weak for **our** execution unless user uses **function calling** (API) or Google-hosted tools in Studio/Vertex; **Yes** on **Gemini API** + declared functions. |
| **Authorization**            | User login; **org policies**; API **secret keys**; MCP servers configured per user/org environment.                                                                                                                                               | **OAuth 2.1 + PKCE** for ChatGPT Apps (ChatGPT as client); Actions may use OAuth or API keys per schema; **API** uses **Bearer** developer keys.                                                                                                                                                                                                                                                      | End-user **Google account** / **Workspace** identity; **GCP service accounts / IAM** and API keys for Vertex; OAuth for user-delegated Google APIs when applicable.            |
| **Billing**                  | **Model usage:** user/org pays Anthropic. **Our revenue:** **BYO** (no Anthropic-run “pay for this Skill” checkout akin to app IAP for third parties documented here).                                                                            | **Model usage:** ChatGPT plan or **API** bill. **Our revenue:** OpenAI announced a **GPT builder revenue program** tied to **usage/engagement** (initially **US**-focused in early communications); treat **terms as time-sensitive** — confirm current rules in OpenAI builder docs. **ChatGPT Apps:** typically **BYO** billing for premium API usage unless a separate commercial program applies. | **Model usage:** consumer Gemini vs **GCP** billing for API. **Our revenue:** **BYO**; no Gemini third-party store economics parallel to GPT Store.                            |

**Primary sources (Step 3 — also listed in Source index):** Anthropic Help [Provision and manage Skills for your organization](https://support.claude.com/en/articles/13119606-managing-skills-as-an-admin). OpenAI [Introducing the GPT Store](https://openai.com/index/introducing-the-gpt-store) (2024-01-10 — **Builders can earn based on GPT usage**; confirm current program rules in OpenAI’s latest builder / monetization docs). Existing DR citations for packaging limits and GPT Actions.

---

# Harness taxonomy (Step 4)

**Classes** (a surface can span more than one):

| Class                                 | Meets minimum harness?                                           | Description                                                                                                                                       |
| ------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **H0 — Consumption chat**             | **No** (alone)                                                   | Instructions + attachments; **no** user-defined tools/code path for our engine.                                                                   |
| **H1 — Hosted tools**                 | **If** exposes code execution or fixed vendor tools we can chain | Vendor sandbox (e.g. hosted interpreter) — often **not** running **our** arbitrary deployed bundle unless we supply code via file or remote call. |
| **H2 — Connector / function surface** | **Yes** (path b)                                                 | Model invokes **HTTP tools** (OpenAPI, MCP remote, “Actions”) → our API runs logic.                                                               |
| **H3 — Local IDE / CLI**              | **Yes** (path a or local MCP)                                    | Repo/files on disk; MCP servers on **user machine**; scripts in skill folder.                                                                     |
| **H4 — API + BYO host**               | **Yes** (path b)                                                 | No consumer marketplace; **our** server is the harness; provider only supplies the model.                                                         |

**Tier A mapping (simplified):**

| Offering                        | Primary class(es)                | Notes                                                              |
| ------------------------------- | -------------------------------- | ------------------------------------------------------------------ |
| Claude.ai + Skills              | H2, H1, H3 (if MCP to localhost) | Code execution + MCP; skill ZIP.                                   |
| Claude Code                     | H3, H2                           | Strongest **Claude Code–class** harness in Tier A.                 |
| Claude API + `container.skills` | H4, H2                           | Our stack must host tool loop or rely on container features.       |
| ChatGPT Custom GPT              | H0 + **H2** if Actions           | Without Actions/App, **fails** minimum harness for **our** engine. |
| ChatGPT Apps                    | H2                               | OAuth to our backend; marketplace listing.                         |
| OpenAI API function-calling     | H4                               | Standard BYO tool loop.                                            |
| Gemini Gem (consumer)           | **Often H0**                     | Rely on **Gemini API** or hosted tools for path b.                 |
| Gemini API / Vertex             | H4                               | Same pattern as OpenAI API.                                        |

**Gaps to track:** OpenAI **first-party** “repo + skill folder” parity with Claude Code is **not** documented as a single product in this DR; **Codex / agent products** belong in Tier B mapping.

---

# Setup playbooks (Tier A)

_End-user and operator steps to get a **skill-equivalent** running with **minimum harness capability** (code/scripts and/or model-initiated HTTP). UI labels change over time; use the **deep links** and Anthropic/OpenAI/Google docs when wording drifts._

## A1 — Claude.ai (web): personal custom Skill (ZIP)

_Source: Anthropic Help [Use Skills in Claude](https://support.claude.com/en/articles/12512180-use-skills-in-claude), [How to create custom Skills](https://support.claude.com/en/articles/12512198-how-to-create-custom-skills) — retrieved 2026-03-24._

1. **Build the folder:** At minimum a `Skill.md` or `SKILL.md` with YAML frontmatter (`name`, `description`, …) plus any `scripts/`, `resources/`, etc. Folder name should match the skill name.
2. **Zip correctly:** Zip the **folder** so the archive root is one directory (not loose files at zip root). See Anthropic’s “Package your skill” diagram in the article above.
3. **Enable code execution:** Open **[Settings → Capabilities](https://claude.ai/settings/capabilities)** and turn on **Code execution and file creation** (required for Skills).
4. **Open Skills UI:** Go to **[Customize → Skills](https://claude.ai/customize/skills)** (this is the screen where all skills are listed and toggled).
5. **Upload:** Click **+**, choose **Upload a skill**, select your `.zip`. The skill appears in the list; **toggle it on**.
6. **Verify:** Start a new chat; use prompts that match the skill `description` so Claude loads it. If it never triggers, tighten the description (see Help troubleshooting).

_Note: Some surfaces may show **Manage** / list wording around the same page; the documented path is **Customize → Skills**, not a separate “Skills” top-level menu on every client._

## A2 — Claude.ai (web): organization-provisioned Skill (Team / Enterprise)

_Source: [Provision and manage Skills for your organization](https://support.claude.com/en/articles/13119606-managing-skills-as-an-admin) — retrieved 2026-03-24._

1. **Owner prerequisites:** In **[Organization settings → Capabilities](https://claude.ai/admin-settings/capabilities)**, enable **Code execution and file creation**. In **[Organization settings → Skills](https://claude.ai/admin-settings/skills)**, enable **Skills**.
2. **Provision:** Stay in **Organization settings → Skills**. Under **Organization skills**, click **+ Add**, select the `.zip` (must include **SKILL.md** per admin article).
3. **User side:** Members see the skill under **[Customize → Skills](https://claude.ai/customize/skills)** with a team/org indicator; they can toggle it off individually but **cannot** delete the org copy.

## A3 — Claude Code (local IDE / CLI harness)

_Source: Claude Code docs cited in [# Anthropic](#anthropic) (e.g. `~/.claude/skills/`)._

1. Place the **unzipped** skill directory under `**~/.claude/skills/<skill-name>/`\*\* (path per OS home).
2. Restart or refresh Claude Code if needed so the skill registers.
3. Ensure **MCP** or other connectors are configured in the same environment if the skill depends on them.

## A4 — Claude API (Skills in API / container)

_Source: Anthropic API docs (Skills API `POST /v1/skills`, `container.skills` on messages) — see PDF/source index in this DR._

1. **Upload or register** the skill via the **Skills API** (organization/workspace credentials) so it has an ID or name the API accepts.
2. **Enable code execution / container** per current API docs for your integration.
3. On each request (or session), pass `**container.skills`\*\* (or equivalent) so the skill is available to the model inside the container.
4. Implement your **tool/MCP loop** on the client if you combine Skills with external tools.

## A5 — ChatGPT: Custom GPT **with** GPT Actions (OpenAPI backend)

_Source: OpenAI Help / Developers — GPT Actions【37†L169-L177】._

1. In ChatGPT, open **Create** (or **My GPTs** → **Create a GPT**).
2. **Configure** name, description, instructions, and optional **Knowledge** files.
3. Open **Actions** → **Create new action** → paste your **OpenAPI** schema (URL or JSON) describing the calculator (or proxy) endpoints.
4. Set **Authentication** for those calls (**API key**, **OAuth**, etc.) per OpenAI’s Action schema requirements.
5. **Save** the GPT. **Important:** A GPT cannot use both **Actions** and user-connected **ChatGPT Apps** at once — pick Actions for our HTTP path【37†L169-L177】.
6. **Share:** Use link for private distribution or submit to the **GPT Store** if public (review + privacy policy when Actions touch user data)【40†L155-L163】.

## A6 — ChatGPT: third-party **App** (Apps SDK / directory)

_Source: OpenAI Developers — Define tools, submit app【47†L517-L525】【47†L577-L585】._

1. **Register** the app in the OpenAI developer / ChatGPT Apps flow; host an **OpenAPI** (MCP-style) tool manifest.
2. Implement **OAuth 2.1 + PKCE** so ChatGPT can obtain tokens to call your API **as the end user**.
3. Submit for **review** (privacy policy, org verification as required).
4. **End user:** In ChatGPT, connect/install the app per current UI; then prompts can invoke your tools.

## A7 — OpenAI API: function / tool calling (**BYO** harness)

_Source: OpenAI API docs (Chat Completions / Responses); Assistants sunset note in this DR【49†L629-L637】._

1. Create a **secret API key** in the OpenAI dashboard (project-scoped where available).
2. In your **server or app**, send user messages plus `**tools`** / function definitions matching our **OpenAPI\*\*-derived JSON schema.
3. On `**tool_calls`**, execute our engine (or proxy), append `**tool`/`function` result\*\* messages, and continue until the model finishes.
4. **Rate limits and billing** accrue to **your** developer account.

## A8 — Gemini consumer: **Gem** (instructions + files)

_Source: Gemini Help — Gems【56†L49-L58】._

1. In **Gemini** (web or app), open **Gems** → **Create** (wording may vary).
2. Set **instructions** and attach **Knowledge** / files as allowed.
3. **Limitation for our product:** A Gem alone does **not** give a first-class “call our API” path comparable to GPT Actions; for **minimum harness**, prefer **A9** or pair with a Google-hosted tool only if it can reach our backend.

## A9 — Gemini API / Google AI Studio / Vertex AI (function calling)

_Source: Google AI — function calling【62†L201-L228】; AI Studio【69†L195-L203】._

1. **GCP / AI Studio:** Create a project; enable **Gemini API**; create an **API key** or use **Vertex** with a **service account** and IAM.
2. In **AI Studio**, prototype **system instruction + tools** (function declarations) and export code; or call **generateContent** from your service with `**function_declarations`\*\*.
3. When the model returns a **functionCall**, run our calculator on your server with the supplied args and return a `**functionResponse`\*\* in the next turn (pattern per Google docs).
4. **Deploy:** Move from AI Studio to **Vertex** for production controls (VPC-SC, logging, quotas) as needed.

---

### Tier B — next research steps (Steps 3 extension / 9)

_Add **B1, B2, …** playbooks here using the same numbered format as Tier A once each flow is verified from vendor docs (no guessed UI paths). Suggested capture order:_

| Order | Provider / harness                                              | What to document first (sources)                                                                                                             |
| ----- | --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | **Microsoft Copilot Studio** (agent + connectors)               | Power Platform / MS Learn: create agent, add connector or generative action, **solution export** / env promotion, admin **tenant** controls. |
| 2     | **M365 Copilot** (extensibility)                                | Current **declarative agents** / **API plugins** / Graph docs (product names change — use official rename timeline).                         |
| 3     | **GitHub Copilot** (MCP, extensions)                            | GitHub + VS Code docs: MCP config in workspace, **optional** org policy for allowed servers.                                                 |
| 4     | **Amazon Bedrock Agents**                                       | Action groups (OpenAPI), IAM execution role, **Prepare → deploy** flow, Knowledge Base if used.                                              |
| 5     | **Amazon Q Business** (if distinct from Bedrock for your buyer) | IdP, data connectors, **application** deployment — separate from “raw” Bedrock Agents.                                                       |
| 6     | **Cursor / Windsurf / Continue**                                | `mcp.json` (or equivalent), **Rules** / AGENTS.md patterns, team vs local config.                                                            |
| 7     | **Mistral / xAI / Cohere APIs**                                 | Same as **[A7](#a7--openai-api-function--tool-calling-byo-harness)** with vendor-specific auth and rate headers.                             |

---

# Executive summary

Anthropic **Skills** are packaged as a folder containing a `SKILL.md` file with YAML frontmatter (name, description, etc.) plus any supporting scripts or data. Skills can embed executable code (via Claude Code) and use Claude’s code-execution and HTTP tools. Users install Skills by uploading a ZIP in the Claude web UI or placing them in a `~/.claude/skills` directory (for Claude Code)【90†L610-L613】. Org admins can provision skills across their workspace (launched Dec 2025【90†L614-L623】). Skills run in Claude.ai (or the Claude Code IDE) when enabled; via the Claude API they are activated by passing the container’s `skills` field【90†L629-L634】. Claude also supports the **Model Context Protocol (MCP)** for connecting external services – Skills and MCP are complementary: Skills teach _how_ to use tools, MCP gives Claude tool access【4†L151-L158】. In practice, MCP connectors (tool APIs via OpenAPI) let Claude fetch or compute data remotely, while Skills provide the step-by-step logic.

OpenAI’s platform offers **Custom GPTs** (formerly “GPTs”), which bundle user instructions and attached knowledge (up to ~20 files of ~512 MB each)【37†L110-L118】. GPTs can connect to external **GPT Actions** (OpenAPI tools) defined by the developer【37†L169-L177】. A GPT may _either_ use user-enabled ChatGPT **Apps** (the plugin/MCP framework) or its own Actions, but not both simultaneously【37†L169-L177】. Custom GPTs are private by default and can be shared via link; public GPTs must pass OpenAI review (Apps or Actions require privacy policy URLs)【40†L155-L163】. Separately, the **ChatGPT Apps** (plugin) platform lets third-party services integrate via an Apps SDK: developers publish an OpenAPI-based tool manifest, implement an OAuth2 (with PKCE) flow (ChatGPT as client), and submit to the ChatGPT App Directory【47†L517-L525】【47†L577-L585】. Users add apps through ChatGPT’s “Plugin” (Apps) interface. Programmatic use is via the Chat Completion API with function-calling: you define the calculator as a function schema, have the model invoke it, then run the calculation and return JSON results. The legacy “Assistants API” is being retired; OpenAI now emphasizes ChatCompletion+function calls or the upcoming Response API【49†L629-L637】. Note all vendors impose rate limits per model/plans (requests/minute, tokens/minute).

Google’s **Gemini** uses **Gems** (renamed “custom assistants”) which users create in Gemini Apps (web/mobile). A Gem is configured by writing system instructions and optionally uploading context files (Docs, images, code repos, etc.)【58†L265-L274】. Gemini supports up to ~10 attachments per prompt (e.g. documents up to 100 MB, videos to 2 GB)【59†L81-L90】. Admins can enable sharing of Gems (stored in Google Drive) within an organization【60†L125-L134】. For tool use, the Google Gemini API offers function calling: you declare JSON “functions” (e.g. a calculator) and Gemini will trigger them【62†L201-L210】【62†L219-L228】. The model calls your service, you return structured JSON. Rate limits are enforced per project (requests/minute and tokens/minute, scaling by usage tier)【65†L203-L212】. Google provides **AI Studio (Gemini Studio)** – a no-code/GUI environment to prototype chatbots (with function calling, grounding, etc.)【69†L195-L203】 – versus **Vertex AI** which is the underlying cloud API. For a single developer, AI Studio is easier for building and testing an agent; Vertex is more heavyweight (cloud deployment).

**Comparison highlights:** Anthropic Skills closely map to user-provided code (in a folder) and rely on Claude’s code runner or MCP to compute. OpenAI’s Custom GPTs **with Actions** and ChatGPT Apps use OpenAPI tools and OAuth flows; a GPT **without** tools is instructions-only. Google’s Gems are primarily prompt + attachments in consumer apps; **Gemini API** function calling is the parallel to OpenAI’s API. Parity gaps include OpenAI’s built-in Code Interpreter (not our deployable bundle) and Google’s Workspace depth for file context. For a broad MVP with a **searchable marketplace**, **OpenAI** (GPT + Action or App) stays the default; **Claude Skills / Claude Code** is the strong alternative for orgs and repo-local harnesses. Vendor-agnostic assets (TypeScript engine, OpenAPI schema, prompts, tests) stay in-repo regardless of vendor.

# Anthropic

### Skills (packaging and manifest)

Anthropic’s **Skills** are packaged as a folder containing at minimum a `SKILL.md` file (all-caps in developer docs, though help articles sometimes say “Skill.md”). The `SKILL.md` includes YAML frontmatter with a `name` (≤64 chars, lowercase letters/numbers/hyphens) and `description` (≤1024 chars)【10†L27-L35】. Additional frontmatter fields (e.g. `dependencies`, `user-invocable`, etc.) control behavior【10†L27-L35】【13†L358-L359】. The body of `SKILL.md` contains the instruction prompt. The skill folder may also contain other files: for example, `reference.md` or example files for context, and a subfolder (e.g. `scripts/`) with Python/JavaScript programs to execute. Claude Code can import packages (via `pip`/`npm`) if declared in `dependencies`, but at runtime only pre-installed packages are available. The skill authoring guide recommends keeping the main SKILL.md under ~500 lines for performance【10†L27-L35】. There is no hard published limit on total files or zip size, but skills are usually zipped (folder zipped to `my-skill.zip`) and uploaded【90†L610-L613】. Skills may call external resources via MCP or embed code to run locally. (Note: earlier “Custom Commands” are now folded into Skills【11†L39-L47】.)

### Distribution (installation)

**Operator steps:** See playbook **[A1](#a1--claudeai-web-personal-custom-skill-zip)** (personal ZIP), **[A2](#a2--claudeai-web-organization-provisioned-skill-team--enterprise)** (org provision), **[A3](#a3--claude-code-localide--cli-harness)** (Claude Code), **[A4](#a4--claude-api-skills-in-api--container)** (API).

In short: enable **Code execution and file creation** under **[Settings → Capabilities](https://claude.ai/settings/capabilities)**, then add the ZIP under **[Customize → Skills](https://claude.ai/customize/skills)** via **+ → Upload a skill**【90†L610-L613】. In Claude Code, place the skill folder under `~/.claude/skills/`【13†L350-L359】. Org **owners** provision org-wide ZIPs from **[Organization settings → Skills](https://claude.ai/admin-settings/skills)** (+ Add)【90†L614-L623】 per [admin Help](https://support.claude.com/en/articles/13119606-managing-skills-as-an-admin). The Skills API (`POST /v1/skills`) supports programmatic upload/versioning【90†L629-L634】.

### Invocation (Claude apps vs API vs Workbench)

Skills are invoked in any “Claude” interface where code execution is enabled. Claude.ai (the web/chat UI) and Claude Code (IDE environment) both support Skills once uploaded. An agent prompt can explicitly invoke a skill by name, or Claude can auto-suggest using a relevant skill. The Claude API can also use skills: the API’s chat request can specify `container.skills = ["skill_folder_name"]` to include them in the session【90†L629-L634】. In contrast, the “Claude Workbench” (developer playground) is only for prompt testing and **does not** execute code or load skills – it’s analogous to the classic API Playground, not a deployment channel. For running local scripts, only Claude Code or Workbench (when connected to a dev environment) can execute user files; the cloud Claude.ai app and API use Anthropic’s container (which can run Python/JS with pip). For remote HTTP access, a skill can either use Anthropic’s built-in HTTP tool (MCP) or use a script with e.g. `fetch`/`curl`. In practice, CP workflows requiring local code or interactive testing use Claude Code; end-user chat flows use the Claude.ai app or API.

### MCP (Model Context Protocol)

Anthropic fully supports the **Model Context Protocol (MCP)** alongside Skills. An MCP connector is simply an OpenAPI (MCP) tool that Claude can call. Anthropic documentation explicitly contrasts Skills vs MCP: _“MCP connects Claude to external services … Skills provide procedural knowledge. You can use both together: MCP gives Claude tool access, Skills teach Claude how to use those tools effectively.”_【4†L151-L158】. Thus, to integrate an external calculator service, one could write an MCP tool (JSON API) and let Claude call it. A skill could then instruct Claude how/when to call that tool. Skills can use MCP tools by referring to fully qualified tool names【26†L13-L20】. Use MCP if you need dynamic data or remote computation; use Skills for static workflows or to orchestrate tool usage. Both are “first-class” in Anthropic’s docs【4†L151-L158】.

# OpenAI

### Custom GPTs (ChatGPT)

OpenAI’s **Custom GPTs** (created via ChatGPT’s “Create GPT” interface) allow bundling instructions and knowledge. A GPT can include _knowledge files_ (up to ~20 files, max ~512 MB each, any text/PDF/audio/image) that the model can reference【37†L110-L118】. The GPT’s configuration also defines _Actions_ – OpenAPI-based tools the GPT may call【37†L169-L177】. Internally, OpenAI calls these “GPT Actions” (successors to “Plugins”). Important constraints: a GPT can either use its **Actions** (custom APIs) or can use user-connected **Apps** (the general ChatGPT plugin tools), but not both simultaneously【37†L169-L177】. Actions require that the developer host an API and provide its OpenAPI schema. Any GPT using user data from an app or action for public release must supply a privacy policy【40†L155-L163】.

Custom GPTs are private until shared. They can be shared via invite links or deployed publicly to the GPT Store after OpenAI review. (The GPT Store review checks compliance: e.g. any GPT with Actions must have a valid privacy policy URL【40†L155-L163】, and disallowed content/tools are flagged.) Once approved, GPTs can be published in the store or shared. GPTs run on the same GPT-4-family/ChatGPT models as chat; they are subject to the usual rate limits per model. Administrators can see usage per GPT under ChatGPT for Business. Models like GPT-4o are available in GPT creation, though some models (e.g. GPT-5.1) are limited to enterprise or retired for Custom GPTs as of 2026.

### ChatGPT Apps / Developer platform

OpenAI’s **ChatGPT Apps** (formerly “plugins”) let third parties integrate services into ChatGPT. Developers build an **MCP connector**: an OpenAPI specification declaring available _tools_ (endpoints, parameters) and host it on a web server. They also implement OAuth 2.1 (PKCE) so ChatGPT can obtain a user token. The OpenAI App Directory (developer dashboard) is used to register the app, upload its metadata (name, icon, privacy URL) and publish. Submission requires organizational verification, agreed policies, and a privacy policy link if the app accesses user data【47†L517-L525】【47†L577-L585】. Once approved, end users enable the app inside ChatGPT’s UI (“Settings > Plugins” or similar). ChatGPT will display the app’s tools in the chat composer.

Tools are defined via the OpenAPI/MCP manifest. When a user invokes a tool (by asking ChatGPT to use it), ChatGPT will make an HTTP request to the app’s endpoint (with parameters and OAuth token). Apps may also receive webhook callbacks (optional, e.g. for event-driven flows). OAuth linking must follow OpenAI’s guidelines (ChatGPT as client, redirect URI set, etc.)【45†L559-L568】. Overall, the ChatGPT Apps ecosystem is carefully controlled: submissions are manually reviewed, and apps must adhere to policy (including OAuth security and content safety)【47†L577-L585】. In summary, third-party integrations in ChatGPT are packaged as “apps” implemented via MCP with OAuth, and they are distributed via the ChatGPT interface after review.

### API (function-calling)

For API integrations, OpenAI recommends using the ChatCompletion (or Response) API with **function calling**. You define a JSON schema for your calculator function (parameters for inputs, etc.). When sending user messages, include that function definition; the model may choose to emit a function call (name + args) instead of a text response. Your application then executes the calculation (on your server or code) and returns the JSON result back to OpenAI in a `function_response`. OpenAI’s GPT models will then incorporate the returned result into the conversation【62†L201-L210】. (This mirrors OpenAI’s examples.)

The older “Assistants API” (beta) supported named tools and function calling but is being sunset (shut down Aug 2026)【49†L629-L637】. The current approach is Chat Completions with `functions` (the new “Responses” API will unify this). Rate limits apply as usual: e.g. GPT-4 has lower QPS/token limits than GPT-3.5. (See OpenAI docs or account dashboard for your plan’s tokens/min and calls/min limits.) In practice, for an interactive calculator, you’d host your calculation core as a REST service (described in an OpenAPI spec) and let the model call it as a function.

### Store / marketplace rules

If you plan to publish publicly, OpenAI has two channels. **GPT Store:** submitting a custom GPT requires compliance with content policies. GPTs using user data or calling external APIs must have a privacy policy link and may be reviewed for safety【40†L155-L163】. GPTs using OpenAI Apps (user plugins) cannot be published. **App Directory:** chat plugin apps follow a similar review – they need privacy policy, proper authentication, and clear documentation【47†L577-L585】. Both processes enforce OpenAI’s safety rules (no illegal/adult content, no undeclared data use). All accepted store/apps remain discoverable to ChatGPT users (subject to regional availability).

### Setup (operator)

**Custom GPT + Actions:** [A5](#a5--chatgpt-custom-gpt-with-gpt-actions-openapi-backend). **ChatGPT App:** [A6](#a6--chatgpt-third-party-app-apps-sdk--directory). **OpenAI API tool loop:** [A7](#a7--openai-api-function--tool-calling-byo-harness).

# Google

### Gems

Google’s Gemini uses **Gems** as its custom-skill unit. A Gem is essentially a Gemini conversation instance initialized with user-supplied _instructions_ (“system prompt”) plus any uploaded _knowledge_ files【54†L199-L207】【55†L34-L42】. Users create Gems in the Gemini Apps interface: they name the Gem and write guidance (persona, tasks, etc.) for Gemini to follow【56†L49-L58】【56†L66-L75】. Users can enhance a Gem by uploading files (Docs, PDFs, images, or even code repositories) for context. According to Google, you can attach up to ~10 files per prompt: documents/images ≤100 MB each, videos ≤2 GB (5 min), audio ≤10 min【59†L81-L90】. You can also import a GitHub repo (up to 5,000 files, 100 MB) or a ZIP. **Limitations:** if you add “non-Drive” data types (like email content or certain code folders), the Gem becomes unshareable【60†L125-L134】. Sharing itself is managed via Google Drive: Gems are saved there and can be shared with others in your org (admins can enable/disable sharing domain-wide【54†L199-L207】【60†L125-L134】).

### Gemini API & function calling

Google’s Gemini API (Vertex AI) offers function-calling similar to OpenAI’s. You declare a JSON “function” with name, parameters, etc. The Gemini model may then output a function call intent with arguments【62†L201-L210】【62†L219-L228】. Your backend executes the calculator with those args and returns the result JSON. Gemini 3 adds unique call IDs for matching responses. Beyond basic function-calling, Google also provides built-in tools (e.g. web search, code execution) in AI Studio【62†L201-L210】. Rate limits are enforced per Google project: measured in requests/minute (RPM) and input tokens/minute (TPM)【65†L203-L212】. Limits scale with your billing tier (free vs paid) and chosen model. For a JSON calculator backend, the pattern is to define it as a function and let Gemini invoke it; then parse the JSON in your app.

### Google AI Studio vs Vertex

Google AI Studio (aistudio.google.com) is a web-based environment for building Gemini-powered apps. It provides a no-code chat prompt interface where you can experiment with prompts, system instructions, and toggle settings (like function-calling, context grounding)【69†L195-L203】. When you’re ready, AI Studio can generate client code (Python/Node) that uses the Gemini API. In contrast, **Vertex AI** is the underlying cloud platform for deploying Gemini API calls in production. Vertex AI (Gemini API) requires setting up a Google Cloud project and calling via REST or SDK. For a solo developer shipping a basic agent, AI Studio is simpler (immediate UI, no cloud setup). Vertex AI is more flexible for scale/metrics but has higher overhead. We expect a developer might prototype the agent in AI Studio, then use the Gemini API (Vertex) for the deployed version.

### Extensions / Workspace integrations

Currently Google does not offer a third-party “plugin store” for Gemini. Instead, Gemini is integrated into Workspace apps (Docs, Gmail, etc.) via built-in features. There is no official API for custom 3rd-party tools in Gemini equivalent to ChatGPT plugins. Gemini Apps can pull in Workspace content (subject to permissions)【79†L225-L233】, but developers cannot publish custom extensions to Gemini beyond the function-calling API already described. In short, custom tool support relies on the Gemini API and function-calling, not on any separate Google marketplace.

### Setup (operator)

**Consumer Gem:** [A8](#a8--gemini-consumer-gem-instructions--files). **Gemini API / AI Studio / Vertex:** [A9](#a9--gemini-api--google-ai-studio--vertex-ai-function-calling).

# Comparison table (Step 5 — expanded)

| Criterion                        | Anthropic (Claude)                                                                                                                                                                                     | OpenAI (ChatGPT / API)                                                                                                          | Google (Gemini)                                                                                                                |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **Primary packaging unit**       | Skill (`SKILL.md` + assets)                                                                                                                                                                            | Custom GPT; ChatGPT App (manifest)                                                                                              | Gem (instructions + files); API tools in code                                                                                  |
| **Install / enable**             | **[A1](#a1--claudeai-web-personal-custom-skill-zip)**–**[A4](#a4--claude-api-skills-in-api--container)** (ZIP: **Customize → Skills**; org: [Admin → Skills](https://claude.ai/admin-settings/skills)) | **[A5](#a5--chatgpt-custom-gpt-with-gpt-actions-openapi-backend)**–**[A7](#a7--openai-api-function--tool-calling-byo-harness)** | **[A8](#a8--gemini-consumer-gem-instructions--files)**–**[A9](#a9--gemini-api--google-ai-studio--vertex-ai-function-calling)** |
| **Marketplace (searchable)**     | **No** public Skill Store (ZIP / org / API distribution)                                                                                                                                               | **Yes** — GPT Store; App Directory (after review)                                                                               | **No** third-party Gemini store                                                                                                |
| **Org rollout**                  | Org owners provision skills (Team/Enterprise); capabilities toggles                                                                                                                                    | Team/Enterprise GPT / connector governance                                                                                      | Workspace admin controls for Gem sharing; GCP for API                                                                          |
| **Harness class (typical)**      | H2 + H1 + **H3** (Claude Code)                                                                                                                                                                         | H2 (Actions/Apps); **H4** (API)                                                                                                 | Consumer Gem **H0**; API **H4**                                                                                                |
| **Execution / API (our engine)** | Code exec + MCP/scripts; API `container.skills`【90†L629-L634】【4†L151-L158】                                                                                                                         | GPT Actions / Apps; API function-calling【37†L169-L177】                                                                        | **API** function calling【62†L201-L228】; Gem needs tool path                                                                  |
| **Auth summary**                 | Account + org policy; API keys; MCP config                                                                                                                                                             | OAuth PKCE (Apps); API Bearer keys【47†L517-L585】                                                                              | Google / Workspace identity; GCP IAM + keys                                                                                    |
| **Billing (us vs platform)**     | **BYO** product revenue; user pays Anthropic                                                                                                                                                           | GPT Store **builder program** (engagement-based; verify current); else **BYO**                                                  | **BYO**; GCP/API usage billed to developer project                                                                             |
| **MCP / equivalent**             | **MCP**【4†L151-L158】                                                                                                                                                                                 | Apps / Actions (OpenAPI)【37†L169-L177】                                                                                        | Function calling【62†L201-L210】                                                                                               |
| **Local / sandbox execution**    | Yes (Claude Code + Claude.ai when enabled)【11†L39-L47】                                                                                                                                               | Code Interpreter = vendor-hosted; not our bundle                                                                                | Gem: code as context; run logic on **our** server via API                                                                      |
| **Best fit for JSON calculator** | Skill + MCP/API or Claude Code scripts                                                                                                                                                                 | Custom GPT **with** Action, ChatGPT App, or API                                                                                 | **Gemini API** (primary); Gem alone insufficient without tools                                                                 |
| **Portability / lock-in**        | Moderate — folder format + MCP; loader-specific【90†L618-L626】                                                                                                                                        | High — GPT/App OAuth + UI; OpenAPI portable                                                                                     | High — Gem UX; OpenAPI tools portable                                                                                          |

# MVP recommendation + what to implement in-repo

**MVP target (updated Step 6 — 2026-03-24, pending Tier B):** **OpenAI-first** for broad **consumer** distribution: **Custom GPT with at least one GPT Action**, a **ChatGPT App**, or **API + BYO host (H4)** satisfy the **minimum harness capability**. A Custom GPT **without** Actions/Apps is **H0** and does **not** meet our bar. **Anthropic** is the parallel track when the buyer already uses **Claude Code** or **org-provisioned Skills** (strong **H3** / org **H2**). **Google consumer Gems alone** are a weak fit for shipping **our** logic; **Gemini API / Vertex (H4)** matches the same integration pattern as OpenAI’s API. OpenAI’s **GPT Store builder payments** are **policy- and eligibility-dependent** ([announcement](https://openai.com/index/introducing-the-gpt-store)) — confirm current terms before relying on them for revenue.

**In-repo (vendor-agnostic):** The core TypeScript calculation engine, deterministic tests, and OpenAPI schema for the calculator should remain in our codebase. All prompts and templates we craft can be stored as plain Markdown or JSON files (not embedded in code). The OpenAPI spec for the calculator is inherently vendor-neutral. The test suite and input/output examples are agnostic. These can be used to generate the specific packaging (e.g. Skills/manifest for Claude, JSON schema for ChatGPT, etc.) when deploying to each platform. Essentially, _all computational logic stays in-repo_; only the “harness” (Skill folder, GPT config, function-call code) is platform-specific.

# Rename / deprecation risks

- **Claude Skills vs Skill.md casing:** Anthropic docs use `Skill.md` (support site) and `SKILL.md` (developer docs). Ensure consistent casing【10†L27-L35】【5†L58-L67】.
- **ChatGPT Plugins → Apps/Actions:** OpenAI has rebranded “Plugins” as “Apps” or “GPT Actions”【37†L169-L177】. Older docs may still say “plugin”.
- **OpenAI Assistants API:** The Assistants API is being shut down (Aug 2026)【49†L629-L637】. The new “Responses API” / function-calling in ChatCompletion is the stable path.
- **GPT names/models:** OpenAI may rename models (e.g. GPT-4o vs GPT-5.x) or restrict some for GPTs (internally updated lists)【77†L107-L110】【76†L37-L42】; watch release notes.
- **Anthropic “MCP” stability:** MCP is an open standard (agentskills.io) and is not expected to be renamed, but watch Anthropic docs for any new term.
- **Google “Gems” term:** Google currently calls them Gems; no public rename announced, but they were previously called “Premade Gems” in early docs. If Google rebrands (e.g. “Agents”), note the legacy term.

# Source index

1. Anthropic Skills GitHub (agent-skills/skills repo), _retrieved 2026-03-21_.
2. **What are Skills?** Anthropic Help, _retrieved 2026-03-21_【4†L151-L158】.
3. **Create custom Skills** (Anthropic Help), _retrieved 2026-03-21_【5†L58-L67】.
4. **Skill authoring best practices** (Claude API docs), _retrieved 2026-03-21_【10†L27-L35】.
5. **Extend Claude with skills** (Claude Code docs), _retrieved 2026-03-21_【11†L39-L47】.
6. Anthropic Developer PDF “Complete Guide to Building Skills for Claude,” Jan 2026, _retrieved 2026-03-21_【90†L610-L613】【90†L629-L634】.
7. **Use Skills in Claude** (Anthropic Help Center), _retrieved 2026-03-21_.
8. Anthropic blog “Claude apps work across all Claude.ai, Claude Code, API,” 27 Oct 2025, _retrieved 2026-03-21_【22†L92-L100】.
9. OpenAI Developers – **GPT Actions** page, _retrieved 2026-03-21_【37†L169-L177】【37†L110-L118】.
10. OpenAI Help “Creating and editing Custom GPTs,” _retrieved 2026-03-21_【37†L110-L118】【37†L169-L177】.
11. OpenAI Help “Sharing and publishing GPTs,” _retrieved 2026-03-21_【40†L155-L163】.
12. OpenAI Developers “Define tools – Apps SDK,” _retrieved 2026-03-21_【47†L517-L525】【47†L577-L585】.
13. OpenAI Developers “Submit and maintain your app,” _retrieved 2026-03-21_【47†L577-L585】.
14. Google Gemini Help “Tips for creating custom Gems,” _retrieved 2026-03-21_【56†L49-L58】【56†L66-L75】.
15. Google Gemini Help “Upload & analyze files in Gemini Apps,” _retrieved 2026-03-21_【59†L81-L90】.
16. Google Workspace Updates “Introducing Gems sharing…” (18 Sep 2025), _retrieved 2026-03-21_【60†L125-L134】【54†L199-L207】.
17. Google AI Dev “Function calling with the Gemini API,” _retrieved 2026-03-21_【62†L201-L210】【62†L219-L228】.
18. Google AI Dev “Gemini API Rate limits,” _retrieved 2026-03-21_【65†L203-L212】.
19. Google AI Dev “Google AI Studio quickstart,” _retrieved 2026-03-21_【69†L195-L203】.
20. Anthropic Privacy Center “How long do you store my data?,” _retrieved 2026-03-21_【73†L60-L68】.
21. OpenAI “Enterprise privacy at OpenAI” (Jan 2026), _retrieved 2026-03-21_【76†L37-L42】.
22. OpenAI blog “Data residency in Europe” (Feb 2025), _retrieved 2026-03-21_【77†L77-L84】【77†L107-L110】.
23. Google Workspace Admin “Generative AI Privacy Hub,” _retrieved 2026-03-21_【79†L225-L233】【79†L270-L278】.
24. Google Gemini Privacy Notice (Gemini Apps Privacy Hub), _retrieved 2026-03-21_【84†L1-L4】.
25. Anthropic Help **Provision and manage Skills for your organization**, [https://support.claude.com/en/articles/13119606-managing-skills-as-an-admin](https://support.claude.com/en/articles/13119606-managing-skills-as-an-admin) — _retrieved 2026-03-24_.
26. OpenAI **Introducing the GPT Store** (GPT builder usage-based payments announced), [https://openai.com/index/introducing-the-gpt-store](https://openai.com/index/introducing-the-gpt-store) — _published 2024-01-10, retrieved 2026-03-24_.
27. Anthropic Help **Use Skills in Claude** (Customize → Skills, upload flow), [https://support.claude.com/en/articles/12512180-use-skills-in-claude](https://support.claude.com/en/articles/12512180-use-skills-in-claude) — _retrieved 2026-03-24_.
28. Anthropic Help **How to create custom Skills** (folder, ZIP structure), [https://support.claude.com/en/articles/12512198-how-to-create-custom-skills](https://support.claude.com/en/articles/12512198-how-to-create-custom-skills) — _retrieved 2026-03-24_.
