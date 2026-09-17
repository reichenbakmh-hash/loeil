import type { Env } from "./index.js";
import { handleEvents } from "./handlers/events.js";
import { handleCountries } from "./handlers/countries.js";
import { handleStats } from "./handlers/stats.js";
import { handleHealth } from "./handlers/health.js";

export async function route(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);

  switch (url.pathname) {
    case "/api/events":
      return handleEvents(url, env);
    case "/api/countries":
      return handleCountries(env);
    case "/api/stats":
      return handleStats(url, env);
    case "/api/health":
      return handleHealth(env);
    default:
      return new Response(JSON.stringify({ error: "Route inconnue", code: 404 }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
  }
}
