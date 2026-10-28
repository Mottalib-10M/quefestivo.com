import { defineGuide } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';
import { lista, ccaaCon, comunesFinde, estadoLocales } from './_util';

/* Resolución de 17 de octubre de 2025 de la Dirección General de Trabajo (BOE-A-2025-21667), en festivos.json. */
const Y = 2026;
const R = K.resolucion(Y)!;
const com = K.comunes(Y);
const finde = comunesFinde(Y);
const d2n = '2026-11-02', d7d = '2026-12-07', d26 = '2026-12-26';
const pub = estadoLocales(Y).filter((e) => e.conFiestas > 0);
/** Fiestas locales de noviembre y diciembre de 2026 en los municipios leídos. */
const finales = K.MUNICIPIOS.flatMap((m) => (K.locales(m.ine, Y) ?? []).filter((f) => f.fecha >= '2026-11-01').map((f) => ({ m, f }))).sort((a, b) => a.f.fecha.localeCompare(b.f.fecha) || a.m.nombre.localeCompare(b.m.nombre, 'es'));
const madrid = K.fiestasMunicipio(Y, '28079');

export default defineGuide({
  id: 'calendario-laboral-2026', group: 'calendario', order: 2,
  tool: 'municipio', toolArg: { ccaa: 'andalucia', muni: '41091', year: '2026' },
  related: ['calendario-laboral-2027', 'puentes-2026', 'festivos-nacionales', 'fiestas-locales', 'cl-cataluna'],
  sources: ['boe-2026', 'et', 'rd2001'],
  es: {
    slug: 'calendario-laboral-2026',
    nav: 'Calendario laboral 2026', card: 'Lo que queda de 2026: puentes de noviembre y diciembre y fiestas locales',
    title: 'Calendario laboral 2026: festivos que quedan y locales',
    description: 'Calendario laboral 2026 de tu municipio: las fiestas que quedan en noviembre y diciembre, los lunes festivos de cada comunidad y las locales del boletín.',
    h1: 'Calendario laboral 2026: lo que queda del año',
    intro: 'Elige comunidad y municipio: ves las 14 fiestas de 2026, cuáles quedan por delante y los laborables que restan cada mes hasta diciembre.',
    resume: `El calendario laboral de 2026 se publicó en el BOE del ${K.fFecha(R.fecha, 'es')} con solo ${com.length} fiestas comunes a toda España, porque el 1 de noviembre y el 6 de diciembre caen en domingo. Cada comunidad decidió qué hacer con esos dos domingos: ${ccaaCon(Y, d2n, 'es').length} comunidades dan fiesta el lunes 2 de noviembre y ${ccaaCon(Y, d7d, 'es').length} el lunes 7 de diciembre, mientras las demás pusieron en su lugar fiestas propias a lo largo del año. Por eso el final de 2026 es distinto según dónde vivas: en Madrid encadenas el lunes 7 y el martes 8 de diciembre, en Cataluña y Baleares celebras San Esteban el 26, que cae en sábado, y en el País Vasco o la Comunitat Valenciana diciembre solo trae el 8 y el 25. A las 12 fiestas de cada comunidad se suman las 2 locales de cada municipio, publicadas en su boletín: las leemos para ${K.MUNICIPIOS.length} municipios. La herramienta muestra tus 14 fiestas de 2026, las que ya han pasado en gris, y los días laborables de cada mes.`,
    faqs: [
      { q: '¿El 2 de noviembre de 2026 es festivo?', a: `Sí en ${lista(ccaaCon(Y, d2n, 'es'), 'es')}, que trasladan al lunes el 1 de noviembre, Todos los Santos, porque cae en domingo. En el resto de comunidades es laborable: usaron ese domingo para añadir otra fiesta propia en otro momento del año. Si tu ayuntamiento lo eligió como fiesta local, el buscador lo muestra.` },
      { q: '¿Dónde es festivo el 7 de diciembre de 2026?', a: `En ${lista(ccaaCon(Y, d7d, 'es'), 'es')}. El Día de la Constitución, el 6 de diciembre, cae en domingo y estas comunidades lo pasan al lunes 7, que se une al martes 8, Inmaculada Concepción: cuatro días seguidos del sábado 5 al martes 8 sin pedir vacaciones.` },
      { q: '¿Cuántos festivos quedan en 2026?', a: `Depende de tu comunidad. Toda España tiene aún el 8 y el 25 de diciembre; ${ccaaCon(Y, d2n, 'es').length} comunidades suman el 2 de noviembre, ${ccaaCon(Y, d7d, 'es').length} el 7 de diciembre, y Cataluña y Baleares el 26 de diciembre, en sábado. Además pueden quedar fiestas locales: Madrid celebra la Almudena el 9 de noviembre. El buscador cuenta las tuyas.` },
    ],
    body: (h) => `<h2>Las ${com.length} fiestas comunes de 2026</h2>
<p>La ${h.src('boe-2026', 'resolución de 17 de octubre de 2025')} fijó estas fiestas para todo el país. Son una menos que en un año normal porque el 1 de noviembre y el 6 de diciembre caen en domingo y cada comunidad decidió por su cuenta si trasladarlos al lunes.</p>
${h.table(['Fecha', 'Día', 'Fiesta'], com.map((f) => [h.dm(f.fecha), K.fSemana(f.fecha, 'es'), f.es]), undefined, ['l', 'l', 'l'])}
<p>De esas ${com.length}, ${finde.length} caen en sábado: ${lista(finde.map((f) => `${f.es} (${h.dm(f.fecha)})`), 'es')}. No se recuperan, porque el ${h.src('rd2001', 'Real Decreto 2001/1983')} solo traslada las de domingo.</p>
<h2>Noviembre y diciembre, comunidad por comunidad</h2>
<p>El lunes 2 de noviembre es festivo en ${lista(ccaaCon(Y, d2n, 'es'), 'es')}. El lunes 7 de diciembre lo es en ${lista(ccaaCon(Y, d7d, 'es'), 'es')}; donde coincide con el 8, deja un fin de semana de cuatro días. San Esteban, el ${h.dm(d26)}, solo es festivo en ${lista(ccaaCon(Y, d26, 'es'), 'es')}, y este año cae en sábado.</p>
${h.mini('faltan', { p: ['ccaa'], d: { ccaa: 'castilla-y-leon', mes: '2026-11' }, t: 'Próximo festivo entre semana en tu comunidad' })}
<h2>Fiestas locales que quedan este año</h2>
<p>Las fiestas locales de 2026 se publicaron entre el verano y el invierno de 2025, cada una en su boletín; las tenemos leídas en ${pub.length} comunidades y ciudades autónomas. ${finales.length ? `De los municipios del buscador, estos tienen todavía una fiesta local en noviembre o diciembre: ${lista(finales.slice(0, 14).map((x) => `${x.m.nombre} (${h.dm(x.f.fecha)})`), 'es')}${finales.length > 14 ? `, y ${finales.length - 14} más` : ''}.` : 'Ninguno de los municipios del buscador tiene fiestas locales en noviembre o diciembre.'} En Madrid capital, el año suma ${madrid.fiestas.length} fiestas.</p>
<h2>Cómo cuadrar las vacaciones que te quedan</h2>
<p>Si te quedan días de 2026, el puente de diciembre es el que más rinde: en las comunidades que dan el 7 no necesitas pedir nada para tener cuatro días, y en las demás el lunes 7 es el día que, pedido, abre esos cuatro días. Navidad cae en viernes, así que el fin de semana del 25 al 27 es largo sin pedir nada. La ${h.a('puentes-2026', 'calculadora de puentes de 2026')} hace la cuenta con tus fiestas locales; para el año que viene, mira el ${h.a('calendario-laboral-2027', 'calendario laboral de 2027')}.</p>
<p>Recuerda que el ${h.src('et', 'Estatuto de los Trabajadores')} fija 14 fiestas como máximo, pero tu convenio puede añadir días de libre disposición, como el 24 o el 31 de diciembre en muchos sectores. Esos días no aparecen aquí porque no son fiestas laborales oficiales.</p>`,
  },
  en: {
    slug: 'spain-public-holidays-2026',
    nav: 'Holiday calendar 2026', card: 'What is left of 2026: November and December long weekends and local days',
    title: 'Public holidays 2026 in Spain: days left and local holidays',
    description: 'Spain public holidays 2026 for your town: the days left in November and December, each region\'s Monday holidays and the local ones from the official gazette.',
    h1: 'Public holidays 2026 in Spain: the rest of the year',
    intro: 'Pick your region and town: you see the 14 holidays of 2026, which are still ahead and the working days left in each month to December.',
    resume: `Spain's 2026 holiday calendar was published in the BOE on ${K.fFecha(R.fecha, 'en')} with just ${com.length} holidays shared by the whole country, because 1 November and 6 December fall on a Sunday. Each region decided what to do with those two Sundays: ${ccaaCon(Y, d2n, 'en').length} regions give Monday 2 November off and ${ccaaCon(Y, d7d, 'en').length} Monday 7 December, while the rest used the slots for regional days elsewhere in the year. So the end of 2026 depends on where you live: in Madrid you link Monday 7 and Tuesday 8 December, in Catalonia and the Balearics Saint Stephen's Day on the 26th falls on a Saturday, and in the Basque Country or Valencia December only brings the 8th and the 25th. On top of each region's 12 holidays come each town's 2 local days, published in its gazette: we read them for ${K.MUNICIPIOS.length} towns. The tool shows your 14 holidays of 2026, greying out those already past, and the working days in each month.`,
    faqs: [
      { q: 'Is 2 November 2026 a holiday in Spain?', a: `Yes in ${lista(ccaaCon(Y, d2n, 'en'), 'en')}, which move All Saints' Day, 1 November, to the Monday because it falls on a Sunday. Elsewhere it is a working day: those regions used the Sunday slot to add another day of their own at some other point in the year. If your town picked it as a local holiday, the search shows it.` },
      { q: 'Where is 7 December 2026 a holiday?', a: `In ${lista(ccaaCon(Y, d7d, 'en'), 'en')}. Constitution Day, 6 December, falls on a Sunday and these regions move it to Monday 7, which joins Tuesday 8, the Immaculate Conception: four days in a row from Saturday 5 to Tuesday 8 without taking leave.` },
      { q: 'How many holidays are left in 2026?', a: `It depends on your region. All of Spain still has 8 and 25 December; ${ccaaCon(Y, d2n, 'en').length} regions add 2 November, ${ccaaCon(Y, d7d, 'en').length} add 7 December, and Catalonia and the Balearics add 26 December, a Saturday. There may also be local days left: Madrid keeps La Almudena on 9 November. The search counts yours.` },
    ],
    body: (h) => `<h2>The ${com.length} nationwide holidays of 2026</h2>
<p>The ${h.src('boe-2026', 'resolution of 17 October 2025')} set these holidays for the whole country. That is one fewer than in a normal year because 1 November and 6 December fall on a Sunday, and each region decided on its own whether to move them to the Monday.</p>
${h.table(['Date', 'Day', 'Holiday'], com.map((f) => [h.dm(f.fecha), K.fSemana(f.fecha, 'en'), f.en]), undefined, ['l', 'l', 'l'])}
<p>Of those ${com.length}, ${finde.length} fall on a Saturday: ${lista(finde.map((f) => `${f.en} (${h.dm(f.fecha)})`), 'en')}. They are not made up, because ${h.src('rd2001', 'Royal Decree 2001/1983')} only moves Sunday holidays.</p>
<h2>November and December, region by region</h2>
<p>Monday 2 November is a holiday in ${lista(ccaaCon(Y, d2n, 'en'), 'en')}. Monday 7 December is one in ${lista(ccaaCon(Y, d7d, 'en'), 'en')}; next to the 8th, it leaves a four-day weekend. Saint Stephen's Day, ${h.dm(d26)}, is a holiday only in ${lista(ccaaCon(Y, d26, 'en'), 'en')}, and this year it falls on a Saturday.</p>
${h.mini('faltan', { p: ['ccaa'], d: { ccaa: 'castilla-y-leon', mes: '2026-11' }, t: 'Next weekday holiday in your region' })}
<h2>Local holidays still to come this year</h2>
<p>The 2026 local holidays were published between summer and winter 2025, each in its own gazette; we have them for ${pub.length} regions and autonomous cities. ${finales.length ? `Among the towns in the search, these still have a local holiday in November or December: ${lista(finales.slice(0, 14).map((x) => `${x.m.nombre} (${h.dm(x.f.fecha)})`), 'en')}${finales.length > 14 ? `, and ${finales.length - 14} more` : ''}.` : 'None of the towns in the search has a local holiday in November or December.'} Madrid city has ${madrid.fiestas.length} holidays in the year.</p>
<h2>Using the leave you have left</h2>
<p>If you still have 2026 leave, the December bridge goes furthest: in regions that give the 7th off you need no leave for four days, and elsewhere Monday 7 is the day that opens those four days. Christmas Day is a Friday, so 25 to 27 December is a long weekend without taking anything. The ${h.a('puentes-2026', '2026 long-weekend planner')} does the maths with your local holidays; for next year, see the ${h.a('calendario-laboral-2027', '2027 holiday calendar')}.</p>
<p>Bear in mind that the ${h.src('et', 'Workers\' Statute')} caps public holidays at 14, but your collective agreement may add personal days, such as 24 or 31 December in many sectors. Those days are not shown here because they are not official public holidays.</p>`,
  },
});
