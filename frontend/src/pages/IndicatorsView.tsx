import { useEffect, useState } from "react";
import { fetchIndicators, type CountryIndicator } from "../api/client.js";

function groupByCountry(rows: CountryIndicator[]): Map<string, CountryIndicator[]> {
  const groups = new Map<string, CountryIndicator[]>();
  for (const row of rows) {
    const existing = groups.get(row.country_iso) ?? [];
    existing.push(row);
    groups.set(row.country_iso, existing);
  }
  return groups;
}

export default function IndicatorsView(): JSX.Element {
  const [rows, setRows] = useState<CountryIndicator[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [countryFilter, setCountryFilter] = useState("");

  useEffect(() => {
    fetchIndicators()
      .then(setRows)
      .catch((error: Error) => setErrorMessage(error.message));
  }, []);

  const filteredRows = countryFilter
    ? rows.filter((row) => row.country_iso === countryFilter.toUpperCase())
    : rows;

  const groups = groupByCountry(filteredRows);
  const latestByCountry = Array.from(groups.entries()).map(([iso, entries]) => {
    const byIndicator = new Map<string, CountryIndicator>();
    for (const entry of entries) {
      const current = byIndicator.get(entry.indicator_code);
      if (!current || entry.year > current.year) {
        byIndicator.set(entry.indicator_code, entry);
      }
    }
    return { iso, indicators: Array.from(byIndicator.values()) };
  });

  return (
    <div className="h-full overflow-y-auto p-6">
      <h1 className="font-data text-sm text-signal">INDICATEURS</h1>
      <p className="mt-1 text-sm text-paper/60">Indicateurs macro-économiques les plus récents par pays (World Bank)</p>

      <input
        value={countryFilter}
        onChange={(event) => setCountryFilter(event.target.value)}
        placeholder="filtrer par code ISO3 (ex. FRA)"
        className="mt-4 w-full max-w-xs rounded border border-hairline bg-panel px-3 py-2 font-data text-xs text-paper outline-none focus:border-signal"
      />

      {errorMessage ? (
        <p className="mt-4 font-data text-xs text-risk">{errorMessage}</p>
      ) : latestByCountry.length === 0 ? (
        <p className="mt-6 text-sm text-paper/60">
          Aucun indicateur pour l'instant — la collecte World Bank n'a pas encore tourné.
        </p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {latestByCountry.map(({ iso, indicators }) => (
            <div key={iso} className="rounded border border-hairline bg-panel p-4">
              <h2 className="font-data text-sm text-signal">{iso}</h2>
              <dl className="mt-3 space-y-2 font-data text-xs">
                {indicators.map((indicator) => (
                  <div key={indicator.indicator_code} className="flex justify-between border-b border-hairline pb-1">
                    <dt className="text-paper/60">{indicator.indicator_label}</dt>
                    <dd>{indicator.value !== null ? `${indicator.value.toFixed(1)} (${indicator.year})` : "—"}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
