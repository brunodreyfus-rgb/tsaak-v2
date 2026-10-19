import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import { isoDay, cleanTags } from '../../lib/castes';
import { card, colors, Chip } from '../../components/RichDemoUI';
import { Shell, Notice, Btn, Input, Textarea, Label, TagInput } from '../../components/Espace';
import ExpertCard from '../../components/ExpertCard';

function BroadcastBox({ ids, names, onClose, onSent }) {
  const [subject, setSubject] = useState(''); const [body, setBody] = useState(''); const [busy, setBusy] = useState(false); const [msg, setMsg] = useState(null);
  async function send() {
    if (!body.trim()) { setMsg({ kind: 'error', text: 'Écris ton message.' }); return; }
    setBusy(true); setMsg(null);
    const { data, error } = await supabase.rpc('send_broadcast', { p_recipients: ids, p_subject: subject.trim(), p_body: body.trim() });
    setBusy(false);
    if (error) setMsg({ kind: 'error', text: error.message }); else onSent(data);
  }
  return <div style={{ ...card(colors.core), display: 'grid', gap: 12, position: 'sticky', bottom: 14, zIndex: 10, background: '#0b0f1c' }}>
    <b>Écrire à {ids.length} expert(s) : {names.slice(0, 4).join(', ')}{names.length > 4 ? '…' : ''}</b>
    <p style={{ margin: 0, color: '#94a3b8', fontSize: 13 }}>Multi-messaging : chaque expert reçoit ton message dans une conversation privée. Les destinataires ne se voient pas entre eux.</p>
    {msg && <Notice kind={msg.kind}>{msg.text}</Notice>}
    <Input placeholder="Objet (ex. Invité(e) sur notre plateau le 20)" value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={120} />
    <Textarea rows={4} placeholder="Ton message…" value={body} onChange={(e) => setBody(e.target.value)} maxLength={5000} />
    <div><Btn onClick={send} disabled={busy}>{busy ? 'Envoi…' : `Envoyer à ${ids.length}`}</Btn><Btn ghostStyle onClick={onClose}>Annuler</Btn></div>
  </div>;
}

export default function Recherche() {
  const router = useRouter();
  const [q, setQ] = useState(''); const [skills, setSkills] = useState([]); const [day, setDay] = useState(''); const [showBusy, setShowBusy] = useState(false);
  const [rows, setRows] = useState(null); const [err, setErr] = useState(''); const [short, setShort] = useState(new Set());
  const [sel, setSel] = useState(new Set()); const [compose, setCompose] = useState(false); const [done, setDone] = useState(null);
  const today = isoDay(new Date());

  const run = useCallback(async () => {
    setErr('');
    const { data, error } = await supabase.rpc('search_experts', { p_q: q.trim() || null, p_skills: skills.length ? skills : null, p_day: day || null, p_include_busy: showBusy });
    if (error) { setErr(error.message); setRows([]); } else setRows(data || []);
  }, [q, skills, day, showBusy]);
  useEffect(() => { const t = setTimeout(run, 250); return () => clearTimeout(t); }, [run]);
  useEffect(() => { supabase.from('shortlists').select('expert_id').then(({ data }) => setShort(new Set((data || []).map((r) => r.expert_id)))); }, []);
  useEffect(() => { if (typeof router.query.q === 'string') setQ(router.query.q); }, [router.query.q]);

  const topSkills = useMemo(() => { const m = new Map(); (rows || []).forEach((r) => (r.skills || []).forEach((s) => m.set(s, (m.get(s) || 0) + 1))); return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10).map((x) => x[0]); }, [rows]);

  return <Shell title="Recherche" wide>{(auth) => {
    const me = auth.profile.id;
    async function toggleShort(id) {
      const has = short.has(id); const next = new Set(short); has ? next.delete(id) : next.add(id); setShort(next);
      const { error } = has ? await supabase.from('shortlists').delete().eq('owner_id', me).eq('expert_id', id) : await supabase.from('shortlists').insert({ owner_id: me, expert_id: id });
      if (error) { setErr(error.message); setShort(short); }
    }
    const toggleSel = (id) => { const n = new Set(sel); n.has(id) ? n.delete(id) : n.add(id); setSel(n); setDone(null); };
    const selRows = (rows || []).filter((r) => sel.has(r.id) && r.id !== me);
    return <div style={{ display: 'grid', gap: 20 }}>
      <div><h1 style={{ margin: 0, fontSize: 34 }}>Recherche d'experts</h1><p style={{ color: '#94a3b8', margin: '6px 0 0' }}>Compétences, sujet, disponibilité. Un expert sans calendrier reste affiché avec « Vérifier la dispo ».</p></div>
      <div style={{ ...card(colors.media), display: 'grid', gap: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 14 }}>
          <Label text="Sujet, nom, mot-clé"><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ex. intelligence artificielle santé" /></Label>
          <Label text="Disponible le"><Input type="date" min={today} value={day} onChange={(e) => setDay(e.target.value)} /></Label>
        </div>
        <Label text="Compétences" hint="un expert doit en avoir au moins une"><TagInput value={skills} onChange={setSkills} c={colors.talent} placeholder="Ajouter une compétence" suggestions={topSkills} /></Label>
        {day && <label style={{ display: 'flex', gap: 10, alignItems: 'center', color: '#C9D4E4', fontSize: 14 }}><input type="checkbox" checked={showBusy} onChange={(e) => setShowBusy(e.target.checked)} /> Afficher aussi les experts indisponibles ce jour-là</label>}
      </div>
      {err && <Notice kind="error">{err}</Notice>}
      {done != null && <Notice kind="ok">Message envoyé à {done} expert(s). Retrouve les réponses dans <a href="/espace/messages" style={{ color: '#fff' }}>Messages</a>.</Notice>}
      <div style={{ color: '#94a3b8', fontSize: 14 }}>{rows === null ? 'Recherche…' : `${rows.length} expert(s)`}{sel.size > 0 && ` · ${sel.size} sélectionné(s)`}</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(310px,1fr))', gap: 18 }}>
        {(rows || []).map((e) => <ExpertCard key={e.id} e={e} selected={sel.has(e.id)} onSelect={e.id !== me ? toggleSel : undefined} inShortlist={short.has(e.id)} onShortlist={e.id !== me ? toggleShort : undefined} />)}
      </div>
      {rows && rows.length === 0 && <div style={{ ...card() }}><p style={{ margin: 0, color: '#C9D4E4' }}>Aucun expert ne correspond pour l'instant. La plateforme se remplit au fil des invitations : <a href="/espace/inviter?caste=expert" style={{ color: colors.media }}>invite des experts</a>.</p></div>}
      {selRows.length > 0 && !compose && <div style={{ position: 'sticky', bottom: 14, zIndex: 10 }}><div style={{ ...card(colors.core), background: '#0b0f1c', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}><b>{selRows.length} sélectionné(s)</b><Btn onClick={() => setCompose(true)}>Écrire à la sélection</Btn><Btn ghostStyle onClick={() => setSel(new Set())}>Tout désélectionner</Btn></div></div>}
      {selRows.length > 0 && compose && <BroadcastBox ids={selRows.map((r) => r.id)} names={selRows.map((r) => r.display_name)} onClose={() => setCompose(false)} onSent={(n) => { setDone(n); setCompose(false); setSel(new Set()); }} />}
    </div>;
  }}</Shell>;
}
