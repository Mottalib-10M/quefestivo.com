import { defineGuide } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';
import { lista, ccaaCon, ccaaSin, propias, comunesFinde, filasBOE, estadoLocales } from './_util';

/* Resolución de 8 de octubre de 2026 de la Dirección General de Trabajo (BOE de 13 de octubre de 2026), en festivos.json.
   Fiestas locales: src/data/municipal. Todo el texto lee los datos ; nada se teclea a mano. */
const Y = 2027;
const R = K.resolucion(Y)!;
const com = K.comunes(Y);
const m = K.movibles(Y);
const finde = comunesFinde(Y);
const lunes16 = '2027-08-16', sanJose = '2027-03-19';
const est = estadoLocales(Y);
const pub = est.filter((e) => e.conFiestas > 0);
const name = (f: { es: string; en: string }, l: 'es' | 'en') => f[l];

export default defineGuide({
  id: 'calendario-laboral-2027', group: 'calendario', order: 1,
  tool: 'municipio', toolArg: { ccaa: 'madrid', muni: '28079', year: '2027' },
  related: ['puentes-2027', 'fiestas-locales', 'dias-laborables', 'calendario-2027', 'cl-madrid', 'cl-andalucia'],
  sources: ['boe-2027', 'et', 'rd2001'],
  es: {
    slug: 'calendario-laboral-2027',
    nav: 'Calendario laboral 2027', card: 'Las 12 fiestas de tu comunidad y las 2 de tu municipio, con los laborables de cada mes',
    title: 'Calendario laboral 2027: festivos de tu comunidad y pueblo',
    description: 'Calendario laboral 2027 con las 9 fiestas comunes, las de cada comunidad según el BOE y las locales de tu municipio. Laborables de cada mes y agenda .ics.',
    h1: 'Calendario laboral 2027 de tu municipio',
    intro: `Elige comunidad y municipio: ves sus 14 fiestas de 2027, las que caen entre semana y los días laborables de cada mes. Fuente: BOE del ${K.fFecha(R.fecha, 'es')}.`,
    resume: `El calendario laboral de 2027 tiene ${com.length} fiestas comunes a toda España, publicadas por la Dirección General de Trabajo en el BOE del ${K.fFecha(R.fecha, 'es')}: ${lista(com.map((f) => `${f.es} (${K.fDia(f.fecha, 'es')})`), 'es')}. Cada comunidad completa hasta 12 fiestas con las suyas, por ejemplo el Jueves Santo, ${K.fDia(m.jueves, 'es')}, que es festivo en ${ccaaCon(Y, m.jueves, 'es').length} comunidades y ciudades autónomas, o el lunes ${K.fDia(lunes16, 'es')}, que ${ccaaCon(Y, lunes16, 'es').length} comunidades toman porque el 15 de agosto cae en domingo. Después, cada ayuntamiento fija dos fiestas locales, que publica el boletín de su comunidad o de su provincia. En total, 14 días festivos al año, como dice el artículo 37.2 del Estatuto de los Trabajadores. Con la herramienta ves las 14 de tu municipio, cuántas caen en fin de semana y cuántos días laborables quedan en cada mes.`,
    faqs: [
      { q: '¿Cuántos festivos hay en 2027 en España?', a: `Cada trabajador tiene 14 fiestas laborales en 2027: 12 de su comunidad autónoma, de las que ${com.length} son comunes a toda España, y 2 locales de su municipio. Algunas caen en sábado, como el 1 de mayo y el 25 de diciembre, y no se recuperan: el Estatuto solo traslada al lunes las que caen en domingo, y lo hace la comunidad al elegir sus fiestas.` },
      { q: '¿Qué festivos nacionales de 2027 caen en fin de semana?', a: `${lista(finde.map((f) => `${f.es} (${K.fSemana(f.fecha, 'es')} ${K.fDia(f.fecha, 'es')})`), 'es')}. El 15 de agosto cae en domingo y por eso ${ccaaCon(Y, lunes16, 'es').length} comunidades dan fiesta el lunes 16. Otras usaron ese hueco para una fiesta propia, como Extremadura, que la pasa al 11 de octubre.` },
      { q: '¿El 19 de marzo de 2027 es festivo?', a: `Solo en ${lista(ccaaCon(Y, sanJose, 'es'), 'es')}, donde San José cae en viernes y forma puente con el fin de semana. En el resto de España es un día laborable, salvo que tu ayuntamiento lo haya elegido como una de sus dos fiestas locales: el buscador de esta página lo indica para cada municipio de la lista.` },
      { q: '¿Cuándo se publican las fiestas locales de 2027?', a: `Las aprueba la autoridad laboral de cada comunidad a propuesta de los ayuntamientos, casi siempre entre septiembre y diciembre del año anterior. A ${K.fFecha(K.LECTURA, 'es')} están leídas en el boletín para ${pub.length} de las 19 comunidades y ciudades autónomas; en las demás, la herramienta muestra «sin publicar» hasta que salgan.` },
    ],
    body: (h) => `<h2>Las ${com.length} fiestas comunes a toda España en 2027</h2>
<p>La ${h.src('boe-2027', 'resolución de la Dirección General de Trabajo')} recoge, como cada año, las fiestas que las comunidades le comunicaron antes del 30 de septiembre. Estas ${com.length} se celebran en todas, sin excepción:</p>
${h.table(['Fecha', 'Día', 'Fiesta'], com.map((f) => [h.dm(f.fecha), K.fSemana(f.fecha, 'es'), f.es]), undefined, ['l', 'l', 'l'])}
<p>De ellas, ${finde.length} caen en sábado o domingo: ${lista(finde.map((f) => `${f.es} (${K.fSemana(f.fecha, 'es')})`), 'es')}. Un festivo en sábado se pierde para quien trabaja de lunes a viernes; el ${h.src('rd2001', 'artículo 45 del Real Decreto 2001/1983')} solo pasa al lunes los que caen en domingo, y deja a cada comunidad decidir si lo hace o pone otra fiesta propia.</p>
<h2>Lo que cambia de una comunidad a otra</h2>
<p>Las tres fiestas que más varían en 2027 son el Jueves Santo, ${h.dm(m.jueves)}, festivo en todas salvo ${lista(ccaaSin(Y, m.jueves, 'es'), 'es')}; el Lunes de Pascua, ${h.dm(m.lunes)}, que solo dan ${lista(ccaaCon(Y, m.lunes, 'es'), 'es')}; y el lunes 16 de agosto, que sustituye al 15 en ${lista(ccaaCon(Y, lunes16, 'es'), 'es')}. San José, el 19 de marzo, queda en ${ccaaCon(Y, sanJose, 'es').length} comunidades.</p>
${h.table(['Comunidad', 'Fiestas propias en 2027'], K.COMUNIDADES.map((c) => [c.es, propias(Y, c.id).map((f) => `${f.es} (${h.dm(f.fecha)})`).join('; ')]), undefined, ['l', 'l'])}
${h.mini('nacionales', { p: ['ccaa'], d: { year: '2027', ccaa: 'cataluna' }, t: 'Las 12 fiestas de una comunidad en 2027', c: 'Cuenta atrás al próximo festivo' })}
<h2>Puentes que deja 2027</h2>
<p>Con el 1 de mayo y la Navidad en sábado, 2027 no es generoso, pero tiene tres puentes largos para todo el país. Semana Santa, del ${h.dm(m.jueves)} al ${h.dm(m.lunes)}, da cuatro o cinco días según la comunidad. El 12 de octubre cae en martes: pidiendo el lunes 11 tienes cuatro días. Y diciembre junta el lunes 6, Día de la Constitución, con el miércoles 8: un solo día de vacaciones, el martes 7, abre cinco días seguidos. La página de ${h.a('puentes-2027', 'puentes de 2027')} calcula el mejor reparto de tus días de vacaciones con las fiestas de tu municipio.</p>
${h.mini('puentes', { p: ['dias'], d: { ccaa: 'madrid', year: '2027', dias: 4 }, t: 'Cuántos días libres sacas con 4 de vacaciones' })}
<h2>Las dos fiestas de tu municipio</h2>
<p>El ${h.src('rd2001', 'artículo 46 del Real Decreto 2001/1983')} da a cada municipio hasta dos fiestas locales al año: las propone el pleno del ayuntamiento, las aprueba la consejería de trabajo y se publican en el boletín de la comunidad o de la provincia. Esta página las lee en ese boletín para ${K.MUNICIPIOS.length} municipios, las capitales de provincia y los más poblados, y cita en cada caso el número y la fecha del boletín. Para 2027 ya están publicadas en ${pub.length} comunidades (${lista(pub.map((e) => e.c.es), 'es')}); la página de ${h.a('fiestas-locales', 'fiestas locales')} dice en qué punto está cada una.</p>
<h2>Cómo leer el resultado</h2>
<p>La herramienta cuenta como laborables los días de lunes a viernes que no son festivos en tu municipio. Si trabajas los sábados, en turnos o en un sector con calendario propio, tu convenio colectivo o el calendario de tu empresa, que debe estar expuesto en el centro de trabajo, puede apartarse de estas cifras. Y si eliges solo la comunidad, el resultado no incluye tus dos fiestas locales: verás 12 fiestas en lugar de 14.</p>`,
  },
  en: {
    slug: 'spain-public-holidays-2027',
    nav: 'Holiday calendar 2027', card: 'Your region\'s 12 holidays and your town\'s 2, with the working days in each month',
    title: 'Public holidays 2027 in Spain: by region and by town',
    description: 'Spain public holidays 2027: the 9 national ones, each region\'s from the BOE and your town\'s two local days. Working days by month and an .ics file for 2027.',
    h1: 'Public holidays 2027 for your Spanish town',
    intro: `Pick your region and town: you see its 14 holidays in 2027, which fall on weekdays and the working days in each month. Source: BOE of ${K.fFecha(R.fecha, 'en')}.`,
    resume: `Spain's 2027 holiday calendar has ${com.length} holidays shared by the whole country, published by the Directorate-General for Labour in the Official State Gazette (BOE) on ${K.fFecha(R.fecha, 'en')}: ${lista(com.map((f) => `${f.en} (${K.fDia(f.fecha, 'en')})`), 'en')}. Each region tops this up to 12 with its own days, such as Maundy Thursday, ${K.fDia(m.jueves, 'en')}, a holiday in ${ccaaCon(Y, m.jueves, 'en').length} regions and autonomous cities, or Monday ${K.fDia(lunes16, 'en')}, taken by ${ccaaCon(Y, lunes16, 'en').length} regions because 15 August falls on a Sunday. Then every town council sets two local holidays, published in the gazette of its region or province. That makes 14 public holidays a year, as article 37.2 of the Workers' Statute provides. The tool shows your town's 14, how many land on a weekend and how many working days each month has.`,
    faqs: [
      { q: 'How many public holidays does Spain have in 2027?', a: `Every employee gets 14 public holidays in 2027: 12 set for their region, ${com.length} of which apply nationwide, and 2 local ones for their town. Some fall on a Saturday, such as 1 May and 25 December, and are not made up: the rules only move Sunday holidays to Monday, and each region decides that when it picks its days.` },
      { q: 'Which 2027 national holidays fall on a weekend?', a: `${lista(finde.map((f) => `${f.en} (${K.fSemana(f.fecha, 'en')} ${K.fDia(f.fecha, 'en')})`), 'en')}. 15 August is a Sunday, so ${ccaaCon(Y, lunes16, 'en').length} regions give Monday 16 off. Others used that slot for a regional day of their own, such as Extremadura, which moves it to 11 October.` },
      { q: 'Is 19 March 2027 a holiday in Spain?', a: `Only in ${lista(ccaaCon(Y, sanJose, 'en'), 'en')}, where Saint Joseph's Day falls on a Friday and makes a long weekend. Elsewhere it is a normal working day, unless your town council chose it as one of its two local holidays: the search tool on this page shows that for every listed town.` },
      { q: 'When are the 2027 local holidays published?', a: `Each region's labour authority approves them on the town councils' proposal, usually between September and December of the year before. As of ${K.fFecha(K.LECTURA, 'en')} they have been read in the gazette for ${pub.length} of the 19 regions and autonomous cities; elsewhere the tool shows "not yet out" until they appear.` },
    ],
    body: (h) => `<h2>The ${com.length} holidays shared by all of Spain in 2027</h2>
<p>The ${h.src('boe-2027', 'Directorate-General for Labour resolution')} lists, as every year, the holidays the regions reported before 30 September. These ${com.length} are kept everywhere, without exception:</p>
${h.table(['Date', 'Day', 'Holiday'], com.map((f) => [h.dm(f.fecha), K.fSemana(f.fecha, 'en'), f.en]), undefined, ['l', 'l', 'l'])}
<p>Of these, ${finde.length} fall on a Saturday or Sunday: ${lista(finde.map((f) => `${f.en} (${K.fSemana(f.fecha, 'en')})`), 'en')}. A Saturday holiday is lost for anyone working Monday to Friday; ${h.src('rd2001', 'article 45 of Royal Decree 2001/1983')} only moves Sunday holidays to the Monday, and lets each region choose between doing so and adding a day of its own.</p>
<h2>What changes from one region to the next</h2>
<p>The three days that vary most in 2027 are Maundy Thursday, ${h.dm(m.jueves)}, a holiday everywhere except ${lista(ccaaSin(Y, m.jueves, 'en'), 'en')}; Easter Monday, ${h.dm(m.lunes)}, given only in ${lista(ccaaCon(Y, m.lunes, 'en'), 'en')}; and Monday 16 August, replacing the 15th in ${lista(ccaaCon(Y, lunes16, 'en'), 'en')}. Saint Joseph's Day, 19 March, stays in ${ccaaCon(Y, sanJose, 'en').length} regions.</p>
${h.table(['Region', 'Own holidays in 2027'], K.COMUNIDADES.map((c) => [c.en, propias(Y, c.id).map((f) => `${f.en} (${h.dm(f.fecha)})`).join('; ')]), undefined, ['l', 'l'])}
${h.mini('nacionales', { p: ['ccaa'], d: { year: '2027', ccaa: 'cataluna' }, t: 'The 12 holidays of a region in 2027', c: 'Countdown to the next holiday' })}
<h2>Long weekends in 2027</h2>
<p>With 1 May and Christmas Day on a Saturday, 2027 is not generous, but it has three long breaks across the country. Easter, from ${h.dm(m.jueves)} to ${h.dm(m.lunes)}, gives four or five days depending on the region. 12 October is a Tuesday: take Monday 11 off and you get four days. And December puts Monday 6, Constitution Day, next to Wednesday 8: a single day of leave on Tuesday 7 opens five days in a row. The ${h.a('puentes-2027', '2027 long weekends')} page works out the best use of your leave with your town's holidays.</p>
${h.mini('puentes', { p: ['dias'], d: { ccaa: 'madrid', year: '2027', dias: 4 }, t: 'How many days off you get with 4 days of leave' })}
<h2>Your town's two holidays</h2>
<p>${h.src('rd2001', 'Article 46 of Royal Decree 2001/1983')} gives each town up to two local holidays a year: the council proposes them, the regional labour department approves them and they are published in the regional or provincial gazette. This site reads them in that gazette for ${K.MUNICIPIOS.length} towns, the provincial capitals and the largest municipalities, and cites the issue and date each time. For 2027 they are already out in ${pub.length} regions (${lista(pub.map((e) => e.c.en), 'en')}); the ${h.a('fiestas-locales', 'local holidays')} page tracks where each region stands.</p>
<h2>How to read the result</h2>
<p>The tool counts as working days the Mondays to Fridays that are not holidays in your town. If you work Saturdays, shifts or in a sector with its own calendar, your collective agreement or your employer's calendar, which must be displayed at the workplace, may differ from these figures. And if you only pick the region, the result leaves out your two local holidays: you see 12 holidays instead of 14.</p>`,
  },
});
