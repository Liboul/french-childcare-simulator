import { getRulePack } from "../../shared/load-rules";
import type { BilanTableau } from "../bilan-table";
import { baseBilanLignes } from "../render-common";
import type { NounouDomicileResult } from "./index";

export function renderBilanTableau(result: NounouDomicileResult): BilanTableau {
  const pack = getRulePack();
  return {
    scenarioSlug: result.scenarioSlug,
    periode: "mois",
    lignes: baseBilanLignes(result, pack),
  };
}
