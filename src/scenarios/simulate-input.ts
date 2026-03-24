import { z } from "zod";

const nn = z.number().finite().nonnegative();
const posInt = z.number().int().positive();

/** Champs autorisés par slug (objet JSON) — clés inconnues = erreur de validation (aide l’agent). */
export const simulateInputAllowedKeysBySlug: Record<string, readonly string[]> = {
  "creche-publique": [
    "monthlyParticipationEur",
    "monthlyCmgStructureEur",
    "childrenCount",
    "custody",
  ],
  "creche-berceau-employeur": [
    "monthlyParticipationEur",
    "monthlyCmgStructureEur",
    "childrenCount",
    "custody",
    "annualEmployerChildcareAidEur",
    "childrenCountForEmployerThreshold",
  ],
  "assistante-maternelle": [
    "monthlyEmploymentCostEur",
    "monthlyHouseholdIncomeForCmgEur",
    "householdChildRank",
    "monthlyCmgPaidEur",
    "childrenCount",
    "custody",
  ],
  "nounou-domicile": [
    "monthlyEmploymentCostEur",
    "monthlyHouseholdIncomeForCmgEur",
    "householdChildRank",
    "monthlyCmgPaidEur",
    "childrenCountForCreditCeiling",
    "custody",
  ],
};

const crechePubliqueInputSchema = z
  .object({
    monthlyParticipationEur: nn.optional(),
    monthlyCmgStructureEur: nn.optional(),
    childrenCount: posInt.optional(),
    custody: z.enum(["full", "shared"]).optional(),
  })
  .strict();

const crecheBerceauEmployeurInputSchema = z
  .object({
    monthlyParticipationEur: nn.optional(),
    monthlyCmgStructureEur: nn.optional(),
    childrenCount: posInt.optional(),
    custody: z.enum(["full", "shared"]).optional(),
    annualEmployerChildcareAidEur: nn.optional(),
    childrenCountForEmployerThreshold: posInt.optional(),
  })
  .strict();

const assistanteMaternelleInputSchema = z
  .object({
    monthlyEmploymentCostEur: nn.optional(),
    monthlyHouseholdIncomeForCmgEur: nn.optional(),
    householdChildRank: posInt.optional(),
    monthlyCmgPaidEur: nn.optional(),
    childrenCount: posInt.optional(),
    custody: z.enum(["full", "shared"]).optional(),
  })
  .strict();

const nounouDomicileInputSchema = z
  .object({
    monthlyEmploymentCostEur: nn.optional(),
    monthlyHouseholdIncomeForCmgEur: nn.optional(),
    householdChildRank: posInt.optional(),
    monthlyCmgPaidEur: nn.optional(),
    childrenCountForCreditCeiling: z.number().int().nonnegative().optional(),
    custody: z.enum(["full", "shared"]).optional(),
  })
  .strict();

const schemaBySlug: Record<string, z.ZodType<object>> = {
  "creche-publique": crechePubliqueInputSchema,
  "creche-berceau-employeur": crecheBerceauEmployeurInputSchema,
  "assistante-maternelle": assistanteMaternelleInputSchema,
  "nounou-domicile": nounouDomicileInputSchema,
};

export type SimulateInputIssue = { path: string; message: string };

export function validateSimulateInput(
  slug: string,
  raw: unknown,
): { ok: true; data: object } | { ok: false; issues: SimulateInputIssue[] } {
  const schema = schemaBySlug[slug];
  if (!schema) {
    return { ok: false, issues: [{ path: "(slug)", message: `Slug inconnu : ${slug}` }] };
  }
  const parsed = schema.safeParse(raw);
  if (parsed.success) {
    return { ok: true, data: parsed.data };
  }
  return {
    ok: false,
    issues: parsed.error.issues.map((i) => ({
      path: i.path.length ? i.path.join(".") : "(racine)",
      message: i.message,
    })),
  };
}
