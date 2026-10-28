import { makeRouter, type RouteDef } from './routes-core';
import { GUIDES } from '../lib/pages';
/** Español primero, inglés en todas las páginas (RECETTE : langue locale + anglais). */
export const LOCALES = ['es', 'en'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'es';
const R = (id: string, es: string, en: string, noindex = false) => ({ id, paths: { es: `/es/${es}/`, en: `/en/${en}/` }, ...(noindex ? { noindex } : {}) });
const CORE: RouteDef<Locale>[] = [
  { id: 'home', paths: { es: '/es/', en: '/en/' } },
  R('method', 'metodologia', 'method'),
  R('about', 'sobre-nosotros', 'about'),
  R('widget', 'widget', 'widget', true),
  R('contact', 'contacto', 'contact', true),
  R('editorial', 'politica-editorial', 'editorial-policy', true),
  R('privacy', 'privacidad', 'privacy', true),
  R('terms', 'aviso-legal', 'legal-notice', true),
  R('cookies', 'cookies', 'cookies', true),
];
const G = (g: (typeof GUIDES)[number]): RouteDef<Locale> => ({ id: g.id, paths: { es: `/es/${g.es.slug}/`, en: `/en/${g.en.slug}/` } });
export const ROUTES: RouteDef<Locale>[] = [CORE[0], ...GUIDES.map(G), ...CORE.slice(1)];
export const { NOINDEX_PATHS, route, hasRoute, altPaths } = makeRouter(LOCALES, ROUTES);
