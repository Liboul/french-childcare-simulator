import { findRule } from "../../config/find-rule";
import type { RulePack } from "../../config/schema";
import type { BilanLigne, BilanLigneSource } from "../bilan-table";
import { rulePackReferenceLine } from "../render-common";
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
    libelle: "Plafond dépenses annuelles (crédit emploi à domicile)",
    montantEur: 0,
    calcul: `Plafond retenu = ${String(t.annualCeilingExpenseForCreditEur)} € / an (majorations enfants selon saisie)`,
    sources: creditRule ? sourcesFromRule(creditRule) : [],
  });

  lignes.push({
    libelle: "Dépenses éligibles au crédit d’impôt (année, après déduction CMG)",
    montantEur: 0,
    calcul: `Éligible annuelle = ${String(t.annualEligibleExpenseForCreditEur)} €`,
    sources: creditRule ? sourcesFromRule(creditRule) : [],
  });

  lignes.push({
    libelle: "Crédit d’impôt emploi à domicile (équivalent mensuel)",
    montantEur: -t.monthlyCreditEquivalentEur,
    calcul: `Crédit annuel ${String(t.annualCreditEmploiDomicileEur)} € ÷ 12 — taux 50 % du pack (règle credit-impot-emploi-domicile-plafonds).`,
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
