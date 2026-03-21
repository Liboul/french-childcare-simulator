# Quickstart — Custom GPT + Action

Objectif : un GPT qui appelle **`POST /v1/calculate`** sur ton backend **HTTPS**.

1. Déploie (ou tunnel de **test uniquement**) un serveur qui expose au minimum :
   - `POST /v1/calculate`
   - `GET /v1/scenario/schema` (optionnel mais utile pour déboguer)  
     Même contrat que [`harness/openapi.yaml`](../../harness/openapi.yaml).
2. ChatGPT → **Create a GPT** → **Actions** → importer le schéma OpenAPI (URL publique ou copie du YAML aligné sur le repo).
3. Colle les instructions depuis [`harness/instructions/gpt-custom-instructions.fr.md`](../../harness/instructions/gpt-custom-instructions.fr.md).
4. Si tu actives **`HARNESS_API_KEY`** côté serveur, configure l’Action pour envoyer **`X-Api-Key`** (voir [`PRODUCTION-HARNESS.md`](./PRODUCTION-HARNESS.md)).

Publication store / review : politique de confidentialité si données personnelles — voir [`DR-05`](../research/DR-05-PROVIDER-HARNESS.md).
