import { defineGuide } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';
import { lista, filasBOE } from './_util';

/* Lista nacional: Real Decreto 2001/1983, art. 45 (texto consolidado). Fiestas 2026-2027: festivos.json (BOE).
   2028: aún sin resolución; se muestran solo las fechas fijas del art. 45.1 a) a c) con su día de la semana. */
const FIJAS: Array<{ md: string; es: string; en: string }> = [
  { md: '01-01', es: 'Año Nuevo', en: 'New Year\'s Day' }, { md: '05-01', es: 'Fiesta del Trabajo', en: 'Labour Day' },
  { md: '08-15', es: 'Asunción de la Virgen', en: 'Assumption' }, { md: '10-12', es: 'Fiesta Nacional de España', en: 'National Day' },
  { md: '11-01', es: 'Todos los Santos', en: 'All Saints\' Day' }, { md: '12-06', es: 'Día de la Constitución', en: 'Constitution Day' },
  { md: '12-08', es: 'Inmaculada Concepción', en: 'Immaculate Conception' }, { md: '12-25', es: 'Natividad del Señor', en: 'Christmas Day' },
];
const y28 = (l: 'es' | 'en') => [...FIJAS.map((f) => ({ fecha: `2028-${f.md}`, n: f[l] })), { fecha: K.movibles(2028).viernes, n: l === 'es' ? 'Viernes Santo' : 'Good Friday' }].sort((a, b) => a.fecha.localeCompare(b.fecha));
const domingos28 = (l: 'es' | 'en') => y28(l).filter((f) => K.weekday(f.fecha) === 7);
const sabados28 = (l: 'es' | 'en') => y28(l).filter((f) => K.weekday(f.fecha) === 6);
const c26 = K.comunes(2026), c27 = K.comunes(2027);
const filas27 = filasBOE(2027);

