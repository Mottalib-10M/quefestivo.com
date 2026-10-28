/** Configuration centrale du site (générée par new-site.py). */
export const SITE_URL = "https://quefestivo.com";
export const SITE_NAMES: Record<string, string> = {"es": "Qué Festivo", "en": "Qué Festivo"};
// Partie du nom affichée en couleur dans l'en-tête (RECETTE §10.3), « » pour aucune.
export const BRAND_ACCENT = "Festivo";
export const LANG_TAGS: Record<string, string> = {"es": "es-ES", "en": "en-ES"};
export const OG_LOCALES: Record<string, string> = {"es": "es_ES", "en": "en_GB"};
export const LOCALE_TAG = 'es-ES';
/** Locale des nombres et des dates par langue de page (RECETTE §4) : l'anglais d'un site espagnol écrit « 1,234 » et « 6 January 2027 ». */
export const NUM_TAGS: Record<string, string> = {"es": "es-ES", "en": "en-GB"};
export const CURRENCY = 'EUR';
export const YEAR = 2026;
/** Année de création du site — signal d'ancienneté (RECETTE §8.0). */
export const SITE_FOUNDED = '2026';
export const LAST_UPDATED = '2026-10-28';
export const AUTHOR_NAME = 'Radif Partners';
export const AUTHOR_ROLE: Record<string, string> = {"es": "Editor de calendarios laborales gratuitos para España: festivos nacionales, autonómicos y locales de cada municipio, puentes, cambio de hora y Semana Santa, calculados en tu navegador", "en": "Publisher of free Spanish work calendars: national, regional and local public holidays for each town, long weekends, clock changes and Holy Week, worked out in your browser"};
export const AUTHOR_DESC: Record<string, string> = {"es": "Radif Partners es un editor independiente. Para Qué Festivo lee la resolución anual de la Dirección General de Trabajo en el BOE, los decretos de fiestas de cada comunidad y las órdenes y resoluciones que fijan las dos fiestas locales de cada municipio en el boletín autonómico o provincial; las fechas que dependen de una regla (Semana Santa, Carnaval, cambio de hora) las calcula con algoritmos probados. No es una administración ni una gestoría, y nada de lo que escribes sale de tu navegador.", "en": "Radif Partners is an independent publisher. For Qué Festivo it reads the Directorate-General for Labour's yearly resolution in the BOE, each region's holiday decree and the orders that fix every town's two local holidays in the regional or provincial gazette; dates that follow a rule (Holy Week, Carnival, clock changes) are computed with tested algorithms. It is not a public body or an agency, and nothing you type leaves your browser."};
/** Sujets sur lesquels l'editeur est competent (schema.org knowsAbout). Ce sont les
 *  themes reellement traites par le site, pas une liste de mots-cles : un sujet
 *  declare ici sans page qui le couvre est une declaration fausse. */
export const KNOWS_ABOUT: Record<string, string[]> = {"es": ["fiestas laborales en España", "calendario laboral por comunidad autónoma", "fiestas locales de los municipios", "puentes y días de vacaciones", "cambio de hora", "Semana Santa y fechas móviles"], "en": ["Spanish public holidays", "regional work calendars in Spain", "local town holidays in Spain", "long weekends and leave planning", "daylight saving time in Spain", "Holy Week and movable feasts"]};
export const CONTACT_EMAIL = "contact@quefestivo.com";
export const THEME_COLOR = '#8E1B24';
export const LOGO_SYMBOL = 'CL';
export const BING_VERIFY_CODE = '';
export const GOOGLE_VERIFY_CODE = '';
/** Régime : 'none' pour tous les sites (RECETTE §15.6, décision de l'éditeur du 2026-10-06) :
 *  aucun bandeau ; Clarity chargé en mode sans cookie (consentv2 denied) ; GA4 avec cookies si GA4_ID.
 *  'opt-in' / 'notice' ne servent plus qu'aux sites anciens qui les portent encore. */
export const CONSENT_MODE: 'opt-in' | 'notice' | 'none' = 'none';
/** Propriété Google Analytics 4 (décision de l'éditeur du 2026-10-17, RECETTE §15.6) : GA4 normal,
 *  avec cookies _ga / _ga_<ID> (390 jours), sans bandeau, publicité refusée. Créée par
 *  `seo-platform/scripts/create-ga4.ts accounts/372759688` (RECETTE §15.3, étape 15), puis
 *  pages légales régénérées : `python3 scripts/gen-legal-pages.py .`. Vide = pas de GA4. */
export const GA4_ID = 'G-2PH1ZLEJGH';
/** Projet Microsoft Clarity (compte amradif), chargé sans cookie. Vide = aucune mesure. */
export const CLARITY_ID = 'z4zpa093ig';
export const INDEXNOW_KEY = '1a108faa65a92ef2d5efcbed59e17bea';

/* ------------------------------------------------------------------------- *
 * IDENTITÉ LÉGALE — À COMPLÉTER AVANT LA MISE EN LIGNE
 * Ces champs alimentent la mention légale du pays, la politique de confidentialité,
 * la page contact et le schema Organization. Un champ vide s'affiche en jaune
 * sur le site. Contrôle : `npm run check:legal`.
 * ------------------------------------------------------------------------- */
export interface LegalHosting { name: string; address: string; phone: string; url: string }
export interface LegalIdentity {
  entityName: string; legalForm: string; street: string; postalCode: string; city: string;
  country: string; phone: string; registerLabel: string; registerNumber: string;
  vatLabel: string; vatNumber: string; jurisdiction: string;
  supervisoryAuthority: string; supervisoryAuthorityUrl: string; hosting: LegalHosting;
}
export const LEGAL: LegalIdentity = {
  entityName: 'Radif Partners',  // éditeur de tous les sites du portefeuille (RECETTE §8)
  legalForm: '',  // vide : comme les autres sites du portefeuille
  street: '49 rue du Ressort',
  postalCode: '63000',
  city: 'Clermont-Ferrand',
  country: "Francia / France",
  phone: '',                 // ligne de contact publiée
  registerLabel: "SIREN",
  registerNumber: '',
  vatLabel: "NIF-IVA",
  vatNumber: '',             // laisser vide si non assujetti
  jurisdiction: "France",
  supervisoryAuthority: "Commission nationale de l'informatique et des libertés (CNIL)",
  supervisoryAuthorityUrl: "https://www.cnil.fr",
  hosting: { name: 'GitHub, Inc. (GitHub Pages)', address: '88 Colin P Kelly Jr Street, San Francisco, CA 94107, United States', phone: '', url: 'https://pages.github.com' },
};

/** Champs sans lesquels le site ne doit pas être mis en ligne. */
export const LEGAL_REQUIRED: Array<keyof LegalIdentity> = ['entityName', 'street', 'postalCode', 'city']; // legalForm vide à dessein, comme les autres sites du portefeuille

/** Profils publics de l'auteur (schema.org sameAs). Laisser vide si aucun. */
export const AUTHOR_SAME_AS: string[] = [];

/** Rythme de revue éditoriale annoncé sur le site, en mois. */
export const REVIEW_CYCLE_MONTHS = 12;
