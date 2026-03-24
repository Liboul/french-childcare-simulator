import type { BilanTableau } from "../bilan-table";
import type { CrechePubliqueResult } from "./index";

export function renderBilanTableau(result: CrechePubliqueResult): BilanTableau {
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
