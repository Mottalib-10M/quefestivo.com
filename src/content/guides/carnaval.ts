import { defineGuide } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';
import { lista } from './_util';

/* Carnaval: martes 47 días antes del Domingo de Pascua (engine/fechas.ts, probado). Fiestas locales del martes de Carnaval: src/data/municipal. */
const Y = 2027;
const m = K.movibles(Y), m26 = K.movibles(2026), m28 = K.movibles(2028);
const enCarnaval = (y: number) => K.MUNICIPIOS.filter((x) => (K.locales(x.ine, y) ?? []).some((f) => f.fecha === K.movibles(y).carnaval || f.fecha === K.addDays(K.movibles(y).carnaval, -1)));
const c26 = enCarnaval(2026), c27 = enCarnaval(2027);
const prox = Array.from({ length: 5 }, (_, i) => Y + i);

export default defineGuide({
  id: 'carnaval', group: 'fechas', order: 12,
  tool: 'movil', toolArg: { ev: 'carnaval', year: 2027 },
  related: ['semana-santa', 'dia-de-la-madre', 'cl-canarias', 'cl-andalucia', 'fiestas-locales'],
  sources: ['boe-2027', 'rd2001'],
  es: {
    slug: 'carnaval-2027',
    nav: 'Carnaval 2027', card: 'Fecha del Carnaval y del Miércoles de Ceniza, y dónde es fiesta local',
    title: 'Carnaval 2027: martes 9 de febrero y dónde es fiesta local',
    description: 'Carnaval 2027: el martes de Carnaval cae el 9 de febrero y el Miércoles de Ceniza el 10. Cómo se calcula, los próximos años y dónde es fiesta local en 2027.',
    h1: 'Carnaval 2027: fechas',
    intro: `En 2027 el martes de Carnaval es el ${K.fDia(m.carnaval, 'es')} y el Miércoles de Ceniza el ${K.fDia(m.ceniza, 'es')}. Cambia el año o la fecha para ver otras.`,
    resume: `El Carnaval no tiene fecha fija porque depende de la Pascua: el martes de Carnaval es siempre 47 días antes del Domingo de Pascua, y al día siguiente, el Miércoles de Ceniza, empieza la Cuaresma. Como en 2027 la Pascua cae el ${K.fDia(m.pascua, 'es')}, el martes de Carnaval es el ${K.fDia(m.carnaval, 'es')}, una semana antes que en 2026, cuando fue el ${K.fDia(m26.carnaval, 'es')}. En 2028, con la Pascua el ${K.fDia(m28.pascua, 'es')}, será el ${K.fDia(m28.carnaval, 'es')}. El Carnaval no es fiesta laboral en ninguna comunidad: ni el BOE ni los decretos autonómicos lo incluyen. Lo que sí hacen muchos ayuntamientos es elegir el lunes o el martes de Carnaval como una de sus dos fiestas locales, sobre todo en Canarias, Cádiz y algunas ciudades del norte. Las grandes celebraciones, como el Carnaval de Santa Cruz de Tenerife, el de Las Palmas o el de Cádiz, se alargan durante semanas, pero el día festivo, si lo hay, es solo uno. La herramienta calcula la fecha de cualquier año.`,
    faqs: [
      { q: '¿Cuándo es Carnaval en 2027?', a: `El martes de Carnaval es el ${K.fDia(m.carnaval, 'es')} de 2027 y el lunes, el ${K.fDia(K.addDays(m.carnaval, -1), 'es')}. El Miércoles de Ceniza, que cierra el Carnaval y abre la Cuaresma, es el ${K.fDia(m.ceniza, 'es')}. Las fiestas de cada ciudad suelen empezar el fin de semana anterior, y en Canarias y Cádiz duran varias semanas alrededor de esas fechas.` },
      { q: '¿Es festivo el martes de Carnaval?', a: `No en toda una comunidad: ningún decreto autonómico lo incluye en 2026 ni en 2027. Lo es en los municipios que lo eligen como fiesta local. ${c26.length ? `De los municipios de este sitio, en 2026 lo tuvieron ${lista(c26.map((x) => x.nombre), 'es')}.` : 'Ninguno de los municipios de este sitio lo eligió en 2026.'} Para el tuyo, mira el buscador de la portada.` },
      { q: '¿Cómo se calcula la fecha del Carnaval?', a: 'Se cuentan 47 días hacia atrás desde el Domingo de Pascua: los 40 días de Cuaresma, que no cuentan los domingos, más los seis domingos y el propio martes. Como la Pascua cae entre el 22 de marzo y el 25 de abril, el martes de Carnaval cae siempre entre el 3 de febrero y el 9 de marzo.' },
    ],
    body: (h) => `<h2>Las fechas de los próximos años</h2>
${h.table(['Año', 'Lunes de Carnaval', 'Martes de Carnaval', 'Miércoles de Ceniza'], prox.map((y) => { const x = K.movibles(y); return [String(y), h.dm(K.addDays(x.carnaval, -1)), h.dm(x.carnaval), h.dm(x.ceniza)]; }), undefined, ['l', 'l', 'l', 'l'])}
<p>La fecha se mueve con la Pascua, que a su vez sigue la luna. El algoritmo que usa esta web, el de Meeus, da las mismas fechas de Jueves Santo, Viernes Santo y Lunes de Pascua que la ${h.src('boe-2027', 'resolución de fiestas de 2027')}, y de ahí sale el Carnaval contando 47 días hacia atrás.</p>
${h.mini('movil', { p: ['year'], d: { ev: 'ceniza', year: 2028 }, t: 'Miércoles de Ceniza de cualquier año' })}
<h2>Dónde es fiesta local</h2>
<p>El ${h.src('rd2001', 'artículo 46 del Real Decreto 2001/1983')} deja a cada ayuntamiento elegir dos fiestas locales, y muchos de tradición carnavalera eligen el lunes o el martes. ${c26.length ? `En 2026, entre los ${K.MUNICIPIOS.length} municipios que sigue este sitio, tuvieron fiesta local en Carnaval ${lista(c26.map((x) => `${x.nombre} (${K.nombreCcaa(x.ccaa, 'es')})`), 'es')}.` : ''} ${c27.length ? `Para 2027 ya está publicado en ${lista(c27.map((x) => x.nombre), 'es')}.` : 'Para 2027, los boletines que ya hemos leído no recogen todavía ningún martes de Carnaval entre estos municipios; se añadirán cuando salgan los que faltan.'}</p>
<h2>Carnaval y calendario escolar</h2>
<p>Algunas comunidades dan días no lectivos en Carnaval aunque no sean fiestas laborales: los colegios cierran y las oficinas no. Ocurre en varias comunidades con el lunes y el martes, a veces con el viernes anterior. Si tienes hijos en edad escolar, compara el calendario escolar de tu comunidad con el laboral: la página de tu comunidad recoge el escolar cuando está publicado.</p>
<h2>Después del Carnaval</h2>
<p>Con el Miércoles de Ceniza empiezan los 40 días de Cuaresma, que terminan con la ${h.a('semana-santa', 'Semana Santa')}. En 2027 el Domingo de Ramos llega el ${h.dm(m.ramos)}, ${K.diffDays(m.carnaval, m.ramos)} días después del martes de Carnaval.</p>`,
  },
  en: {
    slug: 'carnival-spain-2027',
    nav: 'Carnival 2027', card: 'Carnival and Ash Wednesday dates, and where Carnival is a local holiday',
    title: 'Carnival in Spain 2027: Tuesday 9 February, local holidays',
    description: 'Carnival in Spain 2027: Shrove Tuesday falls on 9 February and Ash Wednesday on the 10th. How the date is set, the next years and where it is a day off.',
    h1: 'Carnival in Spain 2027: dates',
    intro: `In 2027 Shrove Tuesday is ${K.fDia(m.carnaval, 'en')} and Ash Wednesday ${K.fDia(m.ceniza, 'en')}. Change the year or the feast to see other dates.`,
    resume: `Carnival has no fixed date because it hangs on Easter: Shrove Tuesday is always 47 days before Easter Sunday, and the next day, Ash Wednesday, Lent begins. With Easter on ${K.fDia(m.pascua, 'en')} in 2027, Shrove Tuesday is ${K.fDia(m.carnaval, 'en')}, a week earlier than in 2026, when it was ${K.fDia(m26.carnaval, 'en')}. In 2028, with Easter on ${K.fDia(m28.pascua, 'en')}, it will be ${K.fDia(m28.carnaval, 'en')}. Carnival is not a public holiday in any region: neither the BOE nor the regional decrees include it. What many town councils do is pick Carnival Monday or Tuesday as one of their two local holidays, especially in the Canary Islands, Cádiz and some northern towns. The big celebrations, such as Santa Cruz de Tenerife's, Las Palmas' or Cádiz's carnivals, run for weeks, but the day off, if there is one, is a single day. The tool works out the date for any year.`,
    faqs: [
      { q: 'When is Carnival in Spain in 2027?', a: `Shrove Tuesday is ${K.fDia(m.carnaval, 'en')} 2027 and Carnival Monday ${K.fDia(K.addDays(m.carnaval, -1), 'en')}. Ash Wednesday, which closes Carnival and opens Lent, is ${K.fDia(m.ceniza, 'en')}. Each town's festivities usually start the weekend before, and in the Canaries and Cádiz they last several weeks around those dates.` },
      { q: 'Is Shrove Tuesday a public holiday in Spain?', a: `Not for a whole region: no regional decree includes it in 2026 or 2027. It is one in the towns that pick it as a local holiday. ${c26.length ? `Among the towns on this site, ${lista(c26.map((x) => x.nombre), 'en')} had it in 2026.` : 'None of the towns on this site picked it in 2026.'} For yours, check the search on the home page.` },
      { q: 'How is the date of Carnival worked out?', a: 'Count 47 days back from Easter Sunday: the 40 days of Lent, which skip Sundays, plus the six Sundays and the Tuesday itself. As Easter falls between 22 March and 25 April, Shrove Tuesday always lands between 3 February and 9 March, and Ash Wednesday the day after.' },
    ],
    body: (h) => `<h2>The dates for the next years</h2>
${h.table(['Year', 'Carnival Monday', 'Shrove Tuesday', 'Ash Wednesday'], prox.map((y) => { const x = K.movibles(y); return [String(y), h.dm(K.addDays(x.carnaval, -1)), h.dm(x.carnaval), h.dm(x.ceniza)]; }), undefined, ['l', 'l', 'l', 'l'])}
<p>The date moves with Easter, which in turn follows the moon. The algorithm this site uses, Meeus's, gives the same Maundy Thursday, Good Friday and Easter Monday as the ${h.src('boe-2027', '2027 holiday resolution')}, and Carnival follows by counting 47 days back.</p>
${h.mini('movil', { p: ['year'], d: { ev: 'ceniza', year: 2028 }, t: 'Ash Wednesday in any year' })}
<h2>Where it is a local holiday</h2>
<p>${h.src('rd2001', 'Article 46 of Royal Decree 2001/1983')} lets each town council pick two local holidays, and many with a carnival tradition choose the Monday or Tuesday. ${c26.length ? `In 2026, among the ${K.MUNICIPIOS.length} towns this site follows, ${lista(c26.map((x) => `${x.nombre} (${K.nombreCcaa(x.ccaa, 'en')})`), 'en')} had a local holiday at Carnival.` : ''} ${c27.length ? `For 2027 it is already published in ${lista(c27.map((x) => x.nombre), 'en')}.` : 'For 2027, the gazettes read so far do not yet show a Carnival holiday among these towns; they will be added as the missing ones come out.'}</p>
<h2>Carnival and the school calendar</h2>
<p>Some regions give school days off at Carnival even though they are not public holidays: schools close, offices do not. It happens in several regions with the Monday and Tuesday, sometimes with the Friday before. If you have school-age children, compare your region's school calendar with the work calendar: your region's page lists the school calendar once it is published.</p>
<h2>After Carnival</h2>
<p>Ash Wednesday starts the 40 days of Lent, which end with ${h.a('semana-santa', 'Holy Week')}. In 2027 Palm Sunday comes on ${h.dm(m.ramos)}, ${K.diffDays(m.carnaval, m.ramos)} days after Shrove Tuesday.</p>`,
  },
});
