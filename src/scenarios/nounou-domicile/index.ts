import {
  type CmgGardeDomicileComputed,
  computeCmgGardeDomicileEmploiDirectMonthly,
} from "../../shared/cmg-garde-domicile-emploi-direct";
import {
  isExplicitMonthlyCmgProvided,
  isIncomeProvidedForCmgFormula,
  resolveCmgFromEmploymentInput,
} from "../../shared/cmg-from-employment-input";
import { appendCreditVsIrSatellite } from "../../shared/credit-vs-ir-brut";
import type { CreditVsIrBrutSatellite } from "../../shared/credit-vs-ir-brut";
import {
  computeCreditEmploiDomicileAnnual,
  readCreditEmploiDomicileParams,
} from "../../shared/credit-emploi-domicile";
import { normalizeCustody, normalizeHouseholdChildRank } from "../../shared/household";
import { getRulePack } from "../../shared/load-rules";
import { monthlyCashflowAfterAides } from "../../shared/monthly-cashflow-after-aides";
import type { NounouEmploymentModel, PrefinancedCesuMode, ScenarioResultBase } from "../types";

function clamp01(x: number): number {
  return Math.min(1, Math.max(0, x));
}

/**
 * Garde à domicile par employeur direct (Pajemploi) : CMG « emploi direct garde à domicile »
 * et crédit d’impôt **emploi à domicile** (CGI 199 sexdecies), pas le crédit « garde hors domicile ».
 * CMG : saisie prioritaire sur le revenu si les deux sont fournis.
 */
export type { NounouEmploymentModel, PrefinancedCesuMode };

export type NounouDomicileInput = {
  /** Coût employeur mensuel — même assiette approximative pour CMG et base crédit 199 ; voir `params.md`. */
  monthlyEmploymentCostEur?: number;
  monthlyHouseholdIncomeForCmgEur?: number;
  householdChildRank?: number;
  monthlyCmgPaidEur?: number;
  /** Majorations du plafond annuel du crédit 199 (≠ obligatoirement tous les enfants du foyer). */
  childrenCountForCreditCeiling?: number;
  custody?: "full" | "shared";
  revenuNetImposableEur?: number;
  nombreParts?: number;
  /** Chèques CESU préfinancés pris en charge par l’employeur — voir `params.md` (intake). */
  prefinancedCesuEmployerUses?: boolean;
  /** Montant mensuel de CESU préfinancé employeur (si `prefinancedCesuEmployerUses`). */
  prefinancedCesuMonthlyEur?: number;
  /** `on_top` : en plus du coût employeur saisi pour CMG/crédit ; `substitutes_constant_employer_cost` : arbitrage pour garder le même coût employeur total (la saisie représente déjà l’enveloppe). */
  prefinancedCesuMode?: PrefinancedCesuMode;
  /** La nounou / l’emploi accepte-t-il le paiement par CESU ? */
  childcareProviderAcceptsCesu?: boolean;
  /** Part du CESU employeur utilisable pour cette garde (0–1) si une partie sert à d’autres services. Défaut 1. */
  prefinancedCesuAvailableForChildcareFraction?: number;
  /** Employeur unique pour ce contrat vs co-famille (plusieurs foyers). */
  nounouEmploymentModel?: NounouEmploymentModel;
};

export type NounouDomicileTrace = {
  monthlyEmploymentCostEur: number;
  monthlyCmgEur: number;
  cmgSource: "saisie" | "calcul_pack";
  cmgDetail?: CmgGardeDomicileComputed;
  annualEligibleExpenseForCreditEur: number;
  annualCeilingExpenseForCreditEur: number;
  annualCreditEmploiDomicileEur: number;
  monthlyCreditEquivalentEur: number;
  netMonthlyCashAfterCmgEur: number;
  netMonthlyBurdenAfterCreditEur: number;
  creditVsIrBrutSatellite?: CreditVsIrBrutSatellite;
  prefinancedCesuEmployerUses: boolean;
  prefinancedCesuMode?: PrefinancedCesuMode;
  prefinancedCesuMonthlyEur: number;
  /** Coût employeur total côté employeur : coût saisi + CESU effectif si mode `on_top`, sinon égal au coût saisi. */
  totalEmployerOutlayMonthlyEur: number;
  childcareProviderAcceptsCesu?: boolean;
  prefinancedCesuAvailableForChildcareFraction: number;
  effectivePrefinancedCesuMonthlyEur: number;
  nounouEmploymentModel?: NounouEmploymentModel;
};

