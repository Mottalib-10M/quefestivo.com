import { defineGuide } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';
import { lista } from './_util';

/* Calendario anual: rejilla de 12 meses (lunes primero), semanas ISO 8601, fiestas comunes del BOE de 2027. */
const Y = 2027;
const com = K.comunes(Y);
const semanas = K.isoWeek(`${Y}-12-28`); // la semana que contiene el 28 de diciembre es siempre la última
const lunes1 = K.addDays(`${Y}-01-01`, (8 - K.weekday(`${Y}-01-01`)) % 7);
const sem = (d: string) => K.isoWeek(d);
const bcn = K.fiestasMunicipio(Y, '08019');
const anio = (y: number) => ({ dias: K.isLeap(y) ? 366 : 365, primero: K.fSemana(`${y}-01-01`, 'es'), ultimo: K.fSemana(`${y}-12-31`, 'es') });
const a27 = anio(2027), a28 = anio(2028);

export default defineGuide({
  id: 'calendario-2027', group: 'calendario', order: 5,
  tool: 'municipio', toolArg: { ccaa: 'cataluna', muni: '08019', year: '2027' },
  related: ['calendario-laboral-2027', 'dias-laborables', 'semana-santa', 'cl-cataluna'],
  sources: ['boe-2027'],
  es: {
    slug: 'calendario-2027',
    nav: 'Calendario 2027 para imprimir', card: 'Los 12 meses de 2027 con festivos y semanas, listos para imprimir',
    title: 'Calendario 2027 con festivos y semanas, para imprimir',
    description: 'Calendario 2027 de España con los 12 meses, los festivos nacionales marcados y el número de semana. Imprimible, con las fiestas de tu comunidad y municipio.',
    h1: 'Calendario 2027 con festivos',
    intro: 'Arriba, las fiestas de tu municipio en 2027; abajo, los 12 meses con los festivos comunes marcados, listos para imprimir en una hoja.',
    resume: `El año 2027 empieza en ${a27.primero} y termina en ${a27.ultimo}; tiene ${a27.dias} días, porque no es bisiesto (el próximo es 2028, con ${a28.dias}). Según la norma ISO 8601, que es la que usan los calendarios y agendas en España, las semanas empiezan en lunes y la semana 1 es la que contiene el primer jueves del año: en 2027 empieza el lunes ${K.fDia(lunes1, 'es')}, y los días 1, 2 y 3 de enero pertenecen todavía a la semana ${sem('2027-01-01')} de 2026. El año tiene ${semanas} semanas. En la rejilla de abajo, los ${com.length} festivos comunes a toda España van marcados en color: ${lista(com.map((f) => K.fDia(f.fecha, 'es')), 'es')}. Para ver también los de tu comunidad y tu municipio, elige arriba: la herramienta lista tus 14 fiestas. Pulsa «Imprimir» y la página sale sin menús, con los 12 meses en una hoja.`,
    faqs: [
      { q: '¿En qué día de la semana empieza 2027?', a: `En ${a27.primero}, 1 de enero, que es festivo en toda España. Termina en ${a27.ultimo}, 31 de diciembre. Como 2027 no es bisiesto, tiene ${a27.dias} días; febrero tiene 28. El próximo año bisiesto es 2028, que empezará en ${a28.primero} y tendrá un 29 de febrero, también ${K.fSemana('2028-02-29', 'es')}.` },
      { q: '¿Cuántas semanas tiene 2027?', a: `${semanas}. Con la norma ISO 8601, la semana 1 de 2027 empieza el lunes ${K.fDia(lunes1, 'es')}, porque es la primera que tiene un jueves en el año. Los días 1 a 3 de enero son la semana ${sem('2027-01-01')} de 2026. El 31 de diciembre de 2027, ${a27.ultimo}, cae en la semana ${sem('2027-12-31')}.` },
      { q: '¿Qué semana es la de Semana Santa de 2027?', a: `La semana ${sem(K.movibles(Y).jueves)}: del lunes ${K.fDia(K.addDays(K.movibles(Y).jueves, -3), 'es')} al Domingo de Pascua, ${K.fDia(K.movibles(Y).pascua, 'es')}. El Jueves Santo es festivo en casi toda España y el Viernes Santo en todas partes. El Lunes de Pascua, ya en la semana ${sem(K.movibles(Y).lunes)}, es festivo solo en algunas comunidades.` },
    ],
    body: (h) => `<h2>Los 12 meses de 2027</h2>
<p class="leyenda not-prose"><span class="l-nacional">Festivo común a toda España</span></p>
${h.grid(Y, com)}
<p>La rejilla marca solo las fiestas comunes. Para un calendario con las de tu municipio, usa la herramienta de arriba: la tabla de fiestas y la de laborables por mes salen en la misma impresión.</p>
<h2>Semanas de 2027</h2>
<p>Algunas empresas, colegios y administraciones cuentan el tiempo en semanas. Estas son las semanas en que caen las fechas más buscadas de 2027:</p>
${h.table(['Fecha', 'Día', 'Semana'], [['2027-01-01', 'Año Nuevo'], [K.movibles(Y).jueves, 'Jueves Santo'], ['2027-05-01', 'Fiesta del Trabajo'], ['2027-08-15', 'Asunción'], ['2027-10-12', 'Fiesta Nacional'], ['2027-12-25', 'Navidad']].map(([d, n]) => [`${n}, ${h.dm(d)}`, K.fSemana(d, 'es'), sem(d)]), undefined, ['l', 'l', 'r'])}
${h.mini('movil', { p: ['ev'], d: { year: 2027, ev: 'corpus' }, t: 'Fecha y semana de una fiesta móvil de 2027' })}
<h2>Ejemplo: Barcelona</h2>
<p>La herramienta arranca con Barcelona. Allí 2027 tiene ${bcn.fiestas.length} fiestas${bcn.localesPublicadas ? '' : ', a falta de las dos locales'}: ${lista(bcn.fiestas.map((f) => `${f.es} (${h.dm(f.fecha)})`), 'es')}. Cataluña no celebra el Jueves Santo; a cambio da el Lunes de Pascua, San Juan y la Diada del 11 de septiembre, que en 2027 cae en sábado. San Esteban, festivo en 2026, cae en domingo en 2027 y sale de su lista.</p>
<h2>Cómo imprimir</h2>
<p>Pulsa «Imprimir» en la herramienta o usa la orden de imprimir del navegador: la página oculta los menús y el pie, y coloca los meses en cuatro columnas. Para pegarlo en la nevera o en la oficina, elige papel A4 en horizontal. Si quieres el calendario en el móvil, en lugar de imprimirlo, descarga el archivo .ics desde la ${h.a('calendario-laboral-2027', 'página del calendario laboral')} o desde la portada.</p>`,
  },
  en: {
    slug: 'printable-calendar-2027-spain',
    nav: 'Printable calendar 2027', card: 'The 12 months of 2027 with Spanish holidays and week numbers, ready to print',
    title: 'Calendar 2027 for Spain with holidays and weeks, printable',
    description: 'Calendar 2027 for Spain with all 12 months, the nationwide holidays highlighted and the week numbers. Printable, plus your region\'s and town\'s 2027 holidays.',
    h1: 'Calendar 2027 with Spanish holidays',
    intro: 'Above, your town\'s 2027 holidays; below, the 12 months with the nationwide holidays highlighted, ready to print on one sheet.',
    resume: `The year 2027 starts on a ${K.fSemana('2027-01-01', 'en')} and ends on a ${K.fSemana('2027-12-31', 'en')}; it has ${a27.dias} days, as it is not a leap year (the next one is 2028, with ${a28.dias}). Under the ISO 8601 standard, which calendars and diaries use in Spain, weeks start on Monday and week 1 is the one containing the first Thursday of the year: in 2027 it starts on Monday ${K.fDia(lunes1, 'en')}, and 1, 2 and 3 January still belong to week ${sem('2027-01-01')} of 2026. The year has ${semanas} weeks. On the grid below, the ${com.length} holidays shared by all of Spain are highlighted: ${lista(com.map((f) => K.fDia(f.fecha, 'en')), 'en')}. To see your region's and town's too, pick them above: the tool lists your 14 holidays. Press "Print" and the page comes out without menus, with the 12 months on one sheet.`,
    faqs: [
      { q: 'What day of the week does 2027 start on?', a: `On a ${K.fSemana('2027-01-01', 'en')}, 1 January, a holiday across Spain. It ends on a ${K.fSemana('2027-12-31', 'en')}, 31 December. As 2027 is not a leap year it has ${a27.dias} days and February has 28. The next leap year is 2028, which starts on a ${K.fSemana('2028-01-01', 'en')} and will have a 29 February, also a ${K.fSemana('2028-02-29', 'en')}.` },
      { q: 'How many weeks are there in 2027?', a: `${semanas}. Under ISO 8601, week 1 of 2027 starts on Monday ${K.fDia(lunes1, 'en')}, the first week with a Thursday in the year. 1 to 3 January are week ${sem('2027-01-01')} of 2026. 31 December 2027, a ${K.fSemana('2027-12-31', 'en')}, falls in week ${sem('2027-12-31')}.` },
      { q: 'Which week is Holy Week 2027?', a: `Week ${sem(K.movibles(Y).jueves)}: from Monday ${K.fDia(K.addDays(K.movibles(Y).jueves, -3), 'en')} to Easter Sunday, ${K.fDia(K.movibles(Y).pascua, 'en')}. Maundy Thursday is a holiday in nearly all of Spain and Good Friday everywhere. Easter Monday, already in week ${sem(K.movibles(Y).lunes)}, is a holiday only in some regions, such as Catalonia and the Basque Country.` },
    ],
    body: (h) => `<h2>The 12 months of 2027</h2>
<p class="leyenda not-prose"><span class="l-nacional">Holiday across Spain</span></p>
${h.grid(Y, com)}
<p>The grid marks only the nationwide holidays. For a calendar with your town's, use the tool above: the holiday table and the working days per month print together with it.</p>
<h2>Weeks of 2027</h2>
<p>Some employers, schools and public offices count time in weeks. These are the weeks of the most searched dates of 2027:</p>
${h.table(['Date', 'Day', 'Week'], [['2027-01-01', 'New Year\'s Day'], [K.movibles(Y).jueves, 'Maundy Thursday'], ['2027-05-01', 'Labour Day'], ['2027-08-15', 'Assumption'], ['2027-10-12', 'National Day'], ['2027-12-25', 'Christmas Day']].map(([d, n]) => [`${n}, ${h.dm(d)}`, K.fSemana(d, 'en'), sem(d)]), undefined, ['l', 'l', 'r'])}
${h.mini('movil', { p: ['ev'], d: { year: 2027, ev: 'corpus' }, t: 'Date and week of a moving feast in 2027' })}
<h2>Example: Barcelona</h2>
<p>The tool opens on Barcelona. There 2027 has ${bcn.fiestas.length} holidays${bcn.localesPublicadas ? '' : ', the two local ones still pending'}: ${lista(bcn.fiestas.map((f) => `${K.nombreFiesta(f, 'en')} (${h.dm(f.fecha)})`), 'en')}. Catalonia does not keep Maundy Thursday; instead it gives Easter Monday, Saint John's Day and the Diada on 11 September, a Saturday in 2027. Saint Stephen's Day, a holiday in 2026, falls on a Sunday in 2027 and drops off its list.</p>
<h2>How to print</h2>
<p>Press "Print" in the tool or use your browser's print command: the page hides the menus and footer and lays the months out in four columns. For the fridge or the office, choose A4 landscape. If you would rather have the calendar on your phone than on paper, download the .ics file from the ${h.a('calendario-laboral-2027', 'holiday calendar page')} or the home page.</p>`,
  },
});
