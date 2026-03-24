import { describe, expect, it } from "bun:test";
import { computeAssistanteMaternelle } from "./assistante-maternelle/index";
import { renderBilanTableau as renderAssistanteMaternelle } from "./assistante-maternelle/render-table";
import { computeCrecheBerceauEmployeur } from "./creche-berceau-employeur/index";
import { renderBilanTableau as renderCrecheBerceau } from "./creche-berceau-employeur/render-table";
import { computeCrechePublique } from "./creche-publique/index";
import { renderBilanTableau as renderCrechePublique } from "./creche-publique/render-table";
import { computeNounouDomicile } from "./nounou-domicile/index";
import { renderBilanTableau as renderNounou } from "./nounou-domicile/render-table";
import { SCENARIO_SLUGS } from "./registry";

describe("scenarios stub (GARDE-005)", () => {
  it("registry lists four slugs", () => {
    expect(SCENARIO_SLUGS).toHaveLength(4);
  });

  it("creche publique compute + render", () => {
    const r = computeCrechePublique({});
    expect(r.status).toBe("stub");
    const t = renderCrechePublique(r);
    expect(t.scenarioSlug).toBe("creche-publique");
    expect(t.lignes.length).toBeGreaterThan(0);
  });

  it("creche berceau employeur compute + render", () => {
    const r = computeCrecheBerceauEmployeur({});
    const t = renderCrecheBerceau(r);
    expect(t.scenarioSlug).toBe("creche-berceau-employeur");
  });

  it("assistante maternelle compute + render", () => {
    const r = computeAssistanteMaternelle({});
    const t = renderAssistanteMaternelle(r);
    expect(t.scenarioSlug).toBe("assistante-maternelle");
  });

  it("nounou domicile compute + render", () => {
    const r = computeNounouDomicile({});
    const t = renderNounou(r);
    expect(t.scenarioSlug).toBe("nounou-domicile");
  });
});
