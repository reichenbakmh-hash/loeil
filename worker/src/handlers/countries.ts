import type { Env } from "../index.js";

export async function handleCountries(env: Env): Promise<Response> {
  try {
    const result = await env.DB.prepare("SELECT * FROM countries ORDER BY name ASC").all();
    return new Response(JSON.stringify({ data: result.results }), {
      headers: { "Content-Type": "application/json", "Cache-Control": "max-age=300" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur de requête";
    return new Response(JSON.stringify({ error: message, code: 500 }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
