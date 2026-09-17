import type { SourceModule } from "./types.js";
import { ucdpSource } from "./sources/ucdp.js";
import { gdeltSource } from "./sources/gdelt.js";
import { reliefwebSource } from "./sources/reliefweb.js";
import { worldBankSource } from "./sources/worldbank.js";

export const sourceRegistry: SourceModule[] = [ucdpSource, gdeltSource, reliefwebSource, worldBankSource];
