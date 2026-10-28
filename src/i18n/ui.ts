import type { Locale } from './routes';
const es = {
  updatedOn: 'Actualizado el', editorialPolicy: 'Política editorial', contactLabel: 'Contacto', reviewedBy: 'Preparado por',
  skipToContent: 'Ir al contenido', mainNav: 'Navegación principal', breadcrumbLabel: 'Ruta de navegación', breadcrumbHome: 'Inicio', menuOpen: 'Abrir el menú',
  faqTitle: 'Preguntas frecuentes', relatedCalculators: 'Sigue con', sourcesTitle: 'Fuentes oficiales de esta página', writtenBy: 'Preparado por',
  asOf: 'Situación', lastUpdated: 'fiestas leídas en el BOE y en los boletines oficiales el', footerValidated: 'Fuentes: resoluciones de la Dirección General de Trabajo con las fiestas laborales de 2026 y 2027 (BOE), decretos de fiestas de cada comunidad, resoluciones de fiestas locales de cada boletín autonómico o provincial, Estatuto de los Trabajadores (art. 37.2), Real Decreto 2001/1983, Real Decreto 236/2002 y Comunicación de la Comisión C/2026/1660 (hora de verano)',
  footerBrowser: 'Las herramientas funcionan en tu navegador · nada de lo que escribes o buscas se envía ni se guarda · sin cuenta ni registro',
  footerDisclaimer: 'Sitio independiente de Radif Partners, no gubernamental, sin relación con el Ministerio de Trabajo, las comunidades autónomas ni los ayuntamientos. Información orientativa: el calendario que obliga es el publicado en el boletín oficial y el que aplique tu convenio o tu empresa.',
  footerPopular: 'Más consultados',
  notFound: 'En esta dirección no hay ninguna página. En la portada buscas tu municipio y ves su calendario laboral completo.',
  readMore: 'Seguir leyendo',
  moreOptions: 'Más datos', copyLink: 'Copiar el enlace', copied: 'Enlace copiado', print: 'Imprimir', howComputed: 'Cómo se calcula', openFull: 'Abrir la herramienta completa',
  independent: 'Sitio independiente, no gubernamental',
};
const en: typeof es = {
  updatedOn: 'Updated on', editorialPolicy: 'Editorial policy', contactLabel: 'Contact', reviewedBy: 'Prepared by',
  skipToContent: 'Skip to content', mainNav: 'Main navigation', breadcrumbLabel: 'Breadcrumb', breadcrumbHome: 'Home', menuOpen: 'Open menu',
  faqTitle: 'Common questions', relatedCalculators: 'Keep going', sourcesTitle: 'Official sources for this page', writtenBy: 'Prepared by',
  asOf: 'As of', lastUpdated: 'holidays read in the BOE and the official gazettes on', footerValidated: 'Sources: Directorate-General for Labour resolutions listing the 2026 and 2027 public holidays (BOE), each region\'s holiday decree, the local-holiday resolutions in each regional or provincial gazette, Workers\' Statute (art. 37.2), Royal Decree 2001/1983, Royal Decree 236/2002 and Commission Communication C/2026/1660 (summer time)',
  footerBrowser: 'The tools run in your browser · nothing you type or search for is sent or stored · no account, no sign-up',
  footerDisclaimer: 'Independent, non-governmental site published by Radif Partners, not affiliated with the Ministry of Labour, the regional governments or the town councils. Indicative only: the binding calendar is the one in the official gazette and the one your collective agreement or employer applies.',
  footerPopular: 'Most visited',
  notFound: 'Nothing lives at this address. On the home page, search for your town and see its full holiday calendar.',
  readMore: 'Read more',
  moreOptions: 'More details', copyLink: 'Copy share link', copied: 'Link copied', print: 'Print', howComputed: 'How this is calculated', openFull: 'Open the full tool',
  independent: 'Independent, non-governmental site',
};
const ALL = { es, en };
export function t(lang: Locale) { return ALL[lang] ?? es; }
