/** Outils d'écriture (`Helpers`) passés au corps de chaque page, dans sa langue. */
import { route, ROUTES } from '../i18n/routes';
import type { Helpers, MiniOpts } from './page-types';
import { formatNumber, displayDate, type Lang } from './format';
import { MUNICIPAL, ESCOLAR, resolucion, YEARS, archivado } from './datos';
import { fLarga, fDia, anioHTML } from './cal';
import { KIT } from './kit';
import P from '../data/params-2026.json';
import { PLANNED_IDS } from './planned';

const esc = (s: string | number) => String(s).replace(/&(?!(?:[a-z]+|#\d+);)/g, '&amp;').replace(/</g, '&lt;');
type Src = { url: string; label: { es: string; en: string } };
/** Fuentes de params-2026.json, más las que se leen en los datos : resolución del BOE de cada año (boe-AAAA),
 *  decreto de fiestas de cada comunidad (dec-<comunidad>-AAAA) y texto de las fiestas locales (loc-<comunidad>-<clave>). */
const RAW: Record<string, Src> = { ...(P as unknown as { sources: Record<string, Src> }).sources };
for (const y of YEARS) { const r = resolucion(y); if (r) RAW[`boe-${y}`] = { url: r.url, label: { es: `${r.titulo} (BOE ${r.boe})`, en: `${r.titulo} (BOE ${r.boe}), Spanish official gazette` } }; }
for (const f of Object.values(MUNICIPAL)) {
  for (const [y, d] of Object.entries(f.decreto_autonomico ?? {})) if (d && d.url) RAW[`dec-${f.ccaa}-${y}`] = { url: d.url, label: { es: `${d.titulo} (${d.boletin})`, en: `${d.titulo} (${d.boletin}, regional gazette)` } };
  for (const [k, d] of Object.entries(f.fuentes)) if ('url' in d && d.url) RAW[`loc-${f.ccaa}-${k}`] = { url: d.url, label: { es: `${d.titulo} (${d.boletin}${d.numero ? ` ${d.numero}` : ''})`, en: `${d.titulo} (${d.boletin}${d.numero ? ` ${d.numero}` : ''}, official gazette)` } };
}
for (const e of Object.values(ESCOLAR)) if (e.fuente?.url) RAW[`esc-${e.ccaa}`] = { url: e.fuente.url, label: { es: `${e.fuente.titulo} (${e.fuente.boletin}${e.fuente.numero ? ` ${e.fuente.numero}` : ''}${archivado(e.fuente.url, 'es')})`, en: `${e.fuente.titulo} (${e.fuente.boletin}${e.fuente.numero ? ` ${e.fuente.numero}` : ''}, school calendar${archivado(e.fuente.url, 'en')})` } };
const lab = (v: Src, lang: Lang) => (lang === 'es' ? v.label.es : v.label.en);
export const SOURCES = (lang: Lang): Record<string, { url: string; label: string }> =>
  Object.fromEntries(Object.entries(RAW).map(([k, v]) => [k, { url: v.url, label: lab(v, lang) }]));
export const sourceList = (keys: string[], lang: Lang) => { const S = SOURCES(lang); return keys.map((k) => ({ name: S[k].label, url: S[k].url })); };
export function table(headers: string[], rows: Array<Array<string | number>>, caption?: string, align: Array<'l' | 'r'> = [], lang: Lang = 'es') {
  const al = (i: number) => (align[i] === 'r' ? 'text-right' : 'text-left');
  return `<div class="not-prose my-6 overflow-x-auto"><table class="journal w-full text-sm">${caption ? `<caption class="mb-2 text-left text-sm text-navy-700">${caption}</caption>` : ''}<thead><tr>${headers.map((h, i) => `<th scope="col" class="px-3 py-2 font-semibold text-navy-900 ${al(i)}">${h}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c, i) => `<td class="tabular-nums border-b border-navy-100 px-3 py-2 text-navy-800 ${al(i)}">${typeof c === 'number' ? esc(formatNumber(c, 0, lang)) : c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}
export const ext = (url: string, text: string) => `<a href="${url}" target="_blank" rel="nofollow noopener noreferrer">${text}</a>`;
export function link(id: string, text: string, lang: Lang) {
  if (!ROUTES.some((r) => r.id === id)) { if (process.env.VITEST && !PLANNED_IDS.has(id)) throw new Error(`Unknown page id in link: ${id}`); return text; }
  return `<a href="${route(id, lang)}">${text}</a>`;
}
export const box = (title: string, html: string) => `<aside class="boxnote not-prose"><p class="boxnote-title">${title}</p><div class="text-navy-800">${html}</div></aside>`;
export const mini = (kind: string, arg?: MiniOpts) => `<!--mini:${kind}${arg === undefined ? '' : `|${Buffer.from(JSON.stringify(arg)).toString('base64')}`}-->`;
export const srcLink = (key: string, lang: Lang, text?: string) => { const s = SOURCES(lang)[key]; if (!s) throw new Error(`Unknown source ${key}`); return ext(s.url, text ?? s.label); };
const MONTHS: Record<Lang, string> = { es: 'es-ES', en: 'en-GB' };
export const monthYear = (ym: string, lang: Lang) => new Date(`${ym}-15T00:00:00Z`).toLocaleDateString(MONTHS[lang], { month: 'long', year: 'numeric', timeZone: 'UTC' });
export function helpers(lang: Lang): Helpers {
  return {
    ...KIT, lang, a: (id, text) => link(id, text, lang),
    table: (hd, rows, cap, al) => table(hd, rows, cap, al, lang),
    src: (key, text) => srcLink(key, lang, text), ext, box, mini,
    n: (x, d = 0) => formatNumber(x, d, lang),
    day: (iso) => displayDate(iso, MONTHS[lang]), dayW: (iso) => fLarga(iso, lang), dm: (iso) => fDia(iso, lang), my: (ym) => monthYear(ym, lang),
    grid: (year, fiestas) => anioHTML(year, fiestas, lang),
  };
}
