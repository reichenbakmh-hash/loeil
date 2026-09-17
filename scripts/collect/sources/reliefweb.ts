import type { NormalizedEvent, SourceFetchResult, SourceModule } from "../types.js";
import { toIsoDate } from "../normalize.js";

interface ReliefWebCountry {
  iso3: string;
  name: string;
}

interface ReliefWebItem {
  id: string;
  fields: {
    title: string;
    date: { created: string };
    country?: ReliefWebCountry[];
  };
}

interface ReliefWebResponse {
  data: ReliefWebItem[];
}

async function fetchReports(): Promise<ReliefWebItem[]> {
  const params = new URLSearchParams();
  params.append("appname", "loeil-veille-geopolitique");
  params.append("limit", "100");
  params.append("sort[]", "date:desc");
  params.append("fields[include][]", "title");
  params.append("fields[include][]", "date");
  params.append("fields[include][]", "country");

  const url = `https://api.reliefweb.int/v1/reports?${params.toString()}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`ReliefWeb: HTTP ${response.status}`);
  }

  const body = (await response.json()) as ReliefWebResponse;
  return body.data ?? [];
}

function toEvent(item: ReliefWebItem): NormalizedEvent {
  const country = item.fields.country?.[0] ?? null;
  return {
    source: "reliefweb",
    sourceEventId: item.id,
    eventDate: toIsoDate(item.fields.date.created),
    countryIso: country?.iso3 ?? null,
    region: null,
    latitude: null,
    longitude: null,
    eventType: "humanitarian_report",
    subEventType: null,
    actors: null,
    fatalities: 0,
    summary: item.fields.title || null,
    rawData: item,
  };
}

export const reliefwebSource: SourceModule = {
  name: "reliefweb",
  async fetchSince(): Promise<SourceFetchResult> {
    const items = await fetchReports();
    return { events: items.map(toEvent), indicators: [] };
  },
};
