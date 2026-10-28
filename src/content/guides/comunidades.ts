import { defineGuide, type GuideDef, type Helpers } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';
import type { Fiesta } from '../../lib/datos';
import { lista, propias } from './_util';
import { NOTAS } from './_ccaa-notas';
import { EXTRA } from './_ccaa-extra';
import { PLAN } from './_ccaa-plan';

/* Una página por comunidad o ciudad autónoma (cl-<id>). Las fechas salen de festivos.json (BOE), de
   src/data/municipal (boletines autonómicos o provinciales) y de src/data/escolar ; el texto propio de
   cada comunidad está en _ccaa-notas.ts. */
type L = 'es' | 'en';
const Y = 2027, Y0 = 2026;
const VECINAS: Record<string, string[]> = {
  andalucia: ['extremadura', 'murcia', 'castilla-la-mancha'], aragon: ['cataluna', 'navarra', 'valenciana'],
  asturias: ['galicia', 'cantabria', 'castilla-y-leon'], baleares: ['cataluna', 'valenciana', 'canarias'],
  canarias: ['baleares', 'andalucia', 'madrid'], cantabria: ['asturias', 'pais-vasco', 'castilla-y-leon'],
  'castilla-la-mancha': ['madrid', 'valenciana', 'andalucia'], 'castilla-y-leon': ['madrid', 'galicia', 'asturias'],
  cataluna: ['aragon', 'valenciana', 'baleares'], extremadura: ['andalucia', 'castilla-y-leon', 'castilla-la-mancha'],
  galicia: ['asturias', 'castilla-y-leon', 'cantabria'], madrid: ['castilla-la-mancha', 'castilla-y-leon', 'andalucia'],
  murcia: ['valenciana', 'andalucia', 'castilla-la-mancha'], navarra: ['pais-vasco', 'la-rioja', 'aragon'],
  'pais-vasco': ['navarra', 'cantabria', 'la-rioja'], 'la-rioja': ['navarra', 'pais-vasco', 'castilla-y-leon'],
  valenciana: ['cataluna', 'murcia', 'aragon'], ceuta: ['melilla', 'andalucia', 'canarias'], melilla: ['ceuta', 'andalucia', 'murcia'],
};
const slugEn = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/** Primer texto de la lista cuya longitud está entre min y max ; si no hay, error de compilación. */
function fit(cands: string[], min: number, max: number, what: string, tails: string[] = ['']): string {
  const all = cands.flatMap((c) => tails.map((t) => c.endsWith('.') && t ? c.slice(0, -1) + t : c));
  const ok = all.find((c) => c.length >= min && c.length <= max);
  if (!ok) throw new Error(`${what}: ninguna variante entre ${min} y ${max} (${cands.map((c) => c.length).join(', ')})`);
  return ok;
}
const h_dm = (d: string, l: L) => `${K.fSemana(d, l).slice(0, 3)} ${K.fDia(d, l)}`;
const dW = (f: string, l: L) => `${K.fSemana(f, l)} ${K.fDia(f, l)}`;
const fl = (fs: Fiesta[], l: L) => lista(fs.map((f) => `${f[l]} (${dW(f.fecha, l)})`), l);

