/**
 * Herramientas declarativas del sitio. Las fechas salen de festivos.json (BOE), de los boletines autonómicos y
 * provinciales (src/data/municipal) y de las reglas probadas de engine/fechas.ts y engine/puentes.ts.
 * Una spec lista sus campos y una función `run` que da la tarjeta de resultado. Nada sale del navegador.
 */
import type { ToolSpec, V, ToolOut, Opt } from './tool-types';
import { resolve } from './tool-types';
import { formatNumber, type Lang } from './format';
import { movibles, cambioHora, diaMadre, weekday, diffDays, addDays, iso, isWeekend, type ISO } from './engine/fechas';
import { optimizar, puentesDelAnio, laborables } from './engine/puentes';
import { COMUNIDADES, comunidad, municipio, municipiosDe, fuenteLocal, pendiente, fiestasCcaa, comunes, resolucion, tieneAnio, YEARS, ISLA_NOMBRE, type Fiesta } from './datos';
import { fLarga, fFecha, fDia, fCorta, fSemana, Mes, TIPO, nombreFiesta, festivosLugar, resumenMeses } from './cal';

export type Args = Record<string, number | string>;
const T = (l: Lang, es: string, en: string) => (l === 'es' ? es : en);
const num = (v: V, k: string) => Number(v[k]) || 0;
const str = (v: V, k: string) => String(v[k] ?? '');
const N = (x: number, l: Lang, d = 0) => formatNumber(x, d, l);

export const ccaaOpts = (l: Lang): Opt[] => COMUNIDADES.map((c) => ({ value: c.id, label: c[l] })).sort((a, b) => a.label.localeCompare(b.label, 'es'));
const muniOpts = (l: Lang) => (v: V): Opt[] => [
  { value: '', label: T(l, 'Toda la comunidad (sin fiestas locales)', 'Whole region (no local holidays)') },
  ...municipiosDe(str(v, 'ccaa')).map((m) => ({ value: m.ine, label: m.isla && m.nombre !== ISLA_NOMBRE[m.isla] ? `${m.nombre} (${ISLA_NOMBRE[m.isla]})` : m.nombre })),
];
const yearOpts = (): Opt[] => YEARS.map((y) => ({ value: String(y), label: String(y) }));
const lugar = (v: V, l: Lang) => { const m = municipio(str(v, 'muni')); return m ? m.nombre : comunidad(str(v, 'ccaa'))[l]; };
const ccaaDef = (arg?: Args) => String(arg?.ccaa ?? 'madrid');
const lugarInputs = (l: Lang, arg?: Args) => [
  { kind: 'select' as const, id: 'ccaa', label: T(l, 'Comunidad autónoma', 'Region'), def: ccaaDef(arg), options: ccaaOpts(l) },
  { kind: 'select' as const, id: 'muni', label: T(l, 'Municipio', 'Town or city'), def: String(arg?.muni ?? ''), options: muniOpts(l) },
];
const yearInput = (l: Lang, arg?: Args) => ({ kind: 'choice' as const, id: 'year', label: T(l, 'Año', 'Year'), def: String(arg?.year ?? '2027'), options: yearOpts() });

/** Texto de la fuente de las fiestas locales del municipio elegido. */
export function notaLocal(v: V, l: Lang, year: number): string {
  const ine = str(v, 'muni');
  if (!ine) return T(l, `Elige tu municipio para añadir sus dos fiestas locales: sin ellas ves las ${fiestasCcaa(year, str(v, 'ccaa')).length} fiestas comunes a toda la comunidad.`, `Pick your town to add its two local holidays: without it you see the ${fiestasCcaa(year, str(v, 'ccaa')).length} holidays shared by the whole region.`);
  const f = fuenteLocal(ine, year);
  if (!f) return '';
  if (pendiente(f)) return T(l, `Las fiestas locales de ${year} aún no se han publicado en el boletín oficial (comprobado el ${fFecha(f.comprobado, l)}). Se añadirán el día que salgan.`, `The ${year} local holidays have not yet been published in the official gazette (checked on ${fFecha(f.comprobado, l)}). They will be added the day they are.`);
  return T(l, `Fiestas locales: ${f.boletin}${f.numero ? ` ${f.numero}` : ''} del ${fFecha(f.fecha, l)}.`, `Local holidays: ${f.boletin}${f.numero ? ` ${f.numero}` : ''} of ${fFecha(f.fecha, l)}.`);
}

