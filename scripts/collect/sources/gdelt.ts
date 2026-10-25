import type { NormalizedEvent, SourceFetchResult, SourceModule } from "../types.js";
import { toIsoDate } from "../normalize.js";

interface GdeltArticle {
  url: string;
  title: string;
  seendate: string;
  domain: string;
  sourcecountry: string;
}

const COUNTRY_NAME_TO_ISO3: Record<string, string> = {
  Ukraine: "UKR",
  Russia: "RUS",
  Israel: "ISR",
  Palestine: "PSE",
  Lebanon: "LBN",
  Syria: "SYR",
  Sudan: "SDN",
  Yemen: "YEM",
  Ethiopia: "ETH",
  Myanmar: "MMR",
  Haiti: "HTI",
  Iran: "IRN",
  China: "CHN",
  Taiwan: "TWN",
  "North Korea": "PRK",
  "South Korea": "KOR",
};

function resolveCountryIso(sourceCountry: string | undefined): string | null {
  if (!sourceCountry) {
    return null;
  }
  return COUNTRY_NAME_TO_ISO3[sourceCountry] ?? null;
}

async function fetchArticles(query: string): Promise<GdeltArticle[]> {
  const params = new URLSearchParams({
    query,
    mode: "artlist",
    format: "json",
    maxrecords: "250",
    sort: "datedesc",
  });
  const url = `https://api.gdeltproject.org/api/v2/doc/doc?${params.toString()}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`GDELT: HTTP ${response.status}`);
  }

  const body = (await response.json()) as { articles?: GdeltArticle[] };
  return body.articles ?? [];
}

// GDELT renvoie les dates sous la forme 20261024T120000Z, que Date ne sait pas lire telle quelle.
function gdeltDateToIso(value: string): string {
  const match = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/.exec(value);
  return match ? `${match[1]}-${match[2]}-${match[3]}T${match[4]}:${match[5]}:${match[6]}Z` : value;
}

function toEvent(article: GdeltArticle): NormalizedEvent {
  return {
    source: "gdelt",
    sourceEventId: article.url,
    eventDate: toIsoDate(gdeltDateToIso(article.seendate)),
    countryIso: resolveCountryIso(article.sourcecountry),
    region: null,
    latitude: null,
    longitude: null,
    eventType: "news_signal",
    subEventType: article.domain || null,
    actors: null,
    fatalities: 0,
    summary: article.title || null,
    rawData: article,
  };
}

export const gdeltSource: SourceModule = {
  name: "gdelt",
  async fetchSince(): Promise<SourceFetchResult> {
    const queries = ["(conflict OR clashes OR ceasefire)", "(sanctions OR embargo)", "(coup OR unrest)"];
    const events: NormalizedEvent[] = [];

    for (const query of queries) {
      const articles = await fetchArticles(query);
      for (const article of articles) {
        try {
          events.push(toEvent(article));
        } catch {
          // un article à la date illisible est ignoré sans bloquer les autres
        }
      }
      await new Promise((resolve) => setTimeout(resolve, 5500));
    }

    return { events, indicators: [] };
  },
};