/** Puentes de una comunidad : para cada fiesta entre semana, lo que da sin pedir nada o pidiendo uno o dos días. */
function puentesCcaa(ccaa: string, l: L): Array<{ comun: boolean; txt: string; fecha: string; nombre: string; libres: number; pide: string }> {
  const com = new Set(K.comunes(Y).map((f) => f.fecha));
  const fs = K.fiestasCcaa(Y, ccaa).filter((f) => !K.isWeekend(f.fecha));
  const set = new Set(K.fiestasCcaa(Y, ccaa).map((f) => f.fecha));
  const seen = new Set<string>();
  const out: Array<{ comun: boolean; txt: string; fecha: string; nombre: string; libres: number; pide: string }> = [];
  for (const f of fs) {
    let libres = 0, pideTxt = '';
    const w = K.weekday(f.fecha);
    if (seen.has(f.fecha)) continue;
    let txt = '';
    if (w === 1 || w === 5) {
      const b = K.bloquesLibres(K.addDays(f.fecha, -4), K.addDays(f.fecha, 4), set).find((x) => x.desde <= f.fecha && x.hasta >= f.fecha)!;
      K.range(b.desde, b.hasta).forEach((d) => seen.add(d));
      libres = b.dias; pideTxt = l === 'es' ? 'nada' : 'nothing';
      txt = l === 'es' ? `${f.es}, ${dW(f.fecha, 'es')}: ${b.dias} días libres seguidos sin pedir vacaciones` : `${f.en}, ${dW(f.fecha, 'en')}: ${b.dias} days off in a row without taking leave`;
    } else {
      const h = K.huecos(K.addDays(f.fecha, -6), K.addDays(f.fecha, 6), set, 2)
        .filter((x) => x.libreDesde <= f.fecha && x.libreHasta >= f.fecha)
        .sort((a, b) => b.rinde - a.rinde || a.pedir - b.pedir)[0];
      if (!h) continue;
      K.range(h.libreDesde, h.libreHasta).forEach((d) => seen.add(d));
      const pide = K.range(h.desde, h.hasta).filter((d) => !K.isWeekend(d) && !set.has(d));
      libres = h.libres; pideTxt = pide.map((d) => h_dm(d, l)).join(', ');
      txt = l === 'es'
        ? `${f.es}, ${dW(f.fecha, 'es')}: pidiendo ${lista(pide.map((d) => `el ${dW(d, 'es')}`), 'es')}, ${h.libres} días libres`
        : `${f.en}, ${dW(f.fecha, 'en')}: book ${lista(pide.map((d) => dW(d, 'en')), 'en')} for ${h.libres} days off`;
    }
    out.push({ comun: com.has(f.fecha), txt, fecha: f.fecha, nombre: f[l], libres, pide: pideTxt });
  }
  return out;
}

/** Puentes de las fiestas propias, en prosa ; los de las fiestas comunes van en la tabla. */
function puProp(xs: Array<{ comun: boolean; txt: string }>, l: L, n: string) {
  const p = xs.filter((x) => !x.comun);
  if (!p.length) return l === 'es' ? `<p>Ninguna fiesta propia de ${n} deja puente en 2027; los de las fiestas comunes están en la tabla.</p>` : `<p>None of ${n}'s own holidays makes a long weekend in 2027; those of the shared holidays are in the table.</p>`;
  return `<ul>${p.map((x) => `<li>${x.txt}.</li>`).join('')}</ul>`;
}

/** Cambios de la lista de la comunidad entre 2026 y 2027 (por nombre de fiesta, sin las comunes). */
function cambios(ccaa: string) {
  const a = propias(Y0, ccaa), b = propias(Y, ccaa);
  const key = (f: Fiesta) => f.es.toLowerCase().slice(0, 14);
  const ka = new Set(a.map(key)), kb = new Set(b.map(key));
  return { sale: a.filter((f) => !kb.has(key(f))), entra: b.filter((f) => !ka.has(key(f))), siguen: b.filter((f) => ka.has(key(f))) };
}