const filaFiesta = (f: Fiesta, l: Lang) => [fFecha(f.fecha, l), fSemana(f.fecha, l), nombreFiesta(f, l), TIPO[f.tipo][l]];

/* ------------------------------------------------------------------ calendario laboral de un lugar */
function municipioSpec(l: Lang, arg?: Args): ToolSpec {
  return {
    inputs: [...lugarInputs(l, arg), yearInput(l, arg)],
    run: (v) => {
      const year = num(v, 'year');
      const { fiestas, localesPublicadas, conMunicipio } = festivosLugar(year, str(v, 'ccaa'), str(v, 'muni'));
      const fest = new Set(fiestas.map((f) => f.fecha));
      const cuenta = (t: Fiesta['tipo'][]) => fiestas.filter((f) => t.includes(f.tipo)).length;
      const lab = laborables(iso(year, 1, 1), iso(year, 12, 31), fest);
      const enFinde = fiestas.filter((f) => isWeekend(f.fecha)).length;
      const meses = resumenMeses(year, fest);
      return {
        label: T(l, `Festivos en ${lugar(v, l)} en ${year}`, `Public holidays in ${lugar(v, l)} in ${year}`),
        value: String(fiestas.length),
        sub: conMunicipio && !localesPublicadas ? T(l, `${fiestas.length} fiestas, a falta de las 2 locales`, `${fiestas.length} holidays, the 2 local ones still to come`) : T(l, `${N(lab, l)} días laborables de lunes a viernes`, `${N(lab, l)} working days, Monday to Friday`),
        rows: [
          [T(l, 'Nacionales', 'National'), String(cuenta(['nacional'])), cuenta(['nacional'])],
          [T(l, 'De la comunidad', 'Regional'), String(cuenta(['autonomica', 'insular'])), cuenta(['autonomica', 'insular'])],
          [T(l, 'Locales', 'Local'), conMunicipio ? (localesPublicadas ? String(cuenta(['local'])) : T(l, 'sin publicar', 'not yet out')) : T(l, 'elige municipio', 'pick a town'), cuenta(['local'])],
          [T(l, 'Caen en sábado o domingo', 'Fall on a weekend'), String(enFinde)],
          [T(l, 'Días laborables (L a V)', 'Working days (Mon to Fri)'), N(lab, l)],
        ],
        table: { caption: T(l, `Calendario laboral ${year} de ${lugar(v, l)}`, `${lugar(v, l)} ${year} holiday calendar`), headers: [T(l, 'Fecha', 'Date'), T(l, 'Día', 'Day'), T(l, 'Fiesta', 'Holiday'), T(l, 'Ámbito', 'Scope')], rows: fiestas.map((f) => filaFiesta(f, l)) },
        tables: [{ caption: T(l, 'Días laborables por mes', 'Working days by month'), headers: [T(l, 'Mes', 'Month'), T(l, 'Laborables', 'Working days'), T(l, 'Festivos entre semana', 'Weekday holidays')], rows: meses.map((m) => [Mes(m.mes, l), N(m.laborables, l), N(m.festivosLaborables, l)]), align: ['l', 'r', 'r'] }],
        note: notaLocal(v, l, year),
      };
    },
  };
}

