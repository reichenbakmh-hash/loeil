import { useState } from "react";
import MapView from "./pages/MapView.js";
import CountryPanel from "./components/CountryPanel.js";

export default function App(): JSX.Element {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  return (
    <div className="flex h-screen flex-col">
      <header className="flex items-center justify-between border-b border-hairline px-6 py-3">
        <span className="font-data text-sm tracking-wide text-signal">L'OEIL</span>
        <span className="font-data text-xs text-paper/60">veille géopolitique en continu</span>
      </header>

      <div className="relative flex-1">
        <MapView onSelectCountry={setSelectedCountry} />
        {selectedCountry ? (
          <CountryPanel countryIso={selectedCountry} onClose={() => setSelectedCountry(null)} />
        ) : null}
      </div>
    </div>
  );
}