function locSection(ccaa: string, h: Helpers, l: L) {
  const F = K.MUNICIPAL[ccaa]; if (!F) return '';
  const c = K.comunidad(ccaa);
  const ms = F.municipios;
  const con27 = ms.filter((m) => m.fiestas[String(Y)]);
  const pend = F.fuentes[String(Y)] && 'estado' in F.fuentes[String(Y)];
  const keys26 = Object.keys(F.fuentes).filter((k) => k.startsWith(String(Y0)) && 'url' in F.fuentes[k]);
  const keys27 = Object.keys(F.fuentes).filter((k) => k.startsWith(String(Y)) && 'url' in F.fuentes[k]);
  const yr = con27.length ? Y : Y0;
  const li = ms.map((m) => {
    const fs = m.fiestas[String(yr)];
    const d = fs ? lista(fs.map((x) => `${h.dm(x.fecha)}${/^(fiesta|festa) local$/i.test(x.nombre) ? '' : ` (${x.nombre.replace(/\s*\(.*$/, '').replace(/,.*$/, '')})`}`), l) : (l === 'es' ? 'sin publicar' : 'not published yet');
    return `<li><strong>${m.nombre}</strong>: ${d}</li>`;
  }).join('');
  const srcs = (ks: string[]) => lista(ks.map((k) => h.src(`loc-${ccaa}-${k}`, `${(F.fuentes[k] as { boletin: string }).boletin} ${K.fFecha((F.fuentes[k] as { fecha: string }).fecha, l)}`)), l);
  if (l === 'es') {
    const estado = con27.length === ms.length
      ? `Las de ${Y} ya están publicadas para los ${ms.length} municipios de la lista (${srcs(keys27)}).`
      : con27.length
        ? `Las de ${Y} están publicadas para ${con27.length} de los ${ms.length} municipios de la lista (${srcs(keys27)}); en el resto la herramienta indica «sin publicar».`
        : `Las de ${Y} aún no están publicadas${pend ? ` (comprobado el ${K.fFecha((F.fuentes[String(Y)] as { comprobado: string }).comprobado, 'es')})` : ''}, así que esta lista da las de ${Y0}, según ${srcs(keys26)}. Suelen repetirse, pero las que dependen de la Pascua o caen en domingo cambian de fecha.`;
    return `<h2>Fiestas locales en ${c.es} (${yr})</h2>\n<p>${estado}</p>\n<ul>${li}</ul>`;
  }
  const estado = con27.length === ms.length
    ? `The ${Y} ones are already published for all ${ms.length} towns on the list (${srcs(keys27)}).`
    : con27.length
      ? `The ${Y} ones are published for ${con27.length} of the ${ms.length} towns on the list (${srcs(keys27)}); for the rest the tool says "not published yet".`
      : `The ${Y} ones are not published yet${pend ? ` (checked on ${K.fFecha((F.fuentes[String(Y)] as { comprobado: string }).comprobado, 'en')})` : ''}, so this list gives the ${Y0} ones, from ${srcs(keys26)}. They tend to repeat, but those tied to Easter or falling on a Sunday change date.`;
  return `<h2>Local holidays in ${c.en} (${yr})</h2>\n<p>${estado}</p>\n<ul>${li}</ul>`;
}

function escSection(ccaa: string, h: Helpers, l: L, i: number) {
  const E = K.ESCOLAR[ccaa]; if (!E || !E.fuente?.url) return '';
  const c = K.comunidad(ccaa);
  const ok = (x?: { inicio: string | null; fin: string | null }) => !!x && !!x.inicio && !!x.fin;
  const pr = ok(E.primaria) ? E.primaria! : null, so = ok(E.eso) ? E.eso! : null;
  const n = E.navidad?.desde && E.navidad?.hasta ? E.navidad : null, s = E.semana_santa?.desde && E.semana_santa?.hasta ? E.semana_santa : null;
  const st = pr ?? so; const etapa = pr ? { es: 'en Primaria', en: 'primary school' } : { es: 'en ESO', en: 'secondary school' };
  if (!st && !n && !s) return '';
  const y4 = (d: string) => d.slice(0, 4);
  if (l === 'es') {
    const parts = [
      st ? `${etapa.es} las clases empiezan el ${dW(st.inicio, 'es')} de ${y4(st.inicio)} y terminan el ${dW(st.fin, 'es')} de ${y4(st.fin)}${pr && so && so.inicio !== pr.inicio ? `; en ESO empiezan el ${dW(so.inicio, 'es')}` : ''}.` : (E.primaria?.inicio ? `En Primaria las clases empiezan el ${dW(E.primaria.inicio, 'es')} de ${y4(E.primaria.inicio)}.` : ''),
      n ? `Las vacaciones de Navidad van del ${K.fDia(n.desde, 'es')} al ${K.fDia(n.hasta, 'es')}${s ? ` y las de Semana Santa del ${K.fDia(s.desde, 'es')} al ${K.fDia(s.hasta, 'es')}` : ''}, ambos incluidos.` : '',
    ].filter(Boolean).join(' ');
    return `<h2>Calendario escolar ${E.curso} en ${c.es}</h2>
<p>${i % 2 ? `El curso escolar ${E.curso} en ${c.es} lo fija la ${h.src(`esc-${ccaa}`, `norma publicada en el ${E.fuente.boletin} del ${K.fFecha(E.fuente.fecha, 'es')}${K.archivado(E.fuente.url, 'es')}`)}.` : `Según la ${h.src(`esc-${ccaa}`, `norma de calendario escolar (${E.fuente.boletin} del ${K.fFecha(E.fuente.fecha, 'es')}${K.archivado(E.fuente.url, 'es')})`)}:`} ${parts}</p>`;
  }
  const parts = [
    st ? `${etapa.en === 'primary school' ? 'Primary school' : 'Secondary school'} starts on ${dW(st.inicio, 'en')} ${y4(st.inicio)} and ends on ${dW(st.fin, 'en')} ${y4(st.fin)}${pr && so && so.inicio !== pr.inicio ? `; secondary starts on ${dW(so.inicio, 'en')}` : ''}.` : (E.primaria?.inicio ? `Primary school starts on ${dW(E.primaria.inicio, 'en')} ${y4(E.primaria.inicio)}.` : ''),
    n ? `The Christmas break runs from ${K.fDia(n.desde, 'en')} to ${K.fDia(n.hasta, 'en')}${s ? ` and the Easter break from ${K.fDia(s.desde, 'en')} to ${K.fDia(s.hasta, 'en')}` : ''}, both inclusive.` : '',
  ].filter(Boolean).join(' ');
  return `<h2>School calendar ${E.curso} in ${c.en}</h2>
<p>${i % 2 ? `The ${E.curso} school year in ${c.en} is set by the ${h.src(`esc-${ccaa}`, `rules published in the ${E.fuente.boletin} on ${K.fFecha(E.fuente.fecha, 'en')}${K.archivado(E.fuente.url, 'en')}`)}.` : `Under the ${h.src(`esc-${ccaa}`, `school calendar rules (${E.fuente.boletin}, ${K.fFecha(E.fuente.fecha, 'en')}${K.archivado(E.fuente.url, 'en')})`)}:`} ${parts}</p>`;
}

function page(ccaa: string, i: number): GuideDef {
  const c = K.comunidad(ccaa); const N = NOTAS[ccaa];
  const f27 = K.fiestasCcaa(Y, ccaa), p27 = propias(Y, ccaa), p26 = propias(Y0, ccaa);
  const semana27 = f27.filter((f) => !K.isWeekend(f.fecha));
  const finde27 = f27.filter((f) => K.isWeekend(f.fecha));
  const set27 = new Set(f27.map((f) => f.fecha));
  const lab = K.laborables(`${Y}-01-01`, `${Y}-12-31`, set27);
  const ch = cambios(ccaa);
  const nMun = K.municipiosDe(ccaa).length;
  const F = K.MUNICIPAL[ccaa];
  const capIne = F?.municipios[0]?.ine;
  const decs = [Y, Y0].map((y) => `dec-${ccaa}-${y}`).filter((k) => F?.decreto_autonomico?.[k.slice(-4)]?.url);
  const locs = F ? Object.keys(F.fuentes).filter((k) => 'url' in F.fuentes[k]).map((k) => `loc-${ccaa}-${k}`) : [];
  const esc = K.ESCOLAR[ccaa]?.fuente?.url ? [`esc-${ccaa}`] : [];
  const pu = { es: puentesCcaa(ccaa, 'es'), en: puentesCcaa(ccaa, 'en') };
  const islas = ccaa === 'canarias';
  const v = VECINAS[ccaa];
  const es = c.es, en = c.en;
  const enIn = (['baleares', 'canarias', 'pais-vasco', 'valenciana', 'madrid'].includes(ccaa) ? 'the ' : '') + en;
  const enS = ccaa === 'madrid' ? 'madrid' : slugEn(en);

  const cambiosTxt = (l: L) => {
    const s = ch.sale.length ? (l === 'es' ? `Salen de la lista ${fl(ch.sale, 'es').replace(/\(([^)]*)\)/g, '(de 2026: $1)')}` : `Off the list: ${fl(ch.sale, 'en').replace(/\(([^)]*)\)/g, '(2026: $1)')}`) : '';
    const e = ch.entra.length ? (l === 'es' ? `entran ${fl(ch.entra, 'es')}` : `new: ${fl(ch.entra, 'en')}`) : '';
    const k = ch.siguen.length ? (l === 'es' ? `Repiten ${lista(ch.siguen.map((f) => f.es), 'es')}` : `Kept: ${lista(ch.siguen.map((f) => f.en), 'en')}`) : '';
    return [[s, e].filter(Boolean).join(l === 'es' ? ', y ' : '; '), k].filter(Boolean).join('. ') + '.';
  };

  const titleEs = fit([
    `Calendario laboral 2027 ${es}: festivos, locales y puentes`,
    `Calendario laboral 2027 ${es}: festivos y puentes`,
    `Calendario laboral 2027 ${es}: festivos locales`,
    `Calendario laboral 2027 de ${es}: los 14 festivos`,
    `Calendario laboral 2027 ${es}: festivos`,
    `Calendario laboral 2027 ${es}`,
  ], 50, 60, `title es ${ccaa}`);
  const titleEn = fit([
    `Holidays 2027 in ${enIn}: work calendar, local days, long weekends`,
    `Holidays 2027 in ${enIn}: work calendar and long weekends`,
    `Holidays 2027 in ${enIn}: regional and local days off`,
    `Holidays 2027 in ${enIn}: local days and long weekends`,
    `Holidays 2027 in ${enIn}: work calendar by town`,
    `Holidays 2027 in ${enIn}: days off by town`,
    `Holidays 2027 in ${enIn}: work calendar`,
  ], 50, 60, `title en ${ccaa}`);
  const pName = (l: L) => (p27[0] ? p27[0][l] : '');
  const descEs = fit([
    `Calendario laboral 2027 de ${es}: sus ${f27.length} fiestas según el BOE, ${p27.length} propias como ${pName('es')}, las locales de ${nMun} municipios y los puentes.`,
    `Calendario laboral 2027 de ${es}: sus ${f27.length} fiestas según el BOE, las locales de ${nMun} municipios, los puentes del año y los laborables de cada mes.`,
    `Calendario laboral 2027 de ${es}: ${f27.length} fiestas según el BOE, locales de ${nMun} municipios, puentes y laborables de cada mes, con agenda.`,
    `Calendario laboral 2027 de ${es}: las ${f27.length} fiestas de la comunidad según el BOE, las locales de sus municipios y los puentes del año.`,
    `Calendario laboral 2027 de ${es}: las ${f27.length} fiestas según el BOE, las locales de sus municipios, los puentes y los laborables de cada mes.`,
  ], 150, 160, `description es ${ccaa}`, ['', ', con agenda.', ', con su agenda.', ' y la agenda.', ', con agenda descargable.', ', con fuentes oficiales.', ' con agenda descargable.']);
  const descEn = fit([
    `Holidays 2027 in ${en}, Spain: its ${f27.length} days off from the BOE, ${p27.length} regional ones such as ${pName('en')}, local days in ${nMun} towns, long weekends.`,
    `Holidays 2027 in ${en}, Spain: its ${f27.length} days off from the BOE, local holidays in ${nMun} towns, the long weekends and working days per month.`,
    `Holidays 2027 in ${en}, Spain: its ${f27.length} days off from the official gazette, local holidays in its towns, long weekends and working days.`,
    `Holidays 2027 in ${en}, Spain: the ${f27.length} regional days off from the BOE, local holidays in its towns, long weekends and monthly working days.`,
    `Holidays 2027 in ${en}, Spain: ${f27.length} regional days off from the BOE, local holidays in each town, long weekends and working days per month.`,
  ], 150, 160, `description en ${ccaa}`, ['', ', with .ics.', ', with an .ics file.', ' and an .ics file.', ', with official sources.', ' and a calendar file.']);

  const meses = K.resumenMeses(Y, set27); const hi = meses.reduce((a, b) => (b.laborables > a.laborables ? b : a)); const lo = meses.reduce((a, b) => (b.laborables < a.laborables ? b : a));
  const mx = { es: `${K.Mes(hi.mes, 'es')} es el mes con más (${hi.laborables}) y ${K.MES(lo.mes, 'es')} el que menos (${lo.laborables}).`, en: `${K.Mes(hi.mes, 'en')} has the most (${hi.laborables}) and ${K.Mes(lo.mes, 'en')} the fewest (${lo.laborables}).` };
  const tablaCambios = (l: L) => {
    const key = (f: Fiesta) => f.es.toLowerCase().slice(0, 14);
    const m = new Map<string, { n: string; a?: string; b?: string }>();
    for (const f of p26) m.set(key(f), { n: f[l], a: dW(f.fecha, l) });
    for (const f of p27) { const x = m.get(key(f)); if (x) x.b = dW(f.fecha, l); else m.set(key(f), { n: f[l], b: dW(f.fecha, l) }); }
    const no = l === 'es' ? 'no festivo' : 'not a holiday';
    return [...m.values()].map((x) => [x.n, x.a ?? no, x.b ?? no]);
  };
  const faq3 = (l: L) => {
    return l === 'es'
      ? { q: `¿Qué fiestas de ${es} cambian de 2026 a 2027?`, a: `${cambiosTxt('es')}${cambiosTxt('es').split(' ').length < 34 ? ' Las comunes a toda España también cambian de día de la semana: en 2027 el 1 de mayo y el 25 de diciembre caen en sábado y el 15 de agosto en domingo.' : ` Fuente: resolución del BOE de ${Y} y la de ${Y0}.`}` }
      : { q: `Which ${en} holidays change from 2026 to 2027?`, a: `${cambiosTxt('en')}${cambiosTxt('en').split(' ').length < 34 ? ' The holidays shared by all of Spain also move to another weekday: in 2027 1 May and 25 December fall on a Saturday and 15 August on a Sunday.' : ` Source: the ${Y} and ${Y0} BOE resolutions.`}` };
  };
  const loc27 = F ? F.municipios.filter((m) => m.fiestas[String(Y)]).length : 0;
  const pubEs = loc27 ? `Las fiestas locales de ${Y} ya están publicadas para ${loc27} de los ${nMun} municipios de la lista.` : `Las fiestas locales de ${Y} aún no están publicadas, y la herramienta lo indica.`;
  const pubEn = loc27 ? `Local holidays for ${Y} are already published for ${loc27} of the ${nMun} towns on the list.` : `Local holidays for ${Y} are not published yet, and the tool says so.`;

  return defineGuide({
    id: `cl-${ccaa}`, group: 'comunidades', order: 20 + i,
    tool: 'municipio', toolArg: { ccaa, muni: capIne ?? '', year: String(Y) },
    related: ['calendario-laboral-2027', 'puentes-2027', 'fiestas-locales', ...v.map((x) => `cl-${x}`)],
    sources: ['boe-2027', 'boe-2026', ...decs, ...locs, ...esc],
    es: {
      slug: `calendario-laboral-2027-${ccaa}`,
      nav: `${es} 2027`, card: `Las ${f27.length} fiestas de ${es} en 2027 y las locales de sus municipios`,
      title: titleEs, description: descEs,
      h1: `Calendario laboral 2027 de ${es}`,
      intro: [`${es} tiene ${f27.length} fiestas en 2027, ${semana27.length} de ellas entre semana. Elige tu municipio para añadir sus dos fiestas locales.`, `En 2027, ${semana27.length} de las ${f27.length} fiestas de ${es} caen de lunes a viernes. Busca tu municipio y suma sus dos locales.`, `Fiestas de ${es} en 2027: ${f27.length}, de las que ${semana27.length} son días laborables libres. Con tu municipio se añaden las dos locales.`, `Estas son las ${f27.length} fiestas laborales de ${es} en 2027; ${semana27.length} caen entre semana. Añade tu municipio para ver también sus dos locales.`][i % 4],
      resume: `${N.es.lead} En 2027 tiene ${f27.length} fiestas${islas ? ' comunes, más la de cada isla' : ''}: las ${K.comunes(Y).length} de toda España y ${p27.length === 1 ? 'una propia' : `${p27.length} propias`}, ${fl(p27, 'es')}. ${N.es.nota}`,
      faqs: [
        { q: N.es.q, a: N.es.a },
        { q: `¿Cuántos días laborables tiene ${es} en 2027?`, a: [`${lab}, de lunes a viernes y sin las fiestas locales. ${mx.es} De sus ${f27.length} fiestas, ${finde27.length} caen en fin de semana (${lista(finde27.map((f) => f.es), 'es')}) y no se recuperan. Con las dos locales entre semana, quedan ${lab - 2}.`, `Sin contar las locales, ${lab} días de lunes a viernes. ${mx.es} ${lista(finde27.map((f) => f.es), 'es')} caen en fin de semana, así que ${es} pierde ${finde27.length} de sus ${f27.length} fiestas. Si las dos locales de tu municipio caen entre semana, te quedan ${lab - 2} días de trabajo.`, `${es} suma ${lab} laborables en 2027 antes de restar las dos fiestas de cada municipio, que normalmente dejan ${lab - 2}. ${mx.es} Las ${finde27.length} fiestas que caen en sábado o domingo (${lista(finde27.map((f) => f.es), 'es')}) no dan día libre.`][(i + 1) % 3] },
        faq3('es'),
      ],
      body: (h) => `<h2>Las ${f27.length} fiestas de ${es} en 2027</h2>
${h.table(['Fecha', 'Día', 'Fiesta', 'Ámbito'], f27.map((f) => [h.dm(f.fecha), K.fSemana(f.fecha, 'es'), f.es, f.tipo === 'autonomica' ? 'autonómica' : 'nacional']), undefined, ['l', 'l', 'l', 'l'])}
<p>${EXTRA[ccaa].es}</p>
<h2>Cambios respecto a 2026</h2>
<p>${[`De un año a otro, ${es} ${ch.sale.length || ch.entra.length ? 'cambia parte de su lista' : 'mantiene su lista'}`, `${es} ${ch.sale.length || ch.entra.length ? 'no repite todas sus fiestas' : 'repite sus fiestas'} de 2026`, `Comparada con la de 2026, la lista de ${es} ${ch.sale.length || ch.entra.length ? 'cambia' : 'no cambia'}`][i % 3]}${decs.length ? ` (${h.src(decs[0], 'norma de la comunidad')})` : ''}.</p>
${h.table(['Fiesta propia', '2026', '2027'], tablaCambios('es'), undefined, ['l', 'l', 'l'])}
${h.mini('laborables', { p: ['year'], d: { ccaa, year: '2027' }, t: `Laborables de ${es} mes a mes` })}
<h2>Puentes de 2027 en ${es}</h2>
<p>${PLAN[ccaa].es}</p>
${puProp(pu.es, 'es', es)}
${h.table(['Fiesta común', 'Fecha', 'Pedir', 'Días libres'], pu.es.filter((x) => x.comun).map((x) => [x.nombre, h.dm(x.fecha), x.pide, x.libres]), undefined, ['l', 'l', 'l', 'r'])}
${h.mini('puentes', { p: ['dias'], d: { ccaa, year: '2027', dias: 3 }, t: `Mejor reparto de vacaciones en ${es}` })}
${locSection(ccaa, h, 'es')}
${escSection(ccaa, h, 'es', i)}
<p>Compara con ${lista(v.map((x) => h.a(`cl-${x}`, K.comunidad(x).es)), 'es')}, o mira el ${h.a('calendario-laboral-2027', 'calendario laboral de toda España')}.</p>`,
    },
    en: {
      slug: `${enS}-public-holidays-2027`,
      nav: `${en} 2027`, card: `${en}'s ${f27.length} holidays in 2027 and its towns' local days`,
      title: titleEn, description: descEn,
      h1: `Public holidays 2027 in ${enIn}`,
      intro: [`${en} has ${f27.length} public holidays in 2027, ${semana27.length} of them on weekdays. Pick your town to add its two local holidays.`, `In 2027, ${semana27.length} of ${enIn}'s ${f27.length} holidays fall Monday to Friday. Find your town to add its two local days.`, `${en}'s holidays in 2027: ${f27.length}, of which ${semana27.length} free a working day. Your town adds two local ones.`, `These are ${enIn}'s ${f27.length} public holidays in 2027; ${semana27.length} fall on weekdays. Add your town to see its two local ones too.`][i % 4],
      resume: `${N.en.lead} In 2027 it has ${f27.length} public holidays${islas ? ', plus one per island' : ''}: the ${K.comunes(Y).length} shared by all of Spain and ${p27.length === 1 ? 'one of its own' : `${p27.length} of its own`}, ${fl(p27, 'en')}. ${N.en.nota}`,
      faqs: [
        { q: N.en.q, a: N.en.a },
        { q: `How many working days does ${en} have in 2027?`, a: [`${lab}, Monday to Friday and before local holidays. ${mx.en} Of its ${f27.length} holidays, ${finde27.length} fall on a weekend (${lista(finde27.map((f) => f.en), 'en')}) and are not made up. With two weekday local holidays, ${lab - 2} remain.`, `Leaving local holidays aside, ${lab} days Monday to Friday. ${mx.en} ${lista(finde27.map((f) => f.en), 'en')} land on a weekend, so ${en} loses ${finde27.length} of its ${f27.length} holidays. If your town's two local days fall midweek, you work ${lab - 2} days.`, `${en} counts ${lab} working days in 2027 before each town's two local holidays, which usually bring it to ${lab - 2}. ${mx.en} The ${finde27.length} holidays falling on a Saturday or Sunday (${lista(finde27.map((f) => f.en), 'en')}) give no day off.`][(i + 1) % 3] },
        faq3('en'),
      ],
      body: (h) => `<h2>${en}'s ${f27.length} public holidays in 2027</h2>
${h.table(['Date', 'Day', 'Holiday', 'Scope'], f27.map((f) => [h.dm(f.fecha), K.fSemana(f.fecha, 'en'), f.en, f.tipo === 'autonomica' ? 'regional' : 'national']), undefined, ['l', 'l', 'l', 'l'])}
<p>${EXTRA[ccaa].en}</p>
<h2>Changes from 2026</h2>
<p>${[`From one year to the next, ${en} ${ch.sale.length || ch.entra.length ? 'changes part of its list' : 'keeps its list'}`, `${en} ${ch.sale.length || ch.entra.length ? 'does not repeat all' : 'repeats all'} of its 2026 holidays`, `Compared with 2026, ${enIn}'s list ${ch.sale.length || ch.entra.length ? 'changes' : 'stays the same'}`][i % 3]}${decs.length ? ` (${h.src(decs[0], 'regional rule')})` : ''}.</p>
${h.table(['Own holiday', '2026', '2027'], tablaCambios('en'), undefined, ['l', 'l', 'l'])}
${h.mini('laborables', { p: ['year'], d: { ccaa, year: '2027' }, t: `${en} working days by month` })}
<h2>Long weekends in 2027 in ${en}</h2>
<p>${PLAN[ccaa].en}</p>
${puProp(pu.en, 'en', en)}
${h.table(['Shared holiday', 'Date', 'Book', 'Days off'], pu.en.filter((x) => x.comun).map((x) => [x.nombre, h.dm(x.fecha), x.pide, x.libres]), undefined, ['l', 'l', 'l', 'r'])}
${h.mini('puentes', { p: ['dias'], d: { ccaa, year: '2027', dias: 3 }, t: `Best use of leave in ${en}` })}
${locSection(ccaa, h, 'en')}
${escSection(ccaa, h, 'en', i)}
<p>Compare with ${lista(v.map((x) => h.a(`cl-${x}`, K.comunidad(x).en)), 'en')}, or see the ${h.a('calendario-laboral-2027', 'holiday calendar for all of Spain')}.</p>`,
    },
  });
}

export default K.COMUNIDADES.map((c, i) => page(c.id, i));
