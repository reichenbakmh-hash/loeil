import { useEffect, useState } from "react";
import { fetchHealth, type SourceStatus } from "../api/client.js";

export default function SourcesView(): JSX.Element {
  const [sources, setSources] = useState<SourceStatus[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchHealth()
      .then(setSources)
      .catch((error: Error) => setErrorMessage(error.message));
  }, []);

  return (
    <div className="h-full overflow-y-auto p-6">
      <h1 className="font-data text-sm text-signal">SOURCES</h1>
      <p className="mt-1 text-sm text-paper/60">État de la dernière collecte par module</p>

      {errorMessage ? (
        <p className="mt-4 font-data text-xs text-risk">{errorMessage}</p>
      ) : sources.length === 0 ? (
        <p className="mt-4 text-sm text-paper/60">
          Aucune donnée pour l'instant — la collecte n'a pas encore tourné. Déclenche le workflow GitHub Actions
          "collect" manuellement pour amorcer.
        </p>
      ) : (
        <table className="mt-6 w-full font-data text-sm">
          <thead>
            <tr className="border-b border-hairline text-left text-paper/60">
              <th className="py-2">source</th>
              <th className="py-2">statut</th>
              <th className="py-2">dernier passage</th>
            </tr>
          </thead>
          <tbody>
            {sources.map((source) => (
              <tr key={source.source} className="border-b border-hairline">
                <td className="py-2">{source.source}</td>
                <td className={`py-2 ${source.status === "ok" ? "text-stable" : "text-risk"}`}>{source.status}</td>
                <td className="py-2 text-paper/60">{source.last_run ? source.last_run.slice(0, 19) : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
