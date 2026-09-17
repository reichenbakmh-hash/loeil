import { sourceRegistry } from "./registry.js";
import { d1InsertEventsBatch, d1InsertIndicatorsBatch, d1UpsertSourceStatus, d1GetLastRun } from "./d1-client.js";
import type { SourceRunResult } from "./types.js";

async function runSource(source: (typeof sourceRegistry)[number]): Promise<SourceRunResult> {
  try {
    const sinceIso = await d1GetLastRun(source.name);
    const { events, indicators } = await source.fetchSince(sinceIso);

    if (events.length > 0) {
      await d1InsertEventsBatch(events as unknown as Array<Record<string, unknown>>);
    }
    if (indicators.length > 0) {
      await d1InsertIndicatorsBatch(indicators as unknown as Array<Record<string, unknown>>);
    }

    const recordsFetched = events.length + indicators.length;
    await d1UpsertSourceStatus(source.name, "ok", recordsFetched, null);
    return { source: source.name, status: "ok", recordsFetched, errorMessage: null };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    await d1UpsertSourceStatus(source.name, "error", 0, errorMessage);
    return { source: source.name, status: "error", recordsFetched: 0, errorMessage };
  }
}

async function main(): Promise<void> {
  const results = await Promise.all(sourceRegistry.map(runSource));

  for (const result of results) {
    if (result.status === "ok") {
      console.log(`[${result.source}] OK — ${result.recordsFetched} enregistrements`);
    } else {
      console.error(`[${result.source}] ERREUR — ${result.errorMessage}`);
    }
  }

  const hasFailure = results.some((result) => result.status === "error");
  if (hasFailure) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error("Échec critique de l'orchestrateur:", error);
  process.exitCode = 1;
});
