import { defineGuide } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';
import { lista, estadoLocales } from './_util';

/* Fiestas locales: RD 2001/1983 art. 46; textos de cada comunidad o provincia en src/data/municipal, con boletín y fecha. */
const e26 = estadoLocales(2026), e27 = estadoLocales(2027);
const leidos26 = e26.filter((e) => e.conFiestas > 0), leidos27 = e27.filter((e) => e.conFiestas > 0);
const munis26 = K.MUNICIPIOS.filter((m) => K.locales(m.ine, 2026)).length, munis27 = K.MUNICIPIOS.filter((m) => K.locales(m.ine, 2027)).length;
/** Fechas de fiesta local más repetidas en 2026 entre los municipios leídos. */
const repes = (() => { const c = new Map<string, string[]>(); for (const m of K.MUNICIPIOS) for (const f of K.locales(m.ine, 2026) ?? []) c.set(f.fecha, [...(c.get(f.fecha) ?? []), m.nombre]); return [...c.entries()].sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0])).slice(0, 6); })();
const porMes = Array.from({ length: 12 }, (_, i) => K.MUNICIPIOS.reduce((s, m) => s + (K.locales(m.ine, 2026) ?? []).filter((f) => +f.fecha.slice(5, 7) === i + 1).length, 0));
const mesTop = porMes.indexOf(Math.max(...porMes)) + 1;
const fuente = (e: (typeof e26)[number], l: 'es' | 'en') => {
  if (!e.f) return l === 'es' ? 'sin datos' : 'no data';
  const s = e.src as { boletin?: string; fecha?: string; estado?: string; comprobado?: string } | undefined;
  if (e.conFiestas && s && s.fecha && s.boletin) return `${s.boletin}, ${K.fFecha(s.fecha, l)}`;
  if (e.conFiestas) return l === 'es' ? 'boletines provinciales' : 'provincial gazettes';
  return s && s.comprobado ? (l === 'es' ? `sin publicar (visto el ${K.fFecha(s.comprobado, l)})` : `not yet out (checked ${K.fFecha(s.comprobado, l)})`) : (l === 'es' ? 'sin publicar' : 'not yet out');
};

