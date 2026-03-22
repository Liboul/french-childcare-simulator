# Comparatif modes de garde (France)

A **transparent simulator** for the **real cost** of childcare in France: not just the sticker price, but the full path from **gross spend** through **social contributions**, **CAF / CMG**, **tax credits**, **employer schemes** (CESU, nursery benefits, etc.), and—where modeled—**household disposable income** after tax.

---

## Why this exists

Figuring out “what we actually pay” for garde d’enfants in France is painful. Rules layer on rules: eligibility, caps, non-cumul, different treatment by mode (nounou à domicile, assistante maternelle, crèche, partage, employeur…). Spreadsheets and blog posts diverge; official sources are scattered.

This repo exists to **encode** that complexity in one place: **versioned parameters**, a **single calculation path**, and outputs you can **trace** (`snapshot`, `trace`, `warnings`, `limitationHints`) instead of trusting hand-waved numbers. The goal is **auditability**: every euro in the result should map back to engine output and the active **rule pack**, not to model improvisation.

Product intent and transparency requirements are spelled out in [`docs/INITIAL_SPEC.md`](docs/INITIAL_SPEC.md).

---

## What’s in the box

| Piece | Role |
| ----- | ---- |
| **`src/`** | TypeScript **calculation engine**: scenarios in, structured result out. |
| **`config/`** | **Rule packs** (barèmes, plafonds, versioned JSON) validated against `src/config/schema.ts`; see `config/rules.example.json`. |
| **`harness/`** | **Agent-facing layer**: JSON schema, intake playbook, skill instructions, optional **dev HTTP API** + **OpenAPI** for GPT Actions. See [`harness/README.md`](harness/README.md). |
| **`docs/demo-scenarios/`** | Example **`ScenarioInput`** JSON files for tests and demos. |
| **`scripts/`** (packaged in skill) | **`simulate.mjs`**: bundled Node runner so assistants can execute the same logic **without** a Bun checkout (see packaging below). |

**Architecture** (portable engine + pluggable harness) is recorded in [`docs/architecture/README.md`](docs/architecture/README.md) and [ADR-0001](docs/architecture/ADR-0001-pluggable-provider-harness.md).

---

## Deep research (DR)

We maintain **research reports** (`DR-*.md`) under [`docs/research/`](docs/research/): deep dives from official sources on CMG, crédit d’impôt, CESU / employeur, costs by mode, complémentaire employment costs, IR / TMI / disposable income, PSU / crèche participation, harness delivery, etc. They explain **context**, **limits**, and **why** the model behaves a certain way.

**Important:** for any live scenario, **authoritative amounts** are **`simulate.mjs` output** (`snapshot`, `trace`, `warnings`, `meta.rulePackVersion`)—not a paraphrase of a DR. If a DR and the engine disagree, **the engine + pack win** for the product; the DR flags understanding gaps or follow-up work. See [`harness/research/README.md`](harness/research/README.md) (also shipped inside the skill ZIP).

Official links are also consolidated in [`docs/SOURCES_OFFICIELLES.md`](docs/SOURCES_OFFICIELLES.md).

---

## Claude skill (ZIP) and claude.ai

The repo ships a ready-to-upload **Agent Skill** archive (instructions + schema + examples + embedded `simulate.mjs` + research bundle):

**[`dist/comparatif-modes-garde-fr-2026-skill.zip`](dist/comparatif-modes-garde-fr-2026-skill.zip)**

Anyone can download it from GitHub (open the file → **Download** or **Raw**) without cloning. On [claude.ai](https://claude.ai), add it under **Skills**, enable **code execution** if required, then follow the bundled `SKILL.md` (orchestration + mandatory `node scripts/simulate.mjs` runs).

Regenerate after changing harness sources or the engine:

```bash
bun run package:harness-skill
```

Full delivery matrix (Cursor, OpenAPI / Custom GPT, etc.): [`docs/shipping/README.md`](docs/shipping/README.md).

---

## Development

Requires [Bun](https://bun.sh).

```bash
bun install
bun run ci
```

Useful scripts: `typecheck`, `test`, `lint`, `format`, `format:write`, `demo:scenario`, `harness:serve`, `package:harness-skill`, `setup:cursor-harness-skill` (local Cursor skill symlink; see shipping doc).

See [`CONTRIBUTING.md`](CONTRIBUTING.md) and [`CHANGELOG.md`](CHANGELOG.md).
