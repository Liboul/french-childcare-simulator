import type { ScenarioExportBundle } from "./types";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function exportScenarioBundleToHtml(bundle: ScenarioExportBundle): string {
  const title =
    bundle.meta.title != null && bundle.meta.title !== ""
      ? escapeHtml(bundle.meta.title)
      : "Comparatif mode de garde — export";

  const snap = bundle.result.snapshot;
  const rows = bundle.result.trace.steps
    .map(
      (st) =>
        `<tr><td>${escapeHtml(String(st.order))}</td><td>${escapeHtml(st.id)}</td><td>${escapeHtml(st.segment)}</td><td>${escapeHtml(st.label)}</td><td>${escapeHtml(st.formula)}</td></tr>`,
    )
    .join("\n");

  const sourcesRows = bundle.ruleSources
    .map(
      (s) =>
        `<tr><td>${escapeHtml(s.id)}</td><td>${escapeHtml(s.title)}</td><td><a href="${escapeHtml(s.url)}">${escapeHtml(s.url)}</a></td></tr>`,
    )
    .join("\n");

  const warnings = bundle.result.warnings.map((w) => `<li>${escapeHtml(w)}</li>`).join("\n");

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 1.5rem; max-width: 56rem; }
    h2 { margin-top: 2rem; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #ccc; padding: 0.35rem 0.5rem; text-align: left; vertical-align: top; }
    th { background: #f5f5f5; }
    pre { background: #f8f8f8; padding: 1rem; overflow: auto; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <p><strong>Généré</strong> : ${escapeHtml(bundle.meta.generatedAtIso)} · <strong>Format</strong> : ${escapeHtml(bundle.meta.documentFormatVersion)}</p>
  ${
    bundle.packSummary
      ? `<p><strong>Pack</strong> : ${escapeHtml(bundle.packSummary.version)} (${escapeHtml(bundle.packSummary.effectiveFrom)})</p>`
      : ""
  }

  <h2>Hypothèses (JSON)</h2>
  <pre>${escapeHtml(JSON.stringify(bundle.hypotheses, null, 2))}</pre>

  <h2>Résultat agrégé</h2>
  <table>
    <thead><tr><th>Indicateur</th><th>Valeur</th></tr></thead>
    <tbody>
      <tr><td>Mode</td><td>${escapeHtml(snap.mode)}</td></tr>
      <tr><td>Brut mensuel (€)</td><td>${escapeHtml(String(snap.monthlyBrutEur))}</td></tr>
      <tr><td>Brut annuel (€)</td><td>${escapeHtml(String(snap.annualBrutEur))}</td></tr>
      <tr><td>Assiette CI mensuelle (€, DR-06)</td><td>${escapeHtml(String(snap.monthlyBrutTaxCreditAssietteEur))}</td></tr>
      <tr><td>Assiette CI annuelle (€)</td><td>${escapeHtml(String(snap.annualBrutTaxCreditAssietteEur))}</td></tr>
      <tr><td>CMG mensuel (€)</td><td>${escapeHtml(String(snap.monthlyCmgEur))}</td></tr>
      <tr><td>CMG annuel (€)</td><td>${escapeHtml(String(snap.annualCmgEur))}</td></tr>
      <tr><td>Statut CMG</td><td>${escapeHtml(snap.cmgStatus)}</td></tr>
      <tr><td>Crédit d'impôt annuel (€)</td><td>${escapeHtml(String(snap.annualTaxCreditEur))}</td></tr>
      <tr><td>Type crédit</td><td>${escapeHtml(snap.taxCreditKind)}</td></tr>
      <tr><td>Reste à charge équivalent annuel (€)</td><td>${escapeHtml(String(snap.netHouseholdBurdenAnnualEur))}</td></tr>
      <tr><td>Reste à charge équivalent mensuel (€)</td><td>${escapeHtml(String(snap.netHouseholdBurdenMonthlyEur))}</td></tr>
      <tr><td>Disponible mensuel (€)</td><td>${snap.disposableIncomeMonthlyEur == null ? "—" : escapeHtml(String(snap.disposableIncomeMonthlyEur))}</td></tr>
      <tr><td>Δ soutien employeur / ref. (€/an)</td><td>${snap.employerSupportDeltaAnnualEur == null ? "—" : escapeHtml(String(snap.employerSupportDeltaAnnualEur))}</td></tr>
    </tbody>
  </table>

  <h2>Avertissements moteur</h2>
  <ul>
    ${warnings || "<li>—</li>"}
  </ul>

  <h2>Étapes de calcul</h2>
  <table>
    <thead><tr><th>Ordre</th><th>Id</th><th>Segment</th><th>Libellé</th><th>Formule</th></tr></thead>
    <tbody>
      ${rows}
    </tbody>
  </table>

  <h2>Sources (règles référencées)</h2>
  <table>
    <thead><tr><th>Id</th><th>Titre</th><th>URL</th></tr></thead>
    <tbody>
      ${sourcesRows || '<tr><td colspan="3">—</td></tr>'}
    </tbody>
  </table>
</body>
</html>
`;
}
