import { getRulePack } from "../../shared/load-rules";
import type { BilanTableau } from "../bilan-table";
import { baseBilanLignes } from "../render-common";
import { buildCrecheBerceauEmployeurLignes } from "./bilan";
import type { CrecheBerceauEmployeurResult } from "./index";

export function renderBilanTableau(result: CrecheBerceauEmployeurResult): BilanTableau {
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
    lignes: buildCrecheBerceauEmployeurLignes(result, pack),
  };
}
