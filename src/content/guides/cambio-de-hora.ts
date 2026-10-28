import { defineGuide } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

/* Hora de verano: Directiva 2000/84/CE, RD 236/2002; calendarios: Orden PCM/186/2022 (2022-2026) y
   Comunicación de la Comisión C/2026/1660 (2027-2031), comprobados en tests/fechas.test.ts. */
const c26 = K.cambioHora(2026), c27 = K.cambioHora(2027), c28 = K.cambioHora(2028);
const filas = (l: 'es' | 'en') => Array.from({ length: 6 }, (_, i) => 2026 + i).map((y) => { const c = K.cambioHora(y); return [String(y), `${K.fSemana(c.verano, l)} ${K.fDia(c.verano, l)}`, `${K.fSemana(c.invierno, l)} ${K.fDia(c.invierno, l)}`, K.baseCambio(y, l)]; });
const veranoDias = K.diffDays(c27.verano, c27.invierno);

export default defineGuide({
  id: 'cambio-de-hora', group: 'fechas', order: 11,
  tool: 'cuenta', toolArg: { ev: 'cambio', ccaa: 'madrid' },
  related: ['festivos-nacionales', 'semana-santa', 'calendario-2027', 'cl-canarias'],
  sources: ['rd236', 'dir2000', 'pcm186', 'c2026'],
  es: {
    slug: 'cambio-de-hora',
    nav: 'Cambio de hora 2027', card: 'Cuánto falta para el próximo cambio de hora y las fechas hasta 2031',
    title: 'Cambio de hora 2027: 28 de marzo y 31 de octubre, reloj',
    description: 'Cambio de hora 2027 en España: el 28 de marzo se adelanta el reloj y el 31 de octubre se atrasa. Cuenta atrás en directo, Canarias y fechas oficiales a 2031.',
    h1: 'Cambio de hora: cuánto falta y fechas de 2027',
    intro: `Próximos cambios: el ${K.fSemana(c27.verano, 'es')} ${K.fFecha(c27.verano, 'es')} se adelanta el reloj y el ${K.fSemana(c27.invierno, 'es')} ${K.fFecha(c27.invierno, 'es')} se atrasa. El contador va en tu hora local.`,
    resume: `En España la hora cambia dos veces al año, el último domingo de marzo y el último domingo de octubre, a la 01:00 en tiempo universal, a la vez que en toda la Unión Europea. En la península, Baleares, Ceuta y Melilla eso significa que en marzo, a las 2:00, el reloj pasa a las 3:00 y dormimos una hora menos, y en octubre, a las 3:00, vuelve a las 2:00. En Canarias ocurre una hora antes en su reloj: de la 1:00 a las 2:00 en marzo y de las 2:00 a la 1:00 en octubre. En 2027 los cambios son el ${K.fFecha(c27.verano, 'es')} y el ${K.fFecha(c27.invierno, 'es')}, con ${veranoDias} días de horario de verano. La regla está en la Directiva 2000/84/CE y en el Real Decreto 236/2002, y las fechas concretas las publica la Comisión Europea cada cinco años: la Orden PCM/186/2022 recogió las de 2022 a 2026, y la comunicación C/2026/1660, del 18 de marzo de 2026, fija las de 2027 a 2031. El contador de arriba cuenta hasta el próximo cambio en tu hora local, sin enviar nada.`,
    faqs: [
      { q: '¿Cuándo se cambia la hora en marzo de 2027?', a: `El domingo ${K.fDia(c27.verano, 'es')}. A las 2:00 de la madrugada serán las 3:00 en la península, Baleares, Ceuta y Melilla, y a la 1:00 serán las 2:00 en Canarias. Esa noche se duerme una hora menos. Los teléfonos y ordenadores conectados cambian solos; los relojes de horno, coche o pared hay que adelantarlos a mano.` },
      { q: '¿Cuándo se cambia la hora en octubre de 2027?', a: `El domingo ${K.fDia(c27.invierno, 'es')}, último domingo del mes. A las 3:00 serán otra vez las 2:00 en la península, y a las 2:00 será la 1:00 en Canarias. Se gana una hora de sueño. En 2028 el cambio de octubre será el ${K.fDia(c28.invierno, 'es')} y el de marzo el ${K.fDia(c28.verano, 'es')}.` },
      { q: '¿Se va a suprimir el cambio de hora?', a: 'La Comisión Europea propuso en 2018 acabar con los cambios estacionales y el Parlamento Europeo lo apoyó en 2019, pero los gobiernos de la Unión no han llegado a un acuerdo en el Consejo. Mientras tanto sigue vigente la Directiva 2000/84/CE, y la Comisión ya ha publicado el calendario de cambios hasta 2031.' },
      { q: '¿Por qué Canarias tiene una hora menos?', a: 'Porque está mucho más al oeste: su huso es el de Greenwich, el de Portugal y el Reino Unido, mientras que la península usa desde 1940 la hora de Europa central. Canarias cambia la hora el mismo instante que el resto de la Unión, pero su reloj marca una hora menos, así que el cambio ocurre a la 1:00 y a las 2:00 locales.' },
    ],
    body: (h) => `<h2>Las fechas, de 2026 a 2031</h2>
<p>La ${h.src('dir2000', 'Directiva 2000/84/CE')} fija la regla: el horario de verano empieza a la 01:00 UTC del último domingo de marzo y termina a la 01:00 UTC del último domingo de octubre. El ${h.src('rd236', 'Real Decreto 236/2002')} la incorpora en España. Cada cinco años la Comisión publica el calendario concreto: el de 2022 a 2026 lo recogió en España la ${h.src('pcm186', 'Orden PCM/186/2022')}, y el de 2027 a 2031 está en la ${h.src('c2026', 'comunicación C/2026/1660')}.</p>
${h.table(['Año', 'Se adelanta (verano)', 'Se atrasa (invierno)', 'Fuente'], filas('es'), undefined, ['l', 'l', 'l', 'l'])}
<p>Los cambios de 2026 ya pasaron: el ${h.dm(c26.verano)} y el ${h.dm(c26.invierno)}. Mientras el BOE no publique una orden para 2027 a 2031, la fuente de esas fechas es la comunicación de la Comisión, que aplica la misma regla de la directiva.</p>
${h.mini('cambio', { p: ['year', 'zona'], d: { year: 2028 }, t: 'Cambio de hora de cualquier año' })}
<h2>Qué pasa con los relojes y los horarios</h2>
<p>Los teléfonos, ordenadores y relojes conectados cambian solos, porque llevan la regla grabada. Los turnos de noche se ven afectados: quien trabaja la noche de marzo hace una hora menos y la de octubre una hora más, y cómo se pagan lo dice el convenio. Los trenes y autobuses nocturnos ajustan sus horarios; los vuelos se programan en hora local de cada aeropuerto, así que conviene revisar la hora de salida si viajas ese fin de semana.</p>
<h2>Canarias, a la misma hora universal</h2>
<p>El cambio ocurre en el mismo instante en toda la Unión Europea. Como Canarias vive una hora por detrás de la península, allí el reloj salta de la 1:00 a las 2:00 en marzo y de las 2:00 a la 1:00 en octubre. Si estás en Canarias, el contador de arriba ya muestra la hora del cambio en tu reloj, porque usa la zona horaria de tu dispositivo.</p>
<h2>El debate sobre suprimirlo</h2>
<p>En 2018 la Comisión propuso acabar con los cambios estacionales tras una consulta pública con 4,6 millones de respuestas, la mayoría a favor. El Parlamento Europeo apoyó la propuesta en 2019, pero el Consejo, donde deciden los gobiernos, no ha llegado a una posición común: cada país tendría que elegir entre horario de verano o de invierno permanente, y temen un mosaico de horas distintas entre vecinos. Hasta que haya acuerdo, se sigue cambiando la hora, y las fechas hasta 2031 ya están publicadas.</p>`,
  },
  en: {
    slug: 'clock-change-spain',
    nav: 'Clock change 2027', card: 'How long until the next clock change in Spain and the dates to 2031',
    title: 'Clock change in Spain 2027: 28 March and 31 October',
    description: 'Clock change in Spain 2027: clocks go forward on 28 March and back on 31 October. Live countdown in your time zone, the Canary Islands and dates up to 2031.',
    h1: 'Clock change in Spain: countdown and 2027 dates',
    intro: `Next changes: on ${K.fSemana(c27.verano, 'en')} ${K.fFecha(c27.verano, 'en')} clocks go forward and on ${K.fSemana(c27.invierno, 'en')} ${K.fFecha(c27.invierno, 'en')} they go back. The counter runs in your local time.`,
    resume: `In Spain the clocks change twice a year, on the last Sunday of March and the last Sunday of October, at 01:00 universal time, at the same moment as the whole European Union. On the mainland, the Balearics, Ceuta and Melilla that means that in March, at 2:00, clocks jump to 3:00 and you lose an hour of sleep, and in October, at 3:00, they go back to 2:00. In the Canary Islands it happens an hour earlier on the local clock: 1:00 to 2:00 in March and 2:00 to 1:00 in October. In 2027 the changes are on ${K.fFecha(c27.verano, 'en')} and ${K.fFecha(c27.invierno, 'en')}, with ${veranoDias} days of summer time. The rule is in Directive 2000/84/EC and Royal Decree 236/2002, and the exact dates are published by the European Commission every five years: Order PCM/186/2022 listed those for 2022 to 2026, and Communication C/2026/1660 of 18 March 2026 sets those for 2027 to 2031. The counter above counts down to the next change in your local time, sending nothing anywhere.`,
    faqs: [
      { q: 'When do the clocks go forward in Spain in March 2027?', a: `On Sunday ${K.fDia(c27.verano, 'en')}. At 2:00 in the morning it becomes 3:00 on the mainland, the Balearics, Ceuta and Melilla, and 1:00 becomes 2:00 in the Canary Islands. You get an hour less sleep that night. Connected phones and computers change by themselves; oven, car and wall clocks have to be moved forward by hand.` },
      { q: 'When do the clocks go back in Spain in October 2027?', a: `On Sunday ${K.fDia(c27.invierno, 'en')}, the last Sunday of the month. At 3:00 it becomes 2:00 again on the mainland, and 2:00 becomes 1:00 in the Canaries. You gain an hour of sleep. In 2028 the October change falls on ${K.fDia(c28.invierno, 'en')} and the March one on ${K.fDia(c28.verano, 'en')}.` },
      { q: 'Is Spain going to scrap the clock change?', a: 'The European Commission proposed ending seasonal changes in 2018 and the European Parliament backed it in 2019, but EU governments have not reached agreement in the Council. Meanwhile Directive 2000/84/EC remains in force, and the Commission has already published the calendar of changes up to 2031.' },
      { q: 'Why are the Canary Islands an hour behind?', a: 'Because they lie much further west: their time zone is Greenwich time, like Portugal and the UK, while mainland Spain has used Central European Time since 1940. The Canaries change at the same instant as the rest of the EU, but their clocks show an hour less, so the change happens at 1:00 and 2:00 local time.' },
    ],
    body: (h) => `<h2>The dates, 2026 to 2031</h2>
<p>${h.src('dir2000', 'Directive 2000/84/EC')} sets the rule: summer time starts at 01:00 UTC on the last Sunday of March and ends at 01:00 UTC on the last Sunday of October. ${h.src('rd236', 'Royal Decree 236/2002')} brings it into Spanish law. Every five years the Commission publishes the exact calendar: the 2022 to 2026 one was listed in Spain by ${h.src('pcm186', 'Order PCM/186/2022')}, and the 2027 to 2031 one is in ${h.src('c2026', 'Communication C/2026/1660')}.</p>
${h.table(['Year', 'Forward (summer)', 'Back (winter)', 'Source'], filas('en'), undefined, ['l', 'l', 'l', 'l'])}
<p>The 2026 changes have already happened: ${h.dm(c26.verano)} and ${h.dm(c26.invierno)}. Until the BOE publishes an order for 2027 to 2031, the source for those dates is the Commission's communication, which applies the same rule as the directive.</p>
${h.mini('cambio', { p: ['year', 'zona'], d: { year: 2028 }, t: 'Clock change in any year' })}
<h2>What happens to clocks and timetables</h2>
<p>Phones, computers and connected clocks change by themselves, as they carry the rule built in. Night shifts are affected: anyone working the March night does an hour less and the October night an hour more, and how that is paid is up to the collective agreement. Night trains and buses adjust their timetables; flights are scheduled in each airport's local time, so check your departure time if you travel that weekend.</p>
<h2>The Canaries, at the same universal time</h2>
<p>The change happens at the same instant across the European Union. As the Canaries run an hour behind the mainland, their clocks jump from 1:00 to 2:00 in March and from 2:00 to 1:00 in October. If you are in the Canaries, the counter above already shows the change in your local time, since it uses your device's time zone.</p>
<h2>The debate on scrapping it</h2>
<p>In 2018 the Commission proposed ending seasonal changes after a public consultation with 4.6 million responses, most in favour. The European Parliament backed the proposal in 2019, but the Council, where governments decide, has not reached a common position: each country would have to choose permanent summer or winter time, and they fear a patchwork of different times between neighbours. Until there is agreement, the clocks keep changing, and the dates up to 2031 are already published.</p>`,
  },
});
