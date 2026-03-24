import { appendCreditVsIrSatellite } from "../../shared/credit-vs-ir-brut";
import type { CreditVsIrBrutSatellite } from "../../shared/credit-vs-ir-brut";
import {
  computeCreditGardeHorsDomicileAnnual,
  readCreditGardeHorsDomicileParams,
} from "../../shared/credit-garde-hors-domicile";
import { normalizeChildrenCountForCredit, normalizeCustody } from "../../shared/household";
import { getRulePack } from "../../shared/load-rules";
import { monthlyCashflowAfterAides } from "../../shared/monthly-cashflow-after-aides";
import type { ScenarioResultBase } from "../types";

/**
 * `monthlyParticipationEur` : part facturée au foyer (après PSU / aides locales affichées sur la facture).
 * Si la facture est **déjà nette de CMG**, mettre `monthlyCmgStructureEur: 0` (sinon double déduction).
 */
export type CrechePubliqueInput = {
  monthlyParticipationEur?: number;
  monthlyCmgStructureEur?: number;
  childrenCount?: number;
  custody?: "full" | "shared";
  /** Optionnel : IR brut indicatif (pack) vs crédit annuel — les deux avec `nombreParts`. */
  revenuNetImposableEur?: number;
  nombreParts?: number;
};

export type CrechePubliqueTrace = {
  monthlyParticipationEur: number;
  monthlyCmgStructureEur: number;
  childrenCount: number;
  custody: "full" | "shared";
  annualEligibleExpenseForCreditEur: number;
  annualCreditGardeHorsDomicileEur: number;
  monthlyCreditEquivalentEur: number;
  netMonthlyCashAfterCmgEur: number;
  netMonthlyBurdenAfterCreditEur: number;
  /** Si `revenuNetImposableEur` + `nombreParts` fournis : cohérence crédit vs IR brut (pas de double comptage avec le reste à charge). */
  creditVsIrBrutSatellite?: CreditVsIrBrutSatellite;
};

export type CrechePubliqueResult = ScenarioResultBase & {
  scenarioSlug: "creche-publique";
  trace?: CrechePubliqueTrace;
};

export function computeCrechePublique(input: CrechePubliqueInput): CrechePubliqueResult {
  const pack = getRulePack();
  const meta = { rulePackVersion: pack.version, effectiveFrom: pack.effectiveFrom };

  const raw = input.monthlyParticipationEur;
  if (raw === undefined || raw === null || Number.isNaN(raw)) {
    return {
      scenarioSlug: "creche-publique",
      status: "stub",
      notes: [
        "Saisir au minimum `monthlyParticipationEur` (part familiale mensuelle) pour un calcul partiel.",
      ],
      meta,
    };
  }
  if (raw < 0) {
    return {
      scenarioSlug: "creche-publique",
      status: "stub",
      notes: ["`monthlyParticipationEur` doit être un nombre ≥ 0."],
      meta,
    };
  }

  const monthlyParticipationEur = raw;
  const monthlyCmgStructureEur = Math.max(0, input.monthlyCmgStructureEur ?? 0);
  const childrenCount = normalizeChildrenCountForCredit(input.childrenCount);
  const custody = normalizeCustody(input.custody);

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

  const notes: string[] = [
    "Calcul partiel : crédit d’impôt = 50 % des dépenses éligibles (plafonds par enfant, garde alternée si `custody: shared`), après déduction CMG si ventilée — paramètres `credit-impot-garde-hors-domicile` du pack.",
    "Barème PSU / reste à charge structure non recalculé ici : la participation doit refléter la facture réelle ou une estimation (monenfant.fr, etc.).",
  ];
  if (!creditParams) {
    notes.push(
      "Avertissement : règle `credit-impot-garde-hors-domicile` absente du pack — crédit d’impôt à 0.",
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
    scenarioSlug: "creche-publique",
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
      ...(satellite ? { creditVsIrBrutSatellite: satellite } : {}),
    },
  };
}