/* ------------------------------------------------------------------ días laborables y horas */
function laborablesSpec(l: Lang, arg?: Args): ToolSpec {
  return {
    inputs: [...lugarInputs(l, arg), yearInput(l, arg),
      { id: 'horas', label: T(l, 'Horas por día laborable', 'Hours per working day'), def: Number(arg?.horas ?? 8), unit: 'h', max: 12, decimals: 1, adv: true },
      { kind: 'select', id: 'mes', label: T(l, 'Periodo', 'Period'), def: String(arg?.mes ?? '0'), options: [{ value: '0', label: T(l, 'Todo el año', 'Whole year') }, ...Array.from({ length: 12 }, (_, i) => ({ value: String(i + 1), label: Mes(i + 1, l) }))], adv: true }],
    run: (v) => {
      const year = num(v, 'year'), mes = num(v, 'mes'), h = num(v, 'horas');
      const { fiestas, conMunicipio, localesPublicadas } = festivosLugar(year, str(v, 'ccaa'), str(v, 'muni'));
      const fest = new Set(fiestas.map((f) => f.fecha));
      const meses = resumenMeses(year, fest);
      const sel = mes ? meses.filter((m) => m.mes === mes) : meses;
      const lab = sel.reduce((s, m) => s + m.laborables, 0), dias = sel.reduce((s, m) => s + m.dias, 0);
      const findes = sel.reduce((s, m) => s + m.findes, 0), fl = sel.reduce((s, m) => s + m.festivosLaborables, 0);
      const periodo = mes ? `${Mes(mes, l).toLowerCase()} ${year}` : String(year);
      return {
        label: T(l, `Días laborables en ${lugar(v, l)}, ${periodo}`, `Working days in ${lugar(v, l)}, ${periodo}`),
        value: N(lab, l),
        sub: T(l, `${N(lab * h, l, h % 1 ? 1 : 0)} horas a ${N(h, l, h % 1 ? 1 : 0)} horas por día`, `${N(lab * h, l, h % 1 ? 1 : 0)} hours at ${N(h, l, h % 1 ? 1 : 0)} hours a day`),
        rows: [
          [T(l, 'Días naturales', 'Calendar days'), N(dias, l)],
          [T(l, 'Sábados y domingos', 'Saturdays and Sundays'), N(findes, l)],
          [T(l, 'Festivos de lunes a viernes', 'Weekday holidays'), N(fl, l)],
          [T(l, 'Laborables de lunes a viernes', 'Working days Monday to Friday'), N(lab, l)],
        ],
        table: { caption: T(l, `Laborables por mes en ${year}`, `Working days by month in ${year}`), headers: [T(l, 'Mes', 'Month'), T(l, 'Días', 'Days'), T(l, 'Fin de semana', 'Weekend'), T(l, 'Festivos', 'Holidays'), T(l, 'Laborables', 'Working'), T(l, 'Horas', 'Hours')], rows: meses.map((m) => [Mes(m.mes, l), N(m.dias, l), N(m.findes, l), N(m.festivosLaborables, l), N(m.laborables, l), N(m.laborables * h, l, h % 1 ? 1 : 0)]), align: ['l', 'r', 'r', 'r', 'r', 'r'] },
        note: conMunicipio && !localesPublicadas ? notaLocal(v, l, year) : T(l, 'Laborables = lunes a viernes que no son festivos. Si tu convenio trabaja los sábados, súmalos aparte.', 'Working days = Monday to Friday, holidays excluded. If your agreement works Saturdays, add them separately.'),
      };
    },
  };
}

