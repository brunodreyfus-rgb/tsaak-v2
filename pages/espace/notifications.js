import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';
import { fmtDateTime } from '../../lib/castes';
import { card } from '../../components/RichDemoUI';
import { Shell, Btn } from '../../components/Espace';

export default function Notifications() {
  const [items, setItems] = useState(null);
  const load = () => supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(100).then(({ data }) => setItems(data || []));
  useEffect(() => { load(); }, []);
  return <Shell title="Notifications">{({ refreshUnread }) => {
    async function readAll() { await supabase.from('notifications').update({ read_at: new Date().toISOString() }).is('read_at', null); await load(); refreshUnread(); }
    async function open(n) { if (!n.read_at) { await supabase.from('notifications').update({ read_at: new Date().toISOString() }).eq('id', n.id); refreshUnread(); } }
    return <div style={{ display: 'grid', gap: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}><h1 style={{ margin: 0, fontSize: 32 }}>Notifications</h1><Btn ghostStyle small onClick={readAll}>Tout marquer comme lu</Btn></div>
      <p style={{ color: '#94a3b8', margin: 0 }}>Les notifications restent dans TSAAK : pas d'email, SMS ni WhatsApp de relance automatique.</p>
      <div style={{ ...card(), display: 'grid', gap: 10 }}>
        {items === null && <p style={{ color: '#64748b' }}>Chargement…</p>}
        {items && items.length === 0 && <p style={{ color: '#64748b', margin: 0 }}>Aucune notification.</p>}
        {(items || []).map((n) => <Link key={n.id} href={n.link || '/espace'} onClick={() => open(n)} style={{ textDecoration: 'none', color: '#fff', padding: 14, borderRadius: 14, background: n.read_at ? 'transparent' : 'rgba(0,213,255,.08)', border: '1px solid rgba(255,255,255,.08)' }}>
          <b>{n.title}</b><div style={{ color: '#94a3b8', fontSize: 14 }}>{n.body}</div><div style={{ color: '#64748b', fontSize: 12 }}>{fmtDateTime(n.created_at)}</div></Link>)}
      </div>
    </div>;
  }}</Shell>;
}
