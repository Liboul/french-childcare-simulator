import type { ScenarioExportBundle } from "./types";

const COLS = 8;

function csvEscape(cell: string): string {
  if (/[",\n\r]/.test(cell)) {
    return `"${cell.replace(/"/g, '""')}"`;
  }
  return cell;
}

function line(cells: readonly string[]): string {
  const padded = [...cells];
  while (padded.length < COLS) padded.push("");
  return `${padded.slice(0, COLS).map(csvEscape).join(",")}\n`;
}

/**
 * CSV unique : préfixe `table` = `metric` | `warning` | `trace` | `flag` | `pending_rule` | `source` | `meta`.
 */
export function exportScenarioBundleToCsv(bundle: ScenarioExportBundle): string {
  const rows: string[] = [];
  rows.push(line(["table", "a", "b", "c", "d", "e", "f", "g"]));

  rows.push(line(["meta", "title", bundle.meta.title ?? "", "", "", "", ""]));
  rows.push(line(["meta", "generatedAtIso", bundle.meta.generatedAtIso, "", "", "", ""]));
  rows.push(
    line(["meta", "documentFormatVersion", bundle.meta.documentFormatVersion, "", "", "", ""]),
  );
  if (bundle.packSummary) {
    rows.push(line(["meta", "pack.version", bundle.packSummary.version, "", "", "", ""]));
    rows.push(
      line(["meta", "pack.effectiveFrom", bundle.packSummary.effectiveFrom, "", "", "", ""]),
    );
    if (bundle.packSummary.effectiveTo) {
      rows.push(line(["meta", "pack.effectiveTo", bundle.packSummary.effectiveTo, "", "", "", ""]));
    }
  }

  const s = bundle.result.snapshot;
  rows.push(line(["metric", "snapshot.mode", s.mode, "", "", "", "", ""]));
  rows.push(
    line(["metric", "snapshot.monthlyBrutEur", String(s.monthlyBrutEur), "", "", "", "", ""]),
  );
  rows.push(
    line(["metric", "snapshot.annualBrutEur", String(s.annualBrutEur), "", "", "", "", ""]),
  );
  rows.push(
    line([
      "metric",
      "snapshot.monthlyBrutTaxCreditAssietteEur",
      String(s.monthlyBrutTaxCreditAssietteEur),
      "",
      "",
      "",
      "",
      "",
    ]),
  );
  rows.push(
    line([
      "metric",
      "snapshot.annualBrutTaxCreditAssietteEur",
      String(s.annualBrutTaxCreditAssietteEur),
      "",
      "",
      "",
      "",
      "",
    ]),
  );
  rows.push(
    line(["metric", "snapshot.monthlyCmgEur", String(s.monthlyCmgEur), "", "", "", "", ""]),
  );
  rows.push(line(["metric", "snapshot.annualCmgEur", String(s.annualCmgEur), "", "", "", "", ""]));
  rows.push(line(["metric", "snapshot.cmgStatus", s.cmgStatus, "", "", "", "", ""]));
  rows.push(
    line([
      "metric",
      "snapshot.annualTaxCreditEur",
      String(s.annualTaxCreditEur),
      "",
      "",
      "",
      "",
      "",
    ]),
  );
  rows.push(line(["metric", "snapshot.taxCreditKind", s.taxCreditKind, "", "", "", "", ""]));
  rows.push(
    line([
      "metric",
      "snapshot.netHouseholdBurdenAnnualEur",
      String(s.netHouseholdBurdenAnnualEur),
      "",
      "",
      "",
      "",
      "",
    ]),
  );
  rows.push(
    line([
      "metric",
      "snapshot.netHouseholdBurdenMonthlyEur",
      String(s.netHouseholdBurdenMonthlyEur),
      "",
      "",
      "",
      "",
      "",
    ]),
  );
  rows.push(
    line([
      "metric",
      "snapshot.disposableIncomeMonthlyEur",
      s.disposableIncomeMonthlyEur == null ? "" : String(s.disposableIncomeMonthlyEur),
      "",
      "",
      "",
      "",
      "",
    ]),
  );
  const opt = (v: number | null) => (v == null ? "" : String(v));
  rows.push(
    line([
      "metric",
      "snapshot.householdGrossSalaryAnnualEur",
      opt(s.householdGrossSalaryAnnualEur),
      "",
      "",
      "",
      "",
      "",
    ]),
  );
  rows.push(
    line([
      "metric",
      "snapshot.householdGrossSalaryMonthlyEur",
      opt(s.householdGrossSalaryMonthlyEur),
      "",
      "",
      "",
      "",
      "",
    ]),
  );
  rows.push(
    line([
      "metric",
      "snapshot.householdNetSalaryAnnualEur",
      opt(s.householdNetSalaryAnnualEur),
      "",
      "",
      "",
      "",
      "",
    ]),
  );
  rows.push(
    line([
      "metric",
      "snapshot.householdNetSalaryMonthlyEur",
      opt(s.householdNetSalaryMonthlyEur),
      "",
      "",
      "",
      "",
      "",
    ]),
  );
  rows.push(
    line([
      "metric",
      "snapshot.householdIncomeAfterIncomeTaxAnnualEur",
      opt(s.householdIncomeAfterIncomeTaxAnnualEur),
      "",
      "",
      "",
      "",
      "",
    ]),
  );
  rows.push(
    line([
      "metric",
      "snapshot.householdIncomeAfterIncomeTaxMonthlyEur",
      opt(s.householdIncomeAfterIncomeTaxMonthlyEur),
      "",
      "",
      "",
      "",
      "",
    ]),
  );
  rows.push(
    line([
      "metric",
      "snapshot.employerSupportDeltaAnnualEur",
      s.employerSupportDeltaAnnualEur == null ? "" : String(s.employerSupportDeltaAnnualEur),
      "",
      "",
      "",
      "",
      "",
    ]),
  );

  bundle.result.warnings.forEach((w, i) => {
    rows.push(line(["warning", String(i), w, "", "", "", "", ""]));
  });

  bundle.result.uncertainty.flags.forEach((f) => {
    rows.push(line(["flag", f.code, f.severity, "", "", "", "", ""]));
  });

  bundle.result.uncertainty.referencedRulesPendingVerification.forEach((r) => {
    rows.push(line(["pending_rule", r.id, r.label, r.category, "", "", "", ""]));
  });

  for (const step of bundle.result.trace.steps) {
    rows.push(
      line([
        "trace",
        String(step.order),
        step.id,
        step.segment,
        step.label,
        step.formula,
        step.ruleId ?? "",
        step.narrative ?? "",
      ]),
    );
  }

  for (const src of bundle.ruleSources) {
    rows.push(line(["source", src.id, src.title, src.url, "", "", "", ""]));
  }

  return rows.join("");
}
