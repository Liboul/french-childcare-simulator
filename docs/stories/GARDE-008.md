# GARDE-008 — Employer benefits (crèche, CESU gates, préfinancé)

| Field     | Value                                                                                                                                               |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Epic**  | E2 — Engine                                                                                                                                         |
| **Links** | [`INITIAL_SPEC.md`](../INITIAL_SPEC.md), [`DR-03`](../research/DR-03-CESU-EMPLOYEUR.md), **GARDE-005** (`config/rules.fr-2026.json`), **GARDE-007** |

## User / product value

The engine can **quantify employer-funded childcare** effects that matter for net cost and later tax steps: **exempt vs imposable** crèche aid (seuil pack), **CESU déclaratif × CMG** incompatibility (pack), and **CESU préfinancé** as an amount that **reduces** the future employment tax-credit base (documented for GARDE-009), without inventing rates beyond DR-03 + config.

## Scope

**In scope**

- `splitEmployerCrecheSubsidyAnnualPerChild(pack, annualEurByChild[])` using `avantage-employeur-creche-seuil-exoneration` (`exemptAnnualAmountPerChildEur`, defaulting to rule value). Sum **exempt** = Σ min(part, seuil), **taxable fringe** = Σ max(0, part − seuil). If rule has `todoVerify`, emit warning.
- `evaluateCesuDeclaratifVsCmg(pack, { receivesCmg, usesCesuDeclaratifForChildcare })` → `compatible` boolean + message key citing `cesu-cmg-non-cumul`.
- `describeEmployerPrefundedCesuAnnual(pack, annualAmountEur)` → structured note that amount is **aide de type public / 7DR** (DR-03) and must reduce crédit impôt emploi à domicile base later — **no euro credit computed here**.

**Out of scope**

- URSSAF cotisation barèmes, crédit d’impôt 50 % computation (**GARDE-009**), `crédit d’impôt famille` entreprise, TESE/CEA détail.

## Acceptance criteria

1. Tests: crèche **2000 €** / 1 enfant → **1830** exempt + **170** taxable (seuil 1830 du pack).
2. Tests: **deux enfants** `[2000, 500]` → exempt **2330**, taxable **170**.
3. Tests: CMG + CESU déclaratif même garde → `compatible: false`.
4. `bun run ci` ; commit `GARDE-008` ; sprint log.

## Technical notes

- Module `src/employer-benefits/` (trace segment `employer_benefits`).

## Deep research

DR-03 déjà dans le pack ; seuil 1830 en `todoVerify` dans JSON — warnings conservés.

## Done checklist

- [x] Story spec
- [x] Code + tests
- [x] Commit `GARDE-008`
- [x] Sprint log
