# Changelog

Format inspiré de [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/).  
**Versions** : `package.json` / `ScenarioResult.meta.engineVersion` (moteur) ; `config/rules.*.json` → champ `version` (barème).

## [0.1.0] — 2026-03-21

### Added

- **IR / TMI (GARDE-019)** : `config/income-tax-bareme.fr-2026.json`, module `src/income-tax/`, champ optionnel `ScenarioInput.incomeTax` ; snapshot enrichi (`estimatedIncomeTaxGrossAnnualEur`, `estimatedIncomeTaxNetAfterDecoteAnnualEur`, `marginalIncomeTaxRate`, `incomeTaxQuotientEur`) ; disponible mensuel depuis `annualHouseholdIncomeAfterIncomeTaxEur` ou baseline − IR estimé (warning PAS) ; `limitationHints` plafonnement QF / zone décote. Recherche **DR-07** dans `docs/research/`.
- **API harness** : validation Zod des requêtes `POST /v1/calculate` ; réponse **422** `validation_failed` + `issues` (GARDE-020).
- **`GET /v1/scenario/schema`** : JSON Schema `ScenarioInput` (`harness/scenario-input.schema.json`, régénéré par `bun run schema:scenario`) (GARDE-021).
- **`ScenarioResult.meta`** : `engineVersion`, `rulePackVersion`, `rulePackEffectiveFrom` (GARDE-026).
- **`ScenarioResult.limitationHints`** : codes FR + liens pour chemins CMG limités (GARDE-022).
- Script `schema:scenario`, doc **INTAKE**, quickstarts `docs/shipping/quickstart-*.md`, `docs/shipping/PRODUCTION-HARNESS.md`, `CONTRIBUTING.md`, modèles GitHub issues.
- CI : contrôle de dérive du schéma JSON + présence des fichiers dans le ZIP skill (GARDE-029–031).

### Changed

- `bun run demo:scenario` valide le fichier JSON avant calcul.

### Harness

- Variable **`HARNESS_API_KEY`** (optionnelle) : si définie, exiger `X-Api-Key` ou `Authorization: Bearer …` sur toutes les routes sauf `OPTIONS` (GARDE-025).

### Rule pack

- Aucun changement de barème dans cette version (réf. `config/rules.fr-2026.json` `version`: `2026.1.0`).
