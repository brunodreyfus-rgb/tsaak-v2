import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../../lib/supabase';
import { casteOf, fmtDateTime } from '../../../lib/castes';
import { card } from '../../../components/RichDemoUI';
import { Shell, Btn, Avatar } from '../../../components/Espace';

export default function Messages() {
  const [convs, setConvs] = useState(null);
  const load = () => supabase.rpc('my_conversations').then(({ data }) => setConvs(data || []));
  useEffect(() => {
    load();
    const iv = setInterval(load, 15000);
    const ch = supabase.channel('inbox').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, load).subscribe();
    return () => { clearInterval(iv); supabase.removeChannel(ch); };
  }, []);
  return <Shell title="Messages">{() => <div style={{ display: 'grid', gap: 18 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 10 }}><div><h1 style={{ margin: 0, fontSize: 34 }}>Messages</h1><p style={{ color: '#94a3b8', margin: '6px 0 0' }}>Conversations privées. Pour écrire à plusieurs experts d'un coup, sélectionne-les dans la recherche.</p></div><Btn href="/espace/recherche" ghostStyle>Trouver quelqu'un</Btn></div>
    <div style={{ ...card(), display: 'grid', gap: 10 }}>
      {convs === null && <p style={{ color: '#64748b' }}>Chargement…</p>}
      {convs && convs.length === 0 && <p style={{ color: '#64748b', margin: 0 }}>Aucune conversation pour l'instant.</p>}
      {(convs || []).map((c) => <Link key={c.id} href={`/espace/messages/${c.id}`} style={{ textDecoration: 'none', color: '#fff', display: 'flex', gap: 14, alignItems: 'center', padding: 12, borderRadius: 16, border: '1px solid rgba(255,255,255,.08)', background: c.unread ? 'rgba(0,213,255,.08)' : 'transparent' }}>
        <Avatar src={c.peer_photo} name={c.peer_name} size={46} />
        <div style={{ flex: 1, minWidth: 0 }}><div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><b>{c.peer_name}</b>{c.peer_caste && <span style={{ fontSize: 11, color: casteOf(c.peer_caste).color }}>{casteOf(c.peer_caste).label}</span>}{c.unread && <span style={{ width: 8, height: 8, borderRadius: 4, background: '#FF2FD6' }} />}</div>
          {c.subject && <div style={{ fontSize: 13, color: '#C9D4E4' }}>{c.subject}</div>}
          <div style={{ color: '#94a3b8', fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.last_body}</div></div>
        <div style={{ color: '#64748b', fontSize: 12, flex: 'none' }}>{fmtDateTime(c.last_at)}</div></Link>)}
    </div>
  </div>}</Shell>;
}
