import { readFileSync } from "node:fs";
import { join } from "node:path";
import { calculateScenario, ScenarioValidationError } from "./handle-calculate";

const PORT = Number(process.env.HARNESS_PORT ?? 8787);
const API_KEY = process.env.HARNESS_API_KEY?.trim();

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Api-Key",
};

const schemaPath = join(import.meta.dir, "scenario-input.schema.json");
let cachedSchemaBody: string | null = null;

function getScenarioSchemaBody(): string {
  if (cachedSchemaBody === null) {
    cachedSchemaBody = readFileSync(schemaPath, "utf8");
  }
  return cachedSchemaBody;
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...corsHeaders,
    },
  });
}

function unauthorizedResponse(): Response {
  return jsonResponse({ error: "unauthorized" }, 401);
}

function requireApiKey(req: Request): Response | null {
  if (!API_KEY) return null;
  const headerKey = req.headers.get("x-api-key");
  const auth = req.headers.get("authorization");
  const bearer = auth?.match(/^Bearer\s+(.+)$/iu)?.[1]?.trim();
  const got = headerKey?.trim() ?? bearer;
  if (got !== API_KEY) return unauthorizedResponse();
  return null;
}

console.log(`Harness API listening on http://127.0.0.1:${PORT} (POST /v1/calculate)`);
if (API_KEY) {
  console.log("HARNESS_API_KEY is set: requests must send X-Api-Key or Authorization: Bearer.");
}

Bun.serve({
  port: PORT,
  async fetch(req: Request): Promise<Response> {
    const url = new URL(req.url, `http://${req.headers.get("host") ?? "127.0.0.1"}`);

    if (req.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    const authBlock = requireApiKey(req);
    if (authBlock) return authBlock;

    if (req.method === "GET" && url.pathname === "/health") {
      return jsonResponse({ ok: true, service: "comparatif-modes-garde-harness" });
    }

    if (req.method === "GET" && url.pathname === "/v1/scenario/schema") {
      return new Response(getScenarioSchemaBody(), {
        status: 200,
        headers: {
          "Content-Type": "application/schema+json; charset=utf-8",
          ...corsHeaders,
        },
      });
    }

    if (req.method === "POST" && url.pathname === "/v1/calculate") {
      let raw: unknown;
      try {
        raw = await req.json();
      } catch {
        return jsonResponse({ error: "invalid_json_body" }, 400);
      }
      try {
        const result = calculateScenario(raw);
        return jsonResponse(result);
      } catch (e) {
        if (e instanceof ScenarioValidationError) {
          return jsonResponse({ error: "validation_failed", issues: e.issues }, 422);
        }
        const message = e instanceof Error ? e.message : String(e);
        if (message === "request_body_must_be_a_json_object") {
          return jsonResponse({ error: message }, 400);
        }
        return jsonResponse({ error: message }, 500);
      }
    }

    return new Response("Not found", { status: 404, headers: corsHeaders });
  },
});
