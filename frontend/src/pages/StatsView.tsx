import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { fetchStats, type StatRow } from "../api/client.js";

function useStats(groupBy: "country" | "source"): { rows: StatRow[]; errorMessage: string | null; loaded: boolean } {
  const [rows, setRows] = useState<StatRow[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetchStats(groupBy)
      .then((data) => {
        setRows(data);
        setLoaded(true);
      })
      .catch((error: Error) => {
        setErrorMessage(error.message);
        setLoaded(true);
      });
  }, [groupBy]);

  return { rows, errorMessage, loaded };
}

function StatChart({ rows, errorMessage, loaded, barColor }: { rows: StatRow[]; errorMessage: string | null; loaded: boolean; barColor: string }): JSX.Element {
  if (errorMessage) {
    return <p className="mt-2 font-data text-xs text-risk">{errorMessage}</p>;
  }
  if (!loaded) {
    return <p className="mt-2 font-data text-xs text-paper/60">chargement...</p>;
  }
  if (rows.length === 0) {
    return (
      <p className="mt-2 text-sm text-paper/60">
        Aucune donnée pour l'instant — la collecte n'a pas encore tourné.
      </p>
    );
  }
  return (
    <div className="mt-3 h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows.slice(0, 20)}>
          <CartesianGrid stroke="#2A313C" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="group_key" tick={{ fill: "#E8E6E0", fontSize: 11 }} />
          <YAxis tick={{ fill: "#E8E6E0", fontSize: 11 }} allowDecimals={false} />
          <Tooltip contentStyle={{ background: "#151B23", border: "1px solid #2A313C", color: "#E8E6E0" }} />
          <Bar dataKey="event_count" fill={barColor} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function StatsView(): JSX.Element {
  const byCountry = useStats("country");
  const bySource = useStats("source");

  return (
    <div className="h-full overflow-y-auto p-6">
      <h1 className="font-data text-sm text-signal">STATISTIQUES</h1>
      <p className="mt-1 text-sm text-paper/60">Volume d'événements et fatalités agrégées</p>

      <section className="mt-8">
        <h2 className="font-data text-xs text-paper/60">Par pays (top 20)</h2>
        <StatChart rows={byCountry.rows} errorMessage={byCountry.errorMessage} loaded={byCountry.loaded} barColor="#C9A227" />
      </section>

      <section className="mt-10">
        <h2 className="font-data text-xs text-paper/60">Par source</h2>
        <StatChart rows={bySource.rows} errorMessage={bySource.errorMessage} loaded={bySource.loaded} barColor="#4C7A6E" />
      </section>
    </div>
  );
}
