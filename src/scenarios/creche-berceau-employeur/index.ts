import {
  computeEmployerChildcareAidTaxableExcessAnnual,
  readAvantageEmployeurCrecheParams,
} from "../../shared/avantage-employeur-creche";
import { appendCreditVsIrSatellite } from "../../shared/credit-vs-ir-brut";
import type { CreditVsIrBrutSatellite } from "../../shared/credit-vs-ir-brut";
import {
  computeCreditGardeHorsDomicileAnnual,
  readCreditGardeHorsDomicileParams,
} from "../../shared/credit-garde-hors-domicile";
import { normalizeChildrenCountForCredit, normalizeCustody } from "../../shared/household";
import { getRulePack } from "../../shared/load-rules";
import { monthlyCashflowAfterAides } from "../../shared/monthly-cashflow-after-aides";
import type { PrefinancedCesuMode, ScenarioResultBase } from "../types";

function clamp01(x: number): number {
  return Math.min(1, Math.max(0, x));
}

/**
 * Place en crèche avec participation employeur (berceau, convention, etc.) : même logique **F8** que la crèche publique
 * pour la part famille, plus **seuil d’exonération** sur l’aide employeur (pack DR-03).
 */
export type CrecheBerceauEmployeurInput = {
  monthlyParticipationEur?: number;
  monthlyCmgStructureEur?: number;
  /** Enfants pour lesquels ces dépenses de garde en structure ouvrent le plafond F8 (≠ obligatoirement tous les enfants du foyer). */
  childrenCount?: number;
  custody?: "full" | "shared";
  /** Aide employeur annuelle versée pour la garde (0 si inconnue ou déjà reflétée ailleurs). */
  annualEmployerChildcareAidEur?: number;
  /** Enfants couverts par le seuil 1 830 € / an (défaut = `childrenCount`). */
  childrenCountForEmployerThreshold?: number;
  revenuNetImposableEur?: number;
  nombreParts?: number;
  /** Chèques CESU préfinancés employeur liés à la garde — voir `params.md`. */
  prefinancedCesuEmployerUses?: boolean;
  prefinancedCesuAnnualEur?: number;
  prefinancedCesuMode?: PrefinancedCesuMode;
  childcareProviderAcceptsCesu?: boolean;
  /** Part du CESU employeur utilisable pour cette garde (0–1) si une partie sert à d’autres services. Défaut 1. */
  prefinancedCesuAvailableForChildcareFraction?: number;
};

export type CrecheBerceauEmployeurTrace = {
  monthlyParticipationEur: number;
  monthlyCmgStructureEur: number;
  childrenCount: number;
  custody: "full" | "shared";
  annualEligibleExpenseForCreditEur: number;
  annualCreditGardeHorsDomicileEur: number;
  monthlyCreditEquivalentEur: number;
  netMonthlyCashAfterCmgEur: number;
  netMonthlyBurdenAfterCreditEur: number;
  annualEmployerChildcareAidEur: number;
  employerExemptPortionAnnualEur: number;
  employerTaxableExcessAnnualEur: number;
  employerThresholdChildrenCount: number;
  creditVsIrBrutSatellite?: CreditVsIrBrutSatellite;
  prefinancedCesuEmployerUses: boolean;
  prefinancedCesuMode?: PrefinancedCesuMode;
  prefinancedCesuAnnualEur: number;
  /** Aide employeur annuelle + CESU si mode `on_top`. */
  totalEmployerChildcareSupportAnnualEur: number;
  childcareProviderAcceptsCesu?: boolean;
  prefinancedCesuAvailableForChildcareFraction: number;
  effectivePrefinancedCesuAnnualEur: number;
};

export type CrecheBerceauEmployeurResult = ScenarioResultBase & {
  scenarioSlug: "creche-berceau-employeur";
  trace?: CrecheBerceauEmployeurTrace;
};

