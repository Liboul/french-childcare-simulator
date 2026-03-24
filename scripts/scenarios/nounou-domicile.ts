import { computeNounouDomicile } from "../../src/scenarios/nounou-domicile/index";
import { renderBilanTableau } from "../../src/scenarios/nounou-domicile/render-table";

const result = computeNounouDomicile({});
const tableau = renderBilanTableau(result);
console.log(JSON.stringify({ result, tableau }, null, 2));
