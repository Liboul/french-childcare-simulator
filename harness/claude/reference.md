# Référence rapide — `ScenarioInput` (harness)

À utiliser quand le **dépôt complet** n’est pas disponible (ex. Skill uploadé seul sur claude.ai). Le moteur attend un JSON avec au minimum **`household`**, **`brutInput`**, **`cmg`**.

## `household`

| Champ     | Type   | Exemple | Note        |
| --------- | ------ | ------- | ----------- |
| `taxYear` | number | `2026`  | Obligatoire |

## `brutInput` — union selon `mode`

Modes : `nounou_domicile` | `nounou_partagee` | `assistante_maternelle` | `mam` | `creche_publique` | `creche_privee` | `creche_inter_entreprises`.

**`nounou_domicile`** : `hourlyGrossEur`, `hoursPerMonth`, `employerShareOfGross` (fraction du brut, ex. `0.42`).

**`nounou_partagee`** : idem + `simultaneousChildrenCount` (≥ 1), `householdShareOfSalary` (0–1).

**`assistante_maternelle` | `mam`** : `hourlyGrossEur`, `hoursPerMonth`, `careDaysPerMonth`, `indemniteEntretienEurPerDay`, `employerShareOfGross` ; pour **`mam`** seulement : `structureParticipationEurPerMonth`.

**`creche_publique` | `creche_privee` | `creche_inter_entreprises`** : `monthlyParticipationEur` seulement (pas de salaire horaire dans ce chemin).

## `cmg` (sans `mode` — le moteur reprend `brutInput.mode`)

- **`cumul`** : `receivesPrepareFull?`, `receivesPreparePartial?`, `receivesAahOrAeeh?` (booléens optionnels).
- Emploi direct / assmat / MAM : souvent `monthlyReferenceIncomeEur`, `householdEffortRank`, `hourlyDeclaredGrossEur`, `heuresParMois`.
- Structure (micro-crèche, etc.) : `annualReferenceIncomeN2Eur`, `structureDependentChildren`, `isSingleParentHousehold?`, `childAgeBand?`, `monthlyStructureExpenseEur?`, `territory?`, `hourlyCrecheFeeEur?` selon le cas.

Poser les questions une à une ; ne pas inventer de montants.

## Champs optionnels utiles

- `taxCredit` : surcharge du contexte crédit d’impôt (voir types moteur si tu as le repo).
- `baselineDisposableIncomeMonthlyEur` : base « disponible » mensuelle (sinon le moteur ne peut pas afficher de disponible final — pas de TMI dans le moteur).
- `declaredEmployerChildcareSupportAnnualEur` / `referenceEmployerChildcareSupportAnnualEur` : comparaison soutien employeur.

## Exemple minimal (nounou à domicile)

```json
{
  "household": { "taxYear": 2026 },
  "brutInput": {
    "mode": "nounou_domicile",
    "hourlyGrossEur": 12,
    "hoursPerMonth": 80,
    "employerShareOfGross": 0.42
  },
  "cmg": {
    "cumul": {},
    "monthlyReferenceIncomeEur": 4000,
    "householdEffortRank": 1,
    "hourlyDeclaredGrossEur": 12,
    "heuresParMois": 80
  }
}
```

## Appel calculateur sans clone du repo

`POST /v1/calculate` sur une API HTTPS qui expose le harness (corps = JSON ci-dessus). Schéma OpenAPI : fichier `harness/openapi.yaml` dans le dépôt **agent-comparatif-modes-de-garde**.

## Limites moteur (à dire à l’utilisateur)

- Pas d’**impôt sur le revenu marginal** : le « disponible » dépend d’une saisie utilisateur si tu veux un chiffre.
- **Crèche publique** : CMG type PSU souvent **`unsupported`** dans ce modèle.
- Avertissement standard : annualisation crédit d’impôt **brut mensuel × 12** (simplification).
