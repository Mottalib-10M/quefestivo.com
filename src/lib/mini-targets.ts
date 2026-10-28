/** Où mène le bouton d'un mini-simulateur : la page qui porte l'outil complet de ce type. */
import { ROUTES, route } from '../i18n/routes';
import { pageOfTool } from './pages';
import type { Lang } from './format';
/** Minis dont l'outil complet n'est pas en tête d'un guide. */
const EXTRA: Record<string, string> = { municipio: 'calendario-laboral-2027', movil: 'carnaval', faltan: 'festivos-nacionales', nacionales: 'festivos-nacionales' };
export const miniHref = (kind: string, lang: Lang, fallback: string) => { const id = EXTRA[kind] ?? pageOfTool(kind); return id && ROUTES.some((r) => r.id === id) ? route(id, lang) : fallback; };
