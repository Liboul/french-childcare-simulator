import { calculateScenario } from "./handle-calculate";

const PORT = Number(process.env.HARNESS_PORT ?? 8787);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...corsHeaders,
    },
  });
}

console.log(`Harness API listening on http://127.0.0.1:${PORT} (POST /v1/calculate)`);

Bun.serve({
  port: PORT,
  async fetch(req: Request): Promise<Response> {
    const url = new URL(req.url, `http://${req.headers.get("host") ?? "127.0.0.1"}`);

    if (req.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (req.method === "GET" && url.pathname === "/health") {
      return jsonResponse({ ok: true, service: "comparatif-modes-garde-harness" });
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
