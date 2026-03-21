# Sprint plan — Comparatif modes de garde (France, 2026)

## Document purpose

This document defines **sprint goals**, **story backlog**, **working agreements**, **deep-research delegation**, and **guard rails** for a “vibe coded” implementation of the product described in [`INITIAL_SPEC.md`](./INITIAL_SPEC.md).

---

## Sprint metadata (fill per sprint)

| Field              | Value                                                                                                                                                                              |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Product goal**   | Reliable, transparent comparison of _real_ childcare costs in France (2026), including social contributions, CAF/CMG, tax credits, employer schemes, and household fiscal effects. |
| **Sprint length**  | _e.g. 2 weeks_                                                                                                                                                                     |
| **Sprint dates**   | _YYYY-MM-DD → YYYY-MM-DD_                                                                                                                                                          |
| **Capacity**       | _story points or dev-days_                                                                                                                                                         |
| **Release target** | _e.g. “MVP engine + JSON/HTML + traceability”_                                                                                                                                     |

---

## Conventions (tech sprint plan)

- **Epics** group related outcomes; **stories** are independently demonstrable slices of value.
- **Identifiers** use the prefix **`GARDE-###`** (project code + sequential number). Reference them in commits: `GARDE-042: short description`.
- **Story points** (optional): use a consistent scale (e.g. Fibonacci); mark **Spike** when discovery dominates delivery.
- **Dependencies**: listed explicitly; blocked stories are called out.
- **Definition of Done** (see below) applies to every story unless the story is explicitly a Spike with a different exit criterion.
- **Sprint plan** (`SPRINT_PLAN.md`) is the living record of **progress and outcomes**; it must be updated when a story closes (see [Story completion log](#story-completion-log)).

---

## Tech stack

| Choice                        | Decision                                                                                                                                           |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Language**                  | **TypeScript** is the main (and default) language for application code, tests, and tooling scripts unless a story explicitly needs something else. |
| **Runtime & package manager** | **[Bun](https://bun.sh)** for installs, scripts, and running the project (`bun run`, lockfile, etc.).                                              |
| **Tests**                     | **[Vitest](https://vitest.dev)** for unit and integration tests.                                                                                   |
| **Linting**                   | **ESLint** with a TypeScript-aware config (and shared rules for consistency).                                                                      |
| **Formatting**                | **Prettier** (or equivalent) so style is automatic and diffs stay small.                                                                           |
| **Types**                     | **Strict TypeScript** (`strict` / `noImplicitAny` as appropriate); typecheck in CI.                                                                |

**GARDE-001** should establish the repo with the above: `package.json` / `bunfig` as needed, ESLint + Prettier wired for editor and CI, Vitest configured, and scripts such as `test`, `lint`, `format` / `typecheck`. Add other **nice-to-have** tooling in the same story when low-cost (e.g. editorconfig, CI workflow running lint + tests on push).

---

## Definition of Done (global)

A story is **done** when **all** of the following are true:

1. **Story spec** exists under `docs/stories/GARDE-###.md` (see [Story spec template](#story-spec-template-per-story)).
2. **Implementation** matches the spec and [`INITIAL_SPEC.md`](./INITIAL_SPEC.md) constraints (traceability, official sources, no illegal cumul).
3. **Automated tests** exist for new behaviour (unit and/or property/integration as appropriate); existing tests stay green.
4. **Commit** after the story: at least one commit on the branch whose message references `GARDE-###`.
5. **Uncertainty**: any rule not fully verified is flagged per product rules (isolated, parametrizable variant or explicit “unknown” branch).
6. **Sprint plan updated**: [`SPRINT_PLAN.md`](./SPRINT_PLAN.md) reflects this story’s **progress** and **outcome** in the [Story completion log](#story-completion-log) (same commit as the story close, or the immediately following commit).

---

## Story completion log

This section is the **sprint-level audit trail**: what shipped, whether execution matched the plan, and what changed along the way.

**When to update:** before marking a story **done** (part of Definition of Done).

**What to record (brief but explicit):**

| Field                        | Guidance                                                                                                                  |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| **Outcome**                  | e.g. completed as specified; **scope adjusted** (what was added/removed and why); **blocked** or **deferred** with reason |
| **Changes during the story** | Surprises, better approach chosen, spec drift corrected, follow-up stories or tech debt created                           |
| **Links**                    | Optional: PR/commit hash, ADR, or `docs/stories/GARDE-###.md`                                                             |

**Where:** append a row to the table below. If the backlog order or story list changes, update the [Backlog](#backlog-stories) section in the same edit so the plan stays coherent.

| Story ID      | Completed (date) | Outcome & notes                                                                                                                                                                                                      |
| ------------- | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **GARDE-001** | 2026-03-21       | Done. Bun + strict TS + Vitest + ESLint + Prettier + EditorConfig + `config/` + GitHub Actions CI (`bun run ci`). Minimal `src/` placeholder; README. Prettier also applied to existing `docs/*.md` on first format. |

---

## Working agreement: story spec before coding

**At the start of each story** (before or as first subtask), the implementer **writes or updates** `docs/stories/GARDE-###.md` using the template below. This is non-negotiable for guard rails on fast, agent-assisted development.

### Story spec template (per story)

Each `docs/stories/GARDE-###.md` should contain:

| Section                  | Content                                                                                                                 |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| **Story ID & title**     | `GARDE-###` + one line                                                                                                  |
| **Links**                | Epic, related stories, upstream spec refs                                                                               |
| **User / product value** | What problem this slice solves                                                                                          |
| **Scope**                | In scope / out of scope (explicit)                                                                                      |
| **Acceptance criteria**  | Numbered, testable bullets                                                                                              |
| **Technical notes**      | Modules touched, data shapes, edge cases                                                                                |
| **Deep research**        | Yes/No; if Yes, **ask project owner** to run the **DR-** prompt in an external tool; then link to `docs/research/` pack |
| **Test plan**            | Cases, fixtures, negative paths                                                                                         |
| **Risks & mitigations**  | Especially legal/fiscal correctness                                                                                     |
| **Done checklist**       | Mirrors Definition of Done for this story                                                                               |
| **Sprint plan**          | After close: row added to [Story completion log](#story-completion-log) in `SPRINT_PLAN.md`                             |

File naming: `docs/stories/GARDE-001-project-bootstrap.md` or `GARDE-001.md` — **pick one convention for the repo and keep it**.

---

## Guard rails (“vibe coding”)

Fast iteration with AI assistance needs explicit limits:

1. **No silent fiscal rules**: every coefficient, ceiling, and exclusion is either (a) in config with a source URL/id, or (b) marked `TODO-VERIFY` with no default pretending to be law.
2. **Single source of truth for numbers**: barèmes/plafonds live in versioned config; code reads config, does not hardcode except tests/fixtures.
3. **Traceability first**: any calculation path must be able to emit **steps** (formula, rule id, source ref) before UI polish.
4. **Tests before merge**: minimum — unit tests for money math and cumul; integration test for at least one full scenario per major block (A–G).
5. **Small commits**: one story per logical PR/commit series; message includes `GARDE-###`.
6. **Review checklist**: story spec reviewed against `INITIAL_SPEC.md` § Transparency and § Contraintes fortes.
7. **No scope creep**: refactors only when required by the current story.
8. **Sprint plan hygiene**: closing a story updates the [Story completion log](#story-completion-log); backlog edits stay in sync when scope shifts.
9. **Deep research handoff**: if deep research is required, **ask the project owner** to run it in an external tool; do not block on the agent faking completeness (see [Deep research](#deep-research-when-and-how)).

---

## Deep research: when and how

**Deep research** = systematic verification against **official** texts and portals (Service-Public, CAF, impots.gouv, URSSAF, applicable collectivités), including **non-cumul**, **planchers/plafonds 2026**, and **employer-specific schemes**.

**Mandatory handoff:** Whenever deep research is **necessary** (per the table below, a `[DEEP RESEARCH]` story, or inability to cite primary official sources), the implementer **must ask you (the project owner)** to run that research in **another tool**—for example OpenAI Deep Research, Gemini Deep Research, Anthropic deep research, or an equivalent. The coding agent or Cursor session **must not** substitute ad-hoc browsing for that step. Provide the matching **DR-** prompt from this document; you paste the result into `docs/research/` (or attach the file), and the story references it.

| Signal                                               | Action                                                                                              |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Rule changes yearly or is disputed                   | Deep research → **ask owner** to run in external tool                                               |
| CMG barèmes, credit d’impôt garde, CESU/PAJE overlap | Deep research → **ask owner** to run in external tool                                               |
| Municipal tariffs (e.g. crèche publique)             | Deep research per **commune** or document as parameter; **ask owner** if primary sources are needed |
| Cursor/agent cannot cite a primary URL + excerpt     | **Ask owner** to run delegated deep research in an external tool (use **DR-** prompts)              |

### Delegation targets (examples)

You choose the tool: **OpenAI Deep Research**, **Gemini Deep Research**, **Anthropic (Opus) deep research**, or manual expert review. The **deliverable** for each delegated topic is a **short research pack**: bullet rules, effective dates, URLs, and **explicit “unknowns”**, stored under `docs/research/` after you run the prompt.

### Delegated research prompts (copy-paste)

Use one prompt per major topic; attach outputs to `docs/research/` and reference from the relevant story spec.

#### DR-01 — CMG & prestations CAF (modes de garde)

You are a French social benefits researcher. For **2026** (or latest published official figures if 2026 is not yet published, with clear date), document for **each** mode: garde à domicile, assistante maternelle, MAM, crèche (collective/agréée as applicable):

- Eligibility conditions, income tests if any, amounts or barèmes, frequency, **non-cumul** with other benefits.
- Official sources only: CAF.fr, Service-Public.fr, Légifrance if needed.

Output: structured bullets + **verbatim URLs** + a table of **non-cumul** rules. Flag anything not explicitly confirmed for 2026.

#### DR-05 — Provider harnesses: Claude Skills vs OpenAI vs Gemini (how to ship)

The codebase will expose a **portable calculation core** (JSON in/out, trace, tests). **Distribution** to end users depends on each vendor’s **agent harness** (instructions, tools, file layout, limits). This is **not** interchangeable with fiscal research — it is **product/platform research**.

Research and compare **current official documentation** (as of your run date) for:

1. **Anthropic Claude**: “Skills” (or successor) — packaging format, `SKILL.md` / project layout, how tools/scripts attach, size limits, invocation in Claude apps vs API.
2. **OpenAI**: Custom GPTs, ChatGPT **Apps** / developer surfaces relevant to shipping a domain skill — what is allowed, how tools and knowledge files work, review constraints.
3. **Google Gemini**: Gems, extensions, or API-side patterns for comparable “instruction + tools” packaging.

For **each** platform, deliver:

- **What the user actually installs** (file zip, store listing, API-only, etc.)
- **How the harness calls our logic** (e.g. hosted HTTP tool vs local script vs prompt-only).
- **Parity gaps** (e.g. one provider has no code execution; another allows MCP).
- **Recommendation**: one **primary** target for MVP + what stays **provider-agnostic** in-repo.

Output: decision-ready summary + URLs to primary docs. Flag anything that changed name recently (rename risk).

---

## Delivery model: engine vs provider harness

The product has **two layers**; only the second is provider-specific:

| Layer       | Role                                                                                                      | Where it lives                            |
| ----------- | --------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| **Core**    | Parametric engine, config, tests, JSON/HTML/CSV outputs, traceability                                     | **Provider-agnostic** repo (this project) |
| **Harness** | Instructions, tool wiring, optional wrappers so an agent _uses_ the core inside Claude / ChatGPT / Gemini | **Per-vendor** artifacts + docs           |

**Implication:** “Shipping the skill” means shipping **(core + harness)**. Anthropic, OpenAI, and Google each supply the **runtime** that loads instructions and may call tools; this sprint plan treats **research on those mechanisms** as mandatory (**DR-05**, story **GARDE-015**) before locking **GARDE-016** implementation choices.

#### DR-02 — Crédit d’impôt pour frais de garde (et garde à domicile)

For French **impôt sur le revenu**, document **crédit d’impôt** rules for childcare and home employment where relevant: **base**, **rate**, **caps**, interaction with **CESU** / **PAJE** / **CMG**, and ordering of deductions. Cite impots.gouv.fr and Service-Public.fr. Note 2026 finance law if applicable.

#### DR-03 — CESU, titres-services, chèques emploi associatif, dispositifs employeur (berceau inter-entreprises)

Explain **tax and social treatment** for employee and employer, **limits**, and how they affect **net cost** and **taxable income**. URSSAF + official employer/employee guidance. List **uncertainties** for inter-company nurseries (tarification, fiscalité).

#### DR-04 — Modèle de coût par mode (nounou partagée, MAM, crèche privée/publique)

For each mode in the spec, list **typical cost components** (hourly, monthly, registration, meals) and **which parameters** must be user-provided vs configurable defaults. Distinguish **national rules** vs **local tariffs** (e.g. ville de Paris). Cite official or municipal sources where the spec requires municipal pricing.

---

## Epic map

| Epic                  | Goal                                                                                      |
| --------------------- | ----------------------------------------------------------------------------------------- |
| **E0 — Foundation**   | Repo (**TypeScript**, **Bun**, **Vitest**, lint/format, CI), config strategy, trace model |
| **E1 — Rules & data** | Official rules encoded as data + research packs                                           |
| **E2 — Engine**       | Blocks A–G, cumul, employer cost constant                                                 |
| **E3 — Outputs**      | CSV, HTML, JSON (+ optional PDF)                                                          |
| **E4 — Packaging**    | Provider harness research (DR-05), skill/GPT/Gem artifacts, docs, demo scenarios          |

---

## Backlog (stories)

> **Deep research**: stories that **require** a research pack before locking numbers are tagged **`[DEEP RESEARCH]`**. The owner runs the **DR-** prompts in an external tool ([handoff rule](#deep-research-when-and-how)); complete DR-01–DR-04 (or equivalent) **before** or **in parallel** with dependent implementation stories. **Platform packaging** uses **DR-05** (engine vs harness — see [Delivery model](#delivery-model-engine-vs-provider-harness)).

| ID            | Title                                                                                                                                 | Epic  | Notes                                                                                       |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ----- | ------------------------------------------------------------------------------------------- |
| **GARDE-001** | Project bootstrap: **TypeScript**, **Bun**, **Vitest**, **ESLint** + **Prettier**, typecheck, scripts, CI; repo layout, config folder | E0    | See [Tech stack](#tech-stack); no fiscal numbers yet                                        |
| **GARDE-002** | Traceability model: `CalculationStep`, sources, formulas (empty engine)                                                               | E0    | Foundational types                                                                          |
| **GARDE-003** | Config schema for barèmes/plafonds + validation                                                                                       | E0    | Pairs with GARDE-002                                                                        |
| **GARDE-004** | `[DEEP RESEARCH]` Research packs DR-01–DR-04 consolidated in `docs/research/`                                                         | E1    | **Delegate** if agent cannot primary-source                                                 |
| **GARDE-005** | Import official parameters into config (versioned, dated)                                                                             | E1    | Depends on GARDE-003, GARDE-004                                                             |
| **GARDE-006** | Block A–B: household + mode inputs; **brut** cost per mode                                                                            | E2    | Municipal tariffs = params                                                                  |
| **GARDE-007** | Block D: CAF/CMG application + cumul rules                                                                                            | E2    | **`[DEEP RESEARCH]`** edge cases → DR-01                                                    |
| **GARDE-008** | Block C: employer benefits (CESU, berceau, etc.)                                                                                      | E2    | **`[DEEP RESEARCH]`** → DR-03                                                               |
| **GARDE-009** | Block E–F: crédits d’impôt + fiscal effects on household                                                                              | E2    | **`[DEEP RESEARCH]`** → DR-02                                                               |
| **GARDE-010** | Block G: final aggregation; reste à charge; revenu disponible; **employer cost constant** across scenarios                            | E2    | Integration-heavy                                                                           |
| **GARDE-011** | Uncertainty handling: flags, parametrizable variants, no silent defaults                                                              | E2    | Per INITIAL_SPEC § Gestion de l’incertitude                                                 |
| **GARDE-012** | Exporters: JSON + HTML + CSV (hypothèses, calculs, sources)                                                                           | E3    |                                                                                             |
| **GARDE-013** | Optional PDF export                                                                                                                   | E3    | Spike if library choice blocks                                                              |
| **GARDE-014** | Test matrix: plafonds, CMG, cumul, CESU consumed, negative RAC guard, ineligible mode                                                 | E0/E2 | Can split per block; must complete before “1.0”                                             |
| **GARDE-015** | `[SPIKE]` **`[DEEP RESEARCH]`** Provider harness & distribution: DR-05 + ADR (`docs/architecture/` or `docs/research/`)               | E4    | **Clarifies Claude Skills vs OpenAI vs Gemini**; defines what “ship” means before GARDE-016 |
| **GARDE-016** | Implement harness(es) per ADR: instructions, tool wiring, example prompts; **core stays portable**                                    | E4    | Depends on **GARDE-015**, stable JSON API (GARDE-012)                                       |
| **GARDE-017** | Demo scenarios + “official sources” table in repo                                                                                     | E4    | For acceptance demos; can follow GARDE-016                                                  |

### Suggested sequencing (first sprint)

1. GARDE-001 → GARDE-002 → GARDE-003
2. **Parallel**: GARDE-004 (research) with GARDE-001–003
3. GARDE-005 → GARDE-006 → GARDE-007 → GARDE-008 → GARDE-009 → GARDE-010 → GARDE-011
4. GARDE-012 (+ GARDE-013 if time)
5. GARDE-014 (ongoing; harden before release)
6. **GARDE-015** (DR-05 spike + ADR) → **GARDE-016** → GARDE-017

**Critical path**: GARDE-004 / research packs → GARDE-005 → engine stories. **E4 critical path**: GARDE-015 → GARDE-016 (harness implements what the spike decides).

---

## Risk register (summary)

| Risk                                   | Mitigation                                                      |
| -------------------------------------- | --------------------------------------------------------------- |
| 2026 parameters not all published      | Use latest official + dated config; explicit “as of” in outputs |
| Local tariffs unknown                  | Parameters + doc; optional DR per territory                     |
| Over-confident AI fills gaps           | Guard rails + `[DEEP RESEARCH]` + `TODO-VERIFY`                 |
| Cumul errors                           | Dedicated tests + trace dump for auditors                       |
| Provider “skill” APIs differ or rename | **GARDE-015** + DR-05; versioned ADR; core API stable           |

---

## References

- Product spec: [`INITIAL_SPEC.md`](./INITIAL_SPEC.md)
- Tech stack: [§ Tech stack](#tech-stack)
- Story specs: `docs/stories/GARDE-###.md` (created per story)
- Research outputs: `docs/research/` (recommended)