/* ------------------------------------------------------------------ puentes y vacaciones */
function puentesSpec(l: Lang, arg?: Args): ToolSpec {
  return {
    inputs: [...lugarInputs(l, arg), yearInput(l, arg),
      { id: 'dias', label: T(l, 'Días de vacaciones que quieres usar', 'Leave days you want to use'), def: Number(arg?.dias ?? 6), unit: T(l, 'días', 'days'), max: 30 },
      { kind: 'choice', id: 'tramo', label: T(l, 'Escapada mínima', 'Shortest break'), def: String(arg?.tramo ?? '4'), options: [{ value: '3', label: T(l, '3 días', '3 days') }, { value: '4', label: T(l, '4 días', '4 days') }, { value: '5', label: T(l, '5 días', '5 days') }], adv: true }],
    run: (v) => {
      const year = num(v, 'year'), dias = Math.max(0, Math.min(30, Math.round(num(v, 'dias'))));
      const { fiestas, conMunicipio, localesPublicadas } = festivosLugar(year, str(v, 'ccaa'), str(v, 'muni'));
      const fest = new Set(fiestas.map((f) => f.fecha));
      const plan = optimizar(iso(year, 1, 1), iso(year, 12, 31), fest, dias, 5, num(v, 'tramo') || 4);
      const clasicos = puentesDelAnio(iso(year, 1, 1), iso(year, 12, 31), fest);
      const best = plan.elegidos.slice().sort((a, b) => b.libres - a.libres)[0];
      const rango = (a: ISO, b: ISO) => T(l, `${fCorta(a, l)} al ${fCorta(b, l)}`, `${fCorta(a, l)} to ${fCorta(b, l)}`);
      return {
        label: T(l, `Días libres seguidos con ${dias} de vacaciones`, `Days off in a row with ${dias} days of leave`),
        value: N(plan.libres, l),
        sub: plan.usados ? T(l, `en ${plan.elegidos.length} escapadas, usando ${plan.usados} días: ${N(plan.libres / plan.usados, l, 1)} libres por día pedido`, `in ${plan.elegidos.length} breaks, using ${plan.usados} days: ${N(plan.libres / plan.usados, l, 1)} off per day of leave`) : T(l, 'Sube los días de vacaciones para ver el reparto.', 'Raise the leave days to see the plan.'),
        rows: [
          [T(l, 'Días pedidos', 'Leave days used'), `${plan.usados} / ${dias}`],
          [T(l, 'Escapadas', 'Breaks'), String(plan.elegidos.length)],
          [T(l, 'La más larga', 'Longest'), best ? T(l, `${best.libres} días, ${rango(best.libreDesde, best.libreHasta)}`, `${best.libres} days, ${rango(best.libreDesde, best.libreHasta)}`) : T(l, 'ninguna', 'none')],
          [T(l, 'Puentes de 1 o 2 días en el año', 'One or two-day bridges this year'), String(clasicos.length)],
        ],
        table: { caption: T(l, `Reparto óptimo de ${dias} días en ${year}`, `Best use of ${dias} days in ${year}`), headers: [T(l, 'Pide', 'Take off'), T(l, 'Días', 'Days'), T(l, 'Libre', 'Off'), T(l, 'Seguidos', 'In a row')], rows: plan.elegidos.map((h) => [h.pedir === 1 ? fCorta(h.desde, l) : rango(h.desde, h.hasta), String(h.pedir), rango(h.libreDesde, h.libreHasta), String(h.libres)]), align: ['l', 'r', 'l', 'r'] },
        tables: [{ caption: T(l, 'Todos los puentes del año, de más a menos rentable', 'Every bridge of the year, best value first'), headers: [T(l, 'Pide', 'Take off'), T(l, 'Días', 'Days'), T(l, 'Libre', 'Off'), T(l, 'Seguidos', 'In a row')], rows: clasicos.slice(0, 12).map((h) => [h.pedir === 1 ? fCorta(h.desde, l) : rango(h.desde, h.hasta), String(h.pedir), rango(h.libreDesde, h.libreHasta), String(h.libres)]), align: ['l', 'r', 'l', 'r'] }],
        note: conMunicipio && !localesPublicadas ? notaLocal(v, l, year) : !conMunicipio ? T(l, 'Sin municipio el cálculo no cuenta tus 2 fiestas locales, que pueden abrir otros puentes.', 'Without a town the plan leaves out your 2 local holidays, which can open more bridges.') : T(l, 'Cuenta de lunes a viernes; tu empresa puede fijar turnos o cierres que cambien el reparto.', 'Counts Monday to Friday; your employer may set shifts or closures that change the plan.'),
      };
    },
  };
}

