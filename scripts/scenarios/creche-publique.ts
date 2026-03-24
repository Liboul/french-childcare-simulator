import { computeCrechePublique } from "../../src/scenarios/creche-publique/index";
import { renderBilanTableau } from "../../src/scenarios/creche-publique/render-table";

const result = computeCrechePublique({});
const tableau = renderBilanTableau(result);
console.log(JSON.stringify({ result, tableau }, null, 2));
