/**
 * Datos del sitio : fiestas nacionales y autonómicas (src/data/festivos.json, BOE) y fiestas locales de
 * cada municipio (src/data/municipal/<comunidad>.json, boletín autonómico o provincial). Nada se descarga
 * en el navegador : todo va en el código de la página.
 */
import F from '../data/festivos.json';
import { type ISO } from './engine/fechas';

export type Lang = 'es' | 'en';
export type Tipo = 'nacional' | 'autonomica' | 'insular' | 'local';
export interface Fiesta { fecha: ISO; es: string; en: string; tipo: Tipo; nota?: string }
export const YEARS = [2026, 2027] as const;
export type Year = (typeof YEARS)[number];

export interface Comunidad { id: string; es: string; en: string; boletin: string; capital: string }
export const COMUNIDADES: Comunidad[] = [
  { id: 'andalucia', es: 'Andalucía', en: 'Andalusia', boletin: 'BOJA', capital: 'Sevilla' },
  { id: 'aragon', es: 'Aragón', en: 'Aragon', boletin: 'BOA', capital: 'Zaragoza' },
  { id: 'asturias', es: 'Asturias', en: 'Asturias', boletin: 'BOPA', capital: 'Oviedo' },
  { id: 'baleares', es: 'Illes Balears', en: 'Balearic Islands', boletin: 'BOIB', capital: 'Palma' },
  { id: 'canarias', es: 'Canarias', en: 'Canary Islands', boletin: 'BOC', capital: 'Las Palmas de Gran Canaria y Santa Cruz de Tenerife' },
  { id: 'cantabria', es: 'Cantabria', en: 'Cantabria', boletin: 'BOC', capital: 'Santander' },
  { id: 'castilla-la-mancha', es: 'Castilla-La Mancha', en: 'Castilla-La Mancha', boletin: 'DOCM', capital: 'Toledo' },
  { id: 'castilla-y-leon', es: 'Castilla y León', en: 'Castile and León', boletin: 'BOCYL', capital: 'Valladolid' },
  { id: 'cataluna', es: 'Cataluña', en: 'Catalonia', boletin: 'DOGC', capital: 'Barcelona' },
  { id: 'extremadura', es: 'Extremadura', en: 'Extremadura', boletin: 'DOE', capital: 'Mérida' },
  { id: 'galicia', es: 'Galicia', en: 'Galicia', boletin: 'DOG', capital: 'Santiago de Compostela' },
  { id: 'madrid', es: 'Comunidad de Madrid', en: 'Madrid region', boletin: 'BOCM', capital: 'Madrid' },
  { id: 'murcia', es: 'Región de Murcia', en: 'Murcia', boletin: 'BORM', capital: 'Murcia' },
  { id: 'navarra', es: 'Navarra', en: 'Navarre', boletin: 'BON', capital: 'Pamplona' },
  { id: 'pais-vasco', es: 'País Vasco', en: 'Basque Country', boletin: 'BOPV', capital: 'Vitoria-Gasteiz' },
  { id: 'la-rioja', es: 'La Rioja', en: 'La Rioja', boletin: 'BOR', capital: 'Logroño' },
  { id: 'valenciana', es: 'Comunitat Valenciana', en: 'Valencian Community', boletin: 'DOGV', capital: 'València' },
  { id: 'ceuta', es: 'Ceuta', en: 'Ceuta', boletin: 'BOCCE', capital: 'Ceuta' },
  { id: 'melilla', es: 'Melilla', en: 'Melilla', boletin: 'BOME', capital: 'Melilla' },
];
export const comunidad = (id: string) => { const c = COMUNIDADES.find((x) => x.id === id); if (!c) throw new Error(`Comunidad desconocida ${id}`); return c; };
export const nombreCcaa = (id: string, l: Lang) => comunidad(id)[l];

/** Isla de cada municipio canario de la lista (fiesta insular del decreto de Canarias). */
export const ISLA: Record<string, string> = {
  '35016': 'gran-canaria', '35026': 'gran-canaria', '35022': 'gran-canaria', '35019': 'gran-canaria', '35006': 'gran-canaria',
  '35004': 'lanzarote', '35017': 'fuerteventura',
  '38038': 'tenerife', '38023': 'tenerife', '38006': 'tenerife', '38017': 'tenerife', '38001': 'tenerife', '38026': 'tenerife',
};
export const ISLA_NOMBRE: Record<string, string> = { 'gran-canaria': 'Gran Canaria', lanzarote: 'Lanzarote', fuerteventura: 'Fuerteventura', tenerife: 'Tenerife', 'la-palma': 'La Palma', 'la-gomera': 'La Gomera', 'el-hierro': 'El Hierro' };

/* ------------------------------------------------------------------ fuentes oficiales */
export interface FuenteBoletin { titulo: string; boletin: string; numero?: string; fecha: string; url: string; leido?: string; via?: string }
export interface Pendiente { estado: 'no-publicado'; comprobado: string; donde?: string }
interface MuniRaw { ine: string; nombre: string; fiestas: Record<string, Array<{ fecha: ISO; nombre: string }> | null>; fuente?: Record<string, string>; nota?: string }
interface FileRaw { ccaa: string; fuentes: Record<string, FuenteBoletin | Pendiente>; decreto_autonomico?: Record<string, FuenteBoletin | null> | null; municipios: MuniRaw[] }

const files = import.meta.glob<{ default: FileRaw }>('../data/municipal/*.json', { eager: true });
export const MUNICIPAL: Record<string, FileRaw> = Object.fromEntries(Object.values(files).map((m) => [m.default.ccaa, m.default]));

