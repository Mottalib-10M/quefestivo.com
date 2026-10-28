import { defineGuide } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';
import { lista } from './_util';

/* Laborables = lunes a viernes no festivos (fiestas del BOE por comunidad; locales aparte). */
const lab = (y: number, c: string) => K.laborables(`${y}-01-01`, `${y}-12-31`, new Set(K.fiestasCcaa(y, c).map((f) => f.fecha)));
const dias = (y: number) => K.range(`${y}-01-01`, `${y}-12-31`).filter((d) => !K.isWeekend(d)).length;
const filas = (y: number) => K.COMUNIDADES.map((c) => ({ c, n: lab(y, c.id) })).sort((a, b) => b.n - a.n || a.c.es.localeCompare(b.c.es, 'es'));
const f27 = filas(2027), f26 = filas(2026);
const max27 = f27[0], min27 = f27[f27.length - 1];
const mad = K.resumenMeses(2027, new Set(K.fiestasMunicipio(2027, '28079').fiestas.map((f) => f.fecha)));
const madF = K.fiestasMunicipio(2027, '28079');
const enMes = (m: number, l: 'es' | 'en') => madF.fiestas.filter((f) => +f.fecha.slice(5, 7) === m && !K.isWeekend(f.fecha)).map((f) => K.nombreFiesta(f, l));
const mesMin = mad.slice().sort((a, b) => a.laborables - b.laborables)[0], mesMax = mad.slice().sort((a, b) => b.laborables - a.laborables)[0];

