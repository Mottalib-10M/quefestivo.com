import { defineGuide } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';
import { lista, ccaaCon } from './_util';

/* Puentes de 2027 con las fiestas del BOE por comunidad (engine/puentes.ts). */
const Y = 2027;
const fest = (c: string) => new Set(K.fiestasCcaa(Y, c).map((f) => f.fecha));
const rango = (a: string, b: string, l: 'es' | 'en') => l === 'es' ? `del ${K.fCorta(a, l)} al ${K.fCorta(b, l)}` : `${K.fCorta(a, l)} to ${K.fCorta(b, l)}`;
const mejores = K.COMUNIDADES.map((c) => ({ c, p: K.puentesDelAnio(`${Y}-01-01`, `${Y}-12-31`, fest(c.id)) }));
const plan = (c: string, d: number) => K.optimizar(`${Y}-01-01`, `${Y}-12-31`, fest(c), d, 5, 4);
const mad5 = plan('madrid', 5), mad10 = plan('madrid', 10);
const dic = K.huecos(`${Y}-12-01`, `${Y}-12-31`, fest('madrid'), 1).find((x) => x.desde === '2027-12-07')!;
const oct = K.huecos(`${Y}-10-01`, `${Y}-10-31`, fest('madrid'), 1).find((x) => x.desde === '2027-10-11')!;
const ene = K.huecos(`${Y}-01-01`, `${Y}-01-31`, fest('madrid'), 2).filter((x) => x.libreHasta >= '2027-01-06' && x.libreDesde <= '2027-01-06');

