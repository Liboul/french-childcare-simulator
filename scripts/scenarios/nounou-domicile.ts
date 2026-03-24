import { computeNounouDomicile } from "../../src/scenarios/nounou-domicile/index";
import { renderBilanTableau } from "../../src/scenarios/nounou-domicile/render-table";

/** Exemple : `{}` pour stub ; ou coût + revenu pour CMG calculé + crédit 199 sexdecies. */
const result = computeNounouDomicile({
  monthlyEmploymentCostEur: 1200,
  monthlyHouseholdIncomeForCmgEur: 3500,
  householdChildRank: 1,
});
const tableau = renderBilanTableau(result);
console.log(JSON.stringify({ result, tableau }, null, 2));
