import type { RulePack } from "../config/schema";
import { computeIrFoyerSimplifie, readIrBaremeParams } from "./ir-impot-revenu";

/**
 * Contexte fiscal optionnel : permet de comparer le **crédit d’impôt garde** (ou emploi à domicile)
 * à un **IR brut indicatif** sans fusionner les assiettes dans un seul moteur.
 */
export type FiscalContextForCreditVsIr = {
  revenuNetImposableEur: number;
  nombreParts: number;
};

/**
 * Satellite : le crédit annuel ne « réduit » l’impôt dû que jusqu’à concurrence de l’IR brut
 * (part **imputable**) ; l’excédent des crédits **remboursables** est restitué — pas « perdu ».
 * Ne pas additionner ce crédit au **reste à charge** déjà net de crédit dans la trace garde.
 */
export type CreditVsIrBrutSatellite = {
  revenuNetImposableEur: number;
  nombreParts: number;
  quotientFamilial: number;
  irBrutEur: number;
  tmi: number;
  annualCreditImpotEur: number;
  creditImputableCommeReductionIrEur: number;
  excedentRemboursableEur: number;
  notes: readonly string[];
};

export function fiscalContextOptional(input: {
  revenuNetImposableEur?: number;
  nombreParts?: number;
}): FiscalContextForCreditVsIr | undefined {
  if (input.revenuNetImposableEur === undefined || input.nombreParts === undefined) {
    return undefined;
  }
  return {
    revenuNetImposableEur: input.revenuNetImposableEur,
    nombreParts: input.nombreParts,
  };
}

/**
 * Part du crédit qui s’impute sur l’IR brut indicatif (plafonnée par celui-ci) ;
 * le surplus pour les crédits remboursables correspond à une **restitution**, pas à une erreur.
 */
export function creditImpotVsIrBrutIndicatif(params: {
  annualCreditImpotEur: number;
  irBrutEur: number;
}): {
  creditImputableCommeReductionIrEur: number;
  excedentRemboursableEur: number;
  notes: readonly string[];
} {
  const credit = Math.max(0, params.annualCreditImpotEur);
  const ir = Math.max(0, params.irBrutEur);
  const creditImputableCommeReductionIrEur = Math.min(credit, ir);
  const excedentRemboursableEur = Math.max(0, credit - ir);
  const notes: string[] = [];
  if (excedentRemboursableEur > 0) {
    notes.push(
      "Le crédit d’impôt annuel dépasse l’IR brut indicatif : la part excédentaire relève en principe d’un **remboursement** (crédit d’impôt remboursable), pas d’une réduction supplémentaire de l’impôt « dû » au-delà de ce montant.",
    );
  }
  return { creditImputableCommeReductionIrEur, excedentRemboursableEur, notes };
}

/**
 * Si la règle IR ou le foyer ne sont pas calculables, retourne `null` (pas d’échec du scénario garde).
 */
export function computeCreditVsIrBrutSatellite(
  pack: RulePack,
  annualCreditImpotEur: number,
  fiscal: FiscalContextForCreditVsIr,
): CreditVsIrBrutSatellite | null {
  const irParams = readIrBaremeParams(pack);
  if (!irParams) return null;
  const foyer = computeIrFoyerSimplifie(irParams, {
    revenuNetImposableEur: fiscal.revenuNetImposableEur,
    nombreParts: fiscal.nombreParts,
  });
  if (!foyer) return null;
  const cmp = creditImpotVsIrBrutIndicatif({
    annualCreditImpotEur,
    irBrutEur: foyer.irBrutEur,
  });
  const notes = [
    ...foyer.warnings,
    ...cmp.notes,
    "Invariant : `netMonthlyBurdenAfterCreditEur` intègre déjà le crédit d’impôt garde dans ce scénario — ne pas le soustraire à nouveau d’un revenu ou d’un « disponible » dérivé de l’IR.",
  ];
  return {
    revenuNetImposableEur: fiscal.revenuNetImposableEur,
    nombreParts: fiscal.nombreParts,
    quotientFamilial: foyer.quotientFamilial,
    irBrutEur: foyer.irBrutEur,
    tmi: foyer.tmi,
    annualCreditImpotEur,
    creditImputableCommeReductionIrEur: cmp.creditImputableCommeReductionIrEur,
    excedentRemboursableEur: cmp.excedentRemboursableEur,
    notes,
  };
}

/** Pour les `compute*` : messages à ajouter aux `notes` + bloc trace optionnel. */
export function appendCreditVsIrSatellite(
  pack: RulePack,
  annualCreditImpotEur: number,
  input: { revenuNetImposableEur?: number; nombreParts?: number },
): { satellite: CreditVsIrBrutSatellite | undefined; extraNotes: string[] } {
  const fiscal = fiscalContextOptional(input);
  if (!fiscal) {
    return { satellite: undefined, extraNotes: [] };
  }
  const sat = computeCreditVsIrBrutSatellite(pack, annualCreditImpotEur, fiscal);
  if (!sat) {
    return {
      satellite: undefined,
      extraNotes: [
        "Contexte fiscal fourni (`revenuNetImposableEur`, `nombreParts`) mais contrôle crédit vs IR indisponible (règle IR absente du pack).",
      ],
    };
  }
  return { satellite: sat, extraNotes: [] };
}