export default defineGuide({
  id: 'puentes-2027', group: 'calendario', order: 6,
  tool: 'puentes', toolArg: { ccaa: 'madrid', muni: '28079', year: '2027', dias: 6 },
  related: ['calendario-laboral-2027', 'puentes-2026', 'dias-laborables', 'semana-santa', 'cl-valenciana'],
  sources: ['boe-2027', 'et'],
  es: {
    slug: 'puentes-2027',
    nav: 'Puentes 2027', card: 'Dónde poner tus días de vacaciones para sacar más días libres seguidos',
    title: 'Puentes 2027: dónde pedir vacaciones para librar más días',
    description: 'Puentes 2027 de tu comunidad y municipio: la calculadora reparte tus días de vacaciones donde dan más días libres seguidos. Diciembre: 1 día pedido, 5 libres.',
    h1: 'Puentes 2027: la calculadora de vacaciones',
    intro: 'Elige tu municipio y cuántos días de vacaciones quieres usar: la calculadora busca los huecos entre festivos y te dice qué días pedir para librar más.',
    resume: `El mejor puente de 2027 está en diciembre: el lunes 6, Día de la Constitución, y el miércoles 8, Inmaculada Concepción, dejan en medio el martes 7. Pidiendo ese único día libras ${dic.libres} seguidos, ${rango(dic.libreDesde, dic.libreHasta, 'es')}, en toda España. El segundo es el de octubre: el 12 cae en martes y, pidiendo el lunes 11, tienes ${oct.libres} días. Semana Santa, del ${K.fDia(K.movibles(Y).jueves, 'es')} al ${K.fDia(K.movibles(Y).lunes, 'es')}, ya da cuatro o cinco días sin pedir nada, según la comunidad, y se alarga a nueve pidiendo los tres o cuatro días de la semana anterior. En cambio, el 1 de mayo y la Navidad caen en sábado y no dejan puente. La calculadora junta tus fiestas, las de tu comunidad y las dos de tu municipio, y reparte el número de días de vacaciones que le digas donde rinden más. Con 5 días en Madrid, por ejemplo, se sacan ${mad5.libres} días libres en ${mad5.elegidos.length} escapadas.`,
    faqs: [
      { q: '¿Cuál es el mejor puente de 2027?', a: `El de la Constitución: el lunes 6 y el miércoles 8 de diciembre son festivos en toda España, así que pidiendo el martes 7 libras ${dic.libres} días, ${rango(dic.libreDesde, dic.libreHasta, 'es')}. Rinde cinco días libres por cada día de vacaciones, el máximo posible con un solo día. Si tu municipio tiene una fiesta local cerca, puede haber otro igual de bueno.` },
      { q: '¿Hay puente en octubre de 2027?', a: `Sí. El 12 de octubre, Fiesta Nacional, cae en martes. Pidiendo el lunes 11 encadenas ${oct.libres} días, ${rango(oct.libreDesde, oct.libreHasta, 'es')}. En Extremadura, además, el lunes 11 es festivo autonómico en lugar del 15 de agosto, así que allí el puente sale sin pedir nada. En la Comunitat Valenciana el 9 de octubre cae en sábado.` },
      { q: '¿Cuántos días de vacaciones necesito para Semana Santa de 2027?', a: `Para librar nueve días seguidos, del sábado ${K.fDia(K.addDays(K.movibles(Y).jueves, -5), 'es')} al ${K.fDia(K.movibles(Y).pascua, 'es')}, necesitas los días laborables de esa semana: tres (lunes a miércoles) donde el Jueves Santo es festivo, o cuatro en Cataluña y la Comunitat Valenciana. Donde el Lunes de Pascua también es festivo, la escapada llega a diez días.` },
    ],
    body: (h) => `<h2>Los puentes de 2027 en toda España</h2>
<p>Tres fechas valen para todos, porque dependen de fiestas comunes de la ${h.src('boe-2027', 'resolución del BOE')}. En enero, el día de Reyes cae en miércoles: ${ene.length ? `pidiendo ${ene[0].pedir} días (${rango(ene[0].desde, ene[0].hasta, 'es')}) libras ${ene[0].libres}` : 'no hay hueco corto'}. En octubre, el lunes 11 une el fin de semana con el martes 12. En diciembre, el martes 7 une el lunes 6 con el miércoles 8. El 1 de noviembre cae en lunes y da un fin de semana largo sin pedir nada.</p>
<h2>Los puentes de cada comunidad</h2>
<p>Las fiestas propias cambian el mapa. Esta tabla da, para cada comunidad y sin las fiestas locales, el puente de uno o dos días que más rinde en 2027 y cuántos puentes de ese tipo tiene el año.</p>
${h.table(['Comunidad', 'Mejor puente', 'Libras', 'Puentes'], mejores.map(({ c, p }) => [c.es, p[0] ? `pide ${p[0].pedir === 1 ? K.fCorta(p[0].desde, 'es') : rango(p[0].desde, p[0].hasta, 'es')}` : 'ninguno', p[0] ? `${p[0].libres} días` : '', p.length]), undefined, ['l', 'l', 'r', 'r'])}
<p>San José cae en viernes en ${lista(ccaaCon(Y, '2027-03-19', 'es'), 'es')}: allí el 19 de marzo da un fin de semana de tres días sin pedir nada, y la semana siguiente llega la Semana Santa. En ${lista(ccaaCon(Y, '2027-08-16', 'es'), 'es')}, el lunes 16 de agosto hace lo mismo en pleno verano.</p>
${h.mini('puentes', { p: ['ccaa', 'dias'], d: { year: '2027', dias: 3, ccaa: 'galicia' }, t: 'Tus mejores puentes con 3 días de vacaciones' })}
<h2>Repartir más días: el ejemplo de Madrid</h2>
<p>Con 10 días de vacaciones, la calculadora propone en Madrid capital ${mad10.elegidos.length} escapadas que suman ${mad10.libres} días libres: ${lista(mad10.elegidos.map((x) => `${rango(x.libreDesde, x.libreHasta, 'es')} (${x.pedir} ${x.pedir === 1 ? 'día pedido' : 'días pedidos'})`), 'es')}. Busca huecos de hasta cinco días laborables entre dos tramos libres y elige la combinación que da más días seguidos, sin solapar dos escapadas y sin pasar del número de días que le das. Si prefieres escapadas largas, sube la «escapada mínima» en «Más datos».</p>
<h2>Antes de pedir los días</h2>
<p>Las vacaciones se fijan de común acuerdo con la empresa, según el ${h.src('et', 'artículo 38 del Estatuto de los Trabajadores')}, y el calendario de vacaciones debe conocerse con al menos dos meses de antelación. Los puentes son los primeros días que se piden: si quieres el 7 de diciembre, pídelo pronto. La calculadora no conoce tu convenio, que puede dar días de libre disposición o fijar cierres en Navidad o en agosto.</p>`,
  },
  en: {
    slug: 'spain-long-weekends-2027',
    nav: 'Long weekends 2027', card: 'Where to place your leave days to get the most days off in a row',
    title: 'Long weekends in Spain 2027: when to book your leave',
    description: 'Long weekends in Spain 2027 for your region and town: the planner puts your leave where it gives the most days off in a row. December: 1 day of leave, 5 off.',
    h1: 'Spain long weekends 2027: the leave planner',
    intro: 'Pick your town and how many leave days you want to use: the planner finds the gaps between holidays and tells you which days to book for the most time off.',
    resume: `The best long weekend of 2027 comes in December: Monday 6, Constitution Day, and Wednesday 8, the Immaculate Conception, leave Tuesday 7 in between. Book that one day and you are off for ${dic.libres} days in a row, ${rango(dic.libreDesde, dic.libreHasta, 'en')}, anywhere in Spain. The second is in October: the 12th is a Tuesday and, by booking Monday 11, you get ${oct.libres} days. Easter, from ${K.fDia(K.movibles(Y).jueves, 'en')} to ${K.fDia(K.movibles(Y).lunes, 'en')}, already gives four or five days without booking anything, depending on the region, and stretches to nine by booking the three or four days before. On the other hand, 1 May and Christmas Day fall on a Saturday and leave no bridge. The planner combines your region's holidays and your town's two, and places however many leave days you give it where they go furthest. With 5 days in Madrid, for example, you get ${mad5.libres} days off in ${mad5.elegidos.length} breaks.`,
    faqs: [
      { q: 'What is the best long weekend in Spain in 2027?', a: `The Constitution one: Monday 6 and Wednesday 8 December are holidays all over Spain, so booking Tuesday 7 gives you ${dic.libres} days off, ${rango(dic.libreDesde, dic.libreHasta, 'en')}. That is five days off per day of leave, the most a single day can give. If your town has a local holiday nearby, there may be another just as good.` },
      { q: 'Is there a long weekend in October 2027 in Spain?', a: `Yes. 12 October, the National Day, is a Tuesday. Book Monday 11 and you link ${oct.libres} days, ${rango(oct.libreDesde, oct.libreHasta, 'en')}. In Extremadura Monday 11 is also a regional holiday in place of 15 August, so there the bridge comes free. In the Valencian Community 9 October falls on a Saturday.` },
      { q: 'How much leave do I need for Easter 2027 in Spain?', a: `To be off nine days in a row, from Saturday ${K.fDia(K.addDays(K.movibles(Y).jueves, -5), 'en')} to ${K.fDia(K.movibles(Y).pascua, 'en')}, you need the working days of that week: three (Monday to Wednesday) where Maundy Thursday is a holiday, or four in Catalonia and Valencia. Where Easter Monday is also a holiday, the break runs to ten days.` },
    ],
    body: (h) => `<h2>Long weekends across Spain in 2027</h2>
<p>Three dates work for everyone, because they hinge on nationwide holidays in the ${h.src('boe-2027', 'BOE resolution')}. In January, Epiphany falls on a Wednesday: ${ene.length ? `booking ${ene[0].pedir} days (${rango(ene[0].desde, ene[0].hasta, 'en')}) gives ${ene[0].libres} off` : 'there is no short gap'}. In October, Monday 11 links the weekend with Tuesday 12. In December, Tuesday 7 links Monday 6 with Wednesday 8. 1 November is a Monday and gives a long weekend without booking anything.</p>
<h2>Each region's long weekends</h2>
<p>Regional holidays change the map. This table gives, for each region and without local holidays, the one or two-day bridge that goes furthest in 2027 and how many such bridges the year has.</p>
${h.table(['Region', 'Best bridge', 'Days off', 'Bridges'], mejores.map(({ c, p }) => [c.en, p[0] ? `book ${p[0].pedir === 1 ? K.fCorta(p[0].desde, 'en') : rango(p[0].desde, p[0].hasta, 'en')}` : 'none', p[0] ? `${p[0].libres} days` : '', p.length]), undefined, ['l', 'l', 'r', 'r'])}
<p>Saint Joseph's Day falls on a Friday in ${lista(ccaaCon(Y, '2027-03-19', 'en'), 'en')}: there 19 March gives a three-day weekend for free, and Easter comes the week after. In ${lista(ccaaCon(Y, '2027-08-16', 'en'), 'en')}, Monday 16 August does the same in the middle of summer.</p>
${h.mini('puentes', { p: ['ccaa', 'dias'], d: { year: '2027', dias: 3, ccaa: 'galicia' }, t: 'Your best long weekends with 3 days of leave' })}
<h2>Spreading more days: the Madrid example</h2>
<p>With 10 days of leave, the planner suggests ${mad10.elegidos.length} breaks in Madrid city adding up to ${mad10.libres} days off: ${lista(mad10.elegidos.map((x) => `${rango(x.libreDesde, x.libreHasta, 'en')} (${x.pedir} ${x.pedir === 1 ? 'day' : 'days'} of leave)`), 'en')}. It looks for gaps of up to five working days between two runs of days off and picks the combination giving the most consecutive days, with no two breaks overlapping and without going over the days you give it. If you prefer longer breaks, raise the "shortest break" under "More details".</p>
<h2>Before you book</h2>
<p>Leave is agreed with your employer, under ${h.src('et', 'article 38 of the Workers\' Statute')}, and the leave calendar must be known at least two months ahead. Bridge days are the first to go: if you want 7 December, ask early. The planner does not know your collective agreement, which may give personal days or set closures at Christmas or in August.</p>`,
  },
});
