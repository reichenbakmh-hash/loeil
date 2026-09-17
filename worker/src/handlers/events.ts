import type { Env } from "../index.js";

export async function handleEvents(url: URL, env: Env): Promise<Response> {
  const country = url.searchParams.get("country");
  const source = url.searchParams.get("source");
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  const limit = Math.min(Number(url.searchParams.get("limit") ?? "200"), 1000);
  const offset = Number(url.searchParams.get("offset") ?? "0");

  const cache = caches.default;
  const cacheKey = new Request(url.toString());
  const cached = await cache.match(cacheKey);
  if (cached) {
    return cached;
  }

  const conditions: string[] = [];
  const params: unknown[] = [];

  if (country) {
    conditions.push("country_iso = ?");
    params.push(country);
  }
  if (source) {
    conditions.push("source = ?");
    params.push(source);
  }
  if (from) {
    conditions.push("event_date >= ?");
    params.push(from);
  }
  if (to) {
    conditions.push("event_date <= ?");
    params.push(to);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const sql = `SELECT * FROM events ${whereClause} ORDER BY event_date DESC LIMIT ? OFFSET ?`;

  try {
    const statement = env.DB.prepare(sql).bind(...params, limit, offset);
    const result = await statement.all();

    const response = new Response(JSON.stringify({ data: result.results }), {
      headers: { "Content-Type": "application/json", "Cache-Control": "max-age=300" },
    });
    await cache.put(cacheKey, response.clone());
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur de requête";
    return new Response(JSON.stringify({ error: message, code: 400 }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}
