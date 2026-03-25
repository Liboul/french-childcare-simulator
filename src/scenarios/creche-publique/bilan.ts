import { findRule } from "../../config/find-rule";
import type { RulePack } from "../../config/schema";
import type { BilanLigne, BilanLigneSource } from "../bilan-table";
import { monthlyEquivalentFromAnnualEur, rulePackReferenceLine } from "../render-common";
import type { CrechePubliqueResult } from "./index";

function sourcesFromRule(rule: {
  sources: { id: string; title: string; url: string }[];
}): BilanLigneSource[] {
  return rule.sources.map((s) => ({ id: s.id, title: s.title, url: s.url }));
}

export function buildCrechePubliqueLignes(
  result: CrechePubliqueResult,
  pack: RulePack,
): BilanLigne[] {
  const t = result.trace;
  if (!t) return [rulePackReferenceLine(pack)];

  const lignes: BilanLigne[] = [rulePackReferenceLine(pack)];

  const creditRule = findRule(pack, "credit-impot-garde-hors-domicile");
  const cmgRule = findRule(pack, "cmg-structure-montants-mensuels-jusquau-2026-03-31");

  lignes.push({
    libelle: "Participation familiale (facture / mois)",
    montantEur: t.monthlyParticipationEur,
    calcul:
      "Saisie utilisateur — montant payé ou dû au titre de la garde en structure (voir `params.md` : cohérence avec la CMG).",
    sources: [],
  });

  if (t.childcareProviderAcceptsCesu !== undefined) {
    lignes.push({
      libelle: "Paiement par CESU accepté par la crèche",
      montantEur: 0,
      calcul: t.childcareProviderAcceptsCesu
        ? "Oui — information trésorerie (hors F8)."
        : "Non — autre moyen pour la participation.",
      sources: [],
    });
  }

  lignes.push({
    libelle: "Complément mode de garde (CMG) — structure",
    montantEur: -t.monthlyCmgStructureEur,
    calcul:
      t.monthlyCmgStructureEur > 0
        ? "Saisie utilisateur (montant mensuel versé par la CAF / MSA pour ce mode) — vérifier avis d’allocations."
        : "Non renseigné ou déjà inclus dans la participation (mettre 0).",
    sources: cmgRule ? sourcesFromRule(cmgRule) : [],
  });

  lignes.push({
    libelle: "Trésorerie nette après CMG (estimation)",
    montantEur: t.netMonthlyCashAfterCmgEur,
    calcul: `${String(t.monthlyParticipationEur)} € − ${String(t.monthlyCmgStructureEur)} € (CMG versée en réduction de charge)`,
    sources: [],
  });

  lignes.push({
    libelle: "Base éligible crédit d’impôt (équivalent mensuel, plafond par enfant)",
    montantEur: monthlyEquivalentFromAnnualEur(t.annualEligibleExpenseForCreditEur),
    calcul: `Éligible annuelle plafonnée ${String(t.annualEligibleExpenseForCreditEur)} € ÷ 12 — ${String(t.childrenCount)} enfant(s), garde ${t.custody === "full" ? "classique" : "alternée"} — aligné sur les autres lignes en €/mois (\`params.md\`, trace).`,
    sources: creditRule ? sourcesFromRule(creditRule) : [],
  });

  lignes.push({
    libelle: "Crédit d’impôt garde hors domicile (équivalent mensuel)",
    montantEur: -t.monthlyCreditEquivalentEur,
    calcul: `Crédit annuel ${String(t.annualCreditGardeHorsDomicileEur)} € ÷ 12 — taux et plafonds issus du pack (règle credit-impot-garde-hors-domicile).`,
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
    calcul:
      "Saisie `monthlyAncillaryCostsEur` — hors plafond F8 si la facture ne les intègre pas ou s’ils ne sont pas éligibles.",
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
