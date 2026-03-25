import { NOTE_ARBITRAGE_BRUT_CHARGES_PATRONALES } from "../../shared/employer-brut-vs-charges-patronales-note";
import { findRule } from "../../config/find-rule";
import type { RulePack } from "../../config/schema";
import { readCreditEmploiDomicileParams } from "../../shared/credit-emploi-domicile";
import type { BilanLigne, BilanLigneSource } from "../bilan-table";
import { monthlyEquivalentFromAnnualEur, rulePackReferenceLine } from "../render-common";
import type { NounouDomicileResult } from "./index";

function sourcesFromRule(rule: {
  sources: { id: string; title: string; url: string }[];
}): BilanLigneSource[] {
  return rule.sources.map((s) => ({ id: s.id, title: s.title, url: s.url }));
}

export function buildNounouDomicileLignes(
  result: NounouDomicileResult,
  pack: RulePack,
): BilanLigne[] {
  const t = result.trace;
  if (!t) return [rulePackReferenceLine(pack)];

  const lignes: BilanLigne[] = [rulePackReferenceLine(pack)];

  const cmgRule = findRule(pack, "cmg-emploi-direct-garde-domicile-2026-04");
  const creditRule = findRule(pack, "credit-impot-emploi-domicile-plafonds");
  const cesuRule = findRule(pack, "cesu-prefinance-plafond-aide-financiere-employeur");
  const creditPackParams = readCreditEmploiDomicileParams(pack);
  const creditRateLabel = creditPackParams
    ? `taux ${String(Math.round(creditPackParams.rate * 1000) / 10)} % (règle credit-impot-emploi-domicile-plafonds)`
    : "taux du pack";

  lignes.push({
    libelle: "Coût employeur mensuel (salaire + cotisations)",
    montantEur: t.monthlyEmploymentCostEur,
    calcul: t.prefinancedCesuEmployerUses
      ? "Saisie — assiette CMG / crédit 199 (voir mode CESU : en plus ou arbitrage même enveloppe)."
      : "Saisie utilisateur — Pajemploi / attestations fiscales.",
    sources: [],
  });

  if (t.nounouEmploymentModel !== undefined) {
    lignes.push({
      libelle: "Modèle d’emploi (nounou)",
      montantEur: 0,
      calcul:
        t.nounouEmploymentModel === "co_famille"
          ? "Co-famille / plusieurs employeurs — saisir la part de **ce** foyer (voir params.md)."
          : "Un seul employeur pour ce contrat — coûts du foyer courant.",
      sources: [],
    });
  }

  if (t.coFamilleHouseholdCostSharePercent !== undefined) {
    lignes.push({
      libelle: "Part de coût de ce foyer (co-famille, %)",
      montantEur: 0,
      calcul: `${String(t.coFamilleHouseholdCostSharePercent)} % — information lecture ; pas de répartition automatique des montants.`,
      sources: [],
    });
  }

  if (t.childcareProviderAcceptsCesu !== undefined) {
    lignes.push({
      libelle: "Paiement par CESU accepté par l’employé / la garde",
      montantEur: 0,
      calcul: t.childcareProviderAcceptsCesu
        ? "Oui — information trésorerie (hors assiette CMG / crédit)."
        : "Non — autre moyen de paiement pour le salaire.",
      sources: [],
    });
  }

  if (t.prefinancedCesuEmployerUses) {
    const modeLabel =
      t.prefinancedCesuMode === "on_top"
        ? "en plus du coût saisi (charge employeur totale = coût + CESU effectif)"
        : "arbitrage : le coût saisi est l’enveloppe employeur totale (CESU compris dans la logique contractuelle)";
    const fracNote =
      t.prefinancedCesuAvailableForChildcareFraction < 1
        ? ` — part garde ${String(Math.round(t.prefinancedCesuAvailableForChildcareFraction * 1000) / 10)} % (autres usages des chèques).`
        : "";
    lignes.push({
      libelle: "Chèques CESU préfinancés (employeur, mois, effectif)",
      montantEur: t.effectivePrefinancedCesuMonthlyEur,
      calcul: `${modeLabel}${fracNote} Brut CESU saisi : ${String(t.prefinancedCesuMonthlyEur)} €.`,
      sources: cesuRule ? sourcesFromRule(cesuRule) : [],
    });
    lignes.push({
      libelle: "Total charge employeur estimée (avec CESU si « en plus »)",
      montantEur: t.totalEmployerOutlayMonthlyEur,
      calcul: `${String(t.monthlyEmploymentCostEur)} € + CESU effectif si mode on_top — sinon égal au coût saisi (substitutes).`,
      sources: [],
    });
    if (t.prefinancedCesuMode === "substitutes_constant_employer_cost") {
      lignes.push({
        libelle: "Arbitrage brut / cotisations patronales (information)",
        montantEur: 0,
        calcul: NOTE_ARBITRAGE_BRUT_CHARGES_PATRONALES,
        sources: [],
      });
    }
  }

  lignes.push({
    libelle: "Complément mode de garde (CMG) — emploi direct garde à domicile",
    montantEur: -t.monthlyCmgEur,
    calcul:
      t.cmgSource === "saisie"
        ? "Montant saisi (avis CAF / MSA)."
        : (t.cmgDetail?.formulaNote ?? "Calcul à partir du pack."),
    sources: cmgRule ? sourcesFromRule(cmgRule) : [],
  });

  lignes.push({
    libelle: "Trésorerie nette après CMG (estimation)",
    montantEur: t.netMonthlyCashAfterCmgEur,
    calcul: `${String(t.monthlyEmploymentCostEur)} € − ${String(t.monthlyCmgEur)} €`,
    sources: [],
  });

  lignes.push({
    libelle: "Plafond dépenses (crédit emploi à domicile, équivalent mensuel)",
    montantEur: monthlyEquivalentFromAnnualEur(t.annualCeilingExpenseForCreditEur),
    calcul: `Plafond annuel retenu ${String(t.annualCeilingExpenseForCreditEur)} € ÷ 12 — majorations selon saisie (voir params.md).`,
    sources: creditRule ? sourcesFromRule(creditRule) : [],
  });

  lignes.push({
    libelle: "Base éligible crédit 199 sexdecies (équivalent mensuel, après CMG)",
    montantEur: monthlyEquivalentFromAnnualEur(t.annualEligibleExpenseForCreditEur),
    calcul: `Éligible annuelle plafonnée ${String(t.annualEligibleExpenseForCreditEur)} € ÷ 12 — coût employeur − CMG puis plafond (voir params.md).`,
    sources: creditRule ? sourcesFromRule(creditRule) : [],
  });

  lignes.push({
    libelle: "Crédit d’impôt emploi à domicile (équivalent mensuel)",
    montantEur: -t.monthlyCreditEquivalentEur,
    calcul: `Crédit annuel ${String(t.annualCreditEmploiDomicileEur)} € ÷ 12 — ${creditRateLabel}.`,
    sources: creditRule ? sourcesFromRule(creditRule) : [],
  });

  lignes.push({
    libelle: "Effort net mensuel (après crédit d’impôt, équivalent)",
    montantEur: t.netMonthlyBurdenAfterCreditEur,
    calcul: `${String(t.netMonthlyCashAfterCmgEur)} € − ${String(t.monthlyCreditEquivalentEur)} €`,
    sources: creditRule ? sourcesFromRule(creditRule) : [],
  });

  lignes.push({
    libelle: "Frais annexes (repas, transport, etc. — estimation)",
    montantEur: t.monthlyAncillaryCostsEur,
    calcul: "Saisie `monthlyAncillaryCostsEur` — hors plafond crédit 199 si non éligibles.",
    sources: [],
  });

  lignes.push({
    libelle: "Effort total estimé (ménage, après crédit + annexes)",
    montantEur: t.estimatedMonthlyHouseholdCashOutEur,
    calcul: `${String(t.netMonthlyBurdenAfterCreditEur)} € + ${String(t.monthlyAncillaryCostsEur)} €`,
    sources: [],
  });

  return lignes;
}
