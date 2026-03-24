import { findRule } from "../config/find-rule";
import type { RulePack } from "../config/schema";

const RULE_ID = "ir-bareme-revenus-2025-imposition-2026" as const;

/** Tranche du barème progressif (quotient familial) — `upToQuotientEur` null = dernière tranche ouverte. */
export type IrProgressiveSlice = {
  upToQuotientEur: number | null;
  marginalRate: number;
};

export type IrBaremeParams = {
  incomeYear: number;
  taxYear: number;
  progressiveSlices: IrProgressiveSlice[];
  decoteSeuilImpotBrutIndividuelEur?: number;
  decoteSeuilImpotBrutCoupleEur?: number;
};

function roundEur2(n: number): number {
  return Math.round(n * 100) / 100;
}

function parseIrBaremeParams(raw: unknown): IrBaremeParams | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const slices = o.progressiveSlices;
  if (!Array.isArray(slices) || slices.length === 0) return null;
  const progressiveSlices: IrProgressiveSlice[] = [];
  for (const s of slices) {
    if (!s || typeof s !== "object") return null;
    const r = s as Record<string, unknown>;
    const up = r.upToQuotientEur;
    const rate = r.marginalRate;
    if (rate !== undefined && typeof rate !== "number") return null;
    if (up !== null && up !== undefined && typeof up !== "number") return null;
    progressiveSlices.push({
      upToQuotientEur: up === null || up === undefined ? null : up,
      marginalRate: rate as number,
    });
  }
  const incomeYear = o.incomeYear;
  const taxYear = o.taxYear;
  if (typeof incomeYear !== "number" || typeof taxYear !== "number") return null;
  const decoteSeuilImpotBrutIndividuelEur =
    typeof o.decoteSeuilImpotBrutIndividuelEur === "number"
      ? o.decoteSeuilImpotBrutIndividuelEur
      : undefined;
  const decoteSeuilImpotBrutCoupleEur =
    typeof o.decoteSeuilImpotBrutCoupleEur === "number"
      ? o.decoteSeuilImpotBrutCoupleEur
      : undefined;
  return {
    incomeYear,
    taxYear,
    progressiveSlices,
    decoteSeuilImpotBrutIndividuelEur,
    decoteSeuilImpotBrutCoupleEur,
  };
}

export function readIrBaremeParams(pack: RulePack): IrBaremeParams | null {
  const rule = findRule(pack, RULE_ID);
  const p = rule?.parameters;
  return parseIrBaremeParams(p);
}

export function computeQuotientFamilial(
  revenuNetImposableEur: number,
  nombreParts: number,
): number {
  if (nombreParts <= 0 || !Number.isFinite(revenuNetImposableEur)) {
    return 0;
  }
  return revenuNetImposableEur / nombreParts;
}

/**
 * TMI au sens DR-07 : taux **marginal** de la tranche du quotient (pas le PAS, pas le taux moyen).
 */
export function computeTmiMarginalQuotient(params: IrBaremeParams, quotient: number): number {
  const { progressiveSlices: slices } = params;
  const last = slices[slices.length - 1];
  if (!last) return 0;
  for (const s of slices) {
    const upper = s.upToQuotientEur === null ? Number.POSITIVE_INFINITY : s.upToQuotientEur;
    if (quotient <= upper) return s.marginalRate;
  }
  return last.marginalRate;
}

/**
 * Impôt **par part** avant décote / réductions / crédits (hors plafonnement QF).
 */
export function computeIrProgressiveParPart(params: IrBaremeParams, quotient: number): number {
  let prev = 0;
  let tax = 0;
  for (const s of params.progressiveSlices) {
    if (quotient <= prev) break;
    const upper = s.upToQuotientEur === null ? Number.POSITIVE_INFINITY : s.upToQuotientEur;
    const slice = Math.min(quotient, upper) - prev;
    if (slice > 0) tax += slice * s.marginalRate;
    prev = upper;
  }
  return roundEur2(tax);
}

export type IrFoyerSimplifieResult = {
  quotientFamilial: number;
  irParPart: number;
  irBrutEur: number;
  tmi: number;
  warnings: string[];
};

/**
 * IR brut indicatif : `irParPart × nombreParts` — sans plafonnement QF, sans décote, sans réductions / crédits.
 */
export function computeIrFoyerSimplifie(
  params: IrBaremeParams,
  input: { revenuNetImposableEur: number; nombreParts: number },
): IrFoyerSimplifieResult | null {
  const { revenuNetImposableEur, nombreParts } = input;
  if (nombreParts <= 0 || !Number.isFinite(revenuNetImposableEur) || revenuNetImposableEur < 0) {
    return null;
  }
  const quotientFamilial = computeQuotientFamilial(revenuNetImposableEur, nombreParts);
  const irParPart = computeIrProgressiveParPart(params, quotientFamilial);
  const irBrutEur = roundEur2(irParPart * nombreParts);
  const tmi = computeTmiMarginalQuotient(params, quotientFamilial);

  const warnings: string[] = [
    "IR brut simplifié : plafonnement du quotient familial, décote, réductions et crédits d’impôt non intégrés — voir docs/research/DR-07-IR-TMI-DISPONIBLE.md.",
    "La TMI n’est pas le taux de prélèvement à la source (PAS).",
  ];

  const seuilInd = params.decoteSeuilImpotBrutIndividuelEur;
  const seuilCouple = params.decoteSeuilImpotBrutCoupleEur;
  if (seuilInd !== undefined && seuilCouple !== undefined) {
    const seuil = nombreParts <= 1 ? seuilInd : seuilCouple;
    if (irBrutEur < seuil) {
      warnings.push(
        "Zone de décote possible : l’effet marginal d’un euro de revenu imposable peut dépasser la TMI affichée (DR-07 §3.4).",
      );
    }
  }

  return {
    quotientFamilial: roundEur2(quotientFamilial),
    irParPart,
    irBrutEur,
    tmi,
    warnings,
  };
}
