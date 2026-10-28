/** Utilidades de redacción compartidas por las páginas (excluido del registro por el guion bajo). */
import { KIT as K } from '../../lib/kit';
import type { Fiesta } from '../../lib/datos';
type L = 'es' | 'en';

/** « A, B y C » / « A, B and C ». */
export const lista = (xs: string[], l: L) => xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} ${l === 'es' ? 'y' : 'and'} ${xs[xs.length - 1]}`;
/** Comunidades (nombres) que tienen festiva una fecha un año. */
export const ccaaCon = (year: number, fecha: string, l: L) => K.COMUNIDADES.filter((c) => K.fiestasCcaa(year, c.id).some((f) => f.fecha === fecha)).map((c) => c[l]);
export const ccaaSin = (year: number, fecha: string, l: L) => K.COMUNIDADES.filter((c) => !K.fiestasCcaa(year, c.id).some((f) => f.fecha === fecha)).map((c) => c[l]);
/** Fiestas de una comunidad que no son comunes a toda España. */
export const propias = (year: number, ccaa: string): Fiesta[] => { const com = new Set(K.comunes(year).map((f) => f.fecha)); return K.fiestasCcaa(year, ccaa).filter((f) => !com.has(f.fecha)); };
/** Fiestas comunes que caen en sábado o domingo. */
export const comunesFinde = (year: number) => K.comunes(year).filter((f) => K.isWeekend(f.fecha));
/** Fiestas (todas las filas del BOE) de un año, con el número de comunidades que las tienen. */
export function filasBOE(year: number) {
  const m = new Map<string, { f: Fiesta; n: number }>();
  for (const c of K.COMUNIDADES) for (const f of K.fiestasCcaa(year, c.id)) { const k = `${f.fecha}|${f.es}`; const x = m.get(k); if (x) x.n++; else m.set(k, { f, n: 1 }); }
  return [...m.values()].sort((a, b) => a.f.fecha.localeCompare(b.f.fecha));
}
/** Fiestas de 2027 que se pueden poner en un puente : laborables de lunes a viernes de la comunidad. */
export const entreSemana = (year: number, ccaa: string) => K.fiestasCcaa(year, ccaa).filter((f) => !K.isWeekend(f.fecha));
/** Estado de publicación de las fiestas locales por comunidad. */
export function estadoLocales(year: number) {
  return K.COMUNIDADES.map((c) => {
    const f = K.MUNICIPAL[c.id];
    const src = f ? (f.fuentes[String(year)] as (K_Src | undefined)) : undefined;
    return { c, f, src, publicado: !!src && !('estado' in src), n: f ? f.municipios.length : 0, conFiestas: f ? f.municipios.filter((m) => m.fiestas[String(year)]).length : 0 };
  });
}
type K_Src = { estado?: string; titulo?: string; boletin?: string; fecha?: string; url?: string; comprobado?: string };