/* ------------------------------------------------------------------ Semana Santa */
const festivoEn = (year: number, ccaa: string, d: ISO, l: Lang) => {
  if (!tieneAnio(year)) return T(l, 'según la resolución del año', 'set by that year\'s resolution');
  return fiestasCcaa(year, ccaa).some((f) => f.fecha === d) ? T(l, 'festivo', 'holiday') : T(l, 'laborable', 'working day');
};
function semanaSantaSpec(l: Lang, arg?: Args): ToolSpec {
  return {
    inputs: [
      { id: 'year', label: T(l, 'Año', 'Year'), def: Number(arg?.year ?? 2027), max: 2099 },
      { kind: 'select', id: 'ccaa', label: T(l, 'Comunidad autónoma', 'Region'), def: ccaaDef(arg), options: ccaaOpts(l) },
    ],
    run: (v) => {
      const y = Math.min(2099, Math.max(1900, Math.round(num(v, 'year')))), m = movibles(y), c = str(v, 'ccaa');
      return {
        label: T(l, `Semana Santa ${y}`, `Holy Week ${y}`),
        value: T(l, `${fDia(m.ramos, l)} al ${fDia(m.pascua, l)}`, `${fDia(m.ramos, l)} to ${fDia(m.pascua, l)}`),
        sub: T(l, `Domingo de Pascua: ${fLarga(m.pascua, l)}`, `Easter Sunday: ${fLarga(m.pascua, l)}`),
        rows: [
          [T(l, 'Domingo de Ramos', 'Palm Sunday'), fCorta(m.ramos, l)],
          [T(l, 'Jueves Santo', 'Maundy Thursday'), `${fCorta(m.jueves, l)} · ${festivoEn(y, c, m.jueves, l)}`],
          [T(l, 'Viernes Santo', 'Good Friday'), `${fCorta(m.viernes, l)} · ${festivoEn(y, c, m.viernes, l)}`],
          [T(l, 'Lunes de Pascua', 'Easter Monday'), `${fCorta(m.lunes, l)} · ${festivoEn(y, c, m.lunes, l)}`],
        ],
        table: { caption: T(l, 'Semana Santa en los próximos años', 'Holy Week in the coming years'), headers: [T(l, 'Año', 'Year'), T(l, 'Jueves Santo', 'Maundy Thursday'), T(l, 'Viernes Santo', 'Good Friday'), T(l, 'Domingo de Pascua', 'Easter Sunday'), T(l, 'Lunes de Pascua', 'Easter Monday')], rows: Array.from({ length: 8 }, (_, i) => { const x = movibles(y + i); return [String(y + i), fDia(x.jueves, l), fDia(x.viernes, l), fDia(x.pascua, l), fDia(x.lunes, l)]; }) },
        note: tieneAnio(y) ? T(l, `Festivos de ${comunidad(c).es} según la resolución del BOE de ${y}.`, `${comunidad(c).en} holidays as listed in the ${y} BOE resolution.`) : T(l, 'Fechas calculadas con la regla de la Pascua (algoritmo de Meeus). Qué días son festivos lo dirá la resolución de ese año.', 'Dates computed with the Easter rule (Meeus algorithm). Which days are holidays will be set by that year\'s resolution.'),
      };
    },
  };
}

