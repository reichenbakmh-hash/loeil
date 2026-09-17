import type { Env } from "../index.js";

const VALID_GROUPINGS = new Set(["country", "month", "source"]);

export async function handleStats(url: URL, env: Env): Promise<Response> {
  const groupBy = url.searchParams.get("group_by") ?? "country";

  if (!VALID_GROUPINGS.has(groupBy)) {
    return new Response(JSON.stringify({ error: "group_by doit être country, month ou source", code: 400 }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const groupColumn =
    groupBy === "country" ? "country_iso" : groupBy === "source" ? "source" : "strftime('%Y-%m', event_date)";

  try {
    const sql = `SELECT ${groupColumn} AS group_key, COUNT(*) AS event_count, SUM(fatalities) AS total_fatalities
                 FROM events GROUP BY group_key ORDER BY event_count DESC`;
    const result = await env.DB.prepare(sql).all();

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
