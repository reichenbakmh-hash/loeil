import type { SourceModule } from "./types.js";
import { ucdpSource } from "./sources/ucdp.js";
import { gdeltSource } from "./sources/gdelt.js";
import { worldBankSource } from "./sources/worldbank.js";
import { usgsSource, eonetSource } from "./sources/natural.js";

// UCDP exige un token (demandé par email aux mainteneurs): actif seulement si UCDP_TOKEN est défini.
// ReliefWeb est retiré: son API v1 est supprimée et la v2 demande un appname approuvé.
export const sourceRegistry: SourceModule[] = [
  ...(process.env.UCDP_TOKEN ? [ucdpSource] : []),
  gdeltSource,
  worldBankSource,
  usgsSource,
  eonetSource,
];
