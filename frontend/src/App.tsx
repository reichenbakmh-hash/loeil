import { NavLink, Route, Routes } from "react-router-dom";
import MapView from "./pages/MapView.js";
import StatsView from "./pages/StatsView.js";
import SourcesView from "./pages/SourcesView.js";
import IndicatorsView from "./pages/IndicatorsView.js";
import WhatsAppButton from "./components/WhatsAppButton.js";

const NAV_ITEMS = [
  { to: "/", label: "carte" },
  { to: "/statistiques", label: "statistiques" },
  { to: "/indicateurs", label: "indicateurs" },
  { to: "/sources", label: "sources" },
];

function navLinkClass(isActive: boolean): string {
  return isActive
    ? "border-b-2 border-signal pb-2 text-signal"
    : "border-b-2 border-transparent pb-2 text-paper/60 hover:text-paper";
}

export default function App(): JSX.Element {
  return (
    <div className="flex h-screen flex-col">
      <header className="flex items-center justify-between border-b border-hairline px-6 py-3">
        <span className="font-data text-sm tracking-wide text-signal">L'OEIL</span>
        <span className="font-data text-xs text-paper/60">veille géopolitique en continu</span>
      </header>

      <nav className="flex gap-6 overflow-x-auto border-b border-hairline px-6 pt-3 font-data text-xs uppercase tracking-wide">
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.to} to={item.to} end className={({ isActive }) => navLinkClass(isActive)}>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="relative flex-1">
        <Routes>
          <Route path="/" element={<MapView />} />
          <Route path="/statistiques" element={<StatsView />} />
          <Route path="/indicateurs" element={<IndicatorsView />} />
          <Route path="/sources" element={<SourcesView />} />
        </Routes>
      </div>

      <WhatsAppButton />
    </div>
  );
}
