import { getRulePack } from "../../shared/load-rules";
import type { BilanTableau } from "../bilan-table";
import { baseBilanLignes } from "../render-common";
import { buildAssistanteMaternelleLignes } from "./bilan";
import type { AssistanteMaternelleResult } from "./index";

export function renderBilanTableau(result: AssistanteMaternelleResult): BilanTableau {
  const pack = getRulePack();
  if (result.status === "stub") {
    return {
      scenarioSlug: result.scenarioSlug,
      periode: "mois",
      lignes: baseBilanLignes(result, pack),
    };
  }
  return {
    scenarioSlug: result.scenarioSlug,
    periode: "mois",
    lignes: buildAssistanteMaternelleLignes(result, pack),
  };
}