export default defineGuide({
  id: 'festivos-nacionales', group: 'calendario', order: 3,
  tool: 'cuenta', toolArg: { ev: 'festivo', ccaa: 'madrid' },
  related: ['calendario-laboral-2027', 'calendario-laboral-2026', 'puentes-2027', 'cambio-de-hora', 'semana-santa'],
  sources: ['rd2001', 'et', 'boe-2027', 'boe-2026'],
  es: {
    slug: 'festivos-nacionales',
    nav: 'Festivos nacionales y cuenta atrás', card: 'Cuánto falta para el próximo festivo, en directo, y las fiestas de toda España de 2026 a 2028',
    title: 'Festivos nacionales 2027: cuánto falta para el próximo',
    description: 'Festivos nacionales 2027 y 2026 en España y cuenta atrás en directo hasta el próximo festivo de tu comunidad, Navidad o Reyes. Fechas fijas de 2028 incluidas.',
    h1: 'Próximo festivo: cuenta atrás y festivos nacionales',
    intro: 'Elige tu comunidad: el contador dice, al segundo y en tu hora local, cuánto falta para el próximo festivo entre semana, y lista lo que viene después.',
    resume: `En España hay fiestas nacionales y fiestas comunes, y no son lo mismo. El artículo 45 del Real Decreto 2001/1983 enumera doce fiestas de ámbito nacional, pero permite a cada comunidad cambiar algunas por otras propias: el Jueves Santo, el 6 de enero, San José o Santiago, y los lunes que siguen a una fiesta nacional caída en domingo. Lo que queda en todas las comunidades a la vez son las fiestas comunes: ${c27.length} en 2027 y ${c26.length} en 2026. En 2027 son ${lista(c27.map((f) => `${f.es.toLowerCase().startsWith('día') || f.es.toLowerCase().startsWith('fiesta') ? f.es : f.es} (${K.fDia(f.fecha, 'es')})`), 'es')}. Para 2028 aún no hay resolución, que se publicará en otoño de 2027, pero las fechas fijas ya se saben: la Navidad cae en lunes y el 15 de agosto en martes. El contador de esta página cuenta hasta el siguiente festivo entre semana de tu comunidad con el reloj de tu dispositivo, sin enviar nada.`,
    faqs: [
      { q: '¿Cuál es la diferencia entre fiesta nacional y fiesta común?', a: 'Fiesta nacional es la que figura en la lista del artículo 45 del Real Decreto 2001/1983. Fiesta común es la que, al final, celebran todas las comunidades ese año. Algunas nacionales, como el Jueves Santo o el 6 de enero, pueden cambiarse por una fiesta propia, y entonces dejan de ser comunes aunque sigan en la lista nacional.' },
      { q: '¿Qué festivos nacionales caen en lunes en 2027?', a: `El 1 de noviembre, Todos los Santos, y el 6 de diciembre, Día de la Constitución. Los dos son fiestas comunes a toda España en 2027 y dan fines de semana de tres días. El 12 de octubre cae en martes y el 8 de diciembre en miércoles: pidiendo el lunes 11 o el martes 7 se abren puentes de cuatro y cinco días.` },
      { q: '¿Cómo serán los festivos de 2028?', a: `La resolución de 2028 saldrá en el BOE en otoño de 2027. Las fechas fijas ya se conocen: ${lista(domingos28('es').map((f) => `${f.n} cae en domingo`), 'es') || 'ninguna fiesta fija cae en domingo'}, así que cada comunidad decidirá si pasa el descanso al lunes. Viernes Santo será el ${K.fDia(K.movibles(2028).viernes, 'es')}, y ${lista(sabados28('es').map((f) => f.n), 'es') || 'ninguna fiesta fija'} caerá en sábado.` },
      { q: '¿La cuenta atrás usa mi hora o la de Madrid?', a: 'La tuya: el contador lee el reloj y la zona horaria de tu dispositivo, y cuenta hasta las 00:00 del día festivo en tu hora local. Si estás en Canarias, la cuenta llega una hora más tarde que en Madrid, como el propio festivo. Nada se envía: el cálculo se hace en tu navegador cada segundo.' },
    ],
    body: (h) => `<h2>Las doce fiestas de la lista nacional</h2>
<p>El ${h.src('rd2001', 'artículo 45 del Real Decreto 2001/1983')} agrupa las fiestas en cuatro bloques. Las cívicas, el 12 de octubre y el 6 de diciembre. Las del Estatuto de los Trabajadores, el 1 de enero, el 1 de mayo y el 25 de diciembre. Las del Acuerdo con la Santa Sede que no se pueden cambiar, el 15 de agosto, el 1 de noviembre, el 8 de diciembre y el Viernes Santo. Y las que cada comunidad puede sustituir por una fiesta tradicional propia: el Jueves Santo, el 6 de enero y, a elegir, San José o Santiago. Si una de ellas cae en domingo, el descanso pasa al lunes, salvo que la comunidad lo cambie también por una fiesta suya.</p>
<h2>Cuántas comunidades tienen cada fiesta en 2027</h2>
<p>Este cuadro cuenta, para cada fecha festiva de 2027 en la ${h.src('boe-2027', 'resolución del BOE')}, en cuántas de las 19 comunidades y ciudades autónomas es fiesta. Las que llegan a 19 son las comunes.</p>
${h.table(['Fecha', 'Fiesta', 'Comunidades'], filas27.filter((x) => x.n > 1).map((x) => [h.dm(x.f.fecha), x.f.es, x.n]), undefined, ['l', 'l', 'r'])}
${h.mini('nacionales', { p: ['year'], d: { ccaa: 'galicia' }, t: 'Fiestas comunes y propias de una comunidad' })}
<h2>2028: lo que ya se sabe</h2>
<p>Las fechas fijas de 2028 caen así: ${lista(y28('es').map((f) => `${f.n}, ${K.fSemana(f.fecha, 'es')} ${h.dm(f.fecha)}`), 'es')}. Lo que falta saber lo decidirá cada comunidad antes del 30 de septiembre de 2027: si celebra el Jueves Santo (${h.dm(K.movibles(2028).jueves)}), si pasa al lunes ${domingos28('es').length ? 'las fiestas que caen en domingo' : 'alguna fiesta'} o si pone una fiesta propia. Cuando salga la resolución, esta página y el buscador se pondrán al día.</p>
<h2>Cómo funciona el contador</h2>
<p>La cuenta atrás usa el reloj de tu dispositivo, no el de un servidor, y arranca a las 00:00 del día festivo en tu hora local. Solo cuenta festivos entre semana, porque son los que cambian tu semana; para ver también los que caen en sábado o domingo, abre el ${h.a('calendario-laboral-2027', 'calendario laboral de 2027')}. La fila «días laborables hasta entonces» descuenta fines de semana y festivos de tu comunidad, pero no tus dos fiestas locales: para incluirlas, usa el buscador de la portada con tu municipio.</p>
<p>El ${h.src('et', 'artículo 37.2 del Estatuto de los Trabajadores')} limita las fiestas a 14 al año. Si una fiesta cae en sábado se pierde para quien trabaja de lunes a viernes: en 2027 ocurre con el 1 de mayo y el 25 de diciembre.</p>`,
  },
  en: {
    slug: 'spain-national-holidays',
    nav: 'National holidays and countdown', card: 'A live countdown to the next holiday and Spain\'s nationwide holidays from 2026 to 2028',
    title: 'National holidays 2027 in Spain: countdown to the next one',
    description: 'Spain national holidays 2027 and 2026, with a live countdown to the next holiday in your region, Christmas or Epiphany. Early look at the fixed dates of 2028.',
    h1: 'Next public holiday in Spain: countdown and national days',
    intro: 'Pick your region: the counter shows, to the second and in your local time, how long until the next weekday holiday, and lists what comes after.',
    resume: `Spain has national holidays and nationwide holidays, and they are not the same thing. Article 45 of Royal Decree 2001/1983 lists twelve national holidays, but lets each region swap some for its own: Maundy Thursday, 6 January, Saint Joseph or Saint James, and the Mondays after a national holiday that falls on a Sunday. What every region keeps at once are the nationwide holidays: ${c27.length} in 2027 and ${c26.length} in 2026. In 2027 they are ${lista(c27.map((f) => `${f.en} (${K.fDia(f.fecha, 'en')})`), 'en')}. There is no resolution for 2028 yet, due in autumn 2027, but the fixed dates are known: Christmas Day is a Monday and 15 August a Tuesday. The counter on this page counts down to your region's next weekday holiday with your device's clock, sending nothing anywhere.`,
    faqs: [
      { q: 'What is the difference between a national and a nationwide holiday in Spain?', a: 'A national holiday is one on the list in article 45 of Royal Decree 2001/1983. A nationwide holiday is one that, in the end, every region keeps that year. Some national days, such as Maundy Thursday or 6 January, may be swapped for a regional day, and then they stop being nationwide even though they remain on the national list.' },
      { q: 'Which Spanish national holidays fall on a Monday in 2027?', a: '1 November, All Saints\' Day, and 6 December, Constitution Day. Both are nationwide in 2027 and give three-day weekends. 12 October is a Tuesday and 8 December a Wednesday: taking Monday 11 or Tuesday 7 off opens four and five-day breaks.' },
      { q: 'What will the 2028 Spanish holidays look like?', a: `The 2028 resolution will come out in the BOE in autumn 2027. The fixed dates are already known: ${lista(domingos28('en').map((f) => `${f.n} falls on a Sunday`), 'en') || 'no fixed holiday falls on a Sunday'}, so each region will decide whether to move the day off to Monday. Good Friday will be ${K.fDia(K.movibles(2028).viernes, 'en')}, and ${lista(sabados28('en').map((f) => f.n), 'en') || 'no fixed holiday'} will fall on a Saturday.` },
      { q: 'Does the countdown use my time or Madrid time?', a: 'Yours: the counter reads your device\'s clock and time zone, and counts to 00:00 on the holiday in your local time. If you are in the Canary Islands, it reaches zero an hour later than in Madrid, just like the holiday itself. Nothing is sent: the calculation runs in your browser every second.' },
    ],
    body: (h) => `<h2>The twelve days on the national list</h2>
<p>${h.src('rd2001', 'Article 45 of Royal Decree 2001/1983')} sorts the holidays into four groups. The civic ones, 12 October and 6 December. Those from the Workers' Statute, 1 January, 1 May and 25 December. Those from the agreement with the Holy See that cannot be changed: 15 August, 1 November, 8 December and Good Friday. And those each region may replace with a traditional day of its own: Maundy Thursday, 6 January and either Saint Joseph or Saint James. If one of them falls on a Sunday, the day off moves to the Monday, unless the region swaps that too for one of its own.</p>
<h2>How many regions keep each holiday in 2027</h2>
<p>This table counts, for each 2027 holiday in the ${h.src('boe-2027', 'BOE resolution')}, how many of the 19 regions and autonomous cities keep it. Those reaching 19 are nationwide.</p>
${h.table(['Date', 'Holiday', 'Regions'], filas27.filter((x) => x.n > 1).map((x) => [h.dm(x.f.fecha), x.f.en, x.n]), undefined, ['l', 'l', 'r'])}
${h.mini('nacionales', { p: ['year'], d: { ccaa: 'galicia' }, t: 'A region\'s nationwide and own holidays' })}
<h2>2028: what is already known</h2>
<p>The fixed dates of 2028 fall like this: ${lista(y28('en').map((f) => `${f.n}, ${K.fSemana(f.fecha, 'en')} ${h.dm(f.fecha)}`), 'en')}. The rest will be decided by each region before 30 September 2027: whether it keeps Maundy Thursday (${h.dm(K.movibles(2028).jueves)}), whether it moves ${domingos28('en').length ? 'the Sunday holidays' : 'any holiday'} to Monday, or whether it adds a day of its own. When the resolution comes out, this page and the search will be updated.</p>
<h2>How the counter works</h2>
<p>The countdown uses your device's clock, not a server's, and runs to 00:00 on the holiday in your local time. It only counts weekday holidays, because those are the ones that change your week; to see the ones on a Saturday or Sunday too, open the ${h.a('calendario-laboral-2027', '2027 holiday calendar')}. The "working days until then" row deducts weekends and your region's holidays, but not your town's two local days: to include them, use the search on the home page with your town.</p>
<p>${h.src('et', 'Article 37.2 of the Workers\' Statute')} caps holidays at 14 a year. A Saturday holiday is lost for anyone working Monday to Friday: in 2027 that happens with 1 May and 25 December.</p>`,
  },
});
