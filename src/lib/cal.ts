/** Formatos de fecha en la lengua de la página y utilidades de calendario compartidas por herramientas y páginas. */
import { weekday, daysInMonth, iso, range, isWeekend, type ISO } from './engine/fechas';
import { fiestasCcaa, fiestasMunicipio, municipio, type Fiesta, type Lang } from './datos';

const TAG: Record<Lang, string> = { es: 'es-ES', en: 'en-GB' };
const fmt = (d: ISO, l: Lang, o: Intl.DateTimeFormatOptions) => new Date(`${d}T12:00:00Z`).toLocaleDateString(TAG[l], { ...o, timeZone: 'UTC' });
/** « viernes, 19 de marzo de 2027 » / « Friday 19 March 2027 ». */
export const fLarga = (d: ISO, l: Lang) => fmt(d, l, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).replace(/^(\w+),? /u, l === 'es' ? '$1, ' : '$1 ');
/** « 19 de marzo de 2027 ». */
export const fFecha = (d: ISO, l: Lang) => fmt(d, l, { day: 'numeric', month: 'long', year: 'numeric' });
/** « 19 de marzo ». */
export const fDia = (d: ISO, l: Lang) => fmt(d, l, { day: 'numeric', month: 'long' });
/** « vie 19 mar ». */
export const fCorta = (d: ISO, l: Lang) => fmt(d, l, { weekday: 'short', day: 'numeric', month: 'short' }).replace(/\./g, '').replace(',', '');
export const fSemana = (d: ISO, l: Lang) => fmt(d, l, { weekday: 'long' });
export const MES = (m: number, l: Lang) => fmt(iso(2027, m, 1), l, { month: 'long' });
export const Mes = (m: number, l: Lang) => { const x = MES(m, l); return x.charAt(0).toUpperCase() + x.slice(1); };

export const TIPO: Record<Fiesta['tipo'], Record<Lang, string>> = {
  nacional: { es: 'Nacional', en: 'National' }, autonomica: { es: 'Autonómica', en: 'Regional' },
  insular: { es: 'Insular', en: 'Island' }, local: { es: 'Local', en: 'Local' },
};
/** Nombre de una fiesta en la lengua de la página (las locales llevan el nombre del boletín). */
export const nombreFiesta = (f: Fiesta, l: Lang) => {
  if (f.tipo !== 'local' || l === 'es') return f[l];
  return /^fiesta local$/i.test(f.es) ? 'Local holiday' : `Local holiday: ${f.es}`;
};

/** Festivos de un lugar : municipio (código INE) o comunidad entera. */
export function festivosLugar(year: number, ccaa: string, ine?: string): { fiestas: Fiesta[]; localesPublicadas: boolean; conMunicipio: boolean } {
  if (ine && municipio(ine)) { const r = fiestasMunicipio(year, ine); return { ...r, conMunicipio: true }; }
  return { fiestas: fiestasCcaa(year, ccaa), localesPublicadas: false, conMunicipio: false };
}

export interface MesResumen { mes: number; dias: number; laborables: number; festivosLaborables: number; findes: number }
/** Días laborables (lunes a viernes no festivos) de cada mes. */
export function resumenMeses(year: number, fest: Set<ISO>): MesResumen[] {
  return Array.from({ length: 12 }, (_, i) => {
    const m = i + 1, dias = daysInMonth(year, m);
    const ds = range(iso(year, m, 1), iso(year, m, dias));
    const findes = ds.filter(isWeekend).length;
    const festivosLaborables = ds.filter((d) => !isWeekend(d) && fest.has(d)).length;
    return { mes: m, dias, findes, festivosLaborables, laborables: dias - findes - festivosLaborables };
  });
}

/** Rejilla HTML de un mes (lunes primero), festivos marcados. Para las páginas, no para el navegador. */
export function mesHTML(year: number, m: number, fest: Map<ISO, Fiesta>, l: Lang): string {
  const first = iso(year, m, 1), pad = weekday(first) - 1, n = daysInMonth(year, m);
  const head = (l === 'es' ? ['L', 'M', 'X', 'J', 'V', 'S', 'D'] : ['M', 'T', 'W', 'T', 'F', 'S', 'S']).map((d) => `<th scope="col">${d}</th>`).join('');
  const cells: string[] = Array(pad).fill('<td></td>');
  for (let d = 1; d <= n; d++) {
    const k = iso(year, m, d), f = fest.get(k), w = weekday(k);
    const cls = f ? `fest fest-${f.tipo}` : w >= 6 ? 'finde' : '';
    cells.push(`<td${cls ? ` class="${cls}"` : ''}${f ? ` title="${nombreFiesta(f, l).replace(/"/g, '&quot;')}"` : ''}>${d}</td>`);
  }
  while (cells.length % 7) cells.push('<td></td>');
  const rows = Array.from({ length: cells.length / 7 }, (_, i) => `<tr>${cells.slice(i * 7, i * 7 + 7).join('')}</tr>`).join('');
  return `<table class="mes"><caption>${Mes(m, l)} ${year}</caption><thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table>`;
}
export function anioHTML(year: number, fiestas: Fiesta[], l: Lang): string {
  const map = new Map(fiestas.map((f) => [f.fecha, f]));
  return `<div class="not-prose anio">${Array.from({ length: 12 }, (_, i) => `<div class="anio-mes">${mesHTML(year, i + 1, map, l)}</div>`).join('')}</div>`;
}