export default defineGuide({
  id: 'dias-laborables', group: 'calendario', order: 4,
  tool: 'laborables', toolArg: { ccaa: 'madrid', muni: '28079', year: '2027' },
  related: ['calendario-laboral-2027', 'calendario-2027', 'puentes-2027', 'cl-pais-vasco'],
  sources: ['boe-2027', 'boe-2026', 'et'],
  es: {
    slug: 'dias-laborables-2027',
    nav: 'Días laborables 2027', card: 'Cuántos días y horas se trabajan cada mes en tu municipio, festivos descontados',
    title: 'Días laborables 2027: cuántos hay por mes en tu municipio',
    description: `Días laborables 2027 y 2026 en tu municipio, mes a mes: de lunes a viernes sin festivos, con las horas según tu jornada. Entre ${min27.n} y ${max27.n} por comunidad.`,
    h1: 'Días laborables 2027 por mes',
    intro: 'Elige tu municipio: la herramienta cuenta los días de lunes a viernes que no son festivos en cada mes y los pasa a horas con tu jornada diaria.',
    resume: `En 2027 hay ${dias(2027)} días de lunes a viernes, los mismos que en 2026. De ellos hay que restar los festivos que caen entre semana, y eso depende del lugar: con las 12 fiestas de su comunidad, sin contar las locales, el año tiene entre ${min27.n} días laborables (${min27.c.es}) y ${max27.n} (${max27.c.es}). La diferencia viene de cuántas fiestas caen en sábado o domingo, que no restan nada: en 2027 caen en sábado el 1 de mayo y el 25 de diciembre en todas partes, y en algunas comunidades también su día propio, como el 11 de septiembre en Cataluña o el 9 de octubre en la Comunitat Valenciana. Después hay que quitar las dos fiestas locales de tu municipio si caen entre semana. Madrid capital, con sus fiestas, deja ${mad.reduce((s, m) => s + m.laborables, 0)} días laborables en 2027: ${mesMax.laborables} en ${K.MES(mesMax.mes, 'es')}, el mes con más, y ${mesMin.laborables} en ${K.MES(mesMin.mes, 'es')}, el que menos. La herramienta convierte esos días en horas con tu jornada.`,
    faqs: [
      { q: '¿Cuántos días laborables tiene 2027?', a: `De lunes a viernes hay ${dias(2027)}. Restando las fiestas de la comunidad que caen entre semana quedan entre ${min27.n} y ${max27.n}, según dónde trabajes, y una o dos menos si tus fiestas locales caen de lunes a viernes. Si tu empresa trabaja los sábados o tienes turnos, el número lo fija el calendario laboral de tu centro, que debe estar expuesto.` },
      { q: '¿Qué mes de 2027 tiene más días laborables?', a: `En Madrid capital, ${K.MES(mesMax.mes, 'es')}, con ${mesMax.laborables}; el que menos, ${K.MES(mesMin.mes, 'es')}, con ${mesMin.laborables}. En la mayoría de comunidades el reparto es parecido: los meses de 23 días laborables son los que no tienen festivos entre semana y empiezan cerca del lunes. La tabla de la herramienta lo da mes a mes para tu municipio.` },
      { q: '¿Cómo se calculan las horas de trabajo del año?', a: 'Multiplicando los días laborables por las horas de tu jornada diaria: con 8 horas, 250 días son 2000 horas. Ese es el máximo teórico; las vacaciones, como mínimo 30 días naturales según el artículo 38 del Estatuto de los Trabajadores, se restan después. Tu convenio puede fijar una jornada anual distinta, que es la que manda.' },
    ],
    body: (h) => `<h2>Laborables de 2027 en cada comunidad</h2>
<p>Esta tabla cuenta los días de lunes a viernes que no son fiesta en cada comunidad según la ${h.src('boe-2027', 'resolución del BOE para 2027')}, sin las dos fiestas locales. Al lado, la cifra de 2026 con la ${h.src('boe-2026', 'resolución de 2026')}.</p>
${h.table(['Comunidad', '2027', '2026'], f27.map((x) => [x.c.es, x.n, f26.find((y) => y.c.id === x.c.id)!.n]), undefined, ['l', 'r', 'r'])}
<p>Que una comunidad tenga más días laborables no significa que tenga menos fiestas: todas tienen 12. Cambia cuántas de ellas caen en fin de semana. En 2027, ${max27.c.es} pierde más fiestas en sábado o domingo y por eso trabaja más días; ${min27.c.es} tiene casi todas las suyas entre semana.</p>
${h.mini('laborables', { p: ['ccaa', 'mes'], d: { year: '2027', mes: '3' }, t: 'Laborables de un mes de 2027' })}
<h2>Mes a mes en Madrid capital</h2>
<p>${madF.localesPublicadas ? 'Con sus dos fiestas locales de 2027' : 'Con las fiestas de la comunidad, a falta de las dos locales de 2027'}, Madrid capital reparte así sus días laborables:</p>
${h.table(['Mes', 'Laborables', 'Festivos entre semana'], mad.map((m) => [K.Mes(m.mes, 'es'), m.laborables, m.festivosLaborables]), undefined, ['l', 'r', 'r'])}
<p>Marzo pierde ${enMes(3, 'es').length} días entre semana (${lista(enMes(3, 'es'), 'es')}) y diciembre ${enMes(12, 'es').length} (${lista(enMes(12, 'es'), 'es')}); la Navidad cae en sábado y no resta nada. Para el resto de municipios, la herramienta hace la misma cuenta con sus fiestas.</p>
<h2>De días a horas</h2>
<p>El campo «horas por día laborable», en «Más datos», multiplica los días por tu jornada. Sirve para comprobar la jornada anual de tu convenio o para calcular cuántas horas te corresponden en un mes con festivos. El ${h.src('et', 'Estatuto de los Trabajadores')} fija un máximo de 40 horas semanales de trabajo efectivo de promedio en cómputo anual (artículo 34) y 30 días naturales de vacaciones como mínimo (artículo 38); el calendario de tu empresa concreta ambos.</p>
<h2>Lo que la cuenta no incluye</h2>
<p>No descuenta tus vacaciones, ni los días de libre disposición de tu convenio, ni los cierres de empresa. Tampoco cuenta los sábados: si trabajas de lunes a sábado, suma los sábados no festivos del mes. Para ver los días en una rejilla de calendario, abre el ${h.a('calendario-2027', 'calendario 2027 para imprimir')}.</p>`,
  },
  en: {
    slug: 'working-days-spain-2027',
    nav: 'Working days 2027', card: 'How many days and hours are worked each month in your town, holidays deducted',
    title: 'Working days in Spain 2027: how many per month in your town',
    description: `Working days in Spain 2027 and 2026 for your town, month by month: Monday to Friday minus holidays, in hours with your daily schedule. ${min27.n} to ${max27.n} by region.`,
    h1: 'Working days in Spain 2027 by month',
    intro: 'Pick your town: the tool counts the Mondays to Fridays that are not holidays in each month and turns them into hours with your daily schedule.',
    resume: `2027 has ${dias(2027)} weekdays, the same as 2026. From them you subtract the holidays that fall on a weekday, and that depends on where you are: with each region's 12 holidays, leaving out local ones, the year has between ${min27.n} working days (${min27.c.en}) and ${max27.n} (${max27.c.en}). The gap comes from how many holidays fall on a Saturday or Sunday, which subtract nothing: in 2027 1 May and 25 December are Saturdays everywhere, and in some regions so is their own day, such as 11 September in Catalonia or 9 October in Valencia. Then you remove your town's two local holidays if they fall on a weekday. Madrid city, with its holidays, has ${mad.reduce((s, m) => s + m.laborables, 0)} working days in 2027: ${mesMax.laborables} in ${K.MES(mesMax.mes, 'en')}, the month with the most, and ${mesMin.laborables} in ${K.MES(mesMin.mes, 'en')}, the one with the fewest. The tool turns those days into hours with your working day.`,
    faqs: [
      { q: 'How many working days does Spain have in 2027?', a: `There are ${dias(2027)} Mondays to Fridays. Taking off the regional holidays that fall on weekdays leaves between ${min27.n} and ${max27.n}, depending on where you work, and one or two fewer if your local holidays fall on weekdays. If your employer works Saturdays or you work shifts, the figure is set by your workplace calendar, which must be displayed.` },
      { q: 'Which month of 2027 has the most working days in Spain?', a: `In Madrid city, ${K.MES(mesMax.mes, 'en')}, with ${mesMax.laborables}; the fewest, ${K.MES(mesMin.mes, 'en')}, with ${mesMin.laborables}. Most regions look similar: the months with 23 working days are those with no weekday holiday that start near a Monday. The tool's table gives the month-by-month figure for your town.` },
      { q: 'How are yearly working hours worked out?', a: 'Multiply the working days by your daily hours: at 8 hours, 250 days make 2,000 hours. That is the theoretical maximum; paid leave, at least 30 calendar days under article 38 of the Workers\' Statute, comes off afterwards. Your collective agreement may set a different yearly total, and that is the one that applies.' },
    ],
    body: (h) => `<h2>2027 working days in each region</h2>
<p>This table counts the Mondays to Fridays that are not holidays in each region under the ${h.src('boe-2027', '2027 BOE resolution')}, without the two local days. Next to it, the 2026 figure from the ${h.src('boe-2026', '2026 resolution')}.</p>
${h.table(['Region', '2027', '2026'], f27.map((x) => [x.c.en, x.n, f26.find((y) => y.c.id === x.c.id)!.n]), undefined, ['l', 'r', 'r'])}
<p>A region with more working days does not have fewer holidays: they all have 12. What changes is how many fall on a weekend. In 2027 ${max27.c.en} loses more holidays to Saturdays and Sundays and so works more days; ${min27.c.en} has nearly all of its own on weekdays.</p>
${h.mini('laborables', { p: ['ccaa', 'mes'], d: { year: '2027', mes: '3' }, t: 'Working days in one month of 2027' })}
<h2>Month by month in Madrid city</h2>
<p>${madF.localesPublicadas ? 'With its two 2027 local holidays' : 'With the regional holidays, its two 2027 local days still pending'}, Madrid city spreads its working days like this:</p>
${h.table(['Month', 'Working days', 'Weekday holidays'], mad.map((m) => [K.Mes(m.mes, 'en'), m.laborables, m.festivosLaborables]), undefined, ['l', 'r', 'r'])}
<p>March loses ${enMes(3, 'en').length} weekdays (${lista(enMes(3, 'en'), 'en')}) and December ${enMes(12, 'en').length} (${lista(enMes(12, 'en'), 'en')}); Christmas Day falls on a Saturday and takes nothing away. For other towns the tool does the same sum with their holidays.</p>
<h2>From days to hours</h2>
<p>The "hours per working day" field, under "More details", multiplies the days by your schedule. It helps check the yearly hours in your collective agreement or the hours owed in a month with holidays. The ${h.src('et', 'Workers\' Statute')} sets a maximum of 40 hours of actual work a week on a yearly average (article 34) and at least 30 calendar days of paid leave (article 38); your employer's calendar fills in the detail.</p>
<h2>What the count leaves out</h2>
<p>It does not deduct your leave, your agreement's personal days or company closures. Nor does it count Saturdays: if you work Monday to Saturday, add the month's non-holiday Saturdays. To see the days on a calendar grid, open the ${h.a('calendario-2027', 'printable 2027 calendar')}.</p>
<p>Payroll and deadlines often use a different count. Legal time limits in administrative procedures, for instance, exclude Saturdays, Sundays and holidays, and a holiday in your town may not be one where the authority sits. When a date matters, check which calendar the rule refers to.</p>`,
  },
});
