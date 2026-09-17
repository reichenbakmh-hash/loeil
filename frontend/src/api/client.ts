const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8787";

export interface GeoEvent {
  id: number;
  source: string;
  source_event_id: string;
  event_date: string;
  country_iso: string | null;
  latitude: number | null;
  longitude: number | null;
  event_type: string | null;
  fatalities: number;
  summary: string | null;
}

export interface EventsFilter {
  country?: string;
  source?: string;
  from?: string;
  to?: string;
}

export async function fetchEvents(filter: EventsFilter = {}): Promise<GeoEvent[]> {
  const params = new URLSearchParams();
  if (filter.country) params.set("country", filter.country);
  if (filter.source) params.set("source", filter.source);
  if (filter.from) params.set("from", filter.from);
  if (filter.to) params.set("to", filter.to);

  const response = await fetch(`${API_BASE_URL}/api/events?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Échec de récupération des événements: HTTP ${response.status}`);
  }

  const body = (await response.json()) as { data: GeoEvent[] };
  return body.data;
}

export interface StatRow {
  group_key: string | null;
  event_count: number;
  total_fatalities: number | null;
}

export async function fetchStats(groupBy: "country" | "month" | "source"): Promise<StatRow[]> {
  const response = await fetch(`${API_BASE_URL}/api/stats?group_by=${groupBy}`);
  if (!response.ok) {
    throw new Error(`Échec de récupération des statistiques: HTTP ${response.status}`);
  }
  const body = (await response.json()) as { data: StatRow[] };
  return body.data;
}

export interface SourceStatus {
  source: string;
  status: "ok" | "error";
  last_run: string | null;
}

export async function fetchHealth(): Promise<SourceStatus[]> {
  const response = await fetch(`${API_BASE_URL}/api/health`);
  if (!response.ok) {
    throw new Error(`Échec de récupération de l'état des sources: HTTP ${response.status}`);
  }
  const body = (await response.json()) as { data: SourceStatus[] };
  return body.data;
}

export interface CountryIndicator {
  country_iso: string;
  indicator_code: string;
  indicator_label: string;
  year: number;
  value: number | null;
  source: string;
}

export async function fetchIndicators(country?: string): Promise<CountryIndicator[]> {
  const params = new URLSearchParams();
  if (country) params.set("country", country);

  const response = await fetch(`${API_BASE_URL}/api/indicators?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Échec de récupération des indicateurs: HTTP ${response.status}`);
  }
  const body = (await response.json()) as { data: CountryIndicator[] };
  return body.data;
}
