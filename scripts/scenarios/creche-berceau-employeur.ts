import { computeCrecheBerceauEmployeur } from "../../src/scenarios/creche-berceau-employeur/index";
import { renderBilanTableau } from "../../src/scenarios/creche-berceau-employeur/render-table";

const result = computeCrecheBerceauEmployeur({
  monthlyParticipationEur: 280,
  monthlyCmgStructureEur: 40,
  annualEmployerChildcareAidEur: 2000,
});
const tableau = renderBilanTableau(result);
console.log(JSON.stringify({ result, tableau }, null, 2));
