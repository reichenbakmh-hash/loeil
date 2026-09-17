export interface NormalizedEvent {
  source: string;
  sourceEventId: string;
  eventDate: string;
  countryIso: string | null;
  region: string | null;
  latitude: number | null;
  longitude: number | null;
  eventType: string | null;
  subEventType: string | null;
  actors: string | null;
  fatalities: number;
  summary: string | null;
  rawData: unknown;
}

export interface NormalizedIndicator {
  countryIso: string;
  indicatorCode: string;
  indicatorLabel: string;
  year: number;
  value: number | null;
  source: string;
}

export interface SourceFetchResult {
  events: NormalizedEvent[];
  indicators: NormalizedIndicator[];
}

export interface SourceModule {
  name: string;
  fetchSince(sinceIso: string | null): Promise<SourceFetchResult>;
}

export interface SourceRunResult {
  source: string;
  status: "ok" | "error";
  recordsFetched: number;
  errorMessage: string | null;
}
