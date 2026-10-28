/**
 * Kit de redacción (CONTRIBUTING-PAGINAS.md): toda fecha o cifra escrita en una página viene de aquí, nunca tecleada a mano.
 *   K.P                         fuentes fechadas (params-2026.json)
 *   K.fiestasCcaa, K.comunes …  fiestas del BOE y de los boletines (lib/datos.ts)
 *   K.movibles, K.cambioHora …  reglas de fechas probadas (engine/fechas.ts)
 *   K.optimizar, K.puentesDelAnio  puentes (engine/puentes.ts)
 *   K.tool(kind, lang, args, valores)  ejecuta una herramienta de tool-specs.ts
 */
import P from '../data/params-2026.json';
import * as D from './datos';
import * as F from './engine/fechas';
import * as PU from './engine/puentes';
import * as C from './cal';
import { runTool, evento, baseCambio } from './tool-specs';
import { LAST_UPDATED } from '../data/site-config';

export const KIT = { P, ...D, ...F, ...PU, ...C, evento, baseCambio, tool: runTool, LECTURA: LAST_UPDATED };
export type Kit = typeof KIT;
