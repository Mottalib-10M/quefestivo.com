/**
 * Reglas de fechas, funciones puras sobre cadenas ISO « AAAA-MM-DD » (sin zona horaria : un día civil).
 * Probadas en tests/fechas.test.ts contra las fechas publicadas (BOE, Comisión Europea).
 */
export type ISO = string;

const pad = (n: number) => String(n).padStart(2, '0');
export const iso = (y: number, m: number, d: number): ISO => `${y}-${pad(m)}-${pad(d)}`;
const toUTC = (s: ISO) => Date.UTC(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10));
const fromUTC = (t: number): ISO => { const d = new Date(t); return iso(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate()); };
const DAY = 86400000;

export const addDays = (s: ISO, n: number): ISO => fromUTC(toUTC(s) + n * DAY);
/** Días entre dos fechas (b − a). */
export const diffDays = (a: ISO, b: ISO) => Math.round((toUTC(b) - toUTC(a)) / DAY);
/** Día de la semana ISO : 1 = lunes … 7 = domingo. */
export const weekday = (s: ISO) => { const w = new Date(toUTC(s)).getUTCDay(); return w === 0 ? 7 : w; };
export const isWeekend = (s: ISO) => weekday(s) >= 6;
export const daysInMonth = (y: number, m: number) => new Date(Date.UTC(y, m, 0)).getUTCDate();
export const isLeap = (y: number) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;

/** Semana ISO 8601 (la que usan los calendarios españoles : empieza en lunes, la semana 1 contiene el primer jueves). */
export function isoWeek(s: ISO): number {
  const t = toUTC(s);
  const thursday = t + (4 - weekday(s)) * DAY;
  const y = new Date(thursday).getUTCFullYear();
  return Math.floor((thursday - Date.UTC(y, 0, 1)) / DAY / 7) + 1;
}

/** Domingo de Pascua (calendario gregoriano), algoritmo anónimo de Meeus/Jones/Butcher. */
export function easter(y: number): ISO {
  const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4;
  const f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31), day = ((h + l - 7 * m + 114) % 31) + 1;
  return iso(y, month, day);
}

/** Fechas de la Semana Santa y las fiestas móviles que dependen de la Pascua. */
export function movibles(y: number) {
  const p = easter(y);
  return {
    carnaval: addDays(p, -47), // martes de Carnaval
    ceniza: addDays(p, -46), // miércoles de Ceniza
    ramos: addDays(p, -7), jueves: addDays(p, -3), viernes: addDays(p, -2), sabado: addDays(p, -1),
    pascua: p, lunes: addDays(p, 1),
    pentecostes: addDays(p, 49), lunesPentecostes: addDays(p, 50),
    corpus: addDays(p, 60), // jueves de Corpus Christi
  };
}

/** Último domingo de un mes. */
export function lastSunday(y: number, m: number): ISO {
  const last = iso(y, m, daysInMonth(y, m));
  return addDays(last, -(weekday(last) % 7));
}
/** Enésimo día de la semana de un mes (n = 1 → primero). */
export function nthWeekday(y: number, m: number, wd: number, n: number): ISO {
  const first = iso(y, m, 1);
  return addDays(first, ((wd - weekday(first) + 7) % 7) + (n - 1) * 7);
}

/**
 * Cambio de hora (Directiva 2000/84/CE, art. 2 y 3 ; Real Decreto 236/2002) : la hora de verano empieza el
 * último domingo de marzo y termina el último domingo de octubre, a la 01:00 UTC. En la península, Baleares,
 * Ceuta y Melilla eso es a las 02:00 (se pasa a las 03:00) y a las 03:00 (se vuelve a las 02:00) ;
 * en Canarias, una hora antes (01:00 → 02:00 y 02:00 → 01:00).
 */
export function cambioHora(y: number) {
  const marzo = lastSunday(y, 3), octubre = lastSunday(y, 10);
  return {
    verano: marzo, invierno: octubre,
    veranoUTC: Date.UTC(y, 2, +marzo.slice(8, 10), 1), inviernoUTC: Date.UTC(y, 9, +octubre.slice(8, 10), 1),
  };
}

/** Día de la Madre en España : primer domingo de mayo (costumbre, no fiesta laboral). */
export const diaMadre = (y: number) => nthWeekday(y, 5, 7, 1);

/** Lista de los días de un intervalo, extremos incluidos. */
export function range(a: ISO, b: ISO): ISO[] {
  const out: ISO[] = [];
  for (let d = a; d <= b; d = addDays(d, 1)) out.push(d);
  return out;
}

/** Desglose de una cuenta atrás en días, horas, minutos y segundos (ms ≥ 0). */
export function desglose(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return { dias: Math.floor(s / 86400), horas: Math.floor((s % 86400) / 3600), minutos: Math.floor((s % 3600) / 60), segundos: s % 60 };
}
