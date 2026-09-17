import { route } from "./router.js";

export interface Env {
  DB: D1Database;
}

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: CORS_HEADERS });
    }

    try {
      const response = await route(request, env);
      for (const [key, value] of Object.entries(CORS_HEADERS)) {
        response.headers.set(key, value);
      }
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erreur interne";
      return new Response(JSON.stringify({ error: message, code: 500 }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...CORS_HEADERS },
      });
    }
  },
};
