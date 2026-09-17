import type { NormalizedEvent, SourceFetchResult, SourceModule } from "../types.js";
import { toIsoDate, safeInt, safeNumber } from "../normalize.js";

interface UcdpRecord {
  id: number;
  date_start: string;
  country_id: string;
  country: string;
  region: string;
  latitude: number;
  longitude: number;
  type_of_violence: number;
  side_a: string;
  side_b: string;
  best: number;
  source_headline: string;
}

const UCDP_VERSION = process.env.UCDP_VERSION ?? "24.1";
const PAGE_SIZE = 500;

async function fetchPage(page: number): Promise<{ records: UcdpRecord[]; hasMore: boolean }> {
  const url = `https://ucdpapi.pcr.uu.se/api/gedevents/${UCDP_VERSION}?pagesize=${PAGE_SIZE}&page=${page}`;
  const headers: Record<string, string> = {};
  if (process.env.UCDP_TOKEN) {
    headers["x-ucdp-access-token"] = process.env.UCDP_TOKEN;
  }

  const response = await fetch(url, { headers });
  if (!response.ok) {
    throw new Error(`UCDP: HTTP ${response.status}`);
  }

  const body = (await response.json()) as { Result: UcdpRecord[]; NextPageUrl?: string };
  return { records: body.Result ?? [], hasMore: Boolean(body.NextPageUrl) };
}

function toEvent(record: UcdpRecord): NormalizedEvent {
  return {
    source: "ucdp",
    sourceEventId: String(record.id),
    eventDate: toIsoDate(record.date_start),
    countryIso: record.country_id || null,
    region: record.region || null,
    latitude: safeNumber(record.latitude),
    longitude: safeNumber(record.longitude),
    eventType: "armed_conflict",
    subEventType: record.type_of_violence ? String(record.type_of_violence) : null,
    actors: [record.side_a, record.side_b].filter(Boolean).join(" vs ") || null,
    fatalities: safeInt(record.best, 0),
    summary: record.source_headline || null,
    rawData: record,
  };
}

export const ucdpSource: SourceModule = {
  name: "ucdp",
  async fetchSince(): Promise<SourceFetchResult> {
    const events: NormalizedEvent[] = [];
    let page = 0;
    let hasMore = true;

    while (hasMore) {
      const { records, hasMore: nextHasMore } = await fetchPage(page);
      events.push(...records.map(toEvent));
      hasMore = nextHasMore;
      page += 1;
      if (page > 20) {
        break;
      }
    }

    return { events, indicators: [] };
  },
};
