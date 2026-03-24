import { computeAssistanteMaternelle } from "../../src/scenarios/assistante-maternelle/index";
import { renderBilanTableau } from "../../src/scenarios/assistante-maternelle/render-table";

const result = computeAssistanteMaternelle({});
const tableau = renderBilanTableau(result);
console.log(JSON.stringify({ result, tableau }, null, 2));
