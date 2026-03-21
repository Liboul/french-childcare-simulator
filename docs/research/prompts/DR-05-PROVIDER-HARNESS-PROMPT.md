# DR-05 — Deep research prompt (harnais éditeurs — Claude Skills, OpenAI, Google Gemini)

**Use this prompt as a single message** in OpenAI Deep Research, Gemini Deep Research, Anthropic, or equivalent. **This is product/platform research**, not French tax law. **Do not rely on Cursor alone** for up-to-date vendor docs (see [`SPRINT_PLAN.md`](../../SPRINT_PLAN.md)).

---

## System / role

You are a **technical product researcher** specializing in **AI assistant platforms** and **agent extensibility** (instructions, tools, MCP, packaging). Your job is a **decision-ready comparison** for shipping a **domain skill** built on top of a **portable calculation core** (TypeScript engine, JSON API, tests in a Git repo). Prioritize **primary vendor documentation** (documentation sites, developer blogs **on the vendor domain**, official GitHub orgs). For **each** claim, give **URL + retrieval date**. If documentation **renamed** a feature (e.g. “Skills” → new name), **flag rename risk** explicitly.

---

## Product context (fixed)

- **Core**: open-source style **library** exposing **JSON in / JSON out** (or CLI), **deterministic tests**, **traceability** of calculations.
- **Harness**: whatever the **vendor** provides so an **end user** can **invoke** that core through an **agent** (chat UI, API, or both).
- **Goal**: understand **how to package**, **distribute**, and **maintain** a “skill-like” experience on **Anthropic**, **OpenAI**, and **Google** ecosystems as of your **research date**.

---

## Research questions (must answer for each vendor)

### A. Anthropic (Claude)

1. **Skills** (or current equivalent): **file layout**, **manifest**, **SKILL.md** or successor, **limits** (size, number of files), **tool** / **code execution** attachment.
2. **Distribution**: how does a user **install** or **enable** a skill (Developer Mode, subscription, API-only)?
3. **Invocation**: Claude **apps** vs **API** vs **Workbench** — differences relevant to **calling local scripts** or **remote HTTP**.
4. **MCP** (Model Context Protocol): does Anthropic document **first-class** MCP usage alongside Skills? **When to prefer which?**

### B. OpenAI

1. **Custom GPTs** (ChatGPT): **knowledge files**, **actions** (OpenAPI), **constraints**, **review** / **publication** process.
2. **ChatGPT Apps** / **developer platform** (or current name): how **third-party** integrations are shipped to **end users**; **OAuth**, **webhooks**, **tool** definitions.
3. **API** (Assistants API, Responses API, or **current** recommended path): how a **tool** would call an external **calculator** service; **rate limits** relevant to **interactive** use.
4. **Store / marketplace** rules if **public** distribution is a goal (high-level).

### C. Google (Gemini)

1. **Gems** (or successor): **instructions**, **knowledge**, **limitations**, **sharing**.
2. **Gemini API** + **function calling** / **tools**: patterns for **structured** calculator backends.
3. **Google AI Studio** vs **Vertex** — which matches a **solo dev** shipping a **configurable** agent.
4. **Extensions** or **Workspace** integrations — only if **officially** documented for **custom** tools.

---

## Cross-vendor comparison (mandatory table)

Produce a table:

| Criterion                                  | Anthropic | OpenAI | Google |
| ------------------------------------------ | --------- | ------ | ------ |
| Primary packaging unit (name)              |           |        |        |
| How user installs / enables                |           |        |        |
| Native **HTTP tool** / **remote** function |           |        |        |
| Local code / sandbox execution             |           |        |        |
| MCP or equivalent                          |           |        |        |
| Best fit for **JSON calculator** backend   |           |        |        |
| **Vendor lock** / portability risk         |           |        |        |

---

## Parity gaps & recommendations

1. **Parity gaps**: features **available on one vendor** but **not** others (e.g. code interpreter, file upload size, persistent memory).
2. **Recommendation**: **one primary target for MVP** (pick **one** with justification: distribution, ergonomics, API stability).
3. **What stays in-repo**: **vendor-agnostic** artifacts (engine, tests, **OpenAPI** spec for calculator, **prompt templates** as plain files).

---

## Security & compliance (lightweight)

- **PII**: calculators may ingest **income**; note **vendor** data retention / **EU** hosting if documented.
- **No legal advice**: this section is **product** only.

---

## Output format (strict)

Use these **exact H2 headings**:

1. **Executive summary** (8–12 lines)
2. **Anthropic** (Skills/MCP/API — with subsections)
3. **OpenAI** (ChatGPT + API — with subsections)
4. **Google** (Gems + API — with subsections)
5. **Comparison table** (copy-paste friendly)
6. **MVP recommendation** + **what to implement in-repo**
7. **Rename / deprecation risks** (bullet list with URLs)
8. **Source index** (numbered URLs)

---

## Quality bar

- **No stale blog posts** as sole source for **current** UI names — **cross-check** vendor docs.
- If **uncertain**, write **“unverified”** and **what to test manually**.

---

## Context for the project

Story **GARDE-015** / **GARDE-016** will implement the harness per your **ADR-style** recommendation; this document should be **actionable for a TypeScript monorepo** with **Bun** and **Vitest**.

---

_End of prompt._
