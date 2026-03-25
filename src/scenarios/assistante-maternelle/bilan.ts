import { findRule } from "../../config/find-rule";
import type { RulePack } from "../../config/schema";
import type { BilanLigne, BilanLigneSource } from "../bilan-table";
import { monthlyEquivalentFromAnnualEur, rulePackReferenceLine } from "../render-common";
import type { AssistanteMaternelleResult } from "./index";

function sourcesFromRule(rule: {
  sources: { id: string; title: string; url: string }[];
}): BilanLigneSource[] {
  return rule.sources.map((s) => ({ id: s.id, title: s.title, url: s.url }));
}

export function buildAssistanteMaternelleLignes(
  result: AssistanteMaternelleResult,
  pack: RulePack,
): BilanLigne[] {
  const t = result.trace;
  if (!t) return [rulePackReferenceLine(pack)];

  const lignes: BilanLigne[] = [rulePackReferenceLine(pack)];

  const cmgRule = findRule(pack, "cmg-emploi-direct-assistante-maternelle-2026-04");
  const creditRule = findRule(pack, "credit-impot-garde-hors-domicile");

  lignes.push({
    libelle: "Coût employeur mensuel (salaire + cotisations)",
    montantEur: t.monthlyEmploymentCostEur,
    calcul: "Saisie utilisateur — montants payés via Pajemploi / attestations (voir `params.md`).",
    sources: [],
  });

  lignes.push({
    libelle: "Complément mode de garde (CMG) — emploi direct",
    montantEur: -t.monthlyCmgEur,
    calcul:
      t.cmgSource === "saisie"
        ? "Montant saisi (avis CAF / MSA)."
        : (t.cmgDetail?.formulaNote ?? "Calcul à partir du pack (formule taux d’effort)."),
    sources: cmgRule ? sourcesFromRule(cmgRule) : [],
  });

  lignes.push({
    libelle: "Trésorerie nette après CMG (estimation)",
    montantEur: t.netMonthlyCashAfterCmgEur,
    calcul: `${String(t.monthlyEmploymentCostEur)} € − ${String(t.monthlyCmgEur)} €`,
    sources: [],
  });

  lignes.push({
    libelle: "Base éligible crédit d’impôt F8 (équivalent mensuel, plafond par enfant)",
    montantEur: monthlyEquivalentFromAnnualEur(t.annualEligibleExpenseForCreditEur),
    calcul: `Éligible annuelle plafonnée ${String(t.annualEligibleExpenseForCreditEur)} € ÷ 12 — aligné sur les autres lignes en €/mois (\`params.md\`, trace).`,
    sources: creditRule ? sourcesFromRule(creditRule) : [],
  });

  lignes.push({
    libelle: "Crédit d’impôt garde hors domicile (équivalent mensuel)",
    montantEur: -t.monthlyCreditEquivalentEur,
    calcul: `Crédit annuel ${String(t.annualCreditGardeHorsDomicileEur)} € ÷ 12 — déduction CMG sur l’assiette (paramètre pack).`,
    sources: creditRule ? sourcesFromRule(creditRule) : [],
  });

  lignes.push({
    libelle: "Effort net mensuel (après crédit d’impôt, équivalent)",
    montantEur: t.netMonthlyBurdenAfterCreditEur,
    calcul: `${String(t.netMonthlyCashAfterCmgEur)} € − ${String(t.monthlyCreditEquivalentEur)} €`,
    sources: creditRule ? sourcesFromRule(creditRule) : [],
  });

  if (t.prefinancedCesuEmployerUses === true) {
    lignes.push({
      libelle: "CESU préfinancé employeur (information)",
      montantEur: 0,
      calcul:
        "Saisie utilisateur — si CMG > 0, vérifier non-cumul / dossier CAF (règle pack `cesu-cmg-non-cumul`, voir notes du résultat).",
      sources: [],
    });
  }

  lignes.push({
    libelle: "Frais annexes (repas, transport, etc. — estimation)",
    montantEur: t.monthlyAncillaryCostsEur,
    calcul: "Saisie `monthlyAncillaryCostsEur`.",
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