/* ------------------------------------------------------------------ cambio de hora */
export function baseCambio(y: number, l: Lang) {
  if (y >= 2022 && y <= 2026) return T(l, 'Orden PCM/186/2022', 'Order PCM/186/2022');
  if (y >= 2027 && y <= 2031) return T(l, 'Comunicación de la Comisión C/2026/1660', 'Commission Communication C/2026/1660');
  return T(l, 'Regla de la Directiva 2000/84/CE', 'Rule of Directive 2000/84/EC');
}
function cambioSpec(l: Lang, arg?: Args): ToolSpec {
  return {
    inputs: [
      { id: 'year', label: T(l, 'Año', 'Year'), def: Number(arg?.year ?? 2027), max: 2099 },
      { kind: 'choice', id: 'zona', label: T(l, 'Zona horaria', 'Time zone'), def: String(arg?.zona ?? 'peninsula'), options: [{ value: 'peninsula', label: T(l, 'Península', 'Mainland') }, { value: 'canarias', label: 'Canarias' }] },
    ],
    run: (v) => {
      const y = Math.min(2099, Math.max(1997, Math.round(num(v, 'year')))), c = cambioHora(y), can = str(v, 'zona') === 'canarias';
      const [a1, a2, b1, b2] = can ? ['1:00', '2:00', '2:00', '1:00'] : ['2:00', '3:00', '3:00', '2:00'];
      return {
        label: T(l, `Cambio de hora ${y}${can ? ' en Canarias' : ''}`, `Clock change ${y}${can ? ' in the Canaries' : ''}`),
        value: `${fDia(c.verano, l)} · ${fDia(c.invierno, l)}`,
        sub: T(l, `${diffDays(c.verano, c.invierno)} días con horario de verano`, `${diffDays(c.verano, c.invierno)} days on summer time`),
        rows: [
          [T(l, 'Horario de verano: se adelanta', 'Summer time: clocks go forward'), T(l, `${fCorta(c.verano, l)}, a las ${a1} son las ${a2}`, `${fCorta(c.verano, l)}, ${a1} becomes ${a2}`)],
          [T(l, 'Horario de invierno: se atrasa', 'Winter time: clocks go back'), T(l, `${fCorta(c.invierno, l)}, a las ${b1} son las ${b2}`, `${fCorta(c.invierno, l)}, ${b1} becomes ${b2}`)],
          [T(l, 'Hora universal del cambio', 'Time of change (UTC)'), '01:00 UTC'],
          [T(l, 'Fuente de la fecha', 'Source of the date'), baseCambio(y, l)],
        ],
        table: { caption: T(l, 'Cambios de hora de los próximos años', 'Clock changes in the coming years'), headers: [T(l, 'Año', 'Year'), T(l, 'Se adelanta (verano)', 'Forward (summer)'), T(l, 'Se atrasa (invierno)', 'Back (winter)'), T(l, 'Fuente', 'Source')], rows: Array.from({ length: 6 }, (_, i) => { const x = cambioHora(y + i); return [String(y + i), fDia(x.verano, l), fDia(x.invierno, l), baseCambio(y + i, l)]; }) },
        note: T(l, 'Península, Baleares, Ceuta y Melilla cambian a las 2:00 y a las 3:00; Canarias, una hora antes. El cambio ocurre a la misma hora universal en toda la Unión Europea.', 'The mainland, Balearics, Ceuta and Melilla change at 2:00 and 3:00; the Canaries one hour earlier. The change happens at the same universal time across the EU.'),
      };
    },
  };
}

