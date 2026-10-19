import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabase } from '../../../lib/supabase';
import { PROFILE_COLS } from '../../../lib/useAuth';
import { casteOf, fmtDate, isoDay, wordCloudOf } from '../../../lib/castes';
import { card, colors, Badge, GameGauges, WordCloud, SkillChips, AvailabilityBadge, tierFor } from '../../../components/RichDemoUI';
import { Shell, Notice, Btn, Input, Textarea, Avatar, C } from '../../../components/Espace';
import CalendarEditor from '../../../components/CalendarEditor';

export default function ExpertPage() {
  const router = useRouter(); const id = router.query.id;
  const [p, setP] = useState(undefined); const [proofs, setProofs] = useState([]); const [busy, setBusy] = useState(null);
  const [inShort, setInShort] = useState(false); const [day, setDay] = useState(''); const [subject, setSubject] = useState(''); const [body, setBody] = useState('');
  const [sending, setSending] = useState(false); const [msg, setMsg] = useState(null);
  const today = isoDay(new Date());

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data } = await supabase.from('profiles').select(PROFILE_COLS).eq('id', id).maybeSingle();
      setP(data || null); if (!data) return;
      const [pr, bl, sl] = await Promise.all([
        supabase.from('media_proofs').select('*').eq('profile_id', id).order('published_on', { ascending: false, nullsFirst: false }),
        supabase.from('availability_blocks').select('day').eq('profile_id', id).gte('day', today),
        supabase.from('shortlists').select('expert_id').eq('expert_id', id),
      ]);
      setProofs(pr.data || []); setBusy(new Set((bl.data || []).map((r) => r.day))); setInShort((sl.data || []).length > 0);
    })();
  }, [id, today]);

  return <Shell title={p ? p.display_name : 'Fiche expert'}>{(auth) => {
    if (p === undefined) return <p style={{ color: C.muted }}>Chargement…</p>;
    if (!p) return <div style={card()}><h2 style={{ marginTop: 0 }}>Profil introuvable</h2><p style={{ color: '#C9D4E4' }}>Ce profil n'existe pas ou n'est pas publié.</p><Btn href="/espace/recherche">Retour à la recherche</Btn></div>;
    const mine = p.id === auth.profile.id; const ct = casteOf(p.caste); const cr = p.criteria || {};
    const tier = tierFor(Math.round((cr.desirability || 0) * 0.35 + (cr.media || 0) * 0.35 + (cr.performance || 0) * 0.25 + (cr.community || 0) * 0.05));
    const avail = !p.calendar_active ? 'verifier' : !day ? 'calendrier' : (busy && busy.has(day)) ? 'indispo' : 'dispo';
    async function toggleShort() {
      const next = !inShort; setInShort(next);
      const { error } = next ? await supabase.from('shortlists').insert({ owner_id: auth.profile.id, expert_id: p.id }) : await supabase.from('shortlists').delete().eq('owner_id', auth.profile.id).eq('expert_id', p.id);
      if (error) { setInShort(!next); setMsg({ kind: 'error', text: error.message }); }
    }
    async function send() {
      if (!body.trim()) { setMsg({ kind: 'error', text: 'Écris ton message.' }); return; }
      setSending(true); setMsg(null);
      const { data, error } = await supabase.rpc('start_conversation', { p_recipient: p.id, p_subject: subject.trim(), p_body: body.trim() });
      setSending(false);
      if (error) setMsg({ kind: 'error', text: error.message }); else router.push('/espace/messages/' + data);
    }
    return <div style={{ display: 'grid', gap: 22 }}>
      <div><Link href="/espace/recherche" style={{ color: '#94a3b8', fontSize: 14, textDecoration: 'none' }}>← Recherche</Link></div>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(260px,340px) 1fr', gap: 22, alignItems: 'start' }} className="expert-grid">
        <aside style={{ ...card(ct.color), display: 'grid', gap: 14 }}>
          <Avatar src={p.photo_url} name={p.display_name} size={96} />
          <div><h1 style={{ margin: 0, fontSize: 28 }}>{p.display_name}</h1><div style={{ color: '#C9D4E4' }}>{p.headline}</div>{p.city && <div style={{ color: '#94a3b8', fontSize: 14 }}>📍 {p.city}</div>}</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}><Badge c={tier.c}>Rang {tier.name}</Badge><AvailabilityBadge status={avail === 'calendrier' ? 'dispo' : avail} /></div>
          {p.caste === 'expert' && <div>
            {avail === 'verifier' ? <p style={{ margin: 0, color: C.warn, fontSize: 13 }}>Calendrier non tenu à jour : contacte l'expert pour vérifier sa disponibilité.</p> : <label style={{ display: 'grid', gap: 6, fontSize: 13, color: '#9FACBF' }}>Vérifier un jour<Input type="date" min={today} value={day} onChange={(e) => setDay(e.target.value)} /></label>}
          </div>}
          {(p.links || []).length > 0 && <div style={{ display: 'grid', gap: 4 }}>{p.links.map((l, i) => <a key={i} href={l.url} target="_blank" rel="noopener noreferrer" style={{ color: colors.media, fontSize: 14 }}>{l.label || l.url}</a>)}</div>}
          {mine ? <Btn href="/espace/profil" ghostStyle>Modifier mon profil</Btn> : <div>
            {auth.profile.caste !== 'expert' && <Btn ghostStyle onClick={toggleShort}>{inShort ? '★ Dans ma shortlist' : '☆ Ajouter à la shortlist'}</Btn>}
          </div>}
        </aside>
        <div style={{ display: 'grid', gap: 20 }}>
          <div style={{ ...card(colors.talent) }}>
            <div style={{ color: colors.talent, fontWeight: 900, fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12 }}>Compétences clés</div>
            {(p.skills || []).length ? <SkillChips skills={p.skills} big c={colors.talent} /> : <p style={{ margin: 0, color: '#64748b' }}>Non renseignées.</p>}
            {p.bio && <p style={{ color: '#C9D4E4', lineHeight: 1.6, marginBottom: 0 }}>{p.bio}</p>}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 20 }}>
            <div style={card(colors.core)}><div style={{ fontWeight: 900, marginBottom: 14 }}>Jauges TSAAK</div><GameGauges values={cr} /></div>
            <div style={card(colors.media)}><div style={{ fontWeight: 900, marginBottom: 14 }}>Nuage de mots</div><WordCloud words={wordCloudOf(p.skills, p.keywords)} /></div>
          </div>
          {p.caste === 'expert' && p.calendar_active && busy && <div style={card()}><div style={{ fontWeight: 900, marginBottom: 14 }}>Calendrier</div><CalendarEditor profileId={p.id} editable={false} months={2} readOnlyBusy={[...busy]} /></div>}
          <div style={card(colors.media)}>
            <div style={{ fontWeight: 900, marginBottom: 14 }}>Passages média ({proofs.length})</div>
            {proofs.length === 0 ? <p style={{ margin: 0, color: '#64748b' }}>Aucune preuve ajoutée.</p> : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(250px,1fr))', gap: 14 }}>
              {proofs.map((it) => <a key={it.id} href={it.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: '#fff', borderRadius: 18, overflow: 'hidden', border: '1px solid rgba(255,255,255,.12)', background: 'rgba(255,255,255,.04)' }}>
                {it.thumbnail && <div style={{ height: 110, backgroundImage: `linear-gradient(180deg,transparent,#02030A), url(${it.thumbnail})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />}
                <div style={{ padding: 14 }}><div style={{ fontWeight: 800 }}>{it.title}</div><div style={{ color: '#94a3b8', fontSize: 13 }}>{[it.source, fmtDate(it.published_on)].filter(Boolean).join(' · ')}</div>{it.metric && <div style={{ color: colors.media, fontWeight: 800, marginTop: 4 }}>{it.metric}</div>}</div></a>)}
            </div>}
          </div>
          {!mine && <div style={{ ...card(colors.core), display: 'grid', gap: 12 }}>
            <div style={{ fontWeight: 900 }}>Écrire à {p.display_name.split(' ')[0]}</div>
            {msg && <Notice kind={msg.kind}>{msg.text}</Notice>}
            <Input placeholder="Objet" value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={120} />
            <Textarea rows={4} placeholder="Ton message : sujet, date, format…" value={body} onChange={(e) => setBody(e.target.value)} maxLength={5000} />
            <div><Btn onClick={send} disabled={sending}>{sending ? 'Envoi…' : 'Envoyer'}</Btn></div>
          </div>}
        </div>
      </div>
      <style jsx global>{`@media (max-width: 820px){ .expert-grid{ grid-template-columns: 1fr !important; } }`}</style>
    </div>;
  }}</Shell>;
}