export type NounouDomicileResult = ScenarioResultBase & {
  scenarioSlug: "nounou-domicile";
  trace?: NounouDomicileTrace;
};

export function computeNounouDomicile(input: NounouDomicileInput): NounouDomicileResult {
  const pack = getRulePack();
  const meta = { rulePackVersion: pack.version, effectiveFrom: pack.effectiveFrom };

  const rawCost = input.monthlyEmploymentCostEur;
  if (rawCost === undefined || rawCost === null || Number.isNaN(rawCost)) {
    return {
      scenarioSlug: "nounou-domicile",
      status: "stub",
      notes: [
        "Saisir `monthlyEmploymentCostEur` (coût employeur mensuel : salaire + cotisations) et soit `monthlyCmgPaidEur`, soit `monthlyHouseholdIncomeForCmgEur` pour le CMG.",
      ],
      meta,
    };
  }
  if (rawCost < 0) {
    return {
      scenarioSlug: "nounou-domicile",
      status: "stub",
      notes: ["`monthlyEmploymentCostEur` doit être ≥ 0."],
      meta,
    };
  }

  const monthlyEmploymentCostEur = rawCost;
  const custody = normalizeCustody(input.custody);
  const rank = normalizeHouseholdChildRank(input.householdChildRank);
  const childrenCountForCeiling = Math.max(0, Math.floor(input.childrenCountForCreditCeiling ?? 1));

  const resolved = resolveCmgFromEmploymentInput({
    monthlyCmgPaidEur: input.monthlyCmgPaidEur,
    monthlyHouseholdIncomeForCmgEur: input.monthlyHouseholdIncomeForCmgEur,
    monthlyEmploymentCostEur,
    householdChildRank: rank,
    computeFromPack: (args) => computeCmgGardeDomicileEmploiDirectMonthly(pack, args),
  });
  if (resolved === null) {
    return {
      scenarioSlug: "nounou-domicile",
      status: "stub",
      notes: [
        "Pour un calcul partiel : fournir `monthlyCmgPaidEur` **ou** `monthlyHouseholdIncomeForCmgEur` (formule CMG garde à domicile).",
      ],
      meta,
    };
  }
  if (resolved.kind === "missing_rule") {
    return {
      scenarioSlug: "nounou-domicile",
      status: "stub",
      notes: ["Règle `cmg-emploi-direct-garde-domicile-2026-04` introuvable dans le pack."],
      meta,
    };
  }

  let monthlyCmgEur: number;
  let cmgSource: "saisie" | "calcul_pack";
  let cmgDetail: CmgGardeDomicileComputed | undefined;
  if (resolved.kind === "saisie") {
    monthlyCmgEur = resolved.monthlyCmgEur;
    cmgSource = "saisie";
  } else {
    monthlyCmgEur = resolved.monthlyCmgEur;
    cmgSource = "calcul_pack";
    cmgDetail = resolved.detail;
  }

  const creditParams = readCreditEmploiDomicileParams(pack);
  const creditAnnual = creditParams
    ? computeCreditEmploiDomicileAnnual(creditParams, {
        monthlyEmploymentCostEur: monthlyEmploymentCostEur,
        monthlyCmgEur: monthlyCmgEur,
        childrenCountForCeiling,
        custody,
      })
    : {
        annualEligibleExpenseEur: 0,
        annualCreditEur: 0,
        annualCeilingExpenseEur: 0,
      };

  const { monthlyCreditEquivalentEur, netMonthlyCashAfterCmgEur, netMonthlyBurdenAfterCreditEur } =
    monthlyCashflowAfterAides({
      monthlyGrossCostEur: monthlyEmploymentCostEur,
      monthlyCmgEur,
      annualCreditImpotEur: creditAnnual.annualCreditEur,
    });

  const cesuUses = input.prefinancedCesuEmployerUses === true;
  const cesuMonthly = Math.max(0, input.prefinancedCesuMonthlyEur ?? 0);
  const cesuMode = input.prefinancedCesuMode;
  const cesuFrac = clamp01(input.prefinancedCesuAvailableForChildcareFraction ?? 1);
  const effectivePrefinancedCesuMonthlyEur = cesuMonthly * cesuFrac;
  const totalEmployerOutlayMonthlyEur =
    cesuUses && cesuMode === "on_top"
      ? monthlyEmploymentCostEur + effectivePrefinancedCesuMonthlyEur
      : monthlyEmploymentCostEur;

  const notes: string[] = [
    "Crédit d’impôt **emploi à domicile** (CGI art. 199 sexdecies) — **non cumulable** avec le crédit « frais de garde hors du domicile » (CGI art. 200 quater B) pour les mêmes dépenses.",
    "Calcul partiel : prise en charge partielle des cotisations (50 % dans le pack CMG) et plafonds détaillés non intégrés ligne à ligne — voir `docs/research/`.",
    "Même montant `monthlyEmploymentCostEur` pour CMG et base du crédit 199 — approximation ; base annuelle = coût − CMG puis plafond (voir params.md, Assiette unique).",
  ];
  if (input.nounouEmploymentModel === "co_famille") {
    notes.push(
      "Co-famille / plusieurs employeurs : le moteur ne répartit pas automatiquement entre foyers — saisir la **part** de coût et de CMG **de ce foyer**, ou simuler par foyer (voir params.md, Limites).",
    );
  }
  if (
    isExplicitMonthlyCmgProvided(input.monthlyCmgPaidEur) &&
    isIncomeProvidedForCmgFormula(input.monthlyHouseholdIncomeForCmgEur)
  ) {
    notes.push(
      "CMG saisi et revenu pour barème tous deux fournis : seul le **CMG saisi** est utilisé ; le revenu est ignoré pour le calcul CMG — voir params.md (Priorité saisie / revenu).",
    );
  }
  if (!creditParams) {
    notes.push(
      "Avertissement : règle `credit-impot-emploi-domicile-plafonds` absente du pack — crédit d’impôt à 0.",
    );
  }

  if (cesuUses) {
    notes.push(
      "CESU préfinancé employeur : les lignes CMG / crédit d’impôt restent calculées sur `monthlyEmploymentCostEur` (assiette unique). Le **total charge employeur** inclut le CESU **effectif** (pondéré) en plus uniquement si le mode est `on_top` — voir tableau et `params.md`.",
    );
    notes.push(
      "Non-cumuls / déclaratif : règle qualitative `cesu-cmg-non-cumul` dans le pack — ne pas cumuler abusivement avec d’autres dispositifs pour la même dépense.",
    );
  }
  if (input.childcareProviderAcceptsCesu === false) {
    notes.push(
      "Paiement par CESU : la garde indiquée **n’accepte pas** les CESU — prévoir un autre moyen pour le salaire / remboursements.",
    );
  }
  if (cesuUses && cesuFrac < 1) {
    notes.push(
      "Part du CESU employeur pour cette garde : `prefinancedCesuAvailableForChildcareFraction` < 1 — montant CESU utile **pondéré** (autres usages des chèques).",
    );
  }

  const { satellite, extraNotes } = appendCreditVsIrSatellite(
    pack,
    creditAnnual.annualCreditEur,
    input,
  );
  if (extraNotes.length > 0) {
    notes.push(...extraNotes);
  }

  return {
    scenarioSlug: "nounou-domicile",
    status: "partial",
    notes,
    meta,
    trace: {
      monthlyEmploymentCostEur,
      monthlyCmgEur,
      cmgSource,
      cmgDetail: cmgDetail ?? undefined,
      annualEligibleExpenseForCreditEur: creditAnnual.annualEligibleExpenseEur,
      annualCeilingExpenseForCreditEur: creditAnnual.annualCeilingExpenseEur,
      annualCreditEmploiDomicileEur: creditAnnual.annualCreditEur,
      monthlyCreditEquivalentEur,
      netMonthlyCashAfterCmgEur,
      netMonthlyBurdenAfterCreditEur,
      prefinancedCesuEmployerUses: cesuUses,
      ...(cesuMode !== undefined ? { prefinancedCesuMode: cesuMode } : {}),
      prefinancedCesuMonthlyEur: cesuMonthly,
      totalEmployerOutlayMonthlyEur,
      prefinancedCesuAvailableForChildcareFraction: cesuFrac,
      effectivePrefinancedCesuMonthlyEur,
      ...(input.nounouEmploymentModel !== undefined
        ? { nounouEmploymentModel: input.nounouEmploymentModel }
        : {}),
      ...(input.childcareProviderAcceptsCesu !== undefined
        ? { childcareProviderAcceptsCesu: input.childcareProviderAcceptsCesu }
        : {}),
      ...(satellite ? { creditVsIrBrutSatellite: satellite } : {}),
    },
  };
}
