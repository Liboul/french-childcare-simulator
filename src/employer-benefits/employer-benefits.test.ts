import { describe, expect, it } from "vitest";
import rulesFr2026 from "../../config/rules.fr-2026.json" with { type: "json" };
import { parseRulePack } from "../config/parse";
import { evaluateCesuDeclaratifVsCmg } from "./cesu-cmg-gate";
import { splitEmployerCrecheSubsidyAnnualPerChild } from "./creche-subsidy";
import { describeEmployerPrefundedCesuAnnual } from "./prefunded-cesu";

const packResult = parseRulePack(rulesFr2026);
if (!packResult.ok) {
  throw new Error(packResult.error);
}
const pack = packResult.data;

describe("splitEmployerCrecheSubsidyAnnualPerChild", () => {
  it("2000 € pour un enfant → 1830 exempt + 170 imposable", () => {
    const r = splitEmployerCrecheSubsidyAnnualPerChild(pack, [2000]);
    expect(r.exemptAnnualTotalEur).toBe(1830);
    expect(r.taxableFringeAnnualTotalEur).toBe(170);
    expect(r.perChild[0]!.exemptEur).toBe(1830);
    expect(r.perChild[0]!.taxableFringeEur).toBe(170);
  });

  it("deux enfants [2000, 500] → exempt 2330, taxable 170", () => {
    const r = splitEmployerCrecheSubsidyAnnualPerChild(pack, [2000, 500]);
    expect(r.exemptAnnualTotalEur).toBe(2330);
    expect(r.taxableFringeAnnualTotalEur).toBe(170);
  });
});

describe("evaluateCesuDeclaratifVsCmg", () => {
  it("CMG + CESU déclaratif → incompatible", () => {
    const r = evaluateCesuDeclaratifVsCmg(pack, {
      receivesCmgOrSimilarChildcareAid: true,
      usesCesuDeclaratifForSameChildcare: true,
    });
    expect(r.compatible).toBe(false);
    expect(r.messageKey).toBe("cesu_cmg_non_cumul_dr03");
  });

  it("CMG seul → compatible", () => {
    const r = evaluateCesuDeclaratifVsCmg(pack, {
      receivesCmgOrSimilarChildcareAid: true,
      usesCesuDeclaratifForSameChildcare: false,
    });
    expect(r.compatible).toBe(true);
  });
});

describe("describeEmployerPrefundedCesuAnnual", () => {
  it("expose la réduction d’assiette future", () => {
    const r = describeEmployerPrefundedCesuAnnual(pack, 1200);
    expect(r.annualAmountEur).toBe(1200);
    expect(r.reducesEmploymentTaxCreditBase).toBe(true);
    expect(r.ruleIds).toContain("cesu-cmg-non-cumul");
  });
});
