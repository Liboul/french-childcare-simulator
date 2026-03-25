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
import { appendCesuPrefinanceCmgCompatibilityNotes } from "../../shared/cesu-cmg-compatibility-notes";
import { NOTE_ARBITRAGE_BRUT_CHARGES_PATRONALES } from "../../shared/employer-brut-vs-charges-patronales-note";
import {
  computeNounouEmployerCostFromHourly,
  TAUX_PATRONAL_SANS_SANTE_URSSAF_2026,
  TAUX_SALARIAL_APPROX_POUR_SUBSTITUTION_CESU,
} from "../../shared/nounou-employer-cost-from-hourly";
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
  /** Coût employeur mensuel — même assiette approximative pour CMG et base crédit 199 ; voir `params.md`. Ignoré si `hourlyGrossRateEur` est fourni (calcul auto). */
  monthlyEmploymentCostEur?: number;
  /** €/h brut — si fourni avec hebdo + part foyer, calcule `monthlyEmploymentCostEur` (Pajemploi 2026). */
  hourlyGrossRateEur?: number;
  /** Heures hebdo du contrat total (défaut 40). */
  weeklyHoursFullTime?: number;
  /** Part du foyer 0–1 (ex. 4/9). Si absent en co-famille, peut dériver de `coFamilleHouseholdCostSharePercent`. */
  householdShareFraction?: number;
  /** Inclure les ICP à 10 % du brut dans le coût employeur (défaut true). */
  includeIcp?: boolean;
  /** Indemnité repas mensuelle (€), part foyer — ajoutée au coût employeur. */
  monthlyMealAllowanceEur?: number;
  /** Part employeur Navigo (€/mois) — hors base crédit 199 ; ajoutée à l’effort cash comme frais annexes. */
  monthlyNavigoShareEur?: number;
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
  /** Repas, transport, etc. — ajoutés au reste à charge après crédit (hors base F8 si non éligible). */
  monthlyAncillaryCostsEur?: number;
  /** Part du coût / CMG attribuée à ce foyer en co-famille (0–100) — information ; pas de répartition auto. */
  coFamilleHouseholdCostSharePercent?: number;
};

export type NounouDomicileTrace = {
  monthlyEmploymentCostEur: number;
  /** True si le coût vient du calcul brut horaire + cotisations + ICP (+ repas). */
  monthlyEmploymentCostComputedFromHourly?: boolean;
  computedMonthlyGrossSalaryEur?: number;
  computedMonthlyPatronalChargesEur?: number;
  computedMonthlyIcpEur?: number;
  effectivePatronalRateApplied?: number;
  monthlyHoursForHousehold?: number;
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
  /** Frais annexes saisis (hors Navigo). */
  monthlyAncillaryCostsEur: number;
  /** Pass Navigo employeur — non éligible crédit 199 ; inclus uniquement dans l’effort cash. */
  monthlyNavigoShareEur: number;
  estimatedMonthlyHouseholdCashOutEur: number;
  coFamilleHouseholdCostSharePercent?: number;
  /** Mode CESU substitutes — indicatif (pas de refonte paie). */
  cesuSubstitutionDeltaBrutEur?: number;
  cesuSubstitutionNetSalaryImpactEur?: number;
  cesuNetGainVsSalaryEur?: number;
};

export type NounouDomicileResult = ScenarioResultBase & {
  scenarioSlug: "nounou-domicile";
  trace?: NounouDomicileTrace;
};

function resolveHouseholdShareFraction(input: NounouDomicileInput): number {
  if (input.householdShareFraction !== undefined && input.householdShareFraction !== null) {
    return clamp01(input.householdShareFraction);
  }
  if (
    input.coFamilleHouseholdCostSharePercent !== undefined &&
    input.coFamilleHouseholdCostSharePercent !== null
  ) {
    return clamp01(input.coFamilleHouseholdCostSharePercent / 100);
  }
  return 1;
}

