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
  const creditPackParams = readCreditEmploiDomicileParams(pack);
  const creditRateLabel = creditPackParams
    ? `taux ${String(Math.round(creditPackParams.rate * 1000) / 10)} % (règle credit-impot-emploi-domicile-plafonds)`
    : "taux du pack";

  lignes.push({
    libelle: "Coût employeur mensuel (salaire + cotisations)",
    montantEur: t.monthlyEmploymentCostEur,
    calcul: "Saisie utilisateur — Pajemploi / attestations fiscales.",
    sources: [],
  });

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

  return lignes;
}
