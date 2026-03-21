# Exploitation publique du harness HTTP (GARDE-025)

Le serveur [`harness/server.ts`](../../harness/server.ts) est un **exemple** : ne l’exposez pas tel quel sur Internet sans durcissement.

## Authentification optionnelle

Si la variable d’environnement **`HARNESS_API_KEY`** est définie (non vide), **toutes** les routes (`GET /health`, `GET /v1/scenario/schema`, `POST /v1/calculate`) exigent :

- en-tête **`X-Api-Key: <valeur>`**, **ou**
- **`Authorization: Bearer <valeur>`**.

Sinon le serveur répond **`401`** avec `{ "error": "unauthorized" }`.  
En local sans variable, l’accès reste **ouvert** (développement uniquement).

## TLS et reverse-proxy

Terminez le TLS devant Bun (Caddy, nginx, Cloudflare, etc.). Ne relayez que vers `127.0.0.1:HARNESS_PORT`.

## Données personnelles

Les corps `ScenarioInput` peuvent contenir des **données familiales / financières**. Prévoir :

- **minimisation** des logs (éviter de logger le JSON brut en production) ;
- **rétention** et base légale si vous opérez en tant que responsable de traitement (résumé RGPD, pas un avis juridique) ;
- **limitation de débit** au niveau proxy ou WAF (non implémentée dans le repo — à ajouter selon votre hébergeur).

## Schéma et version

- **`GET /v1/scenario/schema`** : JSON Schema `ScenarioInput` (fichier généré, voir `bun run schema:scenario`).
- Les réponses **`200`** de `/v1/calculate` incluent **`meta`** (`engineVersion`, `rulePackVersion`, …) pour le support et l’audit.

## Rate limiting

Non inclus dans le code du dépôt. À configurer côté **reverse-proxy** ou API gateway.
