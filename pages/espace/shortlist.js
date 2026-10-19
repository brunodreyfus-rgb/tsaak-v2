import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { PROFILE_COLS } from '../../lib/useAuth';
import { card, colors } from '../../components/RichDemoUI';
import { Shell, Btn, Notice } from '../../components/Espace';
import ExpertCard from '../../components/ExpertCard';

// Pas de chiffre : on reconstruit la ligne « recherche » depuis les colonnes publiques
function toRow(p, busyDays) {
  const cr = p.criteria || {}; const s = Math.round((cr.desirability || 0) * 0.35 + (cr.media || 0) * 0.35 + (cr.performance || 0) * 0.25 + (cr.community || 0) * 0.05);
  return { ...p, tier: s >= 90 ? 'Élite' : s >= 75 ? 'Confirmé' : s >= 50 ? 'Montant' : 'Émergent', availability: p.calendar_active ? 'calendrier' : 'verifier' };
}
export default function Shortlist() {
  const [rows, setRows] = useState(null); const [err, setErr] = useState('');
  useEffect(() => {
    (async () => {
      const { data: sl, error } = await supabase.from('shortlists').select('expert_id').order('created_at', { ascending: false });
      if (error) { setErr(error.message); setRows([]); return; }
      const ids = (sl || []).map((r) => r.expert_id);
      if (!ids.length) { setRows([]); return; }
      const { data } = await supabase.from('profiles').select(PROFILE_COLS).in('id', ids);
      const byId = new Map((data || []).map((p) => [p.id, p]));
      setRows(ids.map((i) => byId.get(i)).filter(Boolean).map(toRow));
    })();
  }, []);
  async function remove(auth, id) { await supabase.from('shortlists').delete().eq('owner_id', auth.profile.id).eq('expert_id', id); setRows((r) => r.filter((x) => x.id !== id)); }
  return <Shell title="Shortlist" wide>{(auth) => <div style={{ display: 'grid', gap: 20 }}>
    <div><h1 style={{ margin: 0, fontSize: 34 }}>Ma shortlist</h1><p style={{ color: '#94a3b8', margin: '6px 0 0' }}>Les experts que tu gardes de côté. Ouvre une fiche pour écrire ou vérifier une date.</p></div>
    {err && <Notice kind="error">{err}</Notice>}
    {rows === null && <p style={{ color: '#64748b' }}>Chargement…</p>}
    {rows && rows.length === 0 && <div style={card()}><p style={{ margin: '0 0 10px', color: '#C9D4E4' }}>Ta shortlist est vide.</p><Btn href="/espace/recherche">Chercher des experts</Btn></div>}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(310px,1fr))', gap: 18 }}>
      {(rows || []).map((e) => <ExpertCard key={e.id} e={e} inShortlist onShortlist={(id) => remove(auth, id)} />)}
    </div>
  </div>}</Shell>;
}
