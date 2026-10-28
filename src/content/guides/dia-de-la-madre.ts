import { defineGuide } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';
import { lista, ccaaCon } from './_util';

/* Día de la Madre en España: primer domingo de mayo (engine/fechas.ts, diaMadre). Día del Padre: 19 de marzo, San José. */
const Y = 2027;
const madre = (y: number) => K.diaMadre(y);
const prox = Array.from({ length: 6 }, (_, i) => Y + i);
const sj27 = ccaaCon(Y, '2027-03-19', 'es'), sj27en = ccaaCon(Y, '2027-03-19', 'en');
const dosMayo26 = ccaaCon(2026, '2026-05-02', 'es').length > 0;

export default defineGuide({
  id: 'dia-de-la-madre', group: 'fechas', order: 13,
  tool: 'movil', toolArg: { ev: 'madre', year: 2027 },
  related: ['carnaval', 'semana-santa', 'calendario-2027', 'festivos-nacionales'],
  sources: ['boe-2027', 'boe-2026'],
  es: {
    slug: 'dia-de-la-madre-2027',
    nav: 'Día de la Madre y del Padre 2027', card: 'Cuándo caen el Día de la Madre y el del Padre, y si son festivos',
    title: 'Día de la Madre 2027: domingo 2 de mayo, y el Día del Padre',
    description: 'Día de la Madre 2027 en España: domingo 2 de mayo, primer domingo del mes. Fechas de los próximos años y del Día del Padre, festivo en cinco comunidades.',
    h1: 'Día de la Madre 2027',
    intro: `En España el Día de la Madre es el primer domingo de mayo: en 2027 cae el ${K.fDia(madre(Y), 'es')}. Cambia el año o la fecha para ver otras.`,
    resume: `En España el Día de la Madre se celebra el primer domingo de mayo, así que cambia de fecha cada año: en 2026 fue el ${K.fDia(madre(2026), 'es')}, en 2027 cae el ${K.fDia(madre(2027), 'es')} y en 2028 caerá el ${K.fDia(madre(2028), 'es')}. No es fiesta laboral, porque cae siempre en domingo y no figura en ninguna resolución de fiestas. Durante décadas se celebró el 8 de diciembre, día de la Inmaculada Concepción, y pasó a mayo en 1965; por eso no coincide con el de otros países, como Estados Unidos, Alemania o Italia, que lo celebran el segundo domingo de mayo, ni con el de Reino Unido, que lo hace en Cuaresma. En 2027 el primer domingo de mayo va justo después del 1 de mayo, Fiesta del Trabajo, que cae en sábado. El Día del Padre sí tiene fecha fija, el 19 de marzo, San José, y en 2027 es festivo en ${sj27.length} comunidades: ${lista(sj27, 'es')}. La herramienta da la fecha de cualquier año.`,
    faqs: [
      { q: '¿Cuándo es el Día de la Madre en 2027?', a: `El domingo ${K.fDia(madre(Y), 'es')}, primer domingo de mayo. Al caer el 1 de mayo en sábado, el fin de semana junta la Fiesta del Trabajo y el Día de la Madre. En 2028 será el ${K.fDia(madre(2028), 'es')}, porque mayo de 2028 empieza en lunes y el primer domingo llega una semana después.` },
      { q: '¿El Día del Padre es festivo?', a: `Solo donde San José, el 19 de marzo, es fiesta laboral. En 2027 lo es en ${lista(sj27, 'es')}, y en todas ellas cae en viernes, con lo que hay fin de semana largo. En el resto de España es un día laborable, salvo en los municipios que lo eligen como una de sus dos fiestas locales; el buscador de la portada lo indica para cada municipio.` },
      { q: '¿Por qué en España el Día de la Madre es distinto que en otros países?', a: 'Porque cada país lo fijó a su manera. En España se celebraba el 8 de diciembre y en 1965 se trasladó al primer domingo de mayo, mes dedicado a la Virgen en la tradición católica. Estados Unidos, Alemania, Italia o Australia lo celebran el segundo domingo de mayo, y Reino Unido el cuarto domingo de Cuaresma.' },
    ],
    body: (h) => `<h2>Día de la Madre en los próximos años</h2>
${h.table(['Año', 'Día de la Madre', 'Día del Padre (19 de marzo)'], prox.map((y) => [String(y), `domingo ${h.dm(madre(y))}`, K.fSemana(`${y}-03-19`, 'es')]), undefined, ['l', 'l', 'l'])}
<p>La regla es sencilla: el primer domingo de mayo cae entre el 1 y el 7. Cae el día 1 cuando mayo empieza en domingo, como en 2033, y el día 7 cuando empieza en lunes, como en 2028.</p>
${h.mini('movil', { p: ['year'], d: { ev: 'padre', year: 2027 }, t: 'Día del Padre en cualquier año' })}
<h2>Mayo de 2027 en el calendario laboral</h2>
<p>El 1 de mayo de 2027 cae en sábado y, según la ${h.src('boe-2027', 'resolución de fiestas de 2027')}, ninguna comunidad lo traslada, porque solo se trasladan las fiestas que caen en domingo. ${dosMayo26 ? 'La Comunidad de Madrid, que en 2026 tuvo festivo el 2 de mayo, su fiesta autonómica, no lo tiene en 2027, porque cae en domingo.' : ''} Mayo trae además el 17, Día de las Letras Gallegas en Galicia y Fiesta del Sacrificio en Ceuta y Melilla, el 27, Corpus Christi en Castilla-La Mancha, y el 31, Día de Castilla-La Mancha.</p>
<h2>San José y las Fallas</h2>
<p>El 19 de marzo es una de las fiestas que el Real Decreto 2001/1983 deja elegir a cada comunidad: San José o Santiago. En 2027 conservan San José ${lista(sj27, 'es')}. En València coincide con la cremà de las Fallas, la noche del 19. En la ${h.src('boe-2026', 'resolución de 2026')}, en cambio, el 19 de marzo cayó en jueves.</p>
<h2>Otros días que no son festivos</h2>
<p>El Día de la Madre y el del Padre son celebraciones, no fiestas laborales, igual que San Valentín, Halloween o el Día del Libro, el 23 de abril, que solo es fiesta en Aragón y en Castilla y León por sus fiestas autonómicas. Para saber qué días libras de verdad, mira el ${h.a('calendario-laboral-2027', 'calendario laboral de 2027')}.</p>
<p>Como cae siempre en domingo, el Día de la Madre no cambia nada para quien trabaja de lunes a viernes, pero sí para el comercio y la hostelería, que abren como cualquier otro domingo de su comunidad. Los domingos de apertura los fija cada comunidad, y en Madrid el horario comercial es libre.</p>`,
  },
  en: {
    slug: 'mothers-day-spain-2027',
    nav: 'Mother\'s and Father\'s Day 2027', card: 'When Mother\'s Day and Father\'s Day fall in Spain, and whether they are holidays',
    title: 'Mother\'s Day in Spain 2027: Sunday 2 May, plus Father\'s Day',
    description: 'Mother\'s Day in Spain 2027: Sunday 2 May, the first Sunday of the month. Dates for the next years and Father\'s Day, 19 March, a holiday in five regions.',
    h1: 'Mother\'s Day in Spain 2027',
    intro: `In Spain Mother's Day is the first Sunday of May: in 2027 it falls on ${K.fDia(madre(Y), 'en')}. Change the year or the date to see others.`,
    resume: `In Spain Mother's Day is the first Sunday of May, so its date changes every year: in 2026 it was ${K.fDia(madre(2026), 'en')}, in 2027 it falls on ${K.fDia(madre(2027), 'en')} and in 2028 it will be ${K.fDia(madre(2028), 'en')}. It is not a public holiday, since it is always a Sunday and appears in no holiday resolution. For decades it was held on 8 December, the Immaculate Conception, and moved to May in 1965; that is why it does not match other countries, such as the United States, Germany or Italy, which keep the second Sunday of May, or the UK, which holds it during Lent. In 2027 the first Sunday of May comes right after 1 May, Labour Day, which falls on a Saturday. Father's Day does have a fixed date, 19 March, Saint Joseph's Day, and in 2027 it is a public holiday in ${sj27en.length} regions: ${lista(sj27en, 'en')}. The tool gives the date for any year.`,
    faqs: [
      { q: 'When is Mother\'s Day in Spain in 2027?', a: `Sunday ${K.fDia(madre(Y), 'en')}, the first Sunday of May. As 1 May is a Saturday, that weekend brings Labour Day and Mother's Day together. In 2028 it will be ${K.fDia(madre(2028), 'en')}, because May 2028 starts on a Monday and the first Sunday comes a week later.` },
      { q: 'Is Father\'s Day a public holiday in Spain?', a: `Only where Saint Joseph's Day, 19 March, is a public holiday. In 2027 it is in ${lista(sj27en, 'en')}, and in all of them it falls on a Friday, giving a long weekend. Elsewhere in Spain it is a working day, except in towns that pick it as one of their two local holidays; the search on the home page shows that for each town.` },
      { q: 'Why is Mother\'s Day different in Spain from other countries?', a: 'Because each country set it its own way. Spain used to celebrate it on 8 December and in 1965 moved it to the first Sunday of May, a month dedicated to the Virgin Mary in Catholic tradition. The United States, Germany, Italy and Australia keep the second Sunday of May, and the UK the fourth Sunday of Lent.' },
    ],
    body: (h) => `<h2>Mother's Day in the next years</h2>
${h.table(['Year', 'Mother\'s Day', 'Father\'s Day (19 March)'], prox.map((y) => [String(y), `Sunday ${h.dm(madre(y))}`, K.fSemana(`${y}-03-19`, 'en')]), undefined, ['l', 'l', 'l'])}
<p>The rule is simple: the first Sunday of May falls between the 1st and the 7th. It is the 1st when May starts on a Sunday, as in 2033, and the 7th when it starts on a Monday, as in 2028.</p>
${h.mini('movil', { p: ['year'], d: { ev: 'padre', year: 2027 }, t: 'Father\'s Day in any year' })}
<h2>May 2027 on the work calendar</h2>
<p>1 May 2027 is a Saturday and, under the ${h.src('boe-2027', '2027 holiday resolution')}, no region moves it, as only Sunday holidays are moved. ${dosMayo26 ? 'The Madrid region, which had its regional day off on 2 May in 2026, does not have it in 2027, as it falls on a Sunday.' : ''} May also brings the 17th, Galician Literature Day in Galicia and Eid al-Adha in Ceuta and Melilla, the 27th, Corpus Christi in Castilla-La Mancha, and the 31st, Castilla-La Mancha Day.</p>
<h2>Saint Joseph and the Fallas</h2>
<p>19 March is one of the holidays Royal Decree 2001/1983 lets each region choose: Saint Joseph or Saint James. In 2027 ${lista(sj27en, 'en')} keep Saint Joseph. In Valencia it coincides with the burning of the Fallas, on the night of the 19th. In the ${h.src('boe-2026', '2026 resolution')}, by contrast, 19 March fell on a Thursday.</p>
<h2>Other days that are not holidays</h2>
<p>Mother's Day and Father's Day are celebrations, not public holidays, like Valentine's Day, Halloween or World Book Day on 23 April, which is a holiday only in Aragon and Castile and León because of their regional days. To see the days you actually get off, check the ${h.a('calendario-laboral-2027', '2027 holiday calendar')}.</p>
<p>Because it always falls on a Sunday, Mother's Day changes nothing for people working Monday to Friday, but it does matter for shops and restaurants, which tend to open as on any other Sunday in their region. Rules on Sunday trading are set by each region and, in large towns, by the council, so the shops open that day differ between Madrid, where trading hours are free, and other regions with a fixed list of Sundays. If you work in retail or hospitality, your schedule for that weekend follows your shift calendar and your collective agreement.</p>`,
  },
});
