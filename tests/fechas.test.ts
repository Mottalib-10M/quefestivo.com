/** Reglas de fechas contra las fechas publicadas por el BOE y la Comisión Europea. */
import { describe, expect, it } from 'vitest';
import { easter, movibles, cambioHora, diaMadre, isoWeek, weekday, addDays, diffDays, lastSunday, nthWeekday, desglose } from '../src/lib/engine/fechas';
import { bloquesLibres, huecos, puentesDelAnio, optimizar, laborables } from '../src/lib/engine/puentes';
import { fiestasCcaa, comunes, COMUNIDADES } from '../src/lib/datos';
import F from '../src/data/festivos.json';

describe('Pascua (Meeus)', () => {
  const known: Record<number, string> = { 2000: '2000-04-23', 2019: '2019-04-21', 2024: '2024-03-31', 2025: '2025-04-20', 2026: '2026-04-05', 2027: '2027-03-28', 2028: '2028-04-16', 2029: '2029-04-01', 2030: '2030-04-21', 2038: '2038-04-25', 2285: '2285-03-22' };
  for (const [y, d] of Object.entries(known)) it(`${y}`, () => expect(easter(+y)).toBe(d));
  it('Viernes y Jueves Santo coinciden con el BOE 2026 y 2027', () => {
    for (const y of [2026, 2027]) {
      const m = movibles(y); const fs = (F.years as Record<string, { fiestas: Array<{ fecha: string; es: string }> }>)[String(y)].fiestas;
      expect(fs.find((f) => f.es === 'Viernes Santo')!.fecha).toBe(m.viernes);
      expect(fs.find((f) => f.es === 'Jueves Santo')!.fecha).toBe(m.jueves);
      expect(fs.find((f) => f.es === 'Lunes de Pascua')!.fecha).toBe(m.lunes);
      expect(fs.find((f) => f.es === 'Corpus Christi')!.fecha).toBe(m.corpus);
    }
  });
  it('Carnaval : martes 47 días antes de Pascua', () => { expect(movibles(2027).carnaval).toBe('2027-02-09'); expect(movibles(2026).carnaval).toBe('2026-02-17'); expect(weekday(movibles(2028).carnaval)).toBe(2); });
});

describe('cambio de hora', () => {
  // Orden PCM/186/2022 (2022-2026) y Comunicación de la Comisión C/2026/1660 (2027-2031).
  const pub: Record<number, [string, string]> = { 2022: ['2022-03-27', '2022-10-30'], 2023: ['2023-03-26', '2023-10-29'], 2024: ['2024-03-31', '2024-10-27'], 2025: ['2025-03-30', '2025-10-26'], 2026: ['2026-03-29', '2026-10-25'], 2027: ['2027-03-28', '2027-10-31'], 2028: ['2028-03-26', '2028-10-29'], 2029: ['2029-03-25', '2029-10-28'], 2030: ['2030-03-31', '2030-10-27'], 2031: ['2031-03-30', '2031-10-26'] };
  for (const [y, [v, i]] of Object.entries(pub)) it(`${y}`, () => { const c = cambioHora(+y); expect(c.verano).toBe(v); expect(c.invierno).toBe(i); });
  it('a la 01:00 UTC', () => { expect(new Date(cambioHora(2027).veranoUTC).toISOString()).toBe('2027-03-28T01:00:00.000Z'); expect(new Date(cambioHora(2026).inviernoUTC).toISOString()).toBe('2026-10-25T01:00:00.000Z'); });
});

describe('utilidades', () => {
  it('Día de la Madre : primer domingo de mayo', () => { expect(diaMadre(2026)).toBe('2026-05-03'); expect(diaMadre(2027)).toBe('2027-05-02'); expect(diaMadre(2028)).toBe('2028-05-07'); });
  it('semana ISO', () => { expect(isoWeek('2027-01-01')).toBe(53); expect(isoWeek('2027-01-04')).toBe(1); expect(isoWeek('2026-12-31')).toBe(53); expect(isoWeek('2028-01-03')).toBe(1); });
  it('aritmética', () => { expect(addDays('2026-12-31', 1)).toBe('2027-01-01'); expect(diffDays('2027-01-01', '2027-12-31')).toBe(364); expect(lastSunday(2026, 10)).toBe('2026-10-25'); expect(nthWeekday(2027, 5, 7, 1)).toBe('2027-05-02'); });
  it('desglose', () => expect(desglose(90061000)).toEqual({ dias: 1, horas: 1, minutos: 1, segundos: 1 }));
});

describe('fiestas del BOE', () => {
  it('cada comunidad : 12 fiestas (Canarias 11 + la de su isla)', () => {
    for (const y of [2026, 2027]) for (const c of COMUNIDADES) expect(fiestasCcaa(y, c.id, c.id === 'canarias' ? 'tenerife' : undefined).length, `${y} ${c.id}`).toBe(12);
  });
  it('fiestas comunes : 8 en 2026 y 9 en 2027', () => { expect(comunes(2026).length).toBe(8); expect(comunes(2027).length).toBe(9); });
  it('ninguna fiesta autonómica en domingo', () => { for (const y of [2026, 2027]) for (const c of COMUNIDADES) for (const f of fiestasCcaa(y, c.id)) expect(weekday(f.fecha), `${f.fecha} ${f.es}`).not.toBe(7); });
});

describe('puentes', () => {
  // Madrid 2027 sin las locales : 19 de marzo viernes, Semana Santa 25-26, 1 de mayo sábado …
  const fest = new Set(fiestasCcaa(2027, 'madrid').map((f) => f.fecha));
  it('tramos libres', () => {
    const b = bloquesLibres('2027-03-18', '2027-03-31', fest);
    expect(b.map((x) => [x.desde, x.dias])).toEqual([['2027-03-19', 3], ['2027-03-25', 4]]);
  });
  it('huecos de un día', () => {
    const h = huecos('2027-12-01', '2027-12-31', fest, 1);
    // martes 7 entre el lunes 6 (Constitución) y el miércoles 8 (Inmaculada) : 1 día pedido, 5 libres (4-8).
    const d7 = h.find((x) => x.desde === '2027-12-07')!;
    expect(d7.pedir).toBe(1); expect(d7.libres).toBe(5); expect(d7.libreDesde).toBe('2027-12-04');
  });
  it('puentes del año ordenados por rendimiento', () => { const p = puentesDelAnio('2027-01-01', '2027-12-31', fest); expect(p[0].rinde).toBeGreaterThanOrEqual(p[p.length - 1].rinde); expect(p.every((x) => x.pedir <= 2)).toBe(true); });
  it('optimizar : no gasta más de lo que hay y no solapa', () => {
    const plan = optimizar('2027-01-01', '2027-12-31', fest, 8, 5, 3);
    expect(plan.usados).toBeLessThanOrEqual(8);
    for (let i = 1; i < plan.elegidos.length; i++) expect(plan.elegidos[i].libreDesde > plan.elegidos[i - 1].libreHasta).toBe(true);
    expect(plan.libres).toBe(plan.elegidos.reduce((s, x) => s + x.libres, 0));
    // Con un día : el martes 7 de diciembre (5 días libres) es el mejor.
    const uno = optimizar('2027-01-01', '2027-12-31', fest, 1, 5, 3);
    expect(uno.elegidos[0].desde).toBe('2027-12-07');
  });
  it('laborables', () => { expect(laborables('2027-03-22', '2027-03-28', fest)).toBe(3); });
});
