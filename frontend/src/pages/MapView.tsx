import { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import { fetchEvents, type GeoEvent } from "../api/client.js";
import CountryPanel from "../components/CountryPanel.js";

function markerColor(fatalities: number): string {
  if (fatalities >= 10) return "#B3432B";
  if (fatalities > 0) return "#C9A227";
  return "#4C7A6E";
}

export default function MapView(): JSX.Element {
  const [events, setEvents] = useState<GeoEvent[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents()
      .then(setEvents)
      .catch((error: Error) => setErrorMessage(error.message));
  }, []);

  return (
    <div className="absolute inset-0">
      {errorMessage ? (
        <div className="absolute left-6 top-4 z-10 rounded border border-risk/40 bg-panel px-3 py-2 font-data text-xs text-risk">
          {errorMessage}
        </div>
      ) : null}

      <div className="map-dark absolute inset-0">
        <MapContainer center={[20, 10]} zoom={2.5} className="h-full w-full bg-ink" zoomControl={false}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; contributeurs OpenStreetMap'
          />
          {events
            .filter((event) => event.latitude !== null && event.longitude !== null)
            .map((event) => (
              <CircleMarker
                key={`${event.source}-${event.source_event_id}`}
                center={[event.latitude as number, event.longitude as number]}
                radius={5}
                pathOptions={{ color: markerColor(event.fatalities), fillOpacity: 0.7 }}
                eventHandlers={{
                  click: () => {
                    if (event.country_iso) {
                      setSelectedCountry(event.country_iso);
                    }
                  },
                }}
              >
                <Popup>
                  <p className="font-data text-xs">{event.event_date.slice(0, 10)}</p>
                  <p className="text-sm">{event.summary ?? "Sans résumé"}</p>
                </Popup>
              </CircleMarker>
            ))}
        </MapContainer>
      </div>

      {selectedCountry ? (
        <CountryPanel countryIso={selectedCountry} onClose={() => setSelectedCountry(null)} />
      ) : null}
    </div>
  );
}
