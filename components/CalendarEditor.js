import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import { isoDay } from '../lib/castes';
import { colors } from './RichDemoUI';

const MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
const DOW = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

// Grille de mois. editable : l'expert clique pour marquer un jour OCCUPÉ. Sinon : lecture seule.
export function MonthGrid({ year, month, busy, onToggle, today, selected }) {
  const first = new Date(year, month, 1); const offset = (first.getDay() + 6) % 7; const n = new Date(year, month + 1, 0).getDate();
  const cells = [...Array(offset).fill(null), ...Array.from({ length: n }, (_, i) => i + 1)];
  return <div>
    <div style={{ fontWeight: 900, marginBottom: 8 }}>{MONTHS[month]} {year}</div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4 }}>
      {DOW.map((d, i) => <div key={i} style={{ fontSize: 10, color: '#64748b', textAlign: 'center' }}>{d}</div>)}
      {cells.map((d, i) => {
        if (!d) return <div key={i} />;
        const iso = isoDay(new Date(year, month, d)); const past = iso < today; const isBusy = busy.has(iso); const sel = selected === iso;
        return <button key={i} type="button" disabled={past || !onToggle} onClick={() => onToggle && onToggle(iso)} aria-label={`${d} ${MONTHS[month]} ${isBusy ? 'occupé' : 'libre'}`}
          style={{ aspectRatio: '1', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: past || !onToggle ? 'default' : 'pointer', color: past ? '#475569' : '#fff',
            border: `1px solid ${sel ? '#fff' : isBusy ? '#FF8A8A88' : 'rgba(255,255,255,.1)'}`, background: isBusy ? '#FF8A8A33' : past ? 'transparent' : 'rgba(124,255,178,.08)' }}>{d}</button>;
      })}
    </div>
  </div>;
}

export default function CalendarEditor({ profileId, months = 3, editable = true, readOnlyBusy }) {
  const today = isoDay(new Date());
  const [busy, setBusy] = useState(new Set()); const [err, setErr] = useState('');
  const base = useMemo(() => { const d = new Date(); return { y: d.getFullYear(), m: d.getMonth() }; }, []);

  useEffect(() => {
    if (readOnlyBusy) { setBusy(new Set(readOnlyBusy)); return; }
    supabase.from('availability_blocks').select('day').eq('profile_id', profileId).gte('day', today).then(({ data }) => setBusy(new Set((data || []).map((r) => r.day))));
  }, [profileId, today, readOnlyBusy]);

  async function toggle(iso) {
    setErr(''); const next = new Set(busy); const was = next.has(iso);
    was ? next.delete(iso) : next.add(iso); setBusy(next);
    const { error } = was ? await supabase.from('availability_blocks').delete().eq('profile_id', profileId).eq('day', iso)
      : await supabase.from('availability_blocks').insert({ profile_id: profileId, day: iso });
    if (error) { setErr(error.message); const back = new Set(next); was ? back.add(iso) : back.delete(iso); setBusy(back); }
  }
  return <div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(230px,1fr))', gap: 22 }}>
      {Array.from({ length: months }).map((_, i) => { const d = new Date(base.y, base.m + i, 1); return <MonthGrid key={i} year={d.getFullYear()} month={d.getMonth()} busy={busy} today={today} onToggle={editable ? toggle : undefined} />; })}
    </div>
    <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#94a3b8', marginTop: 12 }}>
      <span><span style={{ color: colors.talent }}>■</span> libre</span><span><span style={{ color: '#FF8A8A' }}>■</span> occupé{editable ? ' (clique sur un jour pour basculer)' : ''}</span>
    </div>
    {err && <p style={{ color: '#FF8A8A', fontSize: 13 }}>{err}</p>}
  </div>;
}
