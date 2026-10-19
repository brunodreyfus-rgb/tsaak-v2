import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';
import { casteOf, fmtDateTime } from '../../lib/castes';
import { card, colors } from '../../components/RichDemoUI';
import { Shell, Btn, Notice, Avatar, C } from '../../components/Espace';

function Checklist({ p, proofCount }) {
  const items = [
    ['Photo de profil', Boolean(p.photo_url)],
    ['Titre / accroche', Boolean(p.headline)],
    [p.caste === 'expert' ? 'Compétences clés' : 'Spécialités', (p.skills || []).length > 0],
    ...(p.caste === 'expert' ? [['Au moins une preuve média', proofCount > 0], ['Calendrier tenu à jour', p.calendar_active]] : []),
    ['Profil publié', p.published],
  ];
  const done = items.filter((i) => i[1]).length;
  if (done === items.length) return null;
  return <div style={{ ...card(colors.organisation) }}>
    <h2 style={{ marginTop: 0 }}>Termine ton profil <span style={{ color: '#94a3b8', fontSize: 15 }}>({done}/{items.length})</span></h2>
    <div style={{ display: 'grid', gap: 8 }}>{items.map(([l, ok]) => <div key={l} style={{ color: ok ? C.ok : '#C9D4E4' }}>{ok ? '✔' : '○'} {l}</div>)}</div>
    <Btn href="/espace/profil" tone={colors.organisation}>Compléter mon profil</Btn>
  </div>;
}

export default function Dashboard() {
  const [notifs, setNotifs] = useState([]); const [stats, setStats] = useState({ proofs: 0, unreadConvs: 0, wanted: 0, invited: 0, shortlist: 0 });
  useEffect(() => {
    (async () => {
      const [n, pr, cv, w, rw, inv, sl] = await Promise.all([
        supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(6),
        supabase.from('media_proofs').select('id', { count: 'exact', head: true }),
        supabase.rpc('my_conversations'),
        supabase.from('wanteds').select('id', { count: 'exact', head: true }).eq('status', 'open'),
        supabase.rpc('my_received_wanteds'),
        supabase.from('invitations').select('id', { count: 'exact', head: true }).eq('status', 'accepted'),
        supabase.from('shortlists').select('expert_id', { count: 'exact', head: true }),
      ]);
      setNotifs(n.data || []);
      setStats({ proofs: pr.count || 0, unreadConvs: (cv.data || []).filter((c) => c.unread).length, wanted: (w.count || 0) + (rw.data || []).filter((r) => r.my_status === 'sent').length, invited: inv.count || 0, shortlist: sl.count || 0 });
    })();
  }, []);
  return <Shell title="Tableau de bord">{(auth) => {
    const p = auth.profile; const ct = casteOf(p.caste);
    const tiles = [
      ['Messages non lus', stats.unreadConvs, '/espace/messages', '#FF4FD8'],
      [p.caste === 'intermediaire' ? 'Wanted à traiter' : 'Wanted ouverts', stats.wanted, '/espace/wanted', '#FFB020'],
      ...(p.caste !== 'expert' ? [['Shortlist', stats.shortlist, '/espace/shortlist', '#7CFFB2']] : [['Preuves média', stats.proofs, '/espace/profil', '#00D5FF']]),
      ['Membres arrivés grâce à moi', stats.invited, '/espace/inviter', '#B26BFF'],
    ];
    return <div style={{ display: 'grid', gap: 22 }}>
      <div style={{ display: 'flex', gap: 18, alignItems: 'center', flexWrap: 'wrap' }}>
        <Avatar src={p.photo_url} name={p.display_name} size={72} />
        <div><div style={{ color: ct.color, fontWeight: 900, fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase' }}>{ct.emoji} {ct.label}</div>
          <h1 style={{ margin: '4px 0 0', fontSize: 34 }}>Salut {String(p.display_name || '').split(' ')[0] || ''} 👋</h1></div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(210px,1fr))', gap: 16 }}>
        {tiles.map(([l, v, href, c]) => <Link key={l} href={href} style={{ ...card(c), textDecoration: 'none', color: '#fff', display: 'block' }}><div style={{ color: '#94a3b8', fontSize: 13 }}>{l}</div><div style={{ fontSize: 38, fontWeight: 900, color: c }}>{v}</div></Link>)}
      </div>
      <Checklist p={p} proofCount={stats.proofs} />
      <div style={{ ...card() }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><h2 style={{ margin: 0 }}>Dernières notifications</h2><Link href="/espace/notifications" style={{ color: colors.media, fontSize: 14 }}>Tout voir</Link></div>
        {notifs.length === 0 ? <p style={{ color: '#64748b' }}>Rien pour l'instant. Invite tes premiers contacts pour animer la plateforme.</p> :
          <div style={{ display: 'grid', gap: 10, marginTop: 14 }}>{notifs.map((n) => <Link key={n.id} href={n.link || '/espace'} style={{ textDecoration: 'none', color: '#fff', padding: 12, borderRadius: 14, background: n.read_at ? 'transparent' : 'rgba(0,213,255,.08)', border: '1px solid rgba(255,255,255,.08)' }}>
            <b>{n.title}</b><div style={{ color: '#94a3b8', fontSize: 13 }}>{n.body}</div><div style={{ color: '#64748b', fontSize: 11 }}>{fmtDateTime(n.created_at)}</div></Link>)}</div>}
      </div>
      <div style={{ ...card('#B26BFF') }}><h2 style={{ marginTop: 0 }}>Fais grandir TSAAK</h2><p style={{ color: '#C9D4E4' }}>Invite des experts, facilitateurs, médias ou organisations : chacun reçoit un lien personnel pour créer son profil.</p><Btn href="/espace/inviter" tone="#B26BFF">Inviter quelqu'un</Btn></div>
    </div>;
  }}</Shell>;
}
