import type { Env } from "../index.js";

export async function handleIndicators(url: URL, env: Env): Promise<Response> {
  const country = url.searchParams.get("country");
  const code = url.searchParams.get("code");

  const conditions: string[] = [];
  const params: unknown[] = [];

  if (country) {
    conditions.push("country_iso = ?");
    params.push(country);
  }
  if (code) {
    conditions.push("indicator_code = ?");
    params.push(code);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const sql = `SELECT * FROM country_indicators ${whereClause} ORDER BY country_iso ASC, year DESC`;

  try {
    const result = await env.DB.prepare(sql).bind(...params).all();
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
