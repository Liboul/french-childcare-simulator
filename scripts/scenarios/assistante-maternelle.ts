import { computeAssistanteMaternelle } from "../../src/scenarios/assistante-maternelle/index";
import { renderBilanTableau } from "../../src/scenarios/assistante-maternelle/render-table";

/** Exemple : `{}` pour stub ; ou coût + revenu pour CMG calculé, ou + `monthlyCmgPaidEur`. */
const result = computeAssistanteMaternelle({
  monthlyEmploymentCostEur: 800,
  monthlyHouseholdIncomeForCmgEur: 3000,
  householdChildRank: 1,
});
const tableau = renderBilanTableau(result);
console.log(JSON.stringify({ result, tableau }, null, 2));
