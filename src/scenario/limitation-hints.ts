import type { CmgEstimateStatus } from "../family-allowances/cmg/types";
import type { ChildcareMode } from "../childcare/model";
import type { LimitationHint } from "./types";

const URL_CMG_STRUCTURE = "https://www.service-public.fr/particuliers/vosdroits/F345";
const URL_CMG_EMPLOI_DIRECT = "https://www.service-public.fr/particuliers/vosdroits/F39152";

export function buildLimitationHints(args: {
  mode: ChildcareMode;
  cmgStatus: CmgEstimateStatus;
  cmgWarnings: readonly string[];
}): LimitationHint[] {
  const hints: LimitationHint[] = [];
  const seen = new Set<string>();

  const push = (h: LimitationHint) => {
    if (seen.has(h.code)) return;
    seen.add(h.code);
    hints.push(h);
  };

  if (args.cmgStatus === "unsupported") {
    if (args.mode === "creche_publique") {
      push({
        code: "cmg_creche_publique_psu_non_modele",
        messageFr:
          "La CMG / complément de frais pour crèche publique (PSU, tarification) n’est pas modélisé ici : le statut CMG est « unsupported » et le montant est 0 € **dans ce calcul uniquement**. Cela ne signifie pas que vous n’avez aucune aide en réalité — se renseigner auprès de la CAF / simulateurs officiels.",
        docUrl: URL_CMG_STRUCTURE,
      });
    } else if (args.mode === "creche_inter_entreprises") {
      push({
        code: "cmg_creche_inter_entreprises_non_modele",
        messageFr:
          "La branche CMG pour crèche inter-entreprises n’est pas intégrée au moteur : CMG affichée à 0 € avec statut « unsupported » **dans ce calcul**. Ne pas interpréter comme absence d’aide réelle sans vérification CAF.",
        docUrl: URL_CMG_STRUCTURE,
      });
    } else if (args.cmgWarnings.includes("cmg_psu_or_non_structure_branch_not_modeled")) {
      push({
        code: "cmg_branche_structure_non_modelee",
        messageFr:
          "Branche CMG non modélisée pour ce mode dans ce moteur : le montant affiché est 0 € par **limitation du modèle**, pas comme preuve d’inéligibilité — consulter `warnings` / `uncertainty.flags` et la CAF.",
        docUrl: URL_CMG_STRUCTURE,
      });
    } else if (args.cmgWarnings.includes("unexpected_childcare_mode")) {
      push({
        code: "cmg_mode_inattendu",
        messageFr: "Mode de garde inattendu pour l’estimation CMG.",
      });
    }
  }

  if (args.cmgStatus === "ineligible") {
    push({
      code: "cmg_ineligible_parametres",
      messageFr:
        "CMG à 0 € avec statut « ineligible » selon les paramètres fournis (revenus, âge, structure, etc.). Vérifier sur caf.fr ou en agence.",
      docUrl: URL_CMG_EMPLOI_DIRECT,
    });
  }

  return hints;
}
