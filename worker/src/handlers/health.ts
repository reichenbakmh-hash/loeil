import type { Env } from "../index.js";

export async function handleHealth(env: Env): Promise<Response> {
  try {
    const result = await env.DB.prepare("SELECT source, status, last_run FROM sources_status").all();
    return new Response(JSON.stringify({ data: result.results, ok: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur de requête";
    return new Response(JSON.stringify({ error: message, code: 500, ok: false }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