/* ------------------------------------------------------------------ fechas que dependen de la Pascua y otras */
const EVENTOS: Record<string, { es: string; en: string; f: (y: number) => ISO }> = {
  carnaval: { es: 'Martes de Carnaval', en: 'Shrove Tuesday (Carnival)', f: (y) => movibles(y).carnaval },
  ceniza: { es: 'Miércoles de Ceniza', en: 'Ash Wednesday', f: (y) => movibles(y).ceniza },
  ramos: { es: 'Domingo de Ramos', en: 'Palm Sunday', f: (y) => movibles(y).ramos },
  jueves: { es: 'Jueves Santo', en: 'Maundy Thursday', f: (y) => movibles(y).jueves },
  viernes: { es: 'Viernes Santo', en: 'Good Friday', f: (y) => movibles(y).viernes },
  pascua: { es: 'Domingo de Pascua', en: 'Easter Sunday', f: (y) => movibles(y).pascua },
  lunes: { es: 'Lunes de Pascua', en: 'Easter Monday', f: (y) => movibles(y).lunes },
  padre: { es: 'Día del Padre (San José)', en: 'Father\'s Day (Saint Joseph)', f: (y) => iso(y, 3, 19) },
  madre: { es: 'Día de la Madre', en: 'Mother\'s Day', f: (y) => diaMadre(y) },
  pentecostes: { es: 'Lunes de Pentecostés', en: 'Whit Monday', f: (y) => movibles(y).lunesPentecostes },
  corpus: { es: 'Corpus Christi', en: 'Corpus Christi', f: (y) => movibles(y).corpus },
};
export const evento = (id: string, y: number) => EVENTOS[id].f(y);
function movilSpec(l: Lang, arg?: Args): ToolSpec {
  return {
    inputs: [
      { kind: 'select', id: 'ev', label: T(l, 'Fecha', 'Date'), def: String(arg?.ev ?? 'carnaval'), options: Object.entries(EVENTOS).map(([value, e]) => ({ value, label: e[l] })) },
      { id: 'year', label: T(l, 'Año', 'Year'), def: Number(arg?.year ?? 2027), max: 2099 },
    ],
    run: (v) => {
      const y = Math.min(2099, Math.max(1900, Math.round(num(v, 'year')))), e = EVENTOS[str(v, 'ev')] ?? EVENTOS.carnaval, d = e.f(y), p = movibles(y).pascua;
      const k = diffDays(p, d);
      return {
        label: `${e[l]} ${y}`, value: fDia(d, l), sub: fLarga(d, l),
        rows: [
          [T(l, 'Día de la semana', 'Day of the week'), fSemana(d, l)],
          [T(l, 'Respecto al Domingo de Pascua', 'Relative to Easter Sunday'), k === 0 ? T(l, 'es el mismo día', 'same day') : k < 0 ? T(l, `${-k} días antes`, `${-k} days before`) : T(l, `${k} días después`, `${k} days after`)],
          [T(l, 'Día del año', 'Day of the year'), String(diffDays(iso(y, 1, 1), d) + 1)],
        ],
        table: { caption: T(l, `${e.es} en los próximos años`, `${e.en} in the coming years`), headers: [T(l, 'Año', 'Year'), T(l, 'Fecha', 'Date')], rows: Array.from({ length: 6 }, (_, i) => [String(y + i), fLarga(e.f(y + i), l)]) },
        note: str(v, 'ev') === 'padre' ? T(l, 'El 19 de marzo es fiesta laboral solo en las comunidades que lo eligen cada año.', '19 March is a public holiday only in the regions that choose it each year.') : str(v, 'ev') === 'madre' ? T(l, 'En España el Día de la Madre es el primer domingo de mayo; no es fiesta laboral.', 'In Spain Mother\'s Day is the first Sunday of May; it is not a public holiday.') : T(l, 'Calculado con la fecha de la Pascua (algoritmo de Meeus, calendario gregoriano).', 'Computed from the date of Easter (Meeus algorithm, Gregorian calendar).'),
      };
    },
  };
}