export function computeCrecheBerceauEmployeur(
  input: CrecheBerceauEmployeurInput,
): CrecheBerceauEmployeurResult {
  const pack = getRulePack();
  const meta = { rulePackVersion: pack.version, effectiveFrom: pack.effectiveFrom };

  const raw = input.monthlyParticipationEur;
  if (raw === undefined || raw === null || Number.isNaN(raw)) {
    return {
      scenarioSlug: "creche-berceau-employeur",
      status: "stub",
      notes: [
        "Saisir `monthlyParticipationEur` (part familiale mensuelle) pour un calcul partiel — même base que la crèche publique (F8 + CMG structure).",
      ],
      meta,
    };
  }
  if (raw < 0) {
    return {
      scenarioSlug: "creche-berceau-employeur",
      status: "stub",
      notes: ["`monthlyParticipationEur` doit être un nombre ≥ 0."],
      meta,
    };
  }

  const monthlyParticipationEur = raw;
  const monthlyCmgStructureEur = Math.max(0, input.monthlyCmgStructureEur ?? 0);
  const childrenCount = normalizeChildrenCountForCredit(input.childrenCount);
  const custody = normalizeCustody(input.custody);
  const annualEmployerChildcareAidEur = Math.max(0, input.annualEmployerChildcareAidEur ?? 0);
  const employerThresholdChildrenCount = Math.max(
    1,
    Math.floor(input.childrenCountForEmployerThreshold ?? childrenCount),
  );

  const creditParams = readCreditGardeHorsDomicileParams(pack);
  const creditAnnual = creditParams
    ? computeCreditGardeHorsDomicileAnnual(creditParams, {
        monthlyParticipationEur,
        monthlyCmgEur: monthlyCmgStructureEur,
        childrenCount,
        custody,
      })
    : { annualEligibleExpenseEur: 0, annualCreditEur: 0 };

  const { monthlyCreditEquivalentEur, netMonthlyCashAfterCmgEur, netMonthlyBurdenAfterCreditEur } =
    monthlyCashflowAfterAides({
      monthlyGrossCostEur: monthlyParticipationEur,
      monthlyCmgEur: monthlyCmgStructureEur,
      annualCreditImpotEur: creditAnnual.annualCreditEur,
    });

  const avantageParams = readAvantageEmployeurCrecheParams(pack);
  const exemptPerChild = avantageParams?.exemptAnnualAmountPerChildEur ?? 1830;
  const { exemptPortionAnnualEur, taxableExcessAnnualEur } =
    computeEmployerChildcareAidTaxableExcessAnnual(
      exemptPerChild,
      annualEmployerChildcareAidEur,
      employerThresholdChildrenCount,
    );

  const cesuUses = input.prefinancedCesuEmployerUses === true;
  const cesuAnnual = Math.max(0, input.prefinancedCesuAnnualEur ?? 0);
  const cesuMode = input.prefinancedCesuMode;
  const cesuFrac = clamp01(input.prefinancedCesuAvailableForChildcareFraction ?? 1);
  const effectivePrefinancedCesuAnnualEur = cesuAnnual * cesuFrac;
  const totalEmployerChildcareSupportAnnualEur =
    cesuUses && cesuMode === "on_top"
      ? annualEmployerChildcareAidEur + effectivePrefinancedCesuAnnualEur
      : annualEmployerChildcareAidEur;

  const notes: string[] = [
    "Calcul partiel : crédit d’impôt garde **hors domicile** (F8) sur la **part familiale** ; l’aide employeur ne réduit pas ce crédit si la participation saisie est déjà la part nette à payer.",
    "Seuil d’exonération employeur : paramètre `avantage-employeur-creche-seuil-exoneration` (jurisprudence, `todoVerify` dans le pack) — excédent potentiellement imposable en salaire.",
  ];
  if (monthlyParticipationEur > 0 && monthlyCmgStructureEur > 0) {
    notes.push(
      "Contrôle saisie : participation et CMG sont toutes deux non nulles — vérifier que la participation n’est pas déjà « nette » de la CMG (sinon double prise en compte pour la trésorerie et, si `deductCmgFromBase` est vrai dans le pack, pour la base du crédit). Voir `params.md` (crèche publique : Cohérence participation / CMG).",
    );
  }
  if (!creditParams) {
    notes.push(
      "Avertissement : règle `credit-impot-garde-hors-domicile` absente du pack — crédit d’impôt à 0.",
    );
  }

  if (cesuUses) {
    notes.push(
      "CESU préfinancé employeur : le seuil d’exonération / excédent imposable reste calculé sur `annualEmployerChildcareAidEur` seul. Le **total soutien employeur** (aide déclarée + CESU effectif si « en plus ») figure en trace — voir `params.md`.",
    );
  }
  if (input.childcareProviderAcceptsCesu === false) {
    notes.push(
      "Paiement par CESU : la structure indiquée **n’accepte pas** les CESU — le règlement des frais de garde doit s’envisager autrement pour la trésorerie.",
    );
  }
  if (cesuUses && cesuFrac < 1) {
    notes.push(
      "Part du CESU employeur affectée à cette garde : `prefinancedCesuAvailableForChildcareFraction` < 1 — le montant CESU utile pour la trace est **pondéré** (autres usages des chèques).",
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
    scenarioSlug: "creche-berceau-employeur",
    status: "partial",
    notes,
    meta,
    trace: {
      monthlyParticipationEur,
      monthlyCmgStructureEur,
      childrenCount,
      custody,
      annualEligibleExpenseForCreditEur: creditAnnual.annualEligibleExpenseEur,
      annualCreditGardeHorsDomicileEur: creditAnnual.annualCreditEur,
      monthlyCreditEquivalentEur,
      netMonthlyCashAfterCmgEur,
      netMonthlyBurdenAfterCreditEur,
      annualEmployerChildcareAidEur,
      employerExemptPortionAnnualEur: exemptPortionAnnualEur,
      employerTaxableExcessAnnualEur: taxableExcessAnnualEur,
      employerThresholdChildrenCount,
      prefinancedCesuEmployerUses: cesuUses,
      ...(cesuMode !== undefined ? { prefinancedCesuMode: cesuMode } : {}),
      prefinancedCesuAnnualEur: cesuAnnual,
      totalEmployerChildcareSupportAnnualEur,
      prefinancedCesuAvailableForChildcareFraction: cesuFrac,
      effectivePrefinancedCesuAnnualEur,
      ...(input.childcareProviderAcceptsCesu !== undefined
        ? { childcareProviderAcceptsCesu: input.childcareProviderAcceptsCesu }
        : {}),
      ...(satellite ? { creditVsIrBrutSatellite: satellite } : {}),
    },
  };
}
