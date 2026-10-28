/**
 * Cuenta atrás en directo hasta el próximo festivo, Navidad, Año Nuevo, Semana Santa o el próximo cambio de hora,
 * en la hora local del visitante (la de su navegador) y sin enviar nada.
 * Primer rendu = días contados desde el día del build ; el reloj arranca tras el montaje (sin error de hidratación).
 */
import { useEffect, useMemo, useState } from 'react';
import SelectField from '../ui/SelectField';
import { ResultCard, Rows, ShareRow } from './parts';
import { readParams, updateURL } from '../../lib/url-state';
import { fiestasCcaa, comunes, comunidad, type Fiesta } from '../../lib/datos';
import { fLarga, fCorta, fSemana } from '../../lib/cal';
import { movibles, cambioHora, diffDays, isWeekend, desglose, iso, type ISO } from '../../lib/engine/fechas';
import { laborables } from '../../lib/engine/puentes';
import { ccaaOpts } from '../../lib/tool-specs';
import { t } from '../../i18n/ui';
import type { Lang } from '../../lib/format';

interface Props { lang: Lang; methodHref?: string; idPrefix?: string; ev?: string; ccaa?: string }
type Ev = { id: string; es: string; en: string; fecha: ISO; instante?: number };
const localISO = (ms: number) => new Date(ms).toLocaleDateString('sv-SE');

/** Próxima ocurrencia de cada acontecimiento a partir de `hoy` (incluido). */
function eventos(hoy: ISO, ccaa: string, ahora: number | null): Ev[] {
  const y = +hoy.slice(0, 4);
  const sig = (f: (y: number) => ISO) => (f(y) >= hoy ? f(y) : f(y + 1));
  const fest = (lista: Fiesta[]) => lista.find((f) => f.fecha >= hoy && !isWeekend(f.fecha));
  const reg = fest([...fiestasCcaa(y, ccaa), ...fiestasCcaa(y + 1, ccaa)]);
  const nac = fest([...comunes(y), ...comunes(y + 1)]);
  const ss = sig((x) => movibles(x).jueves);
  // Cambio de hora : instante exacto (01:00 UTC), comparado con la hora actual cuando se conoce.
  const ref = ahora ?? Date.parse(`${hoy}T00:00:00Z`);
  const cands = [y, y + 1].flatMap((x) => { const c = cambioHora(x); return [{ ms: c.veranoUTC, d: c.verano, v: true }, { ms: c.inviernoUTC, d: c.invierno, v: false }]; }).filter((c) => c.ms > ref);
  const ch = cands[0];
  const out: Ev[] = [];
  if (reg) out.push({ id: 'festivo', es: `Próximo festivo en ${comunidad(ccaa).es}: ${reg.es}`, en: `Next holiday in ${comunidad(ccaa).en}: ${reg.en}`, fecha: reg.fecha });
  if (nac) out.push({ id: 'nacional', es: `Próximo festivo nacional: ${nac.es}`, en: `Next national holiday: ${nac.en}`, fecha: nac.fecha });
  out.push({ id: 'navidad', es: 'Navidad', en: 'Christmas Day', fecha: sig((x) => iso(x, 12, 25)) });
  out.push({ id: 'nochevieja', es: 'Año Nuevo (campanadas)', en: 'New Year (midnight chimes)', fecha: iso(hoy.slice(5) === '01-01' ? y : y + 1, 1, 1) });
  out.push({ id: 'reyes', es: 'Reyes', en: 'Epiphany', fecha: sig((x) => iso(x, 1, 6)) });
  out.push({ id: 'semanaSanta', es: 'Semana Santa (Jueves Santo)', en: 'Holy Week (Maundy Thursday)', fecha: ss });
  if (ch) out.push({ id: 'cambio', es: ch.v ? 'Cambio a la hora de verano' : 'Cambio a la hora de invierno', en: ch.v ? 'Clocks go forward (summer time)' : 'Clocks go back (winter time)', fecha: ch.d, instante: ch.ms });
  return out;
}

