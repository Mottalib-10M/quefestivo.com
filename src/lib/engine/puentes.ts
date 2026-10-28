/**
 * Puentes y reparto óptimo de días de vacaciones. Funciones puras.
 *  - `bloquesLibres` : tramos seguidos de días no laborables (fines de semana + festivos).
 *  - `puentesDelAnio` : cada hueco de 1 a `maxHueco` días laborables entre dos tramos libres, con lo que rinde.
 *  - `optimizar` : con N días de vacaciones, la combinación de huecos que da más días libres seguidos
 *    (programación dinámica sobre intervalos que no se solapan, con presupuesto de días).
 */
import { addDays, diffDays, isWeekend, range, type ISO } from './fechas';

export interface Bloque { desde: ISO; hasta: ISO; dias: number }
export interface Hueco {
  /** Días laborables que hay que pedir. */
  desde: ISO; hasta: ISO; pedir: number;
  /** Tramo libre resultante, fines de semana y festivos incluidos. */
  libreDesde: ISO; libreHasta: ISO; libres: number;
  /** Días libres por día pedido. */
  rinde: number;
}

const libre = (d: ISO, fest: Set<ISO>) => fest.has(d) || isWeekend(d);

export function bloquesLibres(desde: ISO, hasta: ISO, fest: Set<ISO>): Bloque[] {
  const out: Bloque[] = [];
  let ini: ISO | null = null;
  for (const d of range(desde, hasta)) {
    if (libre(d, fest)) { if (!ini) ini = d; }
    else if (ini) { const h = addDays(d, -1); out.push({ desde: ini, hasta: h, dias: diffDays(ini, h) + 1 }); ini = null; }
  }
  if (ini) out.push({ desde: ini, hasta, dias: diffDays(ini, hasta) + 1 });
  return out;
}

/** Huecos laborables de hasta `maxHueco` días entre dos tramos libres, de `desde` a `hasta`. */
export function huecos(desde: ISO, hasta: ISO, fest: Set<ISO>, maxHueco: number): Hueco[] {
  const ini = addDays(desde, -10), fin = addDays(hasta, 10);
  const b = bloquesLibres(ini, fin, fest);
  const out: Hueco[] = [];
  // Huecos que unen dos o más tramos libres consecutivos (i … j).
  for (let i = 0; i < b.length - 1; i++) {
    let pedir = 0;
    for (let j = i + 1; j < b.length; j++) {
      pedir += diffDays(b[j - 1].hasta, b[j].desde) - 1;
      if (pedir > maxHueco) break;
      const h: Hueco = { desde: addDays(b[i].hasta, 1), hasta: addDays(b[j].desde, -1), pedir, libreDesde: b[i].desde, libreHasta: b[j].hasta, libres: diffDays(b[i].desde, b[j].hasta) + 1, rinde: 0 };
      h.rinde = h.libres / h.pedir;
      if (h.desde >= desde && h.hasta <= hasta) out.push(h);
    }
  }
  return out;
}

/** Puentes « clásicos » de un año : huecos de 1 o 2 días junto a un festivo entre semana. */
export function puentesDelAnio(desde: ISO, hasta: ISO, fest: Set<ISO>, maxHueco = 2): Hueco[] {
  const festSemana = new Set([...fest].filter((d) => !isWeekend(d)));
  return huecos(desde, hasta, fest, maxHueco)
    .filter((h) => range(h.libreDesde, h.libreHasta).some((d) => festSemana.has(d)))
    .sort((a, c) => c.rinde - a.rinde || c.libres - a.libres || a.desde.localeCompare(c.desde));
}

export interface Plan { elegidos: Hueco[]; usados: number; libres: number }

/**
 * Reparto de `dias` de vacaciones entre `desde` y `hasta` que maximiza los días libres en tramos de al menos
 * `minTramo` días, con huecos de como mucho `maxHueco` días laborables. Los tramos elegidos no se solapan.
 * Desempate : menos días usados, después los más tempranos.
 */
export function optimizar(desde: ISO, hasta: ISO, fest: Set<ISO>, dias: number, maxHueco = 5, minTramo = 3): Plan {
  const cand = huecos(desde, hasta, fest, Math.min(maxHueco, Math.max(1, dias)))
    .filter((h) => h.libres >= minTramo)
    .sort((a, c) => a.libreHasta.localeCompare(c.libreHasta) || a.libreDesde.localeCompare(c.libreDesde));
  const n = cand.length, B = Math.max(0, Math.floor(dias));
  // p[i] = último candidato cuyo tramo termina antes de que empiece el de i (sin tocarse).
  const p = cand.map((c, i) => { let k = i - 1; while (k >= 0 && cand[k].libreHasta >= addDays(c.libreDesde, -1)) k--; return k; });
  // dp[i+1][b] = mejor (libres, -usados) con los i primeros candidatos y presupuesto b.
  type Cell = { libres: number; usados: number; prev: number; take: boolean; pb: number };
  const dp: Cell[][] = Array.from({ length: n + 1 }, () => Array.from({ length: B + 1 }, () => ({ libres: 0, usados: 0, prev: -1, take: false, pb: 0 })));
  const better = (x: { libres: number; usados: number }, y: { libres: number; usados: number }) => x.libres > y.libres || (x.libres === y.libres && x.usados < y.usados);
  for (let i = 0; i < n; i++) {
    const c = cand[i];
    for (let b = 0; b <= B; b++) {
      const skip = dp[i][b];
      let best: Cell = { ...skip, prev: i, take: false, pb: b };
      if (c.pedir <= b) {
        const base = dp[p[i] + 1][b - c.pedir];
        const opt = { libres: base.libres + c.libres, usados: base.usados + c.pedir };
        if (better(opt, best)) best = { ...opt, prev: p[i] + 1, take: true, pb: b - c.pedir };
      }
      dp[i + 1][b] = best;
    }
  }
  const elegidos: Hueco[] = [];
  let i = n, b = B;
  while (i > 0) {
    const cell = dp[i][b];
    if (cell.take) { elegidos.push(cand[i - 1]); i = cell.prev; b = cell.pb; } else i -= 1;
  }
  elegidos.reverse();
  return { elegidos, usados: dp[n][B].usados, libres: dp[n][B].libres };
}

/** Días laborables (lunes a viernes no festivos) entre dos fechas, extremos incluidos. */
export function laborables(desde: ISO, hasta: ISO, fest: Set<ISO>): number {
  return range(desde, hasta).filter((d) => !isWeekend(d) && !fest.has(d)).length;
}
