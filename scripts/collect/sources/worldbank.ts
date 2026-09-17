import type { NormalizedIndicator, SourceFetchResult, SourceModule } from "../types.js";
import { safeNumber } from "../normalize.js";

interface WorldBankPoint {
  countryiso3code: string;
  date: string;
  value: number | null;
  indicator: { id: string; value: string };
}

type WorldBankResponse = [unknown, WorldBankPoint[] | null];

const INDICATORS = [
  { code: "NY.GDP.MKTP.KD.ZG", label: "Croissance du PIB (%)" },
  { code: "FP.CPI.TOTL.ZG", label: "Inflation des prix (%)" },
  { code: "SL.UEM.TOTL.ZS", label: "Taux de chômage (%)" },
];

async function fetchIndicator(code: string): Promise<WorldBankPoint[]> {
  const url = `https://api.worldbank.org/v2/country/all/indicator/${code}?format=json&per_page=20000&mrnev=5`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`World Bank: HTTP ${response.status}`);
  }

  const body = (await response.json()) as WorldBankResponse;
  return body[1] ?? [];
}

function toIndicator(point: WorldBankPoint, label: string): NormalizedIndicator | null {
  if (!point.countryiso3code || point.countryiso3code.length !== 3) {
    return null;
  }
  return {
    countryIso: point.countryiso3code,
    indicatorCode: point.indicator.id,
    indicatorLabel: label,
    year: Number(point.date),
    value: safeNumber(point.value),
    source: "worldbank",
  };
}

export const worldBankSource: SourceModule = {
  name: "worldbank",
  async fetchSince(): Promise<SourceFetchResult> {
    const indicators: NormalizedIndicator[] = [];

    for (const definition of INDICATORS) {
      const points = await fetchIndicator(definition.code);
      for (const point of points) {
        const indicator = toIndicator(point, definition.label);
        if (indicator) {
          indicators.push(indicator);
        }
      }
    }

    return { events: [], indicators };
  },
};
