import type { BilanTableau } from "../bilan-table";
import type { NounouDomicileResult } from "./index";

export function renderBilanTableau(result: NounouDomicileResult): BilanTableau {
  return {
    scenarioSlug: result.scenarioSlug,
    periode: "mois",
    lignes: [
      {
        libelle: "Placeholder — reste à charge (stub)",
        montantEur: 0,
        calcul: "0 (moteur non branché)",
        sources: [],
      },
    ],
  };
}
