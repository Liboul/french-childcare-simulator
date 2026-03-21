# GARDE-004 — Research packs DR-01–DR-04 (blocked on owner)

| Field      | Value                                                                                                                                   |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| **Epic**   | E1 — Rules & data                                                                                                                       |
| **Status** | **BLOCKED** — requires **you** to run deep research in an external tool ([handoff rule](../SPRINT_PLAN.md#deep-research-when-and-how)). |

## What you need to do

1. Run each **full prompt** below in **OpenAI Deep Research**, **Gemini Deep Research**, **Anthropic**, or equivalent—not in Cursor alone.
   - [DR-01 — CMG / CAF](../research/prompts/DR-01-CMG-CAF.md)
   - [DR-02 — Crédit d’impôt](../research/prompts/DR-02-CREDIT-IMPOT.md)
   - [DR-03 — CESU & employeur](../research/prompts/DR-03-CESU-EMPLOYEUR.md)
   - [DR-04 — Coût par mode](../research/prompts/DR-04-COUT-MODES.md)
2. Save outputs under `docs/research/` (e.g. `DR-01-results.md`, …).
3. Tell the implementer when files are in place so **GARDE-005** can import official parameters into `config/` without inventing law.

**Note:** [DR-05 — Provider harness](../research/prompts/DR-05-PROVIDER-HARNESS.md) supports **GARDE-015** (packaging); run it when you start the **E4** spike, not necessarily with DR-01–04.

## Acceptance criteria (from sprint plan)

Consolidated research packs with official URLs, non-cumul tables where relevant, and explicit unknowns for 2026.

## Done checklist

- [ ] Owner completed DR-01–DR-04 in external tool
- [ ] Files in `docs/research/`
- [ ] Story closed + sprint log updated
