/** Todas las páginas previstas (id = nombre del fichero de src/content/guides, o id de una página del fichero comunidades.ts).
 *  Los tests aceptan un enlace a estos ids durante la redacción; « todas las páginas existen » falla mientras falte alguna. */
import { COMUNIDADES } from './datos';
export const PLANNED_GUIDES = [
  'calendario-laboral-2027', 'calendario-laboral-2026', 'festivos-nacionales', 'dias-laborables', 'calendario-2027',
  'puentes-2027', 'puentes-2026', 'semana-santa', 'cambio-de-hora', 'carnaval', 'dia-de-la-madre', 'fiestas-locales',
  ...COMUNIDADES.map((c) => `cl-${c.id}`),
];
export const PLANNED_IDS = new Set<string>([...PLANNED_GUIDES, 'home', 'method', 'about', 'widget', 'contact', 'editorial', 'privacy', 'terms', 'cookies']);
