import { defineGuide } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';
import { lista, ccaaCon, ccaaSin } from './_util';

/* Puentes de 2026 (BOE-A-2025-21667): lo que queda desde noviembre y el balance del año por comunidad. */
const Y = 2026;
const fest = (c: string) => new Set(K.fiestasCcaa(Y, c).map((f) => f.fecha));
const rango = (a: string, b: string, l: 'es' | 'en') => l === 'es' ? `del ${K.fCorta(a, l)} al ${K.fCorta(b, l)}` : `${K.fCorta(a, l)} to ${K.fCorta(b, l)}`;
const quedan = (c: string) => K.puentesDelAnio('2026-11-01', `${Y}-12-31`, fest(c));
const total = K.COMUNIDADES.map((c) => ({ c, n: K.puentesDelAnio(`${Y}-01-01`, `${Y}-12-31`, fest(c.id)).length, q: quedan(c.id) }));
const con7 = ccaaCon(Y, '2026-12-07', 'es'), sin7 = ccaaSin(Y, '2026-12-07', 'es');
const con7en = ccaaCon(Y, '2026-12-07', 'en'), sin7en = ccaaSin(Y, '2026-12-07', 'en');
const navidad = K.huecos('2026-12-20', '2027-01-10', new Set([...fest('madrid'), ...K.fiestasCcaa(2027, 'madrid').map((f) => f.fecha)]), 4).filter((x) => x.libreDesde <= '2026-12-25' && x.libreHasta >= '2027-01-01').sort((a, b) => b.rinde - a.rinde)[0];

