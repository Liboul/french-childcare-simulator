# Recherche approfondie (DR) — sources optionnelles pour le harness

Les fichiers **`DR-*.md`** dans ce dossier sont des **rapports de recherche** du dépôt (synthèses à partir de sources officielles au moment de leur rédaction). Ils sont **embarqués dans le ZIP skill** pour que l’agent puisse s’y **référer si besoin** (explication utilisateur, limites du modèle, contexte réglementaire).

## Règle de priorité

- **Vérité chiffrée** pour un scénario : uniquement la sortie de **`node scripts/simulate.mjs`** (`snapshot`, `warnings`, `trace`, `meta`, `limitationHints`, etc.) et le **rule pack** versionné (`meta.rulePackVersion`).
- Les DR **ne remplacent pas** le moteur : en cas d’**écart** apparent entre un rapport et la sortie `simulate.mjs`, **c’est la sortie moteur + le pack** qui font foi pour le produit ; le DR sert à **comprendre** ou à **signaler une limite / une évolution** à traiter dans le code ou le pack.

## Quand ouvrir quel fichier

| Fichier | Sujet (aperçu) |
| -------- | ---------------- |
| `DR-01-CMG-CAF.md` | CMG / PAJE, paramètres, modes |
| `DR-02-CREDIT-IMPOT.md` | Crédits d’impôt garde / emploi à domicile |
| `DR-03-CESU-EMPLOYEUR.md` | CESU, employeur, non-cumuls, préfinancement |
| `DR-04-COUT-MODES.md` | Coût par mode de garde (vue recherche) |
| `DR-05-PROVIDER-HARNESS.md` | Fournisseurs / empaquetage skill (hors calcul) |
| `DR-06-EMPLOI-DOMICILE-COUTS-COMPLEMENTAIRES.md` | Coûts complémentaires emploi à domicile / assiette CI |
| `DR-07-IR-TMI-DISPONIBLE.md` | IR, TMI, revenu disponible |
| `DR-08-PSU-CRECHE-PART-FAMILLE.md` | Crèche PSU, participation familiale |

Les **prompts** utilisés pour *produire* ces recherches (`docs/research/prompts/` dans le dépôt) **ne sont pas** inclus dans le skill : ils ne servent pas au parcours harness utilisateur.

Pour une liste de liens officiels condensée en dépôt complet, voir aussi `docs/SOURCES_OFFICIELLES.md` (non obligatoire dans le ZIP).