export interface Municipio { ine: string; nombre: string; ccaa: string; isla?: string; nota?: string }
export const MUNICIPIOS: Municipio[] = Object.values(MUNICIPAL).flatMap((f) => f.municipios.map((m) => ({ ine: m.ine, nombre: m.nombre, ccaa: f.ccaa, isla: ISLA[m.ine], nota: m.nota || undefined })))
  .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
export const municipio = (ine: string) => MUNICIPIOS.find((m) => m.ine === ine);
export const municipiosDe = (ccaa: string) => MUNICIPIOS.filter((m) => m.ccaa === ccaa);

const esPendiente = (x: unknown): x is Pendiente => !!x && (x as Pendiente).estado === 'no-publicado';
/** Texto oficial que fija las fiestas locales de un municipio un año dado, o « no publicado ». */
export function fuenteLocal(ine: string, year: number): FuenteBoletin | Pendiente | null {
  const m = MUNICIPIOS.find((x) => x.ine === ine); if (!m) return null;
  const f = MUNICIPAL[m.ccaa]; const raw = f.municipios.find((x) => x.ine === ine)!;
  const key = raw.fuente?.[String(year)] ?? String(year);
  return (f.fuentes[key] ?? f.fuentes[String(year)] ?? null) as FuenteBoletin | Pendiente | null;
}
export const pendiente = esPendiente;

/** Fiestas locales leídas (null = el texto del año aún no se ha publicado o no lista el municipio). */
export function locales(ine: string, year: number): Array<{ fecha: ISO; nombre: string }> | null {
  const m = MUNICIPIOS.find((x) => x.ine === ine); if (!m) return null;
  return MUNICIPAL[m.ccaa].municipios.find((x) => x.ine === ine)!.fiestas[String(year)] ?? null;
}

/* ------------------------------------------------------------------ fiestas de un lugar */
type FY = (typeof F.years)['2026'];
const Y = (year: number): FY | undefined => (F.years as Record<string, FY>)[String(year)];
export const resolucion = (year: number) => { const y = Y(year); return y ? { titulo: y.titulo, boe: y.boe, fecha: y.fecha, url: y.url, id: y.id } : null; };
export const tieneAnio = (year: number) => !!Y(year);

/** Fiestas nacionales y de la comunidad (y la insular en Canarias), ordenadas. */
export function fiestasCcaa(year: number, ccaa: string, isla?: string): Fiesta[] {
  const y = Y(year); if (!y) return [];
  const out: Fiesta[] = y.fiestas.filter((f) => ccaa in f.ccaa).map((f) => ({ fecha: f.fecha, es: f.es, en: f.en, tipo: (f.ccaa as Record<string, string>)[ccaa] === 'autonomica' ? 'autonomica' : 'nacional' }));
  if (ccaa === 'canarias' && isla) { const i = (y.islas.fiestas as Record<string, { fecha: ISO; es: string; en: string }>)[isla]; if (i) out.push({ fecha: i.fecha, es: i.es, en: i.en, tipo: 'insular' }); }
  return out.sort((a, b) => a.fecha.localeCompare(b.fecha));
}

/** Todo el calendario de un municipio : nacionales, comunidad, isla y las dos locales si están publicadas. */
export function fiestasMunicipio(year: number, ine: string): { fiestas: Fiesta[]; localesPublicadas: boolean } {
  const m = municipio(ine); if (!m) return { fiestas: [], localesPublicadas: false };
  const base = fiestasCcaa(year, m.ccaa, m.isla);
  const loc = locales(ine, year);
  const fiestas = [...base, ...(loc ?? []).map((x) => ({ fecha: x.fecha, es: x.nombre, en: x.nombre, tipo: 'local' as Tipo }))].sort((a, b) => a.fecha.localeCompare(b.fecha));
  return { fiestas, localesPublicadas: !!loc };
}

/** Fiestas nacionales comunes a las 19 comunidades y ciudades autónomas un año. */
export function comunes(year: number): Fiesta[] {
  const y = Y(year); if (!y) return [];
  return y.fiestas.filter((f) => Object.keys(f.ccaa).length === 19).map((f) => ({ fecha: f.fecha, es: f.es, en: f.en, tipo: 'nacional' as Tipo }));
}

export const ISLAS_REF = (year: number) => Y(year)?.islas.ref ?? '';
export const ARAN = (year: number) => Y(year)?.aran;

/* ------------------------------------------------------------------ calendario escolar (curso 2026-2027) */
export interface Escolar {
  ccaa: string; curso: string; fuente: FuenteBoletin;
  primaria?: { inicio: ISO; fin: ISO }; eso?: { inicio: ISO; fin: ISO };
  navidad?: { desde: ISO; hasta: ISO }; semana_santa?: { desde: ISO; hasta: ISO };
  /* Los campos que el texto no fija vienen a null. */
  otros?: Array<{ fecha: ISO; nombre: string }>; nota?: string;
}
const esc = import.meta.glob<{ default: Escolar }>('../data/escolar/*.json', { eager: true });
export const ESCOLAR: Record<string, Escolar> = Object.fromEntries(Object.values(esc).map((m) => [m.default.ccaa, m.default]));

/** « copia archivada del … » cuando la fuente es una copia de web.archive.org (el original ya no responde). */
export function archivado(url: string, l: Lang): string {
  const m = url.match(/web\.archive\.org\/web\/(\d{4})(\d{2})(\d{2})/); if (!m) return '';
  return l === 'es' ? `, copia archivada del ${m[3]}/${m[2]}/${m[1]}` : `, archived copy of ${m[3]}/${m[2]}/${m[1]}`;
}
