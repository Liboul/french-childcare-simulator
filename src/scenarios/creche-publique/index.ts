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
  /** Enfants pour lesquels ces dépenses de garde en structure ouvrent le plafond F8 (≠ obligatoirement tous les enfants du foyer). */
  childrenCount?: number;
  custody?: "full" | "shared";
  /** La structure accepte-t-elle le paiement par chèques CESU ? (information / trésorerie — ne change pas F8 dans le moteur.) */
  childcareProviderAcceptsCesu?: boolean;
  /** Optionnel : IR brut indicatif (pack) vs crédit annuel — les deux avec `nombreParts`. */
  revenuNetImposableEur?: number;
  nombreParts?: number;
  /** Repas, transport, adhésion… hors base crédit F8 — effort trésorerie additionnel. */
  monthlyAncillaryCostsEur?: number;
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
  /** Information : acceptation des CESU par la crèche (voir `params.md`). */
  childcareProviderAcceptsCesu?: boolean;
  monthlyAncillaryCostsEur: number;
  estimatedMonthlyHouseholdCashOutEur: number;
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

  const monthlyAncillaryCostsEur = Math.max(0, input.monthlyAncillaryCostsEur ?? 0);
  const estimatedMonthlyHouseholdCashOutEur =
    netMonthlyBurdenAfterCreditEur + monthlyAncillaryCostsEur;

  const notes: string[] = [
    "Calcul partiel : crédit d’impôt — taux et plafonds dans la règle `credit-impot-garde-hors-domicile` du pack (souvent 50 % de la base éligible plafonnée ; garde alternée si `custody: shared`). Base éligible : voir `deductCmgFromBase` dans `params.md`.",
    "Barème PSU / reste à charge structure non recalculé ici : la participation doit refléter la facture réelle ou une estimation (monenfant.fr, etc.).",
  ];
  if (input.childcareProviderAcceptsCesu === false) {
    notes.push(
      "Paiement par CESU : la structure indiquée **n’accepte pas** les CESU — prévoir un autre moyen de paiement pour la trésorerie (hors périmètre du calcul F8).",
    );
  }
  if (monthlyParticipationEur > 0 && monthlyCmgStructureEur > 0) {
    notes.push(
      "Contrôle saisie : participation et CMG sont toutes deux non nulles — vérifier que la participation n’est pas déjà « nette » de la CMG (sinon double prise en compte pour la trésorerie et, si `deductCmgFromBase` est vrai dans le pack, pour la base du crédit). Voir `params.md` (section Cohérence participation / CMG).",
    );
  }
  if (!creditParams) {
    notes.push(
      "Avertissement : règle `credit-impot-garde-hors-domicile` absente du pack — crédit d’impôt à 0.",
    );
  }
  if (monthlyAncillaryCostsEur > 0) {
    notes.push(
      "Frais annexes : `monthlyAncillaryCostsEur` est **ajouté** au reste à charge après crédit pour un **effort total** estimé — hors plafond F8 si non éligible (voir facture).",
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
      monthlyAncillaryCostsEur,
      estimatedMonthlyHouseholdCashOutEur,
      ...(input.childcareProviderAcceptsCesu !== undefined
        ? { childcareProviderAcceptsCesu: input.childcareProviderAcceptsCesu }
        : {}),
      ...(satellite ? { creditVsIrBrutSatellite: satellite } : {}),
    },
  };
}
