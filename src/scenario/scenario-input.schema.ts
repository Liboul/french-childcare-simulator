import { z } from "zod";
import type { ScenarioInput } from "./types";

const domicileTransportBaseSchema = z.enum([
  "non",
  "navigo_mois_plein",
  "navigo_demi_tarif",
  "navigo_zones_limitees",
  "autre",
]);

const domicileComplementaryCostsSchema = z
  .object({
    fraisTransportMensuelEur: z.number().optional(),
    fraisTransportBase: domicileTransportBaseSchema.optional(),
    provisionCongesPayesMensuelEur: z.number().optional(),
    depensesCotisablesLisseesMensuelEur: z.number().optional(),
    depensesHorsCreditImpotLisseesMensuelEur: z.number().optional(),
  })
  .strict();

const brutNounouDomicileSchema = z
  .object({
    mode: z.literal("nounou_domicile"),
    hourlyGrossEur: z.number(),
    hoursPerMonth: z.number(),
    employerShareOfGross: z.number(),
    householdShareOfEmploymentCost: z.number().gt(0).lte(1).optional(),
    domicileComplementaryCosts: domicileComplementaryCostsSchema.optional(),
  })
  .strict();

const brutNounouPartageeSchema = z
  .object({
    mode: z.literal("nounou_partagee"),
    hourlyGrossEur: z.number(),
    hoursPerMonth: z.number(),
    simultaneousChildrenCount: z.number().int().min(1),
    householdShareOfSalary: z.number().gte(0).lte(1),
    employerShareOfGross: z.number(),
    domicileComplementaryCosts: domicileComplementaryCostsSchema.optional(),
  })
  .strict();

const brutAssistanteSchema = z
  .object({
    mode: z.literal("assistante_maternelle"),
    hourlyGrossEur: z.number(),
    hoursPerMonth: z.number(),
    careDaysPerMonth: z.number(),
    indemniteEntretienEurPerDay: z.number(),
    employerShareOfGross: z.number(),
  })
  .strict();

const brutMamSchema = z
  .object({
    mode: z.literal("mam"),
    hourlyGrossEur: z.number(),
    hoursPerMonth: z.number(),
    careDaysPerMonth: z.number(),
    indemniteEntretienEurPerDay: z.number(),
    structureParticipationEurPerMonth: z.number(),
    employerShareOfGross: z.number(),
  })
  .strict();

const brutCrechePubliqueSchema = z
  .object({
    mode: z.literal("creche_publique"),
    monthlyParticipationEur: z.number(),
  })
  .strict();

const brutCrechePriveeSchema = z
  .object({
    mode: z.literal("creche_privee"),
    monthlyParticipationEur: z.number(),
  })
  .strict();

const brutCrecheInterSchema = z
  .object({
    mode: z.literal("creche_inter_entreprises"),
    monthlyParticipationEur: z.number(),
  })
  .strict();

/** Schéma Zod aligné sur `ScenarioInput` / `BrutCostInput` (GARDE-020 / GARDE-021). */
export const scenarioBrutInputSchema = z.discriminatedUnion("mode", [
  brutNounouDomicileSchema,
  brutNounouPartageeSchema,
  brutAssistanteSchema,
  brutMamSchema,
  brutCrechePubliqueSchema,
  brutCrechePriveeSchema,
  brutCrecheInterSchema,
]);

const cmgCumulSchema = z
  .object({
    receivesPrepareFull: z.boolean().optional(),
    receivesPreparePartial: z.boolean().optional(),
    receivesAahOrAeeh: z.boolean().optional(),
  })
  .strict();

export const scenarioCmgInputSchema = z
  .object({
    cumul: cmgCumulSchema.default({}),
    monthlyReferenceIncomeEur: z.number().optional(),
    householdEffortRank: z.number().optional(),
    hourlyDeclaredGrossEur: z.number().optional(),
    heuresParMois: z.number().optional(),
    annualReferenceIncomeN2Eur: z.number().optional(),
    structureDependentChildren: z.number().optional(),
    isSingleParentHousehold: z.boolean().optional(),
    childAgeBand: z.enum(["under3", "age3to6"]).optional(),
    monthlyStructureExpenseEur: z.number().optional(),
    territory: z.enum(["metropole", "mayotte"]).optional(),
    hourlyCrecheFeeEur: z.number().optional(),
  })
  .strict();

const scenarioTaxCreditPartialSchema = z
  .object({
    childQualifiesForHorsDomicileCredit: z.boolean().optional(),
    sharedCustodyHalvedOutsideHomeCeiling: z.boolean().optional(),
    outsideHomeAnnualEmployerAidDeductibleEur: z.number().optional(),
    taxUnitDependentChildrenForEmploymentCeiling: z.number().optional(),
    prefundedCesuAnnualEur: z.number().optional(),
    sharedCustodyHalvedEmploymentIncrements: z.boolean().optional(),
  })
  .strict();

const householdSchema = z
  .object({
    taxYear: z.number().int(),
  })
  .strict();

export const scenarioInputSchema = z
  .object({
    household: householdSchema,
    brutInput: scenarioBrutInputSchema,
    cmg: scenarioCmgInputSchema,
    taxCredit: scenarioTaxCreditPartialSchema.optional(),
    baselineDisposableIncomeMonthlyEur: z.number().optional(),
    declaredEmployerChildcareSupportAnnualEur: z.number().optional(),
    referenceEmployerChildcareSupportAnnualEur: z.number().optional(),
  })
  .strict();

export type ScenarioValidationIssue = {
  path: (string | number)[];
  code: string;
  message: string;
};

export class ScenarioValidationError extends Error {
  readonly issues: readonly ScenarioValidationIssue[];

  constructor(issues: readonly ScenarioValidationIssue[]) {
    super("validation_failed");
    this.name = "ScenarioValidationError";
    this.issues = issues;
  }
}

export function safeParseScenarioInput(
  raw: unknown,
): { ok: true; data: ScenarioInput } | { ok: false; issues: ScenarioValidationIssue[] } {
  const r = scenarioInputSchema.safeParse(raw);
  if (r.success) {
    return { ok: true, data: r.data as ScenarioInput };
  }
  const issues: ScenarioValidationIssue[] = r.error.issues.map((i) => ({
    path: i.path as (string | number)[],
    code: String(i.code),
    message: i.message,
  }));
  return { ok: false, issues };
}
