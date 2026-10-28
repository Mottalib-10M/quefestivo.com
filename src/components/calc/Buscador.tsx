/**
 * Buscador de municipio (portada) : escribe tu municipio, ves su calendario laboral completo (nacionales,
 * comunidad, isla y las dos locales del boletín), los laborables, el próximo festivo y un .ics para tu agenda.
 * Todo se calcula en el navegador con los datos de la página : la búsqueda no sale de tu equipo.
 * Primer rendu = Madrid 2027 y el día del build ; el enlace compartido y la fecha de hoy se leen tras el montaje.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import SelectField from '../ui/SelectField';
import { Choice, ResultCard, Rows, ShareRow } from './parts';
import { readParams, updateURL } from '../../lib/url-state';
import { MUNICIPIOS, municipio, comunidad, YEARS, ISLA_NOMBRE } from '../../lib/datos';
import { festivosLugar, fFecha, fSemana, fCorta, nombreFiesta, TIPO } from '../../lib/cal';
import { laborables } from '../../lib/engine/puentes';
import { diffDays, iso, isWeekend } from '../../lib/engine/fechas';
import { ccaaOpts, notaLocal } from '../../lib/tool-specs';
import { t } from '../../i18n/ui';
import type { Lang } from '../../lib/format';

interface Props { lang: Lang; methodHref?: string; ccaaHrefs: Record<string, string>; idPrefix?: string; ine?: string; ccaa?: string }
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9ñ ]/g, ' ').trim();
const INDEX = MUNICIPIOS.map((m) => ({ m, k: norm(m.nombre) }));
function buscar(q: string) {
  const x = norm(q); if (!x) return [];
  const starts = INDEX.filter((e) => e.k.startsWith(x) || e.k.split(' ').some((w) => w.startsWith(x)));
  const has = INDEX.filter((e) => !starts.includes(e) && e.k.includes(x));
  return [...starts, ...has].slice(0, 8).map((e) => e.m);
}
const etiqueta = (ine: string) => { const m = municipio(ine); return m ? (m.isla && m.nombre !== ISLA_NOMBRE[m.isla] ? `${m.nombre} (${ISLA_NOMBRE[m.isla]})` : m.nombre) : ''; };

function ics(nombre: string, year: number, fiestas: Array<{ fecha: string; titulo: string }>) {
  const d = (s: string) => s.replace(/-/g, '');
  const next = (s: string) => { const x = new Date(`${s}T12:00:00Z`); x.setUTCDate(x.getUTCDate() + 1); return x.toISOString().slice(0, 10).replace(/-/g, ''); };
  const esc = (s: string) => s.replace(/[\\;,]/g, (c) => `\\${c}`);
  const ev = fiestas.map((f) => ['BEGIN:VEVENT', `UID:${d(f.fecha)}-${norm(nombre).replace(/ /g, '-')}@calendario-laboral`, `DTSTAMP:${d(f.fecha)}T000000Z`, `DTSTART;VALUE=DATE:${d(f.fecha)}`, `DTEND;VALUE=DATE:${next(f.fecha)}`, `SUMMARY:${esc(f.titulo)}`, 'TRANSP:TRANSPARENT', 'END:VEVENT'].join('\r\n'));
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Radif Partners//Calendario laboral//ES', 'CALSCALE:GREGORIAN', `X-WR-CALNAME:${esc(`${nombre} ${year}`)}`, ...ev, 'END:VCALENDAR'].join('\r\n') + '\r\n';
}

export default function Buscador({ lang: l, methodHref, ccaaHrefs, idPrefix = 'b', ine: ine0 = '28079', ccaa: ccaa0 }: Props) {
  const ui = t(l);
  const T = (es: string, en: string) => (l === 'es' ? es : en);
  const start = municipio(ine0);
  const [ine, setIne] = useState(start ? ine0 : '');
  const [ccaa, setCcaa] = useState(start?.ccaa ?? ccaa0 ?? 'madrid');
  const [q, setQ] = useState(start ? etiqueta(ine0) : '');
  const [year, setYear] = useState('2027');
  const [open, setOpen] = useState(false);
  const [hoy, setHoy] = useState(__BUILD_DAY__);
  const [act, setAct] = useState(0);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    setHoy(new Date().toLocaleDateString('sv-SE'));
    const u = readParams(window.location.search);
    const m = municipio(u.get('m') ?? '');
    if (m) { setIne(m.ine); setCcaa(m.ccaa); setQ(etiqueta(m.ine)); }
    else if (u.get('c') && ccaaOpts(l).some((o) => o.value === u.get('c'))) { setIne(''); setCcaa(u.get('c')!); setQ(''); }
    if (u.get('y') && YEARS.map(String).includes(u.get('y')!)) setYear(u.get('y')!);
    const close = (e: MouseEvent) => { if (box.current && !box.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);
  useEffect(() => updateURL(ine ? { m: ine, y: year } : { c: ccaa, y: year }), [ine, ccaa, year]);
  const hits = useMemo(() => buscar(q), [q]);
  const pick = (x: string) => { const m = municipio(x)!; setIne(x); setCcaa(m.ccaa); setQ(etiqueta(x)); setOpen(false); };
  const y = Number(year);
  const r = useMemo(() => festivosLugar(y, ccaa, ine), [y, ccaa, ine]);
  const fest = useMemo(() => new Set(r.fiestas.map((f) => f.fecha)), [r]);
  const lab = laborables(iso(y, 1, 1), iso(y, 12, 31), fest);
  const nombre = ine ? etiqueta(ine) : comunidad(ccaa)[l];
  const prox = r.fiestas.find((f) => f.fecha >= hoy && !isWeekend(f.fecha));
  const cuenta = (tp: string[]) => r.fiestas.filter((f) => tp.includes(f.tipo)).length;
  const descargar = () => {
    const blob = new Blob([ics(nombre, y, r.fiestas.map((f) => ({ fecha: f.fecha, titulo: nombreFiesta(f, l) })))], { type: 'text/calendar;charset=utf-8' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `calendario-laboral-${norm(nombre).replace(/ /g, '-')}-${y}.ics`; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };
  const qid = `${idPrefix}-q`;
  return (
    <div className="rounded-xl border border-navy-200 bg-white p-4 sm:p-5">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,23rem)]">
        <form className="grid content-start grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); if (hits[0]) pick(hits[0].ine); }} role="search">
          <div ref={box} className="relative grid grid-rows-subgrid row-span-3 content-start gap-y-0 sm:col-span-2">
            <label htmlFor={qid} className="mb-1 block text-sm font-medium text-navy-700">{T('Tu municipio', 'Your town or city')}</label>
            <input id={qid} type="text" autoComplete="off" spellCheck={false} value={q} placeholder={T('Escribe: Sevilla, Getafe, Vigo…', 'Type: Seville, Getafe, Vigo…')}
              role="combobox" aria-expanded={open && hits.length > 0} aria-controls={`${qid}-list`} aria-autocomplete="list"
              onFocus={(e) => { e.target.select(); setOpen(true); }}
              onChange={(e) => { setQ(e.target.value); setOpen(true); setAct(0); }}
              onKeyDown={(e) => { if (e.key === 'ArrowDown') { e.preventDefault(); setAct((a) => Math.min(a + 1, hits.length - 1)); } else if (e.key === 'ArrowUp') { e.preventDefault(); setAct((a) => Math.max(a - 1, 0)); } else if (e.key === 'Enter' && hits[act]) { e.preventDefault(); pick(hits[act].ine); } else if (e.key === 'Escape') setOpen(false); }}
              className="h-12 w-full rounded-lg border border-navy-300 bg-white px-3 text-navy-900 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20" />
            <p className="mt-1 text-xs text-navy-500">{T(`${MUNICIPIOS.length} municipios: capitales de provincia y los más poblados. ¿No está el tuyo? Elige tu comunidad.`, `${MUNICIPIOS.length} towns: provincial capitals and the largest. Not listed? Pick your region.`)}</p>
            {open && hits.length > 0 && (
              <ul id={`${qid}-list`} role="listbox" className="absolute left-0 right-0 top-[4.6rem] z-20 max-h-72 overflow-y-auto rounded-lg border border-navy-200 bg-white shadow-lg">
                {hits.map((m, i) => (
                  <li key={m.ine} role="option" aria-selected={i === act}>
                    <button type="button" onClick={() => pick(m.ine)} className={`flex w-full justify-between gap-3 px-3 py-2 text-left text-sm ${i === act ? 'bg-accent-50' : 'hover:bg-navy-50'}`}>
                      <span className="font-medium text-navy-900">{etiqueta(m.ine)}</span><span className="text-navy-500">{comunidad(m.ccaa)[l]}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <SelectField id={`${idPrefix}-c`} label={T('O tu comunidad', 'Or your region')} value={ccaa} onChange={(v) => { setCcaa(v); setIne(''); setQ(''); }} options={ccaaOpts(l)} />
          <div className="grid grid-rows-subgrid row-span-3 content-start"><Choice id={`${idPrefix}-y`} label={T('Año', 'Year')} value={year} options={YEARS.map((x) => ({ value: String(x), label: String(x) }))} onChange={setYear} /></div>
        </form>
        <ResultCard label={T(`Festivos en ${nombre} en ${y}`, `Public holidays in ${nombre} in ${y}`)} value={String(r.fiestas.length)}
          sub={ine && !r.localesPublicadas ? T('a falta de las 2 fiestas locales, aún sin publicar', 'the 2 local holidays are not yet published') : T(`${lab.toLocaleString('es-ES')} días laborables de lunes a viernes`, `${lab.toLocaleString('en-GB')} working days, Monday to Friday`)}>
          <Rows rows={[
            [T('Nacionales', 'National'), String(cuenta(['nacional'])), cuenta(['nacional'])],
            [T('De la comunidad', 'Regional'), String(cuenta(['autonomica', 'insular'])), cuenta(['autonomica', 'insular'])],
            [T('Locales', 'Local'), ine ? (r.localesPublicadas ? String(cuenta(['local'])) : T('sin publicar', 'not yet out')) : T('elige municipio', 'pick a town'), cuenta(['local'])],
            [T('Próximo festivo entre semana', 'Next weekday holiday'), prox ? `${fCorta(prox.fecha, l)} · ${T(`en ${diffDays(hoy, prox.fecha)} días`, `in ${diffDays(hoy, prox.fecha)} days`)}` : T('ninguno', 'none')],
          ]} />
          <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
            <button type="button" onClick={descargar} className="font-medium text-accent-700 underline">{T('Añadir a mi agenda (.ics)', 'Add to my calendar (.ics)')}</button>
            {ccaaHrefs[ccaa] && <a href={ccaaHrefs[ccaa]} className="font-medium text-accent-700 underline">{T(`Calendario de ${comunidad(ccaa).es}`, `${comunidad(ccaa).en} calendar`)}</a>}
          </p>
          <ShareRow methodHref={methodHref} labels={ui} />
        </ResultCard>
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <caption className="mb-2 text-left text-sm text-navy-700">{T(`Calendario laboral ${y} de ${nombre}`, `${nombre} ${y} holiday calendar`)}</caption>
          <thead><tr>{[T('Fecha', 'Date'), T('Día', 'Day'), T('Fiesta', 'Holiday'), T('Ámbito', 'Scope')].map((h) => <th key={h} scope="col" className="border-b border-navy-300 px-2 py-1.5 text-left font-semibold text-navy-900">{h}</th>)}</tr></thead>
          <tbody>{r.fiestas.map((f) => (
            <tr key={f.fecha + f.tipo} className={f.fecha < hoy ? 'text-navy-500' : ''}>
              <td className="tabular-nums border-b border-navy-100 px-2 py-1.5">{fFecha(f.fecha, l)}</td>
              <td className="border-b border-navy-100 px-2 py-1.5">{fSemana(f.fecha, l)}</td>
              <td className="border-b border-navy-100 px-2 py-1.5">{nombreFiesta(f, l)}</td>
              <td className="border-b border-navy-100 px-2 py-1.5">{TIPO[f.tipo][l]}</td>
            </tr>
          ))}</tbody>
        </table>
        <p className="mt-2 text-xs text-navy-600">{notaLocal({ ccaa, muni: ine }, l, y)}</p>
      </div>
    </div>
  );
}