/* ------------------------------------------------------------------ fiestas nacionales */
function nacionalesSpec(l: Lang, arg?: Args): ToolSpec {
  return {
    inputs: [yearInput(l, arg), { kind: 'select', id: 'ccaa', label: T(l, 'Comunidad autónoma', 'Region'), def: ccaaDef(arg), options: ccaaOpts(l) }],
    run: (v) => {
      const year = num(v, 'year'), c = str(v, 'ccaa');
      const com = comunes(year), propias = fiestasCcaa(year, c).filter((f) => !com.some((x) => x.fecha === f.fecha));
      const r = resolucion(year)!;
      return {
        label: T(l, `Fiestas comunes a toda España en ${year}`, `Holidays shared by all of Spain in ${year}`), value: String(com.length),
        sub: T(l, `${comunidad(c).es} añade ${propias.length} hasta llegar a 12`, `${comunidad(c).en} adds ${propias.length} to reach 12`),
        rows: com.slice(0, 3).map((f) => [f[l], fCorta(f.fecha, l)] as [string, string]).concat([[T(l, 'Publicadas en', 'Published in'), `BOE ${fFecha(r.fecha, l)}`]]),
        table: { caption: T(l, `Las 12 fiestas de ${comunidad(c).es} en ${year}`, `The 12 holidays of ${comunidad(c).en} in ${year}`), headers: [T(l, 'Fecha', 'Date'), T(l, 'Día', 'Day'), T(l, 'Fiesta', 'Holiday'), T(l, 'Ámbito', 'Scope')], rows: fiestasCcaa(year, c).map((f) => [fFecha(f.fecha, l), fSemana(f.fecha, l), f[l], com.some((x) => x.fecha === f.fecha) ? T(l, 'Toda España', 'All of Spain') : TIPO[f.tipo][l]]) },
        note: T(l, `${r.titulo}, BOE del ${fFecha(r.fecha, l)}.`, `${r.titulo} (BOE of ${fFecha(r.fecha, l)}).`),
      };
    },
  };
}

/* ------------------------------------------------------------------ cuántos días faltan (sin reloj: para minis) */
function faltanSpec(l: Lang, arg?: Args): ToolSpec {
  return {
    inputs: [
      { kind: 'select', id: 'ccaa', label: T(l, 'Comunidad autónoma', 'Region'), def: ccaaDef(arg), options: ccaaOpts(l) },
      { kind: 'select', id: 'mes', label: T(l, 'Desde el mes de', 'From the month of'), def: String(arg?.mes ?? '11'), options: Array.from({ length: 14 }, (_, i) => { const y = i < 2 ? 2026 : 2027, m = i < 2 ? 11 + i : i - 1; return { value: `${y}-${String(m).padStart(2, '0')}`, label: `${Mes(m, l)} ${y}` }; }) },
    ],
    run: (v) => {
      const desde = `${str(v, 'mes').length === 7 ? str(v, 'mes') : '2026-11'}-01`, c = str(v, 'ccaa');
      const todas = [...fiestasCcaa(2026, c), ...fiestasCcaa(2027, c)].filter((f) => f.fecha >= desde && !isWeekend(f.fecha));
      const p = todas[0];
      return {
        label: T(l, `Próximo festivo entre semana en ${comunidad(c).es}`, `Next weekday holiday in ${comunidad(c).en}`),
        value: p ? fDia(p.fecha, l) : T(l, 'ninguno', 'none'), sub: p ? `${p[l]} · ${fSemana(p.fecha, l)}` : '',
        rows: todas.slice(1, 5).map((f) => [f[l], fCorta(f.fecha, l)] as [string, string]),
        note: T(l, 'El contador en directo de la página cuenta hasta el segundo, en tu hora local.', 'The live counter on this page counts down to the second, in your local time.'),
      };
    },
  };
}

export const SPECS: Record<string, (l: Lang, arg?: Args) => ToolSpec> = {
  municipio: municipioSpec, laborables: laborablesSpec, puentes: puentesSpec, semanaSanta: semanaSantaSpec,
  cambio: cambioSpec, movil: movilSpec, nacionales: nacionalesSpec, faltan: faltanSpec,
};
export const TOOL_KINDS = Object.keys(SPECS);
export function getTool(kind: string, l: Lang, arg?: Args): ToolSpec {
  const f = SPECS[kind]; if (!f) throw new Error(`herramienta desconocida: ${kind}`);
  return f(l, arg);
}
/** Ejecuta una herramienta con sus valores por defecto (o los dados): sirve a las páginas y a los tests. */
export function runTool(kind: string, l: Lang, arg?: Args, values?: V): ToolOut {
  const spec = getTool(kind, l, arg);
  const v = Object.fromEntries(spec.inputs.map((i) => [i.id, i.def])) as V;
  return spec.run(resolve(spec.inputs, { ...v, ...(values ?? {}) }));
}
export { addDays, weekday };
