import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabase } from '../../../lib/supabase';
import { fmtDate, fmtDateTime } from '../../../lib/castes';
import { card, colors, SkillChips } from '../../../components/RichDemoUI';
import { Shell, Notice, Btn, Input, Textarea, Avatar, C } from '../../../components/Espace';

const ST = { sent: ['Envoyé', C.warn], seen: ['Vu', '#94a3b8'], interested: ['Partant', C.ok], declined: ['Décline', '#64748b'] };


export default function WantedPage() {
  const router = useRouter(); const id = router.query.id;
  const [w, setW] = useState(undefined); const [recips, setRecips] = useState([]); const [props, setProps] = useState([]); const [names, setNames] = useState({});
  const [resp, setResp] = useState(''); const [q, setQ] = useState(''); const [found, setFound] = useState([]); const [note, setNote] = useState(''); const [msg, setMsg] = useState(null);

  const load = useCallback(async () => {
    if (!id) return;
    const { data } = await supabase.rpc('get_wanted', { p_id: id }); const row = Array.isArray(data) ? data[0] : null; setW(row || null); if (!row) return;
    const [r, p] = await Promise.all([supabase.from('wanted_recipients').select('*').eq('wanted_id', id), supabase.from('wanted_proposals').select('*').eq('wanted_id', id).order('created_at', { ascending: false })]);
    setRecips(r.data || []); setProps(p.data || []);
    const ids = [...new Set([...(r.data || []).map((x) => x.recipient_id), ...(p.data || []).flatMap((x) => [x.proposer_id, x.expert_id])])];
    if (ids.length) { const { data: pr } = await supabase.from('profiles').select('id,display_name,headline,skills,photo_url').in('id', ids); setNames(Object.fromEntries((pr || []).map((x) => [x.id, x]))); }
  }, [id]);
  useEffect(() => { load(); }, [load]);

  useEffect(() => { // le destinataire ouvre → « Vu »
    if (!w || w.is_author) return;
    supabase.from('wanted_recipients').update({ status: 'seen' }).eq('wanted_id', w.id).eq('status', 'sent').then(() => {});
  }, [w]);
  useEffect(() => {
    if (!q.trim()) { setFound([]); return; }
    const t = setTimeout(async () => { const { data } = await supabase.rpc('search_experts', { p_q: q.trim(), p_skills: null, p_day: null, p_include_busy: true }); setFound((data || []).slice(0, 6)); }, 300);
    return () => clearTimeout(t);
  }, [q]);

  return <Shell title={w ? w.title : 'Wanted'}>{(auth) => {
    if (w === undefined) return <p style={{ color: C.muted }}>Chargement…</p>;
    if (!w) return <div style={card()}><h2 style={{ marginTop: 0 }}>Wanted introuvable</h2><Btn href="/espace/wanted">Retour</Btn></div>;
    const me = auth.profile.id; const mineRecip = recips.find((r) => r.recipient_id === me);
    async function answer(status) {
      setMsg(null); const { error } = await supabase.from('wanted_recipients').update({ status, response: resp.trim() }).eq('wanted_id', w.id).eq('recipient_id', me);
      if (error) setMsg({ kind: 'error', text: error.message }); else { setMsg({ kind: 'ok', text: status === 'interested' ? 'Tu es noté(e) partant(e). Propose un ou plusieurs experts ci-dessous.' : 'Réponse envoyée.' }); load(); }
    }
    async function propose(expertId) {
      setMsg(null); const { error } = await supabase.from('wanted_proposals').insert({ wanted_id: w.id, proposer_id: me, expert_id: expertId, note: note.trim() });
      if (error) setMsg({ kind: /duplicate/i.test(error.message) ? 'warn' : 'error', text: /duplicate/i.test(error.message) ? 'Cet expert est déjà proposé.' : error.message }); else { setNote(''); setQ(''); setMsg({ kind: 'ok', text: 'Profil proposé : l\'auteur est prévenu.' }); load(); }
    }
    async function close() { await supabase.from('wanteds').update({ status: w.status === 'open' ? 'closed' : 'open' }).eq('id', w.id); load(); }
    const nm = (i) => (names[i] && names[i].display_name) || 'Membre TSAAK';
    return <div style={{ display: 'grid', gap: 20 }}>
      <Link href="/espace/wanted" style={{ color: '#94a3b8', fontSize: 14, textDecoration: 'none' }}>← Wanted</Link>
      <div style={{ ...card(colors.organisation), display: 'grid', gap: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}><h1 style={{ margin: 0, fontSize: 30 }}>{w.title}</h1><span style={{ color: w.status === 'open' ? C.ok : '#64748b', fontWeight: 800 }}>{w.status === 'open' ? 'Ouvert' : 'Clos'}</span></div>
        <div style={{ color: '#94a3b8', fontSize: 14 }}>Par {w.author_name} · publié le {fmtDate(w.created_at)}{w.deadline ? ` · échéance ${fmtDate(w.deadline)}` : ''}</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 12 }}>
          {[['Thème', w.theme], ['Cible', w.target], ['Angle', w.angle]].filter((x) => x[1]).map(([l, v]) => <div key={l}><div style={{ color: '#64748b', fontSize: 12 }}>{l}</div><b>{v}</b></div>)}
        </div>
        {w.brief && <p style={{ margin: 0, color: '#C9D4E4', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{w.brief}</p>}
        {w.is_author && <div><Btn ghostStyle small onClick={close}>{w.status === 'open' ? 'Clore ce Wanted' : 'Rouvrir'}</Btn></div>}
      </div>
      {msg && <Notice kind={msg.kind}>{msg.text}</Notice>}

      {!w.is_author && mineRecip && <div style={{ ...card('#FF4FD8'), display: 'grid', gap: 12 }}>
        <h2 style={{ margin: 0 }}>Ta réponse</h2>
        {mineRecip.status === 'interested' || mineRecip.status === 'declined' ? <p style={{ margin: 0, color: '#C9D4E4' }}>Tu as répondu : <b style={{ color: ST[mineRecip.status][1] }}>{ST[mineRecip.status][0]}</b>{mineRecip.response ? ` — « ${mineRecip.response} »` : ''}</p> : null}
        <Textarea rows={2} placeholder="Un mot pour l'auteur (facultatif)" value={resp} onChange={(e) => setResp(e.target.value)} maxLength={500} />
        <div><Btn tone={C.ok} onClick={() => answer('interested')}>Je suis partant</Btn><Btn ghostStyle onClick={() => answer('declined')}>Je décline</Btn></div>
        {mineRecip.status !== 'declined' && w.status === 'open' && <div style={{ display: 'grid', gap: 10, marginTop: 8 }}>
          <b>Proposer un expert</b>
          <Input placeholder="Chercher un expert (nom, compétence…)" value={q} onChange={(e) => setQ(e.target.value)} />
          <Input placeholder="Pourquoi lui/elle ? (facultatif)" value={note} onChange={(e) => setNote(e.target.value)} maxLength={300} />
          {found.map((e) => <div key={e.id} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: 10, borderRadius: 14, border: '1px solid rgba(255,255,255,.1)' }}><Avatar src={e.photo_url} name={e.display_name} size={40} /><div style={{ flex: 1, minWidth: 0 }}><b>{e.display_name}</b><div style={{ color: '#94a3b8', fontSize: 12 }}>{(e.skills || []).slice(0, 4).join(' · ')}</div></div><Btn small onClick={() => propose(e.id)}>Proposer</Btn></div>)}
        </div>}
      </div>}

      {w.is_author && <div style={card()}><h2 style={{ marginTop: 0 }}>Facilitateurs ({recips.length})</h2>
        <div style={{ display: 'grid', gap: 10 }}>{recips.map((r) => { const [l, c] = ST[r.status]; return <div key={r.recipient_id} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: 12, borderRadius: 14, border: '1px solid rgba(255,255,255,.1)', flexWrap: 'wrap' }}>
          <Avatar src={names[r.recipient_id] && names[r.recipient_id].photo_url} name={nm(r.recipient_id)} size={38} /><div style={{ flex: 1 }}><b>{nm(r.recipient_id)}</b>{r.response && <div style={{ color: '#C9D4E4', fontSize: 13 }}>« {r.response} »</div>}</div>
          <span style={{ color: c, fontWeight: 800, fontSize: 12, border: `1px solid ${c}66`, padding: '5px 10px', borderRadius: 999 }}>{l}</span></div>; })}</div></div>}

      {(w.is_author || props.some((p) => p.proposer_id === me)) && <div style={card(colors.talent)}><h2 style={{ marginTop: 0 }}>Profils proposés ({props.length})</h2>
        {props.length === 0 ? <p style={{ margin: 0, color: '#64748b' }}>Aucune proposition pour l'instant.</p> : <div style={{ display: 'grid', gap: 10 }}>{props.map((p) => <div key={p.id} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: 12, borderRadius: 14, border: '1px solid rgba(255,255,255,.1)', flexWrap: 'wrap' }}>
          <Avatar src={names[p.expert_id] && names[p.expert_id].photo_url} name={nm(p.expert_id)} size={44} />
          <div style={{ flex: 1, minWidth: 200 }}><Link href={`/espace/expert/${p.expert_id}`} style={{ color: '#fff', fontWeight: 800 }}>{nm(p.expert_id)}</Link><div style={{ color: '#94a3b8', fontSize: 13 }}>proposé par {nm(p.proposer_id)} · {fmtDateTime(p.created_at)}</div>{p.note && <div style={{ color: '#C9D4E4', fontSize: 13 }}>« {p.note} »</div>}</div>
          <Btn small href={`/espace/expert/${p.expert_id}`}>Voir la fiche</Btn></div>)}</div>}
      </div>}
    </div>;
  }}</Shell>;
}
