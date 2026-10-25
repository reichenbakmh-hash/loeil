import type { NormalizedEvent, SourceFetchResult, SourceModule } from "../types.js";
import { toIsoDate, safeNumber } from "../normalize.js";

interface UsgsFeature {
  id: string;
  properties: { mag: number | null; place: string | null; time: number; title?: string };
  geometry: { coordinates: number[] };
}

export const usgsSource: SourceModule = {
  name: "usgs",
  async fetchSince(): Promise<SourceFetchResult> {
    const response = await fetch("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson");
    if (!response.ok) {
      throw new Error(`USGS: HTTP ${response.status}`);
    }
    const body = (await response.json()) as { features?: UsgsFeature[] };

    const events: NormalizedEvent[] = (body.features ?? []).map((feature) => ({
      source: "usgs",
      sourceEventId: feature.id,
      eventDate: toIsoDate(feature.properties.time),
      countryIso: null,
      region: null,
      latitude: safeNumber(feature.geometry.coordinates[1]),
      longitude: safeNumber(feature.geometry.coordinates[0]),
      eventType: "earthquake",
      subEventType: feature.properties.mag !== null ? `M${feature.properties.mag}` : null,
      actors: null,
      fatalities: 0,
      summary: feature.properties.title ?? feature.properties.place ?? null,
      rawData: feature,
    }));

    return { events, indicators: [] };
  },
};

interface EonetEvent {
  id: string;
  title: string;
  categories: Array<{ id: string; title: string }>;
  geometry: Array<{ date: string; type: string; coordinates: unknown }>;
}

function firstCoordinate(value: unknown): number[] | null {
  let current = value;
  while (Array.isArray(current) && Array.isArray(current[0])) {
    current = current[0];
  }
  return Array.isArray(current) && typeof current[0] === "number" ? (current as number[]) : null;
}

export const eonetSource: SourceModule = {
  name: "eonet",
  async fetchSince(): Promise<SourceFetchResult> {
    const response = await fetch("https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=200");
    if (!response.ok) {
      throw new Error(`EONET: HTTP ${response.status}`);
    }
    const body = (await response.json()) as { events?: EonetEvent[] };

    const events: NormalizedEvent[] = [];
    for (const event of body.events ?? []) {
      const category = event.categories[0]?.id ?? "";
      if (category === "seaLakeIce" || category === "waterColor") {
        continue;
      }
      const geometry = event.geometry[event.geometry.length - 1];
      if (!geometry) {
        continue;
      }
      const point = geometry.type === "Point" ? (geometry.coordinates as number[]) : firstCoordinate(geometry.coordinates);
      if (!point) {
        continue;
      }
      events.push({
        source: "eonet",
        sourceEventId: event.id,
        eventDate: toIsoDate(geometry.date),
        countryIso: null,
        region: null,
        latitude: safeNumber(point[1]),
        longitude: safeNumber(point[0]),
        eventType: category || "natural_event",
        subEventType: null,
        actors: null,
        fatalities: 0,
        summary: event.title,
        rawData: event,
      });
    }

    return { events, indicators: [] };
  },
};