export default function Cuenta({ lang: l, methodHref, idPrefix = 'ca', ev: ev0 = 'festivo', ccaa: ccaa0 = 'madrid' }: Props) {
  const ui = t(l);
  const T = (es: string, en: string) => (l === 'es' ? es : en);
  const [ev, setEv] = useState(ev0);
  const [ccaa, setCcaa] = useState(ccaa0);
  const [ahora, setAhora] = useState<number | null>(null);
  const [zona, setZona] = useState('');
  useEffect(() => {
    const u = readParams(window.location.search);
    if (u.get('c') && ccaaOpts(l).some((o) => o.value === u.get('c'))) setCcaa(u.get('c')!);
    if (u.get('e')) setEv(u.get('e')!);
    setZona(Intl.DateTimeFormat().resolvedOptions().timeZone ?? '');
    setAhora(Date.now());
    const id = setInterval(() => setAhora(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  useEffect(() => updateURL({ e: ev, c: ccaa }), [ev, ccaa]);
  const hoy = ahora === null ? __BUILD_DAY__ : localISO(ahora);
  const lista = useMemo(() => eventos(hoy, ccaa, ahora === null ? null : Math.floor(ahora / 60000) * 60000), [hoy, ccaa, ahora === null ? 0 : Math.floor(ahora / 60000)]);
  const e = lista.find((x) => x.id === ev) ?? lista[0];
  const fest = useMemo(() => new Set([...fiestasCcaa(+hoy.slice(0, 4), ccaa), ...fiestasCcaa(+hoy.slice(0, 4) + 1, ccaa)].map((f) => f.fecha)), [hoy, ccaa]);
  const objetivo = e.instante ?? (ahora === null ? null : new Date(+e.fecha.slice(0, 4), +e.fecha.slice(5, 7) - 1, +e.fecha.slice(8, 10)).getTime());
  const d = ahora !== null && objetivo !== null ? desglose(objetivo - ahora) : null;
  const dias = d ? d.dias : Math.max(0, diffDays(hoy, e.fecha));
  const p2 = (n: number) => String(n).padStart(2, '0');
  const horaCambio = e.instante && ahora !== null ? new Date(e.instante).toLocaleTimeString(l === 'es' ? 'es-ES' : 'en-GB', { hour: '2-digit', minute: '2-digit' }) : null;
  const lab = e.fecha > hoy ? laborables(hoy, e.fecha, fest) - (isWeekend(e.fecha) || fest.has(e.fecha) ? 0 : 1) : 0;
  return (
    <div className="rounded-xl border border-navy-200 bg-white p-4 sm:p-5">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,23rem)]">
        <form className="grid content-start grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2" onSubmit={(x) => x.preventDefault()}>
          <SelectField id={`${idPrefix}-e`} label={T('Cuenta atrás hasta', 'Count down to')} value={e.id} onChange={setEv} options={lista.map((x) => ({ value: x.id, label: x.id === 'festivo' ? T('Próximo festivo de mi comunidad', 'Next holiday in my region') : x.id === 'nacional' ? T('Próximo festivo nacional', 'Next national holiday') : x[l] }))} />
          <SelectField id={`${idPrefix}-c`} label={T('Comunidad autónoma', 'Region')} value={ccaa} onChange={setCcaa} options={ccaaOpts(l)} />
        </form>
        <ResultCard label={T(`Faltan para: ${e.es}`, `Time left to: ${e.en}`)} value={T(`${dias.toLocaleString('es-ES')} ${dias === 1 ? 'día' : 'días'}`, `${dias.toLocaleString('en-GB')} ${dias === 1 ? 'day' : 'days'}`)}
          sub={d ? `${p2(d.horas)} h ${p2(d.minutos)} min ${p2(d.segundos)} s` : T('contando desde hoy…', 'counting from today…')}>
          <Rows rows={[
            [T('Fecha', 'Date'), fLarga(e.fecha, l)],
            [T('Hora de referencia', 'Reference time'), e.instante ? (horaCambio ? T(`${horaCambio}, tu hora local`, `${horaCambio}, your local time`) : '01:00 UTC') : T('00:00, tu hora local', '00:00, your local time')],
            [T('Días laborables hasta entonces', 'Working days until then'), lab.toLocaleString(l === 'es' ? 'es-ES' : 'en-GB')],
            [T('Tu zona horaria', 'Your time zone'), zona || '…'],
          ]} />
          <ShareRow methodHref={methodHref} labels={ui} />
        </ResultCard>
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <caption className="mb-2 text-left text-sm text-navy-700">{T('Lo que viene', 'Coming up')}</caption>
          <thead><tr>{[T('Qué', 'What'), T('Fecha', 'Date'), T('Día', 'Day'), T('Faltan', 'Days left')].map((h, i) => <th key={h} scope="col" className={`border-b border-navy-300 px-2 py-1.5 font-semibold text-navy-900 ${i === 3 ? 'text-right' : 'text-left'}`}>{h}</th>)}</tr></thead>
          <tbody>{lista.map((x) => (
            <tr key={x.id}>
              <td className="border-b border-navy-100 px-2 py-1.5">{x[l]}</td>
              <td className="tabular-nums border-b border-navy-100 px-2 py-1.5">{fCorta(x.fecha, l)} {x.fecha.slice(0, 4)}</td>
              <td className="border-b border-navy-100 px-2 py-1.5">{fSemana(x.fecha, l)}</td>
              <td className="tabular-nums border-b border-navy-100 px-2 py-1.5 text-right">{Math.max(0, diffDays(hoy, x.fecha)).toLocaleString(l === 'es' ? 'es-ES' : 'en-GB')}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}