export function computeNounouDomicile(input: NounouDomicileInput): NounouDomicileResult {
  const pack = getRulePack();
  const meta = { rulePackVersion: pack.version, effectiveFrom: pack.effectiveFrom };

  const hourlyRate = input.hourlyGrossRateEur;
  const hasHourly =
    hourlyRate !== undefined && hourlyRate !== null && !Number.isNaN(hourlyRate) && hourlyRate > 0;

  if (
    hourlyRate !== undefined &&
    hourlyRate !== null &&
    !Number.isNaN(hourlyRate) &&
    hourlyRate <= 0
  ) {
    return {
      scenarioSlug: "nounou-domicile",
      status: "stub",
      notes: ["`hourlyGrossRateEur` doit être > 0 si fourni."],
      meta,
    };
  }

  const rawCost = input.monthlyEmploymentCostEur;
  const hasMonthly = rawCost !== undefined && rawCost !== null && !Number.isNaN(rawCost as number);

  let monthlyEmploymentCostEur: number;
  let costComputedFromHourly = false;
  let hourlyComputed: ReturnType<typeof computeNounouEmployerCostFromHourly> | undefined;

  if (hasHourly) {
    const weeklyH = input.weeklyHoursFullTime ?? 40;
    if (weeklyH <= 0 || !Number.isFinite(weeklyH)) {
      return {
        scenarioSlug: "nounou-domicile",
        status: "stub",
        notes: [
          "`weeklyHoursFullTime` doit être > 0 si vous estimez le coût depuis le brut horaire.",
        ],
        meta,
      };
    }
    const share = resolveHouseholdShareFraction(input);
    hourlyComputed = computeNounouEmployerCostFromHourly({
      hourlyGrossRateEur: hourlyRate!,
      weeklyHoursFullTime: weeklyH,
      householdShareFraction: share,
      includeIcp: input.includeIcp !== false,
      monthlyMealAllowanceEur: input.monthlyMealAllowanceEur ?? 0,
    });
    monthlyEmploymentCostEur = hourlyComputed.monthlyEmploymentCostEur;
    costComputedFromHourly = true;
  } else if (hasMonthly) {
    if ((rawCost as number) < 0) {
      return {
        scenarioSlug: "nounou-domicile",
        status: "stub",
        notes: ["`monthlyEmploymentCostEur` doit être ≥ 0."],
        meta,
      };
    }
    monthlyEmploymentCostEur = rawCost as number;
  } else {
    return {
      scenarioSlug: "nounou-domicile",
      status: "stub",
      notes: [
        "Fournir soit `monthlyEmploymentCostEur` (coût employeur mensuel), soit `hourlyGrossRateEur` avec `weeklyHoursFullTime` / part foyer (`householdShareFraction` ou `coFamilleHouseholdCostSharePercent` en co-famille). Puis `monthlyCmgPaidEur` ou `monthlyHouseholdIncomeForCmgEur` pour le CMG.",
      ],
      meta,
    };
  }
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

  const monthlyAncillaryCostsEur = Math.max(0, input.monthlyAncillaryCostsEur ?? 0);
  const monthlyNavigoShareEur = Math.max(0, input.monthlyNavigoShareEur ?? 0);
  const estimatedMonthlyHouseholdCashOutEur =
    netMonthlyBurdenAfterCreditEur + monthlyAncillaryCostsEur + monthlyNavigoShareEur;

  const patronalRateForCesuSubstitution =
    hourlyComputed?.effectivePatronalRateApplied ?? TAUX_PATRONAL_SANS_SANTE_URSSAF_2026;

  const cesuUses = input.prefinancedCesuEmployerUses === true;
  const cesuMonthly = Math.max(0, input.prefinancedCesuMonthlyEur ?? 0);
  const cesuMode = input.prefinancedCesuMode;
  const cesuFrac = clamp01(input.prefinancedCesuAvailableForChildcareFraction ?? 1);
  const effectivePrefinancedCesuMonthlyEur = cesuMonthly * cesuFrac;

  let cesuSubstitutionDeltaBrutEur: number | undefined;
  let cesuSubstitutionNetSalaryImpactEur: number | undefined;
  let cesuNetGainVsSalaryEur: number | undefined;
  if (
    cesuUses &&
    cesuMode === "substitutes_constant_employer_cost" &&
    effectivePrefinancedCesuMonthlyEur > 0
  ) {
    const deltaBrut = effectivePrefinancedCesuMonthlyEur / (1 + patronalRateForCesuSubstitution);
    cesuSubstitutionDeltaBrutEur = Math.round(deltaBrut * 100) / 100;
    const netImpact = deltaBrut * (1 - TAUX_SALARIAL_APPROX_POUR_SUBSTITUTION_CESU);
    cesuSubstitutionNetSalaryImpactEur = Math.round(netImpact * 100) / 100;
    cesuNetGainVsSalaryEur =
      Math.round((effectivePrefinancedCesuMonthlyEur - netImpact) * 100) / 100;
  }

  const totalEmployerOutlayMonthlyEur =
    cesuUses && cesuMode === "on_top"
      ? monthlyEmploymentCostEur + effectivePrefinancedCesuMonthlyEur
      : monthlyEmploymentCostEur;

  const notes: string[] = [
    "Crédit d’impôt **emploi à domicile** (CGI art. 199 sexdecies) — **non cumulable** avec le crédit « frais de garde hors du domicile » (CGI art. 200 quater B) pour les mêmes dépenses.",
    "Calcul partiel : prise en charge partielle des cotisations (50 % dans le pack CMG) et plafonds détaillés non intégrés ligne à ligne — voir `docs/research/`.",
    "Même montant `monthlyEmploymentCostEur` pour CMG et base du crédit 199 — approximation ; base annuelle = coût − CMG puis plafond (voir params.md, Assiette unique).",
  ];
  if (costComputedFromHourly) {
    notes.push(
      "Coût employeur **estimé** depuis le brut horaire + cotisations Urssaf particuliers (min 44,696 % + 5 € vs 47,396 %) + ICP 10 % si activé — voir `params.md` (Pajemploi 2026).",
    );
  }
  if (monthlyNavigoShareEur > 0) {
    notes.push(
      "Pass Navigo (part employeur) : **non** éligible au crédit d’impôt 199 sexdecies — inclus uniquement dans l’effort cash (comme frais annexes). Réf. tarifaire Île-de-France : voir `params.md`.",
    );
  }
  if (input.nounouEmploymentModel === "co_famille") {
    notes.push(
      "Co-famille / plusieurs employeurs : le moteur ne répartit pas automatiquement entre foyers — saisir la **part** de coût et de CMG **de ce foyer**, ou simuler par foyer (voir params.md, Limites).",
    );
  }
  if (
    input.nounouEmploymentModel === "co_famille" &&
    input.coFamilleHouseholdCostSharePercent !== undefined &&
    input.coFamilleHouseholdCostSharePercent !== null
  ) {
    notes.push(
      `Part de coût de ce foyer (co-famille) : ${String(input.coFamilleHouseholdCostSharePercent)} % — lecture seule ; les montants du calcul restent ceux saisis pour ce foyer.`,
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

  notes.push(
    ...appendCesuPrefinanceCmgCompatibilityNotes(pack, {
      prefinancedCesuEmployerUses: cesuUses,
      monthlyCmgEur,
    }),
  );

  if (cesuUses) {
    notes.push(
      "CESU préfinancé employeur : les lignes CMG / crédit d’impôt restent calculées sur `monthlyEmploymentCostEur` (assiette unique). Le **total charge employeur** inclut le CESU **effectif** (pondéré) en plus uniquement si le mode est `on_top` — voir tableau et `params.md`.",
    );
    if (cesuMode === "substitutes_constant_employer_cost") {
      notes.push(NOTE_ARBITRAGE_BRUT_CHARGES_PATRONALES);
      if (
        cesuSubstitutionDeltaBrutEur !== undefined &&
        cesuSubstitutionNetSalaryImpactEur !== undefined &&
        cesuNetGainVsSalaryEur !== undefined
      ) {
        notes.push(
          `Substitution CESU (indicatif) : baisse de brut ≈ ${String(cesuSubstitutionDeltaBrutEur)} € pour un CESU effectif de ${String(effectivePrefinancedCesuMonthlyEur)} € (τ patronal ${String(Math.round(patronalRateForCesuSubstitution * 10000) / 100)} %) ; impact net salarial approx. ${String(cesuSubstitutionNetSalaryImpactEur)} € (taux salarial ${String(TAUX_SALARIAL_APPROX_POUR_SUBSTITUTION_CESU * 100)} %).`,
        );
      }
    }
    notes.push(
      "Déclaration fiscale : le crédit 199 (emploi à domicile) suit la **dépense réelle** déclarée (ex. case 7DR) — ne pas confondre avec un CESU **déclaratif** sur une autre ligne ; le moteur ne substitue pas automatiquement préfinancé vs base crédit.",
    );
  }
  if (monthlyAncillaryCostsEur > 0 || monthlyNavigoShareEur > 0) {
    notes.push(
      "Effort cash total : reste à charge après crédit + frais annexes saisis + part Navigo éventuelle (`monthlyNavigoShareEur`) — hors base crédit 199 pour le Navigo.",
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
      ...(costComputedFromHourly ? { monthlyEmploymentCostComputedFromHourly: true } : {}),
      ...(hourlyComputed
        ? {
            computedMonthlyGrossSalaryEur: hourlyComputed.computedMonthlyGrossSalaryEur,
            computedMonthlyPatronalChargesEur: hourlyComputed.computedMonthlyPatronalChargesEur,
            computedMonthlyIcpEur: hourlyComputed.computedMonthlyIcpEur,
            effectivePatronalRateApplied: hourlyComputed.effectivePatronalRateApplied,
            monthlyHoursForHousehold: hourlyComputed.monthlyHoursForHousehold,
          }
        : {}),
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
      monthlyAncillaryCostsEur,
      monthlyNavigoShareEur,
      estimatedMonthlyHouseholdCashOutEur,
      ...(cesuSubstitutionDeltaBrutEur !== undefined
        ? {
            cesuSubstitutionDeltaBrutEur,
            cesuSubstitutionNetSalaryImpactEur,
            cesuNetGainVsSalaryEur,
          }
        : {}),
      ...(input.coFamilleHouseholdCostSharePercent !== undefined &&
      input.coFamilleHouseholdCostSharePercent !== null
        ? { coFamilleHouseholdCostSharePercent: input.coFamilleHouseholdCostSharePercent }
        : {}),
      ...(input.childcareProviderAcceptsCesu !== undefined
        ? { childcareProviderAcceptsCesu: input.childcareProviderAcceptsCesu }
        : {}),
      ...(satellite ? { creditVsIrBrutSatellite: satellite } : {}),
    },
  };
}
