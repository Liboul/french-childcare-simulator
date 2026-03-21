# GARDE-007 — CAF / CMG estimate + cumul rules (from rule pack)

| Field     | Value                                                                                                                                        |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| **Epic**  | E2 — Engine                                                                                                                                  |
| **Links** | [`INITIAL_SPEC.md`](../INITIAL_SPEC.md), [`DR-01`](../research/DR-01-CMG-CAF.md), **GARDE-005** (`config/rules.fr-2026.json`), **GARDE-006** |

## User / product value

The engine can output a **monthly CMG estimate** and apply **documented cumul rules** (PreParE, AAH/AEEH) using **only** versioned config + DR-01-backed parameters—no silent fiscal defaults.

## Scope

**In scope**

- **Emploi direct** (garde à domicile + assistante maternelle / MAM): DR-01 formula  
  `CMG = coût_garde × (1 − (revenu_borné × taux_effort / CHR))`  
  with hourly **declared** salary capped by pack (`maxHourlySalaryCountedEur`), income clamped by pack floors/ceilings, `taux_effort` from `effortRateByHouseholdChildRank` (ranks >3 for assmat: reuse rank-3 rate with explicit **warning** until pack completes DR-01 gap).
- **Structure** (micro-crèche / `creche_privee`): tranches N-2 from pack, monthly amounts (valid through 2026-03-31), **RAC minimum** 15 % ⇒ cap aid at `0.85 × monthlyExpense`, optional **Mayotte** T1 &lt;3 override from pack; **ineligible** if hourly fee &gt; 10 € (pack).
- **Cumul** from `cmg-non-cumul-et-majorations`: PreParE taux plein → CMG 0 ; PreParE ≤50 % → CMG halved ; AAH/AEEH → ×1,3 (after PreParE). APL: no change to amount (documented cumul).
- **Explicit non-support**: `creche_publique`, `creche_inter_entreprises` → PSU / hors branche « CMG structure » dans ce slice → `unsupported` result (no invented amount).

**Out of scope**

- Prise en charge détaillée des cotisations (50 % / plafonds 526 €) en **montant séparé** (reste `todoVerify` dans le pack) ; peut suivre dans une story dédiée.
- Résidence alternée par parent, Alsace-Moselle net salary, fratrie Pajemploi : paramètres ou stories ultérieures.

## Acceptance criteria

1. `estimateCmgMonthlyEur(rulePack, request)` retourne un résultat typé (`ok` | `ineligible` | `unsupported`) + montant + `warnings[]` + `ruleIds[]` touchés.
2. Au moins un test chiffré **emploi direct garde domicile** cohérent avec la formule et les paramètres du JSON.
3. Au moins un test **structure** (tranche + plafond 85 % dépense).
4. Au moins un test **cumul** PreParE plein → 0 ; partiel → moitié ; AAH → ×1,3.
5. `bun run ci` vert ; commit `GARDE-007` ; ligne dans [`SPRINT_PLAN.md`](../SPRINT_PLAN.md).

## Technical notes

- Module domaine : `src/family-allowances/cmg/` (aligné sur `TraceSegment` `family_allowances`).
- Les entrées **revenu / coût** sont explicites : le moteur ne devine pas le QF ou les déclarations CAF.

## Deep research

DR-01 déjà intégré en GARDE-005 ; cas limites hors scope → `warnings` ou `unsupported`.

## Test plan

- Cas limite : ratio ≥ 1 ⇒ CMG 0 (emploi direct).
- Micro-crèche : tarif horaire 11 € ⇒ ineligible structure.

## Done checklist

- [x] Story spec (this file)
- [x] Implémentation + tests
- [x] Commit `GARDE-007`
- [x] Sprint plan completion log
