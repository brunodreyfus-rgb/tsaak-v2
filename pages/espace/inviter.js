import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import { callApi } from '../../lib/useAuth';
import { CASTE_LIST, casteOf, INVITE_STATUS, inviteLink, fmtDate, parseInviteLine, EMAIL_RE } from '../../lib/castes';
import { card, colors } from '../../components/RichDemoUI';
import { Shell, Notice, Btn, Input, Textarea, Label, C } from '../../components/Espace';

function Row({ inv, onChanged }) {
  const ct = casteOf(inv.caste); const [busy, setBusy] = useState(false); const [note, setNote] = useState(null);
  const link = inviteLink(inv.token); const active = inv.status === 'pending' || inv.status === 'sent';
  const text = `Je t'invite à rejoindre TSAAK (${ct.label.toLowerCase()}) : ${link}`;
  async function copy() { try { await navigator.clipboard.writeText(link); setNote({ kind: 'ok', text: 'Lien copié' }); } catch { setNote({ kind: 'warn', text: link }); } }
  async function send() {
    setBusy(true); setNote(null);
    try { await callApi('/api/invite-email', { invitation_id: inv.id }); setNote({ kind: 'ok', text: 'Email envoyé' }); onChanged(); }
    catch (e) { setNote({ kind: 'error', text: e.message }); }
    setBusy(false);
  }
  async function revoke() { setBusy(true); await supabase.from('invitations').update({ status: 'revoked' }).eq('id', inv.id); setBusy(false); onChanged(); }
  const stColor = inv.status === 'accepted' ? C.ok : inv.status === 'revoked' ? '#64748b' : inv.status === 'sent' ? colors.media : C.warn;
  return <div style={{ padding: 14, borderRadius: 16, border: '1px solid rgba(255,255,255,.1)', background: 'rgba(255,255,255,.035)', display: 'grid', gap: 10 }}>
    <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}>
      <div><b>{inv.name || inv.email || 'Invitation sans nom'}</b> <span style={{ color: ct.color, fontSize: 13 }}>{ct.emoji} {ct.label}</span>
        <div style={{ color: '#94a3b8', fontSize: 13 }}>{[inv.email, fmtDate(inv.created_at)].filter(Boolean).join(' · ')}</div></div>
      <span style={{ fontSize: 12, fontWeight: 800, color: stColor, border: `1px solid ${stColor}66`, padding: '5px 10px', borderRadius: 999 }}>{INVITE_STATUS[inv.status]}</span>
    </div>
    {active && <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <Btn small ghostStyle onClick={copy}>Copier le lien</Btn>
      <a href={`https://wa.me/?text=${encodeURIComponent(text)}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}><span style={{ display: 'inline-block', padding: '8px 13px', borderRadius: 999, border: '1px solid #25D36688', color: '#fff', fontSize: 13, fontWeight: 800 }}>WhatsApp</span></a>
      <a href={`mailto:${inv.email || ''}?subject=${encodeURIComponent('Invitation TSAAK')}&body=${encodeURIComponent(text)}`} style={{ textDecoration: 'none' }}><span style={{ display: 'inline-block', padding: '8px 13px', borderRadius: 999, border: '1px solid rgba(255,255,255,.25)', color: '#fff', fontSize: 13, fontWeight: 800 }}>Mon mail</span></a>
      {inv.email && <Btn small onClick={send} disabled={busy}>{inv.status === 'sent' ? 'Renvoyer par TSAAK' : 'Envoyer par TSAAK'}</Btn>}
      <Btn small ghostStyle onClick={revoke} disabled={busy}>Annuler</Btn>
    </div>}
    {note && <Notice kind={note.kind}>{note.text}</Notice>}
  </div>;
}

export default function Inviter() {
  const router = useRouter();
  const [list, setList] = useState(null); const [mode, setMode] = useState('one'); const [caste, setCaste] = useState('expert');
  const [one, setOne] = useState({ name: '', email: '', message: '' }); const [bulk, setBulk] = useState('');
  const [busy, setBusy] = useState(false); const [msg, setMsg] = useState(null);
  const load = useCallback(() => supabase.from('invitations').select('*').order('created_at', { ascending: false }).limit(200).then(({ data }) => setList(data || [])), []);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { const c = router.query.caste; if (typeof c === 'string' && ['expert', 'intermediaire', 'media', 'organisation'].includes(c)) setCaste(c); }, [router.query.caste]);

  return <Shell title="Inviter">{(auth) => {
    async function create(e) {
      e.preventDefault(); setMsg(null);
      let rows;
      if (mode === 'one') {
        const email = one.email.trim().toLowerCase();
        if (email && !EMAIL_RE.test(email)) { setMsg({ kind: 'error', text: 'Adresse email invalide.' }); return; }
        rows = [{ name: one.name.trim(), email: email || null }];
      } else {
        const parsed = bulk.split('\n').map(parseInviteLine).filter(Boolean);
        if (!parsed.length) { setMsg({ kind: 'error', text: 'Colle au moins une ligne.' }); return; }
        if (parsed.length > 40) { setMsg({ kind: 'error', text: '40 invitations à la fois maximum.' }); return; }
        rows = parsed.map((r) => ({ name: r.name, email: r.email || null }));
      }
      setBusy(true);
      const { data, error } = await supabase.from('invitations').insert(rows.map((r) => ({ inviter_id: auth.profile.id, caste, name: r.name, email: r.email, message: one.message.trim().slice(0, 500) }))).select('id,email');
      if (error) { setBusy(false); setMsg({ kind: 'error', text: error.message }); return; }
      // Envoi automatique par email si une adresse est fournie et que l'envoi est configuré
      let sent = 0; let mailNote = '';
      for (const r of (data || []).filter((x) => x.email)) { try { await callApi('/api/invite-email', { invitation_id: r.id }); sent++; } catch (er) { mailNote = er.message; if (er.manual) break; } }
      setBusy(false);
      setMsg({ kind: 'ok', text: `${data.length} invitation(s) créée(s)${sent ? `, ${sent} email(s) envoyé(s)` : ''}.` + (mailNote ? ` Email : ${mailNote.replace(/\.$/, '')}.` : '') + ' Tu peux aussi copier le lien ci-dessous.' });
      setOne({ name: '', email: '', message: one.message }); setBulk(''); load();
    }
    const ct = casteOf(caste);
    const acc = (list || []).filter((i) => i.status === 'accepted').length;
    return <div style={{ display: 'grid', gap: 22 }}>
      <div><h1 style={{ margin: 0, fontSize: 34 }}>Inviter sur TSAAK</h1><p style={{ color: '#94a3b8', margin: '6px 0 0' }}>Chaque invitation est un lien personnel : la personne crée son compte avec le bon type de profil. Inscription uniquement sur invitation.</p></div>
      <form onSubmit={create} style={{ ...card(ct.color), display: 'grid', gap: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 10 }}>
          {CASTE_LIST.map((c) => <button type="button" key={c.key} onClick={() => setCaste(c.key)} style={{ textAlign: 'left', cursor: 'pointer', padding: 14, borderRadius: 16, color: '#fff', fontFamily: 'inherit', border: `1px solid ${caste === c.key ? c.color : 'rgba(255,255,255,.14)'}`, background: caste === c.key ? `${c.color}22` : 'rgba(255,255,255,.03)' }}>
            <div style={{ fontWeight: 900, color: c.color }}>{c.emoji} {c.label}</div><div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>{c.blurb}</div></button>)}
        </div>
        <div style={{ display: 'flex', gap: 8 }}><Btn small ghostStyle={mode !== 'one'} onClick={() => setMode('one')} tone={ct.color}>Une personne</Btn><Btn small ghostStyle={mode !== 'bulk'} onClick={() => setMode('bulk')} tone={ct.color}>Plusieurs d'un coup</Btn></div>
        {msg && <Notice kind={msg.kind}>{msg.text}</Notice>}
        {mode === 'one' ? <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 14 }}>
          <Label text="Nom" hint="facultatif"><Input value={one.name} onChange={(e) => setOne({ ...one, name: e.target.value })} maxLength={80} /></Label>
          <Label text="Email" hint="facultatif — sans email, tu récupères juste le lien"><Input type="email" value={one.email} onChange={(e) => setOne({ ...one, email: e.target.value })} /></Label>
        </div> : <Label text="Une personne par ligne" hint="« Nom <email> », « email » ou simplement un nom"><Textarea rows={6} value={bulk} onChange={(e) => setBulk(e.target.value)} placeholder={'Marie Durand <marie@exemple.fr>\njean@exemple.fr\nAlex Martin'} /></Label>}
        <Label text="Petit mot" hint="facultatif, affiché sur la page d'invitation et dans l'email"><Textarea rows={2} value={one.message} onChange={(e) => setOne({ ...one, message: e.target.value })} maxLength={500} /></Label>
        <div><Btn type="submit" tone={ct.color} disabled={busy}>{busy ? 'Création…' : mode === 'bulk' ? 'Créer les invitations' : 'Créer l\'invitation'}</Btn></div>
      </form>
      <div style={{ ...card() }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}><h2 style={{ margin: 0 }}>Mes invitations</h2><span style={{ color: '#94a3b8' }}>{list ? `${list.length} envoyée(s) · ${acc} acceptée(s)` : ''}</span></div>
        <div style={{ display: 'grid', gap: 12, marginTop: 14 }}>
          {list === null && <p style={{ color: '#64748b' }}>Chargement…</p>}
          {list && list.length === 0 && <p style={{ color: '#64748b', margin: 0 }}>Aucune invitation pour l'instant.</p>}
          {(list || []).map((inv) => <Row key={inv.id} inv={inv} onChanged={load} />)}
        </div>
      </div>
    </div>;
  }}</Shell>;
}
