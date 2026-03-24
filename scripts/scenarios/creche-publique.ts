import { computeCrechePublique } from "../../src/scenarios/creche-publique/index";
import { renderBilanTableau } from "../../src/scenarios/creche-publique/render-table";

/** Exemple : ajuster les montants ou `{}` pour le mode stub (sans participation). */
const result = computeCrechePublique({
  monthlyParticipationEur: 300,
  monthlyCmgStructureEur: 50,
});
const tableau = renderBilanTableau(result);
console.log(JSON.stringify({ result, tableau }, null, 2));
