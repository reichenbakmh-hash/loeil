import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { fetchStats, type StatRow } from "../api/client.js";

function useStats(groupBy: "country" | "source"): { rows: StatRow[]; errorMessage: string | null } {
  const [rows, setRows] = useState<StatRow[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchStats(groupBy)
      .then(setRows)
      .catch((error: Error) => setErrorMessage(error.message));
  }, [groupBy]);

  return { rows, errorMessage };
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
        {byCountry.errorMessage ? (
          <p className="mt-2 font-data text-xs text-risk">{byCountry.errorMessage}</p>
        ) : (
          <div className="mt-3 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byCountry.rows.slice(0, 20)}>
                <CartesianGrid stroke="#2A313C" strokeDasharray="3 3" />
                <XAxis dataKey="group_key" tick={{ fill: "#E8E6E0", fontSize: 11 }} />
                <YAxis tick={{ fill: "#E8E6E0", fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "#151B23", border: "1px solid #2A313C", color: "#E8E6E0" }} />
                <Bar dataKey="event_count" fill="#C9A227" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      <section className="mt-10">
        <h2 className="font-data text-xs text-paper/60">Par source</h2>
        {bySource.errorMessage ? (
          <p className="mt-2 font-data text-xs text-risk">{bySource.errorMessage}</p>
        ) : (
          <div className="mt-3 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bySource.rows}>
                <CartesianGrid stroke="#2A313C" strokeDasharray="3 3" />
                <XAxis dataKey="group_key" tick={{ fill: "#E8E6E0", fontSize: 11 }} />
                <YAxis tick={{ fill: "#E8E6E0", fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "#151B23", border: "1px solid #2A313C", color: "#E8E6E0" }} />
                <Bar dataKey="event_count" fill="#4C7A6E" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>
    </div>
  );
}
