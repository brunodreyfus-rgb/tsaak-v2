import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabase } from '../../../lib/supabase';
import { casteOf, fmtDate } from '../../../lib/castes';
import { card, colors, Chip } from '../../../components/RichDemoUI';
import { Shell, Notice, Btn, Input, Textarea, Label, Avatar, C } from '../../../components/Espace';

function NewWanted({ me, onCreated }) {
  const [f, setF] = useState({ title: '', theme: '', target: '', angle: '', brief: '', deadline: '' });
  const [inter, setInter] = useState(null); const [sel, setSel] = useState(new Set()); const [filter, setFilter] = useState('');
  const [busy, setBusy] = useState(false); const [msg, setMsg] = useState(null);
  useEffect(() => { supabase.from('profiles').select('id,display_name,headline,photo_url,skills').eq('caste', 'intermediaire').eq('published', true).order('display_name').then(({ data }) => setInter(data || [])); }, []);
  const shown = (inter || []).filter((i) => !filter.trim() || [i.display_name, i.headline, ...(i.skills || [])].join(' ').toLowerCase().includes(filter.trim().toLowerCase()));
  const toggle = (id) => { const n = new Set(sel); n.has(id) ? n.delete(id) : n.add(id); setSel(n); };
  async function submit(e) {
    e.preventDefault(); setMsg(null);
    if (!f.title.trim()) { setMsg({ kind: 'error', text: 'Donne un titre à ton besoin.' }); return; }
    if (!sel.size) { setMsg({ kind: 'error', text: 'Choisis au moins un intermédiaire.' }); return; }
    setBusy(true);
    const { data, error } = await supabase.rpc('send_wanted', { p_title: f.title, p_theme: f.theme, p_target: f.target, p_angle: f.angle, p_brief: f.brief, p_deadline: f.deadline || null, p_recipients: [...sel] });
    setBusy(false);
    if (error) setMsg({ kind: 'error', text: error.message }); else onCreated(data);
  }
  return <form onSubmit={submit} style={{ ...card(colors.organisation), display: 'grid', gap: 16 }}>
    <h2 style={{ margin: 0 }}>Nouveau Wanted</h2>
    <p style={{ margin: 0, color: '#94a3b8', fontSize: 14 }}>Décris le profil que tu cherches : il est poussé à des intermédiaires que tu choisis, qui te répondent ou te proposent des experts.</p>
    {msg && <Notice kind={msg.kind}>{msg.text}</Notice>}
    <Label text="Titre"><Input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} maxLength={140} placeholder="Ex. Un expert IA pour le 20h de jeudi" /></Label>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 14 }}>
      <Label text="Thème"><Input value={f.theme} onChange={(e) => setF({ ...f, theme: e.target.value })} maxLength={80} /></Label>
      <Label text="Cible / public"><Input value={f.target} onChange={(e) => setF({ ...f, target: e.target.value })} maxLength={80} /></Label>
      <Label text="Angle"><Input value={f.angle} onChange={(e) => setF({ ...f, angle: e.target.value })} maxLength={120} /></Label>
      <Label text="Échéance" hint="facultatif"><Input type="date" value={f.deadline} onChange={(e) => setF({ ...f, deadline: e.target.value })} /></Label>
    </div>
    <Label text="Détails" hint="format, durée, contraintes"><Textarea rows={4} value={f.brief} onChange={(e) => setF({ ...f, brief: e.target.value })} maxLength={3000} /></Label>
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
        <b>Pousser à des intermédiaires ({sel.size} choisi{sel.size > 1 ? 's' : ''})</b>
        <div style={{ display: 'flex', gap: 8 }}><Input style={{ width: 200, padding: '9px 12px' }} placeholder="Filtrer…" value={filter} onChange={(e) => setFilter(e.target.value)} /><Btn small ghostStyle onClick={() => setSel(new Set(shown.map((i) => i.id)))}>Tout choisir</Btn></div>
      </div>
      {inter === null && <p style={{ color: '#64748b' }}>Chargement…</p>}
      {inter && inter.length === 0 && <Notice kind="warn">Aucun intermédiaire n'a encore publié son profil. <Link href="/espace/inviter?caste=intermediaire" style={{ color: '#fff' }}>Invite des intermédiaires</Link> pour pouvoir envoyer un Wanted.</Notice>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 10 }}>
        {shown.map((i) => <label key={i.id} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: 12, borderRadius: 14, cursor: 'pointer', border: `1px solid ${sel.has(i.id) ? '#FF4FD8' : 'rgba(255,255,255,.12)'}`, background: sel.has(i.id) ? 'rgba(255,79,216,.12)' : 'rgba(255,255,255,.03)' }}>
          <input type="checkbox" checked={sel.has(i.id)} onChange={() => toggle(i.id)} /><Avatar src={i.photo_url} name={i.display_name} size={38} />
          <div style={{ minWidth: 0 }}><b>{i.display_name}</b><div style={{ color: '#94a3b8', fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{i.headline || (i.skills || []).join(', ')}</div></div></label>)}
      </div>
    </div>
    <div><Btn type="submit" tone={colors.organisation} disabled={busy}>{busy ? 'Envoi…' : `Publier et pousser à ${sel.size || '…'} intermédiaire(s)`}</Btn></div>
    <p style={{ margin: 0, color: '#64748b', fontSize: 12 }}>Les intermédiaires sont prévenus dans TSAAK uniquement (pas d'email ni de relance automatique).</p>
  </form>;
}

export default function WantedIndex() {
  const router = useRouter();
  const [mine, setMine] = useState(null); const [recv, setRecv] = useState(null); const [form, setForm] = useState(false);
  const load = () => Promise.all([supabase.from('wanteds').select('id,title,theme,deadline,status,created_at,author_id').order('created_at', { ascending: false }), supabase.rpc('my_received_wanteds')]).then(([a, b]) => { setMine(a.data || []); setRecv(b.data || []); });
  useEffect(() => { load(); }, []);
  return <Shell title="Wanted">{(auth) => {
    const me = auth.profile.id; const sent = (mine || []).filter((w) => w.author_id === me);
    return <div style={{ display: 'grid', gap: 22 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
        <div><h1 style={{ margin: 0, fontSize: 34 }}>Wanted</h1><p style={{ color: '#94a3b8', margin: '6px 0 0' }}>{auth.canWanted ? 'Publie un besoin et pousse-le à des intermédiaires.' : auth.profile.caste === 'intermediaire' ? 'Les besoins que médias et organisations te poussent.' : 'Les Wanted sont publiés par les médias et les organisations, puis poussés aux intermédiaires.'}</p></div>
        {auth.canWanted && !form && <Btn onClick={() => setForm(true)} tone={colors.organisation}>+ Nouveau Wanted</Btn>}
      </div>
      {auth.canWanted && form && <NewWanted me={me} onCreated={(id) => router.push('/espace/wanted/' + id)} />}
      {auth.canWanted && <div style={card()}><h2 style={{ marginTop: 0 }}>Mes Wanted</h2>
        {mine === null ? <p style={{ color: '#64748b' }}>Chargement…</p> : sent.length === 0 ? <p style={{ color: '#64748b', margin: 0 }}>Aucun Wanted publié.</p> :
          <div style={{ display: 'grid', gap: 10 }}>{sent.map((w) => <Link key={w.id} href={`/espace/wanted/${w.id}`} style={{ textDecoration: 'none', color: '#fff', padding: 14, borderRadius: 14, border: '1px solid rgba(255,255,255,.1)', display: 'flex', justifyContent: 'space-between', gap: 10 }}><span><b>{w.title}</b><div style={{ color: '#94a3b8', fontSize: 13 }}>{[w.theme, fmtDate(w.created_at)].filter(Boolean).join(' · ')}</div></span><span style={{ color: w.status === 'open' ? C.ok : '#64748b', fontSize: 12, fontWeight: 800 }}>{w.status === 'open' ? 'Ouvert' : 'Clos'}</span></Link>)}</div>}
      </div>}
      {(auth.profile.caste === 'intermediaire' || (recv || []).length > 0) && <div style={card('#FF4FD8')}><h2 style={{ marginTop: 0 }}>Wanted reçus</h2>
        {recv === null ? <p style={{ color: '#64748b' }}>Chargement…</p> : recv.length === 0 ? <p style={{ color: '#64748b', margin: 0 }}>Rien pour l'instant. Pense à publier ton profil pour être trouvé.</p> :
          <div style={{ display: 'grid', gap: 10 }}>{recv.map((w) => <Link key={w.id} href={`/espace/wanted/${w.id}`} style={{ textDecoration: 'none', color: '#fff', padding: 14, borderRadius: 14, border: '1px solid rgba(255,255,255,.1)', background: w.my_status === 'sent' ? 'rgba(255,79,216,.1)' : 'transparent', display: 'flex', justifyContent: 'space-between', gap: 10 }}><span><b>{w.title}</b><div style={{ color: '#94a3b8', fontSize: 13 }}>{[w.author_name, w.theme, fmtDate(w.created_at)].filter(Boolean).join(' · ')}</div></span><span style={{ fontSize: 12, fontWeight: 800, color: w.my_status === 'interested' ? C.ok : w.my_status === 'declined' ? '#64748b' : C.warn }}>{{ sent: 'À traiter', seen: 'Vu', interested: 'Partant', declined: 'Décliné' }[w.my_status]}</span></Link>)}</div>}
      </div>}
    </div>;
  }}</Shell>;
}
