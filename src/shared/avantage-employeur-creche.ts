import { findRule } from "../config/find-rule";
import type { RulePack } from "../config/schema";

export type AvantageEmployeurCrecheParams = {
  exemptAnnualAmountPerChildEur: number;
};

export function readAvantageEmployeurCrecheParams(
  pack: RulePack,
): AvantageEmployeurCrecheParams | null {
  const r = findRule(pack, "avantage-employeur-creche-seuil-exoneration");
  const p = r?.parameters;
  if (!p || typeof p !== "object") return null;
  const exemptAnnualAmountPerChildEur =
    typeof p.exemptAnnualAmountPerChildEur === "number" ? p.exemptAnnualAmountPerChildEur : 1830;
  return { exemptAnnualAmountPerChildEur };
}

/** Au-delà de `exemptPerChild × childrenCount`, l’excédent est traité comme avantage imposable (pack DR-03). */
export function computeEmployerChildcareAidTaxableExcessAnnual(
  exemptPerChild: number,
  annualEmployerAidEur: number,
  childrenCountForThreshold: number,
): { exemptPortionAnnualEur: number; taxableExcessAnnualEur: number } {
  const n = Math.max(1, Math.floor(childrenCountForThreshold));
  const cap = exemptPerChild * n;
  const exemptPortionAnnualEur = Math.min(Math.max(0, annualEmployerAidEur), cap);
  const taxableExcessAnnualEur = Math.max(0, annualEmployerAidEur - cap);
  return { exemptPortionAnnualEur, taxableExcessAnnualEur };
}
