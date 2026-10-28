/** llms.txt (RECETTE §21), generado a partir del registro de páginas. */
import { GUIDES } from '../lib/pages';
import { SITE_URL, LAST_UPDATED, SITE_NAMES } from '../data/site-config';
import { route } from '../i18n/routes';
import { GROUPS } from '../i18n/nav';
import { KIT as K } from '../lib/kit';
export function GET() {
  const R = K.resolucion(2027)!, c = K.comunes(2027), ch = K.cambioHora(2027), m = K.movibles(2027);
  const lines = [
    `# ${SITE_NAMES.en}`, '',
    `> Spanish public holiday calendar for 2026 and 2027, in Spanish and English, by region and by town. National and regional holidays are read in the BOE (2027: ${R.titulo}, BOE of ${R.fecha}); the two local holidays of ${K.MUNICIPIOS.length} towns (provincial capitals and the largest municipalities) are read in each regional or provincial gazette, with the issue and date cited; when a year's local holidays are not yet published, the site says so. 2027 has ${c.length} nationwide holidays: ${c.map((f) => `${f.en} ${f.fecha}`).join(', ')}. Each region has 12 holidays plus 2 local ones (Workers' Statute art. 37.2, Royal Decree 2001/1983 arts. 45-46). Easter 2027: Maundy Thursday ${m.jueves}, Good Friday ${m.viernes}, Easter Monday ${m.lunes} (Meeus algorithm, checked against the BOE). Clock change 2027: ${ch.verano} and ${ch.invierno} at 01:00 UTC (Commission Communication C/2026/1660; the Canaries change one hour earlier in local time). Tools: town search with .ics export, working days by month, long-weekend optimiser, live countdown. Browser-only, nothing sent or stored. Independent site published by Radif Partners, not affiliated with any public body. Last updated ${LAST_UPDATED}.`, '',
    ...GROUPS.flatMap((g) => [`## ${g.label.en} / ${g.label.es}`, ...GUIDES.filter((p) => p.group === g.id).flatMap((p) => [
      `- [${p.es.nav}](${SITE_URL}${route(p.id, 'es')}): ${p.es.card}`,
      `- [${p.en.nav}](${SITE_URL}${route(p.id, 'en')}): ${p.en.card}`,
    ]), '']),
    '## About', `- [Método](${SITE_URL}${route('method', 'es')})`, `- [Method](${SITE_URL}${route('method', 'en')})`, `- [Quiénes somos](${SITE_URL}${route('about', 'es')})`, `- [About](${SITE_URL}${route('about', 'en')})`,
  ];
  return new Response(lines.join('\n') + '\n', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
