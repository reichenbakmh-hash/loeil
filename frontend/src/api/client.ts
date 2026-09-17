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