export default defineGuide({
  id: 'puentes-2026', group: 'calendario', order: 7,
  tool: 'puentes', toolArg: { ccaa: 'valenciana', muni: '46250', year: '2026', dias: 3 },
  related: ['puentes-2027', 'calendario-laboral-2026', 'festivos-nacionales', 'cl-baleares'],
  sources: ['boe-2026', 'et'],
  es: {
    slug: 'puentes-2026',
    nav: 'Puentes 2026', card: 'El puente de diciembre de 2026 y los días que te quedan por gastar',
    title: 'Puentes 2026: el de diciembre y cómo gastar los que quedan',
    description: 'Puentes 2026 que quedan en tu comunidad: el de la Constitución del 5 al 8 de diciembre, Navidad y Año Nuevo, y la calculadora para tus últimos días de 2026.',
    h1: 'Puentes de 2026: lo que queda del año',
    intro: 'Escribe cuántos días de vacaciones te quedan: la calculadora busca los huecos entre festivos que aún no han pasado en tu municipio.',
    resume: `A estas alturas de 2026 quedan pocos puentes, pero uno es bueno en media España. El 6 de diciembre, Día de la Constitución, cae en domingo, y ${con7.length} comunidades dan fiesta el lunes 7: con el martes 8, Inmaculada Concepción, salen cuatro días seguidos, del sábado 5 al martes 8, sin pedir vacaciones. En las demás (${lista(sin7, 'es')}) el lunes 7 es laborable: pidiéndolo consigues los mismos cuatro días con un solo día de vacaciones. Navidad cae en viernes y Año Nuevo de 2027 también, así que hay dos fines de semana de tres días seguidos; pidiendo los cuatro días entre ambos, del 28 al 31 de diciembre, encadenas ${navidad ? navidad.libres : 10} días libres. Si te quedan días de 2026, comprueba antes con tu empresa si puedes pasarlos a 2027: el Estatuto no lo garantiza salvo en casos como la incapacidad temporal. La calculadora reparte los días que le digas con tus fiestas locales.`,
    faqs: [
      { q: '¿Hay puente en diciembre de 2026?', a: `Sí. En ${lista(con7, 'es')} el lunes 7 de diciembre es festivo y, con el martes 8, hay cuatro días libres sin pedir nada. En el resto de comunidades, pidiendo el lunes 7 consigues los mismos cuatro días, del sábado 5 al martes 8, con un solo día de vacaciones.` },
      { q: '¿Cómo junto Navidad y Año Nuevo en 2026?', a: `El 25 de diciembre de 2026 y el 1 de enero de 2027 caen en viernes. Pidiendo del lunes 28 al jueves 31 de diciembre, cuatro días laborables, libras ${navidad ? navidad.libres : 10} días seguidos, del ${navidad ? K.fDia(navidad.libreDesde, 'es') : '25 de diciembre'} al ${navidad ? K.fDia(navidad.libreHasta, 'es') : '3 de enero'}. Muchos convenios dan además el 24 y el 31 como días libres o de media jornada.` },
      { q: '¿Pierdo los días de vacaciones de 2026 que no gaste?', a: 'En principio sí: las vacaciones se disfrutan dentro del año natural, salvo que tu convenio o un acuerdo con la empresa permita pasarlas al año siguiente. Hay excepciones en el artículo 38 del Estatuto de los Trabajadores, como la incapacidad temporal o el permiso por nacimiento, que permiten disfrutarlas después aunque haya terminado el año.' },
    ],
    body: (h) => `<h2>El puente de la Constitución, comunidad por comunidad</h2>
<p>La ${h.src('boe-2026', 'resolución de fiestas de 2026')} dejó el 6 de diciembre en domingo. Cada comunidad eligió: trasladar el descanso al lunes 7, como ${lista(con7, 'es')}, o usar ese hueco para otra fiesta propia a lo largo del año, como ${lista(sin7, 'es')}. En el primer grupo el puente sale gratis; en el segundo cuesta un día.</p>
${h.mini('puentes', { p: ['ccaa'], d: { year: '2026', dias: 1, ccaa: 'pais-vasco' }, t: 'Con un día de vacaciones, ¿dónde lo pones?' })}
<h2>Lo que queda en cada comunidad</h2>
<p>Esta tabla cuenta los puentes de uno o dos días que tenía 2026 en cada comunidad, sin fiestas locales, y el mejor de los que quedan desde noviembre.</p>
${h.table(['Comunidad', 'Puentes en 2026', 'Mejor de lo que queda'], total.map(({ c, n, q }) => [c.es, n, q[0] ? `${q[0].pedir === 1 ? K.fCorta(q[0].desde, 'es') : rango(q[0].desde, q[0].hasta, 'es')}: ${q[0].libres} días` : 'ninguno']), undefined, ['l', 'r', 'l'])}
<p>El lunes 2 de noviembre, festivo en ${ccaaCon(Y, '2026-11-02', 'es').length} comunidades por caer Todos los Santos en domingo, dio un fin de semana de tres días al principio del mes. En Cataluña y Baleares, San Esteban cae en sábado este año y no añade nada.</p>
<h2>Navidad y Año Nuevo</h2>
<p>Con el 25 de diciembre y el 1 de enero en viernes, la semana del 28 al 31 queda encajada entre dos fines de semana largos. Es el hueco de cuatro días que más rinde del final de año: ${navidad ? `${navidad.libres} días libres, ${rango(navidad.libreDesde, navidad.libreHasta, 'es')}` : 'diez días libres'}. El 6 de enero de 2027, miércoles, es festivo en todas las comunidades: pidiendo también el lunes 4 y el martes 5 llegas hasta Reyes.</p>
<h2>Vacaciones pendientes</h2>
<p>El ${h.src('et', 'artículo 38 del Estatuto de los Trabajadores')} da al menos 30 días naturales de vacaciones al año, que se fijan de común acuerdo con la empresa. Si se solapan con una incapacidad temporal o con el permiso por nacimiento, puedes disfrutarlas después. Para planificar el año que viene, la página de ${h.a('puentes-2027', 'puentes de 2027')} hace el reparto completo con las fiestas ya publicadas.</p>`,
  },
  en: {
    slug: 'spain-long-weekends-2026',
    nav: 'Long weekends 2026', card: 'The December 2026 bridge and how to use the leave you have left',
    title: 'Long weekends in Spain 2026: December and your days left',
    description: 'Long weekends left in Spain in 2026: the Constitution bridge from 5 to 8 December, Christmas and New Year, and a planner to use up your last days of 2026 leave.',
    h1: 'Spain long weekends 2026: the rest of the year',
    intro: 'Enter how many leave days you have left: the planner finds the gaps between holidays still ahead in your town.',
    resume: `At this point in 2026 few long weekends remain, but one is good in half of Spain. 6 December, Constitution Day, falls on a Sunday, and ${con7en.length} regions give Monday 7 off: with Tuesday 8, the Immaculate Conception, that makes four days in a row, Saturday 5 to Tuesday 8, without taking leave. In the others (${lista(sin7en, 'en')}) Monday 7 is a working day: book it and you get the same four days for one day of leave. Christmas Day falls on a Friday and so does New Year's Day 2027, giving two three-day weekends; book the four days in between, 28 to 31 December, and you link ${navidad ? navidad.libres : 10} days off. If you have 2026 leave left, check with your employer whether it can roll into 2027: the Workers' Statute does not guarantee it except in cases such as sick leave. The planner places the days you give it around your local holidays.`,
    faqs: [
      { q: 'Is there a long weekend in December 2026 in Spain?', a: `Yes. In ${lista(con7en, 'en')} Monday 7 December is a holiday and, with Tuesday 8, there are four days off without booking anything. In the other regions, booking Monday 7 gives you the same four days, Saturday 5 to Tuesday 8, for one day of leave.` },
      { q: 'How do I link Christmas and New Year in 2026?', a: `25 December 2026 and 1 January 2027 are both Fridays. Booking Monday 28 to Thursday 31 December, four working days, gives you ${navidad ? navidad.libres : 10} days in a row, ${navidad ? K.fDia(navidad.libreDesde, 'en') : '25 December'} to ${navidad ? K.fDia(navidad.libreHasta, 'en') : '3 January'}. Many collective agreements also give 24 and 31 December off or as half days.` },
      { q: 'Do I lose 2026 leave I do not use?', a: 'In principle yes: leave is taken within the calendar year, unless your collective agreement or an arrangement with your employer lets it roll over. Article 38 of the Workers\' Statute has exceptions, such as sick leave or birth leave, which let you take it later even after the year has ended.' },
    ],
    body: (h) => `<h2>The Constitution bridge, region by region</h2>
<p>The ${h.src('boe-2026', '2026 holiday resolution')} left 6 December on a Sunday. Each region chose: move the day off to Monday 7, as ${lista(con7en, 'en')} did, or use the slot for another regional day during the year, as ${lista(sin7en, 'en')} did. In the first group the bridge is free; in the second it costs one day.</p>
${h.mini('puentes', { p: ['ccaa'], d: { year: '2026', dias: 1, ccaa: 'pais-vasco' }, t: 'With one day of leave, where does it go?' })}
<h2>What is left in each region</h2>
<p>This table counts the one or two-day bridges 2026 had in each region, without local holidays, and the best of those still ahead from November.</p>
${h.table(['Region', 'Bridges in 2026', 'Best of what is left'], total.map(({ c, n, q }) => [c.en, n, q[0] ? `${q[0].pedir === 1 ? K.fCorta(q[0].desde, 'en') : rango(q[0].desde, q[0].hasta, 'en')}: ${q[0].libres} days` : 'none']), undefined, ['l', 'r', 'l'])}
<p>Monday 2 November, a holiday in ${ccaaCon(Y, '2026-11-02', 'en').length} regions because All Saints' Day fell on a Sunday, gave a three-day weekend at the start of the month. In Catalonia and the Balearics, Saint Stephen's Day is a Saturday this year and adds nothing.</p>
<h2>Christmas and New Year</h2>
<p>With 25 December and 1 January both on a Friday, the week of 28 to 31 December sits between two long weekends. It is the four-day gap that goes furthest at year end: ${navidad ? `${navidad.libres} days off, ${rango(navidad.libreDesde, navidad.libreHasta, 'en')}` : 'ten days off'}. As 6 January 2027, a Wednesday, is a holiday everywhere, booking Monday 4 and Tuesday 5 as well takes you all the way to Epiphany.</p>
<h2>Leave still owed</h2>
<p>${h.src('et', 'Article 38 of the Workers\' Statute')} gives at least 30 calendar days of leave a year, set by agreement with your employer. If it overlaps with sick leave or birth leave, you can take it later. To plan next year, the ${h.a('puentes-2027', '2027 long weekends')} page does the full plan with the holidays already published.</p>
<p>Leave you have not taken by 31 December is usually lost unless your collective agreement or your employer allows it to be carried over, so the last weeks of the year are worth planning now.</p>`,
  },
});
