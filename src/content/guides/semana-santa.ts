import { defineGuide } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';
import { lista, ccaaCon, ccaaSin } from './_util';

/* Pascua: algoritmo de Meeus (engine/fechas.ts), comprobado contra el BOE de 2026 y 2027. Festivos por comunidad: festivos.json. */
const Y = 2027;
const m = K.movibles(Y), m26 = K.movibles(2026), m28 = K.movibles(2028);
const si = (y: number, c: string, d: string) => K.fiestasCcaa(y, c).some((f) => f.fecha === d);
const dias = (c: string) => [m.jueves, m.viernes, m.lunes].filter((d) => si(Y, c, d)).length;
const cinco = (l: 'es' | 'en') => K.COMUNIDADES.filter((c) => dias(c.id) === 3).map((c) => c[l]);
const sev = (K.locales('41091', 2026) ?? [])[0];
const temprana = Array.from({ length: 60 }, (_, i) => 2027 + i).filter((y) => K.easter(y) <= `${y}-03-25`);

export default defineGuide({
  id: 'semana-santa', group: 'fechas', order: 10,
  tool: 'semanaSanta', toolArg: { year: 2027, ccaa: 'andalucia' },
  related: ['puentes-2027', 'calendario-laboral-2027', 'carnaval', 'cl-andalucia', 'cl-castilla-y-leon'],
  sources: ['boe-2027', 'boe-2026', 'rd2001'],
  es: {
    slug: 'semana-santa-2027',
    nav: 'Semana Santa 2027', card: 'Fechas de la Semana Santa, qué días son festivos en tu comunidad y los próximos años',
    title: 'Semana Santa 2027: del 21 al 28 de marzo, por comunidad',
    description: 'Semana Santa 2027: Jueves Santo el 25 de marzo, Viernes Santo el 26 y Pascua el 28. Qué días son festivos en tu comunidad y las fechas de los próximos años.',
    h1: 'Semana Santa 2027: fechas y festivos',
    intro: `La Semana Santa de 2027 va del Domingo de Ramos, ${K.fDia(m.ramos, 'es')}, al Domingo de Pascua, ${K.fDia(m.pascua, 'es')}. Elige tu comunidad para ver qué días libras.`,
    resume: `En 2027 la Semana Santa es temprana: el Domingo de Ramos cae el ${K.fDia(m.ramos, 'es')}, el Jueves Santo el ${K.fDia(m.jueves, 'es')}, el Viernes Santo el ${K.fDia(m.viernes, 'es')}, el Domingo de Pascua el ${K.fDia(m.pascua, 'es')} y el Lunes de Pascua el ${K.fDia(m.lunes, 'es')}. Son ocho días antes que en 2026, cuando la Pascua fue el ${K.fDia(m26.pascua, 'es')}. El Viernes Santo es fiesta en toda España; el Jueves Santo lo es en ${ccaaCon(Y, m.jueves, 'es').length} comunidades y ciudades autónomas, todas salvo ${lista(ccaaSin(Y, m.jueves, 'es'), 'es')}; y el Lunes de Pascua solo en ${lista(ccaaCon(Y, m.lunes, 'es'), 'es')}. Así, según dónde vivas, la Semana Santa de 2027 da cuatro días libres seguidos, del jueves al domingo o del viernes al lunes, o cinco en ${lista(cinco('es'), 'es')}, que tienen festivos el jueves y el lunes. La fecha sale de una regla fija: el Domingo de Pascua es el primer domingo después de la primera luna llena eclesiástica de primavera.`,
    faqs: [
      { q: '¿Cuándo es Semana Santa en 2027?', a: `Del domingo ${K.fDia(m.ramos, 'es')}, Domingo de Ramos, al domingo ${K.fDia(m.pascua, 'es')}, Domingo de Pascua. Los días festivos son el Jueves Santo, ${K.fDia(m.jueves, 'es')}, en casi toda España, el Viernes Santo, ${K.fDia(m.viernes, 'es')}, en todas partes, y el Lunes de Pascua, ${K.fDia(m.lunes, 'es')}, en seis comunidades.` },
      { q: '¿Por qué la Semana Santa cambia de fecha cada año?', a: 'Porque depende de la luna. El Concilio de Nicea, en el año 325, la fijó en el domingo siguiente a la primera luna llena de primavera, y la Iglesia calcula esa luna con unas tablas, no con la luna astronómica. Por eso el Domingo de Pascua cae siempre entre el 22 de marzo y el 25 de abril.' },
      { q: '¿Cuándo será Semana Santa en 2028?', a: `En 2028 será tardía: Jueves Santo el ${K.fDia(m28.jueves, 'es')}, Viernes Santo el ${K.fDia(m28.viernes, 'es')} y Domingo de Pascua el ${K.fDia(m28.pascua, 'es')}. Qué días son festivos en cada comunidad lo dirá la resolución del BOE que se publicará en otoño de 2027; el Viernes Santo lo será en toda España, porque no se puede sustituir.` },
      { q: '¿Es festivo el Lunes de Pascua en 2027?', a: `Solo en ${lista(ccaaCon(Y, m.lunes, 'es'), 'es')}. En el resto de España es un día laborable, aunque muchos ayuntamientos de esas comunidades sin Lunes de Pascua eligen otro día de la semana como fiesta local. En 2026 también lo fue en Castilla-La Mancha, que en 2027 lo ha cambiado por otra fiesta.` },
    ],
    body: (h) => `<h2>Qué días libras en cada comunidad</h2>
<p>La ${h.src('boe-2027', 'resolución de fiestas de 2027')} reparte así los días de Semana Santa. El Viernes Santo está en la lista nacional que no se puede sustituir; el Jueves Santo es nacional pero sustituible, según el ${h.src('rd2001', 'artículo 45 del Real Decreto 2001/1983')}; el Lunes de Pascua es una fiesta propia de algunas comunidades.</p>
${h.table(['Comunidad', 'Jueves Santo', 'Viernes Santo', 'Lunes de Pascua', 'Días'], K.COMUNIDADES.map((c) => [c.es, si(Y, c.id, m.jueves) ? 'festivo' : 'laborable', si(Y, c.id, m.viernes) ? 'festivo' : 'laborable', si(Y, c.id, m.lunes) ? 'festivo' : 'laborable', dias(c.id)]), undefined, ['l', 'l', 'l', 'l', 'r'])}
<p>Con el fin de semana, tres festivos dan cinco días seguidos y dos dan cuatro. Para alargarlos, la ${h.a('puentes-2027', 'calculadora de puentes')} dice cuántos días de vacaciones pedir. Algunos municipios ponen una de sus fiestas locales en primavera, cerca de estas fechas: ${sev ? `Sevilla tuvo una el ${h.dm(sev.fecha)} de 2026, en plena Feria de Abril` : 'en Andalucía es frecuente un día de feria'}.</p>
${h.mini('movil', { p: ['year'], d: { ev: 'ramos', year: 2027 }, t: 'Domingo de Ramos en cualquier año' })}
<h2>Cómo se calcula la fecha</h2>
<p>El Domingo de Pascua es el primer domingo después de la luna llena eclesiástica que sigue al 21 de marzo. Desde la reforma gregoriana de 1582, la fecha se calcula con aritmética: el número áureo del año, que sitúa el ciclo lunar de 19 años, y unas correcciones por siglo. Esta web usa el algoritmo publicado por Jean Meeus, el mismo que usan las agendas y los programas de calendario, y lo comprueba contra el BOE: el Jueves Santo, el Viernes Santo, el Lunes de Pascua y el Corpus Christi de 2026 y 2027 coinciden con la resolución de cada año.</p>
<p>La Semana Santa más temprana posible empieza con un Domingo de Pascua el 22 de marzo, y la más tardía con uno el 25 de abril. En los próximos 60 años, la Pascua caerá en marzo y antes del 26 en ${temprana.length} ocasiones${temprana.length ? `, la primera en ${temprana[0]}` : ''}.</p>
<h2>Semana Santa y vacaciones escolares</h2>
<p>Los colegios no siguen exactamente el calendario laboral: cada comunidad fija sus vacaciones de Semana Santa en el calendario escolar, a menudo de viernes a viernes o pegadas al Lunes de Pascua. Antes de reservar, consulta el de tu comunidad; la página de cada comunidad de este sitio recoge las fechas cuando ya están publicadas en su boletín.</p>`,
  },
  en: {
    slug: 'easter-holy-week-spain-2027',
    nav: 'Holy Week 2027', card: 'Holy Week dates, which days are holidays in your region and the years ahead',
    title: 'Holy Week in Spain 2027: 21 to 28 March, holidays by region',
    description: 'Holy Week in Spain 2027: Maundy Thursday on 25 March, Good Friday on the 26th and Easter Sunday on the 28th. Holidays in your region and the next years.',
    h1: 'Holy Week in Spain 2027: dates and holidays',
    intro: `Holy Week 2027 runs from Palm Sunday, ${K.fDia(m.ramos, 'en')}, to Easter Sunday, ${K.fDia(m.pascua, 'en')}. Pick your region to see which days you get off.`,
    resume: `In 2027 Holy Week comes early: Palm Sunday falls on ${K.fDia(m.ramos, 'en')}, Maundy Thursday on ${K.fDia(m.jueves, 'en')}, Good Friday on ${K.fDia(m.viernes, 'en')}, Easter Sunday on ${K.fDia(m.pascua, 'en')} and Easter Monday on ${K.fDia(m.lunes, 'en')}. That is eight days earlier than in 2026, when Easter was on ${K.fDia(m26.pascua, 'en')}. Good Friday is a holiday all over Spain; Maundy Thursday is one in ${ccaaCon(Y, m.jueves, 'en').length} regions and autonomous cities, all but ${lista(ccaaSin(Y, m.jueves, 'en'), 'en')}; and Easter Monday only in ${lista(ccaaCon(Y, m.lunes, 'en'), 'en')}. So, depending on where you live, Holy Week 2027 gives four days off in a row, Thursday to Sunday or Friday to Monday, or five in ${lista(cinco('en'), 'en')}, which have both the Thursday and the Monday. The date follows a fixed rule: Easter Sunday is the first Sunday after the first church full moon of spring.`,
    faqs: [
      { q: 'When is Holy Week in Spain in 2027?', a: `From Sunday ${K.fDia(m.ramos, 'en')}, Palm Sunday, to Sunday ${K.fDia(m.pascua, 'en')}, Easter Sunday. The holidays are Maundy Thursday, ${K.fDia(m.jueves, 'en')}, in nearly all of Spain, Good Friday, ${K.fDia(m.viernes, 'en')}, everywhere, and Easter Monday, ${K.fDia(m.lunes, 'en')}, in six regions, among them Catalonia and the Valencian Community.` },
      { q: 'Why does Easter move every year?', a: 'Because it follows the moon. The Council of Nicaea, in 325, set it on the Sunday after the first full moon of spring, and the Church works out that moon from tables, not from the astronomical moon. That is why Easter Sunday always falls between 22 March and 25 April.' },
      { q: 'When is Holy Week in Spain in 2028?', a: `It will be late in 2028: Maundy Thursday on ${K.fDia(m28.jueves, 'en')}, Good Friday on ${K.fDia(m28.viernes, 'en')} and Easter Sunday on ${K.fDia(m28.pascua, 'en')}. Which days are holidays in each region will be set by the BOE resolution due in autumn 2027; Good Friday will be one everywhere, as it cannot be replaced.` },
      { q: 'Is Easter Monday a holiday in Spain in 2027?', a: `Only in ${lista(ccaaCon(Y, m.lunes, 'en'), 'en')}. Elsewhere in Spain it is a working day, although many towns in regions without Easter Monday pick another day that week as a local holiday. In 2026 it was also a holiday in Castilla-La Mancha, which has swapped it for another day in 2027.` },
    ],
    body: (h) => `<h2>Which days you get off in each region</h2>
<p>The ${h.src('boe-2027', '2027 holiday resolution')} spreads the Holy Week days like this. Good Friday is on the national list and cannot be replaced; Maundy Thursday is national but replaceable, under ${h.src('rd2001', 'article 45 of Royal Decree 2001/1983')}; Easter Monday is a regional holiday in some regions.</p>
${h.table(['Region', 'Maundy Thursday', 'Good Friday', 'Easter Monday', 'Days'], K.COMUNIDADES.map((c) => [c.en, si(Y, c.id, m.jueves) ? 'holiday' : 'working', si(Y, c.id, m.viernes) ? 'holiday' : 'working', si(Y, c.id, m.lunes) ? 'holiday' : 'working', dias(c.id)]), undefined, ['l', 'l', 'l', 'l', 'r'])}
<p>With the weekend, three holidays make five days in a row and two make four. To stretch them, the ${h.a('puentes-2027', 'long-weekend planner')} tells you how many leave days to book. Some towns put one of their local holidays in spring, near these dates: ${sev ? `Seville had one on ${h.dm(sev.fecha)} 2026, during its April Fair` : 'in Andalusia a fair day is common'}.</p>
${h.mini('movil', { p: ['year'], d: { ev: 'ramos', year: 2027 }, t: 'Palm Sunday in any year' })}
<h2>How the date is worked out</h2>
<p>Easter Sunday is the first Sunday after the church full moon that follows 21 March. Since the Gregorian reform of 1582 the date is computed with arithmetic: the year's golden number, which places it in the 19-year lunar cycle, plus a few century corrections. This site uses the algorithm published by Jean Meeus, the one diaries and calendar software use, and checks it against the BOE: Maundy Thursday, Good Friday, Easter Monday and Corpus Christi in 2026 and 2027 all match each year's resolution.</p>
<p>The earliest possible Holy Week has Easter Sunday on 22 March, the latest on 25 April. In the next 60 years, Easter will fall in March before the 26th on ${temprana.length} occasions${temprana.length ? `, first in ${temprana[0]}` : ''}.</p>
<h2>Holy Week and school holidays</h2>
<p>Schools do not follow the work calendar exactly: each region sets its Easter school break in the school calendar, often Friday to Friday or attached to Easter Monday. Before booking, check your region's; this site's page for each region lists the dates once they are published in its gazette.</p>
<p>Shops and public services also follow the regional calendar: on Maundy Thursday most offices are closed in Madrid or Seville but open in Barcelona and Valencia, where the day off comes on Easter Monday instead.</p>`,
  },
});
