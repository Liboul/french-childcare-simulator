import type { FrenchIncomeTaxEstimate2026 } from "../income-tax/estimate-fr-2026";
import type { LimitationHint } from "./types";

const URL_QF = "https://www.service-public.gouv.fr/particuliers/vosdroits/F2705";
const URL_IR_BARÈME = "https://www.service-public.gouv.fr/particuliers/vosdroits/F1419";

export function buildIncomeTaxLimitationHints(
  estimate: FrenchIncomeTaxEstimate2026 | null,
): LimitationHint[] {
  if (estimate == null) return [];
  const hints: LimitationHint[] = [
    {
      code: "income_tax_quotient_familial_plafond_non_modele",
      messageFr:
        "Le plafonnement du quotient familial (CGI art. 197, I-2) n’est pas modélisé : l’impôt estimé et la TMI peuvent surestimer l’allègement réel pour certains foyers avec enfants.",
      docUrl: URL_QF,
    },
  ];
  if (estimate.decoteAnnualEur > 0) {
    hints.push({
      code: "income_tax_decote_zone_effet_marginal",
      messageFr:
        "Décote applicable : la TMI affichée peut sous-estimer l’effet marginal réel sur l’impôt (zone non linéaire, DR-07 § 3.4).",
      docUrl: URL_IR_BARÈME,
    });
  }
  return hints;
}
