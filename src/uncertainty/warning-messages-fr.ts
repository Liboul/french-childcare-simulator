/**
 * Libellés FR pour codes stables de `warnings[]` — exploités dans `uncertainty.flags[].messageFr`.
 * Les codes non mappés restent sans `messageFr` (rétrocompat UI).
 */
export const WARNING_CODE_MESSAGE_FR: Readonly<Record<string, string>> = {
  nounou_domicile_shared_employment_align_cmg_with_household_declaration_to_caf:
    "Garde à domicile partagée entre foyers : alignez `cmg.heuresParMois` et les montants déclarés à la CAF sur la part de **ce** foyer (souvent la moitié du contrat total), pas sur le contrat agrégé.",
  employer_childcare_support_differs_from_reference_scenario:
    "Les montants employeur déclaré vs référence diffèrent : l’écart `employerSupportDeltaAnnualEur` sert à **comparer deux hypothèses** ; il **ne réduit pas** le reste à charge affiché (`netHouseholdBurden*`).",
  cesu_prefunded_exceeds_employer_aid_annual_cap:
    "Le préfinancement CESU / chèque emploi service déclaré dépasse le plafond d’aide employeur pris en charge par le moteur pour cette règle : le crédit d’impôt est plafonné en conséquence (voir calcul et `trace`).",
  domicile_complementary_align_cmg_pajemploi_declaration_dr06:
    "Coûts complémentaires à domicile (transport, CP, etc.) : vérifiez l’alignement avec la déclaration PAJE / Pajemploi et la CAF.",
  domicile_transport_navigo_or_forfait_missing_monthly_eur_consult_iledefrance_mobilites:
    "Transport nounou : un forfait autre que « non » est indiqué sans montant mensuel — renseignez `fraisTransportMensuelEur` (tarif officiel Île-de-France Mobilités / Navigo).",
  cmg_psu_or_non_structure_branch_not_modeled:
    "CMG à 0 € avec statut « unsupported » : cette branche (ex. crèche publique / inter-entreprises PSU) **n’est pas calculée** par ce moteur — ce n’est **pas** une conclusion sur vos droits réels ; voir `limitationHints` et la CAF / simulateurs officiels.",
  unexpected_childcare_mode:
    "Mode de garde non pris en charge pour l’estimation CMG dans ce moteur : montant CMG affiché à 0 € — vérifier le mode saisi et la documentation.",
};

export function messageFrForWarningCode(code: string): string | undefined {
  return WARNING_CODE_MESSAGE_FR[code];
}
