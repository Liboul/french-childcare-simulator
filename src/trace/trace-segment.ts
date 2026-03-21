/**
 * Logical stage of a calculation trace (domain language).
 * INITIAL_SPEC.md uses letters A–G for the same ideas in prose; code uses these ids.
 */
export const TRACE_SEGMENTS = [
  "household",
  "childcare",
  "employer_benefits",
  "family_allowances",
  "tax_credits",
  "taxation",
  "summary",
] as const;

export type TraceSegment = (typeof TRACE_SEGMENTS)[number];

/** French labels for auditors / UI (aligned with INITIAL_SPEC section titles). */
export const TRACE_SEGMENT_LABEL_FR: Record<TraceSegment, string> = {
  household: "Profil foyer",
  childcare: "Profil mode de garde",
  employer_benefits: "Avantages employeur",
  family_allowances: "Aides CAF / CMG",
  tax_credits: "Crédits d'impôt",
  taxation: "Fiscalité",
  summary: "Résultat final",
};
