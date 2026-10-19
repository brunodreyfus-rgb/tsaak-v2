import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabase } from '../../../lib/supabase';
import { fmtDateTime, casteOf } from '../../../lib/castes';
import { card, colors } from '../../../components/RichDemoUI';
import { Shell, Btn, Avatar, Notice, Textarea } from '../../../components/Espace';

export default function Thread() {
  const router = useRouter(); const id = router.query.id;
  const [msgs, setMsgs] = useState([]); const [peer, setPeer] = useState(undefined); const [body, setBody] = useState(''); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  const endRef = useRef(null);

  const markRead = useCallback(() => { if (id) supabase.from('conversation_members').update({ last_read_at: new Date().toISOString() }).eq('conversation_id', id).then(() => {}); }, [id]);
  const load = useCallback(async () => {
    if (!id) return;
    const { data } = await supabase.from('messages').select('id,sender_id,body,created_at').eq('conversation_id', id).order('created_at');
    setMsgs(data || []); markRead();
  }, [id, markRead]);

  useEffect(() => {
    if (!id) return;
    supabase.rpc('my_conversations').then(({ data }) => setPeer((data || []).find((c) => c.id === id) || null));
    load();
    const iv = setInterval(load, 10000);
    const ch = supabase.channel('thread-' + id).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${id}` }, load).subscribe();
    return () => { clearInterval(iv); supabase.removeChannel(ch); };
  }, [id, load]);
  useEffect(() => { if (endRef.current) endRef.current.scrollIntoView({ block: 'end' }); }, [msgs.length]);

  return <Shell title="Conversation">{(auth) => {
    const me = auth.profile.id;
    async function send(e) {
      e.preventDefault(); if (!body.trim()) return; setBusy(true); setErr('');
      const { error } = await supabase.from('messages').insert({ conversation_id: id, sender_id: me, body: body.trim() });
      setBusy(false); if (error) setErr(error.message); else { setBody(''); load(); }
    }
    if (peer === null) return <div style={card()}><h2 style={{ marginTop: 0 }}>Conversation introuvable</h2><Btn href="/espace/messages">Retour aux messages</Btn></div>;
    return <div style={{ display: 'grid', gap: 16, maxWidth: 820 }}>
      <Link href="/espace/messages" style={{ color: '#94a3b8', fontSize: 14, textDecoration: 'none' }}>← Messages</Link>
      {peer && <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}><Avatar src={peer.peer_photo} name={peer.peer_name} size={52} /><div><h1 style={{ margin: 0, fontSize: 26 }}>{peer.peer_name}</h1><div style={{ color: casteOf(peer.peer_caste).color, fontSize: 13 }}>{casteOf(peer.peer_caste).label}{peer.subject ? ` · ${peer.subject}` : ''}</div></div></div>}
      <div style={{ ...card(), display: 'grid', gap: 10, minHeight: 280, maxHeight: '55vh', overflowY: 'auto', alignContent: 'start' }}>
        {msgs.length === 0 && <p style={{ color: '#64748b' }}>Aucun message.</p>}
        {msgs.map((m) => { const mine = m.sender_id === me; return <div key={m.id} style={{ justifySelf: mine ? 'end' : 'start', maxWidth: '78%' }}>
          <div style={{ padding: '10px 14px', borderRadius: 16, whiteSpace: 'pre-wrap', wordBreak: 'break-word', background: mine ? 'linear-gradient(135deg,#00D5FF55,#FF2FD633)' : 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.1)' }}>{m.body}</div>
          <div style={{ fontSize: 11, color: '#64748b', textAlign: mine ? 'right' : 'left', marginTop: 3 }}>{fmtDateTime(m.created_at)}</div></div>; })}
        <div ref={endRef} />
      </div>
      {err && <Notice kind="error">{err}</Notice>}
      <form onSubmit={send} style={{ display: 'grid', gap: 10 }}>
        <Textarea rows={3} placeholder="Ton message…" value={body} onChange={(e) => setBody(e.target.value)} maxLength={5000} onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) send(e); }} />
        <div><Btn type="submit" disabled={busy || !body.trim()}>{busy ? 'Envoi…' : 'Envoyer'}</Btn> <span style={{ color: '#64748b', fontSize: 12 }}>Ctrl/Cmd + Entrée pour envoyer</span></div>
      </form>
    </div>;
  }}</Shell>;
}
