import { NOTE_ARBITRAGE_BRUT_CHARGES_PATRONALES } from "../../shared/employer-brut-vs-charges-patronales-note";
import { findRule } from "../../config/find-rule";
import type { RulePack } from "../../config/schema";
import type { BilanLigne, BilanLigneSource } from "../bilan-table";
import { monthlyEquivalentFromAnnualEur, rulePackReferenceLine } from "../render-common";
import type { CrecheBerceauEmployeurResult } from "./index";

function sourcesFromRule(rule: {
  sources: { id: string; title: string; url: string }[];
}): BilanLigneSource[] {
  return rule.sources.map((s) => ({ id: s.id, title: s.title, url: s.url }));
}

export function buildCrecheBerceauEmployeurLignes(
  result: CrecheBerceauEmployeurResult,
  pack: RulePack,
): BilanLigne[] {
  const t = result.trace;
  if (!t) return [rulePackReferenceLine(pack)];

  const lignes: BilanLigne[] = [rulePackReferenceLine(pack)];

  const creditRule = findRule(pack, "credit-impot-garde-hors-domicile");
  const cmgRule = findRule(pack, "cmg-structure-montants-mensuels-jusquau-2026-03-31");
  const avantageRule = findRule(pack, "avantage-employeur-creche-seuil-exoneration");
  const cesuRule = findRule(pack, "cesu-prefinance-plafond-aide-financiere-employeur");

  lignes.push({
    libelle: "Participation familiale (facture / mois)",
    montantEur: t.monthlyParticipationEur,
    calcul:
      "Saisie utilisateur — part payée par le foyer (après PSU / aides locales ; cohérence avec CMG).",
    sources: [],
  });

  lignes.push({
    libelle: "Complément mode de garde (CMG) — structure",
    montantEur: -t.monthlyCmgStructureEur,
    calcul:
      t.monthlyCmgStructureEur > 0
        ? "Saisie utilisateur (montant mensuel CMG structure)."
        : "Non renseigné ou déjà inclus dans la participation (mettre 0).",
    sources: cmgRule ? sourcesFromRule(cmgRule) : [],
  });

  lignes.push({
    libelle: "Trésorerie nette après CMG (estimation)",
    montantEur: t.netMonthlyCashAfterCmgEur,
    calcul: `${String(t.monthlyParticipationEur)} € − ${String(t.monthlyCmgStructureEur)} €`,
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
    libelle: "Aide employeur (annuelle, saisie)",
    montantEur: 0,
    calcul: `${String(t.annualEmployerChildcareAidEur)} € / an — prise en charge par l’employeur pour la garde (montant 0 € sur la ligne : information ; voir seuil ci-dessous).`,
    sources: [],
  });

  if (t.prefinancedCesuEmployerUses) {
    const modeLabel =
      t.prefinancedCesuMode === "on_top"
        ? "CESU en plus de l’aide annuelle saisie"
        : "arbitrage : l’aide saisie reflète déjà l’enveloppe (CESU inclus dans la convention)";
    const fracNote =
      t.prefinancedCesuAvailableForChildcareFraction < 1
        ? ` Part garde ${String(Math.round(t.prefinancedCesuAvailableForChildcareFraction * 1000) / 10)} %.`
        : "";
    lignes.push({
      libelle: "Chèques CESU préfinancés employeur (annuel, effectif garde)",
      montantEur: 0,
      calcul: `${String(t.effectivePrefinancedCesuAnnualEur)} € / an effectifs — ${modeLabel}${fracNote} Brut saisi : ${String(t.prefinancedCesuAnnualEur)} €. Seuil social : lignes ci-dessous sur ` + "`annualEmployerChildcareAidEur` seul.",
      sources: cesuRule ? sourcesFromRule(cesuRule) : [],
    });
    lignes.push({
      libelle: "Total soutien employeur estimé (aide déclarée + CESU si « en plus »)",
      montantEur: 0,
      calcul: `${String(t.totalEmployerChildcareSupportAnnualEur)} € / an — lecture ; ne modifie pas le crédit F8 famille.`,
      sources: [],
    });
  }

  if (t.employerAidSalaryTaxableExcessApplies) {
    lignes.push({
      libelle: "Seuil exonération employeur (part non imposable, annuel)",
      montantEur: 0,
      calcul: `Part dans la limite ${String(t.employerThresholdChildrenCount)} enfant(s) × seuil pack = ${String(t.employerExemptPortionAnnualEur)} € exonérés (règle avantage-employeur-creche-seuil-exoneration).`,
      sources: avantageRule?.sources?.length ? sourcesFromRule(avantageRule) : [],
    });

    lignes.push({
      libelle: "Excédent d’aide employeur (imposable en salaire, estimation annuelle)",
      montantEur: Math.round((t.employerTaxableExcessAnnualEur / 12) * 100) / 100,
      calcul: `${String(t.employerTaxableExcessAnnualEur)} € / an au-delà du seuil — équivalent mensuel pour lecture (pas une charge de trésorerie).`,
      sources: avantageRule?.sources?.length ? sourcesFromRule(avantageRule) : [],
    });
  } else {
    lignes.push({
      libelle: "Excédent imposable salaire (modèle seuil désactivé)",
      montantEur: 0,
      calcul:
        "Saisie `employerAidSalaryTaxableExcessApplies: false` — pas d’excédent imposable en salaire modélisé (ex. crédit d’impôt famille entreprise, prise en charge non traitée comme avantage imposable pour le salarié). Valider convention / paie. Le montant `annualEmployerChildcareAidEur` reste une information sur la prise en charge versée à la structure.",
      sources: [],
    });
  }

  if (t.annualEmployerNetCostAfterCifEur !== undefined) {
    lignes.push({
      libelle: "Coût employeur après CIF (saisie, information)",
      montantEur: 0,
      calcul: `${String(t.annualEmployerNetCostAfterCifEur)} € / an — coût réel estimé employeur après crédit d’impôt famille (ou équivalent) ; à arbitrer avec le brut pour neutralité coût employeur (la baisse de brut **ne** coïncide **pas** euro pour euro avec ce montant ni avec la facture crèche : voir ligne suivante). Distinct de \`annualEmployerChildcareAidEur\` (versement / engagement côté structure).`,
      sources: [],
    });
  }

  const brutPatronalBilanApplies =
    !t.employerAidSalaryTaxableExcessApplies ||
    t.annualEmployerNetCostAfterCifEur !== undefined ||
    (t.prefinancedCesuEmployerUses && t.prefinancedCesuMode === "substitutes_constant_employer_cost");
  if (brutPatronalBilanApplies) {
    lignes.push({
      libelle: "Arbitrage brut / cotisations patronales (information)",
      montantEur: 0,
      calcul: NOTE_ARBITRAGE_BRUT_CHARGES_PATRONALES,
      sources: [],
    });
  }

  lignes.push({
    libelle: "Base éligible crédit d’impôt F8 (équivalent mensuel, plafond par enfant)",
    montantEur: monthlyEquivalentFromAnnualEur(t.annualEligibleExpenseForCreditEur),
    calcul: `Éligible annuelle plafonnée ${String(t.annualEligibleExpenseForCreditEur)} € ÷ 12 — ${String(t.childrenCount)} enfant(s), garde ${t.custody === "full" ? "classique" : "alternée"} — aligné sur les autres lignes en €/mois (\`params.md\`, trace).`,
    sources: creditRule ? sourcesFromRule(creditRule) : [],
  });

  lignes.push({
    libelle: "Crédit d’impôt garde hors domicile (équivalent mensuel)",
    montantEur: -t.monthlyCreditEquivalentEur,
    calcul: `Crédit annuel ${String(t.annualCreditGardeHorsDomicileEur)} € ÷ 12`,
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
    calcul: "Saisie `monthlyAncillaryCostsEur` — hors F8 si non éligibles.",
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
