import { useEffect, useState } from "react";
import { fetchEvents, type GeoEvent } from "../api/client.js";

interface CountryPanelProps {
  countryIso: string;
  onClose: () => void;
}

export default function CountryPanel({ countryIso, onClose }: CountryPanelProps): JSX.Element {
  const [events, setEvents] = useState<GeoEvent[]>([]);

  useEffect(() => {
    fetchEvents({ country: countryIso }).then(setEvents).catch(() => setEvents([]));
  }, [countryIso]);

  const totalFatalities = events.reduce((sum, event) => sum + event.fatalities, 0);

  return (
    <aside className="absolute right-0 top-0 h-full w-80 border-l border-hairline bg-panel p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-data text-lg text-signal">{countryIso}</h2>
        <button onClick={onClose} className="font-data text-xs text-paper/60 hover:text-paper">
          fermer
        </button>
      </div>

      <dl className="mt-6 space-y-3 font-data text-sm">
        <div className="flex justify-between border-b border-hairline pb-2">
          <dt className="text-paper/60">événements suivis</dt>
          <dd>{events.length}</dd>
        </div>
        <div className="flex justify-between border-b border-hairline pb-2">
          <dt className="text-paper/60">victimes cumulées</dt>
          <dd className={totalFatalities > 0 ? "text-risk" : ""}>{totalFatalities}</dd>
        </div>
      </dl>

      <ul className="mt-6 space-y-3 overflow-y-auto text-sm">
        {events.slice(0, 15).map((event) => (
          <li key={`${event.source}-${event.source_event_id}`} className="border-b border-hairline pb-2">
            <p className="font-data text-xs text-paper/60">{event.event_date.slice(0, 10)} · {event.source}</p>
            <p>{event.summary ?? "Sans résumé"}</p>
          </li>
        ))}
      </ul>
    </aside>
  );
}
