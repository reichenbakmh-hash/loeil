interface D1QueryResult {
  success: boolean;
  errors?: Array<{ message: string }>;
}

interface D1Env {
  accountId: string;
  databaseId: string;
  apiToken: string;
}

function readEnv(): D1Env {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const databaseId = process.env.CLOUDFLARE_D1_DATABASE_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  if (!accountId || !databaseId || !apiToken) {
    throw new Error("Variables Cloudflare manquantes: CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_D1_DATABASE_ID, CLOUDFLARE_API_TOKEN");
  }
  return { accountId, databaseId, apiToken };
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function d1Execute(sql: string, params: unknown[] = [], maxRetries = 3): Promise<D1QueryResult> {
  const env = readEnv();
  const url = `https://api.cloudflare.com/client/v4/accounts/${env.accountId}/d1/database/${env.databaseId}/query`;
  let lastError: string = "erreur inconnue";

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${env.apiToken}`,
        },
        body: JSON.stringify({ sql, params }),
      });

      if (!response.ok) {
        lastError = `HTTP ${response.status}`;
        await sleep(2 ** attempt * 500);
        continue;
      }

      const body = (await response.json()) as { result?: D1QueryResult[]; errors?: Array<{ message: string }> };
      if (body.errors && body.errors.length > 0) {
        lastError = body.errors.map((e) => e.message).join("; ");
        await sleep(2 ** attempt * 500);
        continue;
      }

      return { success: true };
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
      await sleep(2 ** attempt * 500);
    }
  }

  throw new Error(`Échec écriture D1 après ${maxRetries} tentatives: ${lastError}`);
}

export async function d1InsertEventsBatch(events: Array<Record<string, unknown>>): Promise<void> {
  for (const event of events) {
    await d1Execute(
      `INSERT INTO events (source, source_event_id, event_date, country_iso, region, latitude, longitude, event_type, sub_event_type, actors, fatalities, summary, raw_data)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(source, source_event_id) DO UPDATE SET
         event_date = excluded.event_date,
         fatalities = excluded.fatalities,
         summary = excluded.summary`,
      [
        event.source,
        event.sourceEventId,
        event.eventDate,
        event.countryIso,
        event.region,
        event.latitude,
        event.longitude,
        event.eventType,
        event.subEventType,
        event.actors,
        event.fatalities,
        event.summary,
        JSON.stringify(event.rawData ?? null),
      ],
    );
  }
}

export async function d1InsertIndicatorsBatch(indicators: Array<Record<string, unknown>>): Promise<void> {
  for (const indicator of indicators) {
    await d1Execute(
      `INSERT INTO country_indicators (country_iso, indicator_code, indicator_label, year, value, source)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(country_iso, indicator_code, year, source) DO UPDATE SET
         value = excluded.value,
         updated_at = CURRENT_TIMESTAMP`,
      [indicator.countryIso, indicator.indicatorCode, indicator.indicatorLabel, indicator.year, indicator.value, indicator.source],
    );
  }
}

export async function d1GetLastRun(source: string): Promise<string | null> {
  const env = readEnv();
  const url = `https://api.cloudflare.com/client/v4/accounts/${env.accountId}/d1/database/${env.databaseId}/query`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.apiToken}`,
    },
    body: JSON.stringify({ sql: "SELECT last_run FROM sources_status WHERE source = ?", params: [source] }),
  });

  if (!response.ok) {
    return null;
  }

  const body = (await response.json()) as { result?: Array<{ results?: Array<{ last_run: string }> }> };
  const row = body.result?.[0]?.results?.[0];
  return row?.last_run ?? null;
}

export async function d1UpsertSourceStatus(
  source: string,
  status: "ok" | "error",
  recordsFetched: number,
  errorMessage: string | null,
): Promise<void> {
  await d1Execute(
    `INSERT INTO sources_status (source, last_run, status, error_message, records_fetched)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(source) DO UPDATE SET
       last_run = excluded.last_run,
       status = excluded.status,
       error_message = excluded.error_message,
       records_fetched = excluded.records_fetched`,
    [source, new Date().toISOString(), status, errorMessage, recordsFetched],
  );
}