export default defineGuide({
  id: 'fiestas-locales', group: 'calendario', order: 8,
  tool: 'municipio', toolArg: { ccaa: 'pais-vasco', muni: '48020', year: '2027' },
  related: ['calendario-laboral-2027', 'calendario-laboral-2026', 'carnaval', 'cl-galicia', 'cl-castilla-la-mancha'],
  sources: ['rd2001', 'et', 'boe-2027'],
  es: {
    slug: 'fiestas-locales-2027',
    nav: 'Fiestas locales 2027', card: 'Las dos fiestas de cada municipio: quién las fija, dónde se publican y si ya han salido',
    title: 'Fiestas locales 2027: las dos de tu municipio y su boletín',
    description: 'Fiestas locales 2027 y 2026 de tu municipio: las dos que fija cada ayuntamiento, el boletín donde se publican y en qué comunidades ya han salido las de 2027.',
    h1: 'Fiestas locales 2027 de tu municipio',
    intro: 'Elige tu municipio: ves sus dos fiestas locales, el boletín que las publica y, si las de 2027 aún no han salido, la fecha en que lo comprobamos.',
    resume: `Además de las 12 fiestas de su comunidad, cada municipio tiene hasta dos fiestas locales al año, según el artículo 46 del Real Decreto 2001/1983. Las propone el pleno del ayuntamiento, normalmente el día del patrón o de la feria mayor, y las aprueba la consejería de trabajo de la comunidad, que las publica en su boletín oficial o, en algunas comunidades, en el boletín de cada provincia. Son retribuidas y no recuperables, como cualquier otra fiesta laboral, y solo valen dentro del término municipal: quien vive en un municipio y trabaja en otro tiene las fiestas del lugar de trabajo. Este sitio las lee para ${K.MUNICIPIOS.length} municipios, las capitales de provincia y los más poblados: las de 2026 están leídas en ${munis26} de ellos y las de 2027 en ${munis27}. Cada comunidad publica en un momento distinto, entre el verano y el final del año anterior, y algunas en varios textos. Cuando un boletín aún no ha salido, lo decimos con la fecha en que lo comprobamos.`,
    faqs: [
      { q: '¿Las fiestas locales son las del municipio donde vivo o donde trabajo?', a: 'Las del municipio donde está tu centro de trabajo. Las fiestas laborales se aplican al lugar donde se presta el trabajo, así que si vives en Getafe y trabajas en Madrid, libras las fiestas locales de Madrid y no las de Getafe. Si teletrabajas, depende de dónde esté fijado tu centro de trabajo en el contrato.' },
      { q: '¿Puede un municipio tener más de dos fiestas locales?', a: 'No como fiestas laborales: el Estatuto de los Trabajadores limita a 14 las fiestas del año, de las que dos son locales. Un ayuntamiento puede celebrar más días de feria, pero esos días no son festivos para los trabajadores, salvo que el convenio o la empresa los den como libres.' },
      { q: '¿Qué pasa si una fiesta local cae en domingo?', a: 'Se pierde, salvo que el ayuntamiento elija otro día. Por eso muchos ayuntamientos, cuando su patrón cae en domingo, proponen el lunes siguiente como fiesta local. La comunidad publica lo que cada ayuntamiento propone, y el buscador muestra la fecha tal como sale en el boletín, sin moverla.' },
      { q: '¿Cuándo salen las fiestas locales de 2027?', a: `Depende de la comunidad. A ${K.fFecha(K.LECTURA, 'es')} las tenemos leídas en ${leidos27.length} de las 19 comunidades y ciudades autónomas${leidos27.length ? `: ${lista(leidos27.map((e) => e.c.es), 'es')}` : ''}. Las demás suelen publicarse entre noviembre y diciembre. La tabla de esta página dice dónde está cada una.` },
    ],
    body: (h) => `<h2>Dónde se publican, comunidad por comunidad</h2>
<p>El ${h.src('rd2001', 'artículo 46 del Real Decreto 2001/1983')} dice que las fiestas locales se publican en el boletín de la comunidad y, en su caso, en el de la provincia. Esta tabla muestra qué texto hemos leído para cada año.</p>
${h.table(['Comunidad', 'Fiestas locales 2026', 'Fiestas locales 2027'], K.COMUNIDADES.map((c) => [c.es, fuente(e26.find((x) => x.c.id === c.id)!, 'es'), fuente(e27.find((x) => x.c.id === c.id)!, 'es')]), undefined, ['l', 'l', 'l'])}
<h2>Las fechas que más se repiten</h2>
<p>Entre los municipios leídos, las fiestas locales de 2026 se concentran en ${K.MES(mesTop, 'es')}, con ${porMes[mesTop - 1]} fiestas. Las fechas más repetidas fueron ${lista(repes.map(([d, ms]) => `el ${h.dm(d)} (${ms.length} municipios)`), 'es')}. Cuando muchos municipios coinciden, suele haber detrás un patrón o una tradición compartida en la provincia.</p>
${h.mini('municipio', { p: ['ccaa', 'muni'], d: { ccaa: 'galicia', year: '2026' }, t: 'Fiestas locales de otro municipio' })}
<h2>Qué cuenta y qué no</h2>
<p>Solo son fiestas locales las que publica el boletín. Las fiestas de un barrio, las romerías o los días de feria que el ayuntamiento celebra sin proponerlos como festivos laborales no dan derecho a librar. Al revés, una fiesta local publicada es obligatoria para todas las empresas del municipio, con las mismas reglas que las nacionales: si trabajas ese día, el ${h.src('rd2001', 'artículo 47')} obliga a pagar las horas con un recargo mínimo del 75 % o a darte un descanso compensatorio. Junto con las 12 de la comunidad suman las 14 que fija el ${h.src('et', 'artículo 37.2 del Estatuto de los Trabajadores')}.</p>
<h2>Si tu municipio no está</h2>
<p>El buscador cubre ${K.MUNICIPIOS.length} municipios. Si el tuyo no aparece, busca en el boletín de tu comunidad o de tu provincia la «resolución por la que se publica la relación de fiestas locales» del año: la página de cada comunidad de este sitio enlaza el texto que hemos leído. También puedes preguntar en tu ayuntamiento o en el comité de empresa, que debe conocer el calendario del centro.</p>`,
  },
  en: {
    slug: 'spain-local-holidays-2027',
    nav: 'Local holidays 2027', card: 'Each town\'s two holidays: who sets them, where they are published and whether they are out',
    title: 'Local holidays in Spain 2027: your town\'s two days off',
    description: 'Local holidays in Spain 2027 and 2026 for your town: the two days each council sets, the gazette that publishes them and which regions have released 2027.',
    h1: 'Local holidays 2027 in your Spanish town',
    intro: 'Pick your town: you see its two local holidays, the gazette that publishes them and, if 2027 is not out yet, the date we last checked.',
    resume: `On top of its region's 12 holidays, each Spanish town has up to two local holidays a year, under article 46 of Royal Decree 2001/1983. The town council proposes them, usually the patron saint's day or the main fair, and the regional labour department approves them and publishes them in its official gazette or, in some regions, in each province's gazette. They are paid and not made up, like any other public holiday, and they only apply within the municipality: if you live in one town and work in another, you get the holidays of your workplace. This site reads them for ${K.MUNICIPIOS.length} towns, the provincial capitals and the largest municipalities: the 2026 ones have been read for ${munis26} of them and the 2027 ones for ${munis27}. Each region publishes at a different time, between the summer and the end of the previous year, and some in several texts. When a gazette is not out yet, we say so with the date we checked.`,
    faqs: [
      { q: 'Do local holidays follow where I live or where I work?', a: 'Where your workplace is. Public holidays apply to the place where the work is done, so if you live in Getafe and work in Madrid, you get Madrid\'s local holidays, not Getafe\'s. If you work from home, it depends on where your contract places your workplace.' },
      { q: 'Can a Spanish town have more than two local holidays?', a: 'Not as public holidays: the Workers\' Statute caps the year\'s holidays at 14, two of them local. A council may celebrate more fair days, but those are not holidays for employees, unless the collective agreement or the employer gives them off.' },
      { q: 'What happens if a local holiday falls on a Sunday?', a: 'It is lost, unless the council picks another day. That is why many councils, when their patron saint falls on a Sunday, propose the following Monday as the local holiday. The region publishes what each council proposes, and the search shows the date exactly as the gazette prints it, without moving it.' },
      { q: 'When are the 2027 local holidays published in Spain?', a: `It depends on the region. As of ${K.fFecha(K.LECTURA, 'en')} we have read them for ${leidos27.length} of the 19 regions and autonomous cities${leidos27.length ? `: ${lista(leidos27.map((e) => e.c.en), 'en')}` : ''}. The rest usually come out between November and December. The table on this page shows where each stands.` },
    ],
    body: (h) => `<h2>Where they are published, region by region</h2>
<p>${h.src('rd2001', 'Article 46 of Royal Decree 2001/1983')} says local holidays are published in the regional gazette and, where relevant, the provincial one. This table shows which text we have read for each year.</p>
${h.table(['Region', 'Local holidays 2026', 'Local holidays 2027'], K.COMUNIDADES.map((c) => [c.en, fuente(e26.find((x) => x.c.id === c.id)!, 'en'), fuente(e27.find((x) => x.c.id === c.id)!, 'en')]), undefined, ['l', 'l', 'l'])}
<h2>The most common dates</h2>
<p>Among the towns read, the 2026 local holidays cluster in ${K.MES(mesTop, 'en')}, with ${porMes[mesTop - 1]} of them. The most repeated dates were ${lista(repes.map(([d, ms]) => `${h.dm(d)} (${ms.length} towns)`), 'en')}. When many towns share a date, there is usually a patron saint or a tradition common to the province behind it.</p>
${h.mini('municipio', { p: ['ccaa', 'muni'], d: { ccaa: 'galicia', year: '2026' }, t: 'Local holidays of another town' })}
<h2>What counts and what does not</h2>
<p>Only the days published in the gazette are local holidays. District fiestas, pilgrimages or fair days the council celebrates without proposing them as public holidays give no right to a day off. Conversely, a published local holiday binds every employer in the town, under the same rules as national ones: if you work that day, ${h.src('rd2001', 'article 47')} requires the hours to be paid with at least a 75% premium or compensatory time off. Together with the region's 12 they make up the 14 set by ${h.src('et', 'article 37.2 of the Workers\' Statute')}.</p>
<h2>If your town is not listed</h2>
<p>The search covers ${K.MUNICIPIOS.length} towns. If yours is missing, look in your regional or provincial gazette for the year's "resolución por la que se publica la relación de fiestas locales": each region's page on this site links the text we have read. You can also ask your town council or your works council, which should know the workplace calendar.</p>
<p>Local holidays count exactly like the others: they are paid, they cannot be made up later, and working on one entitles you to compensatory rest or the extra pay set by your agreement. Two people in the same company can have different local holidays if they work in different towns, because what counts is where the workplace is, not where you live.</p>`,
  },
});
