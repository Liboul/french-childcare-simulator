import { findRule } from "../config/find-rule";
import type { RulePack } from "../config/schema";
import type { BilanLigne, BilanLigneSource } from "./bilan-table";
import type { ScenarioResultBase } from "./types";

function sourcesFromRule(rule: {
  sources: { id: string; title: string; url: string }[];
}): BilanLigneSource[] {
  return rule.sources.map((s) => ({ id: s.id, title: s.title, url: s.url }));
}

/** Ligne unique « pack version » (réutilisable par scénario métier). */
export function rulePackReferenceLine(pack: RulePack): BilanLigne {
  return {
    libelle: "Pack de règles (référence)",
    montantEur: 0,
    calcul: `version=${pack.version}, effectiveFrom=${pack.effectiveFrom}`,
    sources: [],
  };
}

/** Lignes communes : référence pack + SMIC (référence nationale) + placeholder métier. */
export function baseBilanLignes(result: ScenarioResultBase, pack: RulePack): BilanLigne[] {
  const lignes: BilanLigne[] = [rulePackReferenceLine(pack)];

  const smic = findRule(pack, "tarif-smic-horaire-metropole-2026");
  if (smic) {
    const hourly = smic.parameters?.hourlyGrossEur;
    lignes.push({
      libelle: smic.label,
      montantEur: typeof hourly === "number" ? hourly : 0,
      calcul:
        typeof hourly === "number"
          ? `hourlyGrossEur = ${String(hourly)} €/h (paramètre pack)`
          : "paramètre hourlyGrossEur absent",
      sources: sourcesFromRule(smic),
    });
  }

  lignes.push({
    libelle: "Reste à charge / garde — à modéliser",
    montantEur: 0,
    calcul:
      result.status === "stub"
        ? "0 € — moteur métier du scénario non encore branché sur le pack"
        : "voir stories suivantes",
    sources: [],
  });

  return lignes;
}
