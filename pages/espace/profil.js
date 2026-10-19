import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import { callApi } from '../../lib/useAuth';
import { casteOf, PROOF_KINDS, cleanTags, normalizeUrl, fmtDate } from '../../lib/castes';
import { card, colors, Badge, GameGauges, tierFor, SkillChips, WordCloud } from '../../components/RichDemoUI';
import { Shell, Notice, Btn, Input, Textarea, Label, TagInput, Avatar, C } from '../../components/Espace';
import CalendarEditor from '../../components/CalendarEditor';
import { wordCloudOf } from '../../lib/castes';

const SKILL_SUGGESTIONS = ['Intelligence artificielle', 'Géopolitique', 'Économie', 'Santé', 'Management', 'Cybersécurité', 'Énergie', 'Keynote', 'Plateau TV', 'Podcast'];

function Section({ n, title, hint, children, c = colors.media }) {
  return <div style={{ ...card(c), display: 'grid', gap: 16 }}>
    <div><div style={{ color: c, fontWeight: 900, fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase' }}>{n}</div><h2 style={{ margin: '4px 0 0', fontSize: 22 }}>{title}</h2>{hint && <p style={{ margin: '6px 0 0', color: '#94a3b8', fontSize: 14 }}>{hint}</p>}</div>
    {children}
  </div>;
}

function Identity({ auth }) {
  const p = auth.profile; const ct = casteOf(p.caste);
  const [f, setF] = useState({ display_name: p.display_name, headline: p.headline, city: p.city, bio: p.bio });
  const [skills, setSkills] = useState(p.skills || []); const [keywords, setKeywords] = useState(p.keywords || []);
  const [links, setLinks] = useState(Array.isArray(p.links) ? p.links : []);
  const [busy, setBusy] = useState(false); const [msg, setMsg] = useState(null); const fileRef = useRef(null);
  const isExpert = p.caste === 'expert';

  async function save() {
    setBusy(true); setMsg(null);
    const patch = { display_name: f.display_name.trim(), headline: f.headline.trim(), city: f.city.trim(), bio: f.bio.trim(), skills: cleanTags(skills), keywords: cleanTags(keywords),
      links: links.map((l) => ({ label: String(l.label || '').trim().slice(0, 40), url: normalizeUrl(l.url) })).filter((l) => l.url) };
    if (!patch.display_name) { setBusy(false); setMsg({ kind: 'error', text: 'Le nom est obligatoire.' }); return; }
    const { error } = await supabase.from('profiles').update(patch).eq('id', p.id);
    setBusy(false);
    if (error) setMsg({ kind: 'error', text: error.message }); else { auth.setProfile(patch); setMsg({ kind: 'ok', text: 'Profil enregistré.' }); }
  }
  async function upload(e) {
    const file = e.target.files && e.target.files[0]; if (!file) return;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) { setMsg({ kind: 'error', text: 'Photo : JPG, PNG ou WebP.' }); return; }
    if (file.size > 3 * 1024 * 1024) { setMsg({ kind: 'error', text: 'Photo : 3 Mo maximum.' }); return; }
    setBusy(true); setMsg(null);
    const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
    const path = `${p.id}/avatar-${Date.now()}.${ext}`;
    const up = await supabase.storage.from('avatars').upload(path, file, { contentType: file.type, upsert: false });
    if (up.error) { setBusy(false); setMsg({ kind: 'error', text: 'Envoi de la photo impossible : ' + up.error.message }); return; }
    const url = supabase.storage.from('avatars').getPublicUrl(path).data.publicUrl;
    const { error } = await supabase.from('profiles').update({ photo_url: url }).eq('id', p.id);
    setBusy(false); if (error) setMsg({ kind: 'error', text: error.message }); else auth.setProfile({ photo_url: url });
  }
  return <Section n="1 · Identité" title="Qui es-tu ?" c={ct.color}>
    {msg && <Notice kind={msg.kind}>{msg.text}</Notice>}
    <div style={{ display: 'flex', gap: 18, alignItems: 'center', flexWrap: 'wrap' }}>
      <Avatar src={p.photo_url} name={f.display_name} size={84} />
      <div><input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={upload} style={{ display: 'none' }} />
        <Btn ghostStyle small tone={ct.color} onClick={() => fileRef.current && fileRef.current.click()} disabled={busy}>{p.photo_url ? 'Changer la photo' : 'Ajouter une photo'}</Btn>
        <div style={{ color: '#64748b', fontSize: 12, marginTop: 6 }}>JPG, PNG ou WebP · 3 Mo max</div></div>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 14 }}>
      <Label text="Nom affiché"><Input value={f.display_name} onChange={(e) => setF({ ...f, display_name: e.target.value })} maxLength={80} /></Label>
      <Label text="Ville"><Input value={f.city} onChange={(e) => setF({ ...f, city: e.target.value })} maxLength={60} /></Label>
    </div>
    <Label text={isExpert ? 'Titre / accroche' : p.caste === 'organisation' ? 'Type d\'organisation' : p.caste === 'media' ? 'Média / rubrique' : 'Activité'} hint="une ligne"><Input value={f.headline} onChange={(e) => setF({ ...f, headline: e.target.value })} maxLength={120} placeholder={isExpert ? 'Ex. Spécialiste de l\'IA appliquée à la santé' : ''} /></Label>
    <Label text="Présentation" hint="quelques lignes"><Textarea value={f.bio} onChange={(e) => setF({ ...f, bio: e.target.value })} maxLength={1500} /></Label>
    <Label text={isExpert ? 'Compétences clés' : 'Spécialités'} hint="affichées en premier sur ta fiche — Entrée ou virgule pour ajouter">
      <TagInput value={skills} onChange={setSkills} c={ct.color} placeholder="Ex. Intelligence artificielle" suggestions={SKILL_SUGGESTIONS} /></Label>
    <Label text="Mots-clés" hint="sujets, langues, formats : alimentent ton nuage de mots"><TagInput value={keywords} onChange={setKeywords} c={colors.media} placeholder="Ex. souveraineté numérique" /></Label>
    <Label text="Liens utiles" hint="site, LinkedIn, chaîne… (simples liens, pas d'import automatique)">
      <div style={{ display: 'grid', gap: 8 }}>
        {links.map((l, i) => <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: 8 }}>
          <Input placeholder="Nom (ex. LinkedIn)" value={l.label || ''} onChange={(e) => setLinks(links.map((x, j) => j === i ? { ...x, label: e.target.value } : x))} />
          <Input placeholder="https://…" value={l.url || ''} onChange={(e) => setLinks(links.map((x, j) => j === i ? { ...x, url: e.target.value } : x))} />
          <Btn ghostStyle small onClick={() => setLinks(links.filter((_, j) => j !== i))}>✕</Btn></div>)}
        {links.length < 6 && <div><Btn ghostStyle small onClick={() => setLinks([...links, { label: '', url: '' }])}>+ Ajouter un lien</Btn></div>}
      </div>
    </Label>
    <div><Btn onClick={save} disabled={busy} tone={ct.color}>{busy ? 'Enregistrement…' : 'Enregistrer mon profil'}</Btn></div>
  </Section>;
}

function Proofs({ auth }) {
  const p = auth.profile;
  const empty = { url: '', title: '', source: '', kind: 'article', published_on: '', metric: '', note: '', thumbnail: '' };
  const [items, setItems] = useState([]); const [draft, setDraft] = useState(null); const [link, setLink] = useState('');
  const [busy, setBusy] = useState(false); const [msg, setMsg] = useState(null);
  const load = () => supabase.from('media_proofs').select('*').eq('profile_id', p.id).order('published_on', { ascending: false, nullsFirst: false }).then(({ data }) => setItems(data || []));
  useEffect(() => { load(); }, []); // eslint-disable-line

  async function readLink() {
    const url = normalizeUrl(link); if (!url) { setMsg({ kind: 'error', text: 'Colle un lien valide (https://…).' }); return; }
    setBusy(true); setMsg(null);
    try {
      const r = await callApi('/api/scrape', { url });
      setDraft({ ...empty, url: r.url || url, title: r.title || '', source: r.source || '', kind: r.kind || 'article', published_on: r.published_on || '', thumbnail: r.thumbnail || '', note: r.description || '' });
      setMsg(r.found ? { kind: 'ok', text: 'Lien lu. Vérifie les champs, ajoute le chiffre d\'audience si tu le connais, puis ajoute la preuve.' } : { kind: 'warn', text: 'Page lue mais aucun titre trouvé : complète à la main.' });
    } catch (e) {
      setDraft({ ...empty, url });
      setMsg({ kind: 'warn', text: (e.message || 'Lecture impossible') + ' — remplis les champs à la main.' });
    }
    setBusy(false);
  }
  async function add() {
    if (!draft.title.trim()) { setMsg({ kind: 'error', text: 'Donne un titre à la preuve.' }); return; }
    setBusy(true);
    const row = { profile_id: p.id, url: normalizeUrl(draft.url) || draft.url, title: draft.title.trim().slice(0, 200), source: draft.source.trim().slice(0, 80), kind: draft.kind, published_on: draft.published_on || null, metric: draft.metric.trim().slice(0, 80), note: draft.note.trim().slice(0, 400), thumbnail: draft.thumbnail || null };
    const { error } = await supabase.from('media_proofs').insert(row);
    setBusy(false);
    if (error) { setMsg({ kind: 'error', text: error.message }); return; }
    setDraft(null); setLink(''); setMsg({ kind: 'ok', text: 'Preuve ajoutée.' }); load(); auth.refresh();
  }
  async function remove(id) { await supabase.from('media_proofs').delete().eq('id', id); load(); auth.refresh(); }

  return <Section n="2 · Preuves" title="Tes passages média" hint="Colle un lien (article, vidéo, podcast…) : TSAAK lit le titre, le média, l'image et la date. Rien n'est inventé : tu corriges et tu saisis toi-même les chiffres." c={colors.media}>
    {msg && <Notice kind={msg.kind}>{msg.text}</Notice>}
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
      <div style={{ flex: '1 1 320px' }}><Input placeholder="https://www.lemonde.fr/…" value={link} onChange={(e) => setLink(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); readLink(); } }} /></div>
      <Btn onClick={readLink} disabled={busy || !link.trim()}>{busy ? 'Lecture…' : 'Lire le lien'}</Btn>
      <Btn ghostStyle onClick={() => { setDraft({ ...empty }); setMsg(null); }}>Saisir à la main</Btn>
    </div>
    {draft && <div style={{ padding: 16, borderRadius: 18, border: '1px solid rgba(255,255,255,.14)', background: 'rgba(255,255,255,.04)', display: 'grid', gap: 12 }}>
      {draft.thumbnail && <img src={draft.thumbnail} alt="" style={{ maxHeight: 130, borderRadius: 12, objectFit: 'cover', justifySelf: 'start' }} />}
      <Label text="Titre"><Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} /></Label>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12 }}>
        <Label text="Média / source"><Input value={draft.source} onChange={(e) => setDraft({ ...draft, source: e.target.value })} /></Label>
        <Label text="Type"><select value={draft.kind} onChange={(e) => setDraft({ ...draft, kind: e.target.value })} style={{ width: '100%', padding: '14px 16px', borderRadius: 14, background: 'rgba(255,255,255,.06)', color: '#fff', border: '1px solid rgba(255,255,255,.14)', fontSize: 15 }}>{PROOF_KINDS.map(([v, l]) => <option key={v} value={v} style={{ color: '#000' }}>{l}</option>)}</select></Label>
        <Label text="Date"><Input type="date" value={draft.published_on} onChange={(e) => setDraft({ ...draft, published_on: e.target.value })} /></Label>
        <Label text="Audience / chiffre" hint="si tu le connais"><Input value={draft.metric} placeholder="Ex. 120 000 auditeurs" onChange={(e) => setDraft({ ...draft, metric: e.target.value })} /></Label>
      </div>
      <Label text="Note" hint="facultatif"><Textarea rows={2} value={draft.note} onChange={(e) => setDraft({ ...draft, note: e.target.value })} /></Label>
      <div><Btn onClick={add} disabled={busy}>Ajouter la preuve</Btn><Btn ghostStyle onClick={() => setDraft(null)}>Annuler</Btn></div>
    </div>}
    <div style={{ display: 'grid', gap: 10 }}>
      {items.length === 0 && <p style={{ color: '#64748b', margin: 0 }}>Aucune preuve pour l'instant.</p>}
      {items.map((it) => <div key={it.id} style={{ display: 'flex', gap: 14, alignItems: 'center', padding: 12, borderRadius: 16, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)' }}>
        {it.thumbnail ? <img src={it.thumbnail} alt="" style={{ width: 72, height: 52, objectFit: 'cover', borderRadius: 10, flex: 'none' }} /> : <div style={{ width: 72, height: 52, borderRadius: 10, background: 'rgba(255,255,255,.06)', display: 'grid', placeItems: 'center', flex: 'none' }}>🎬</div>}
        <div style={{ flex: 1, minWidth: 0 }}><a href={it.url} target="_blank" rel="noopener noreferrer" style={{ color: '#fff', fontWeight: 800, textDecoration: 'none' }}>{it.title}</a>
          <div style={{ color: '#94a3b8', fontSize: 13 }}>{[it.source, fmtDate(it.published_on), it.metric].filter(Boolean).join(' · ')}</div></div>
        <Btn ghostStyle small onClick={() => remove(it.id)}>Supprimer</Btn></div>)}
    </div>
  </Section>;
}

function Availability({ auth }) {
  const p = auth.profile; const [busy, setBusy] = useState(false);
  async function setActive(v) { setBusy(true); const { error } = await supabase.from('profiles').update({ calendar_active: v }).eq('id', p.id); setBusy(false); if (!error) auth.setProfile({ calendar_active: v }); }
  return <Section n="3 · Disponibilités" title="Ton calendrier" hint="La recherche d'experts tient compte de ta disponibilité. Marque les jours où tu es OCCUPÉ." c={colors.talent}>
    <label style={{ display: 'flex', gap: 12, alignItems: 'flex-start', cursor: 'pointer' }}>
      <input type="checkbox" checked={p.calendar_active} disabled={busy} onChange={(e) => setActive(e.target.checked)} style={{ marginTop: 4, width: 18, height: 18 }} />
      <span><b>Je tiens mon calendrier TSAAK à jour</b><br /><span style={{ color: '#94a3b8', fontSize: 14 }}>Activé : les jours non marqués comme occupés sont considérés « disponibles » et les jours occupés te masquent de la recherche. Désactivé : tu restes visible avec la mention « Vérifier la dispo » — les demandeurs te contactent pour confirmer.</span></span>
    </label>
    <div style={{ opacity: p.calendar_active ? 1 : 0.5 }}><CalendarEditor profileId={p.id} /></div>
  </Section>;
}

function Publication({ auth }) {
  const p = auth.profile; const ct = casteOf(p.caste); const [busy, setBusy] = useState(false); const [msg, setMsg] = useState(null);
  const gaps = [!p.display_name && 'nom', !p.headline && 'titre', (p.caste === 'expert' && !(p.skills || []).length) && 'au moins une compétence'].filter(Boolean);
  async function toggle() {
    if (!p.published && gaps.length) { setMsg({ kind: 'warn', text: 'Avant de publier, complète : ' + gaps.join(', ') + '.' }); return; }
    setBusy(true); setMsg(null);
    const { error } = await supabase.from('profiles').update({ published: !p.published }).eq('id', p.id);
    setBusy(false); if (error) setMsg({ kind: 'error', text: error.message }); else auth.setProfile({ published: !p.published });
  }
  return <Section n="4 · Visibilité" title={p.published ? 'Ton profil est publié' : 'Ton profil est privé'} c={p.published ? C.ok : C.warn}
    hint={p.caste === 'expert' ? 'Publié = visible dans la recherche des membres connectés (médias, organisations, facilitateurs). Tu peux le retirer à tout moment.' : 'Publié = les autres membres peuvent te trouver et t\'écrire' + (p.caste === 'intermediaire' ? ' (nécessaire pour recevoir des Wanted).' : '.')}>
    {msg && <Notice kind={msg.kind}>{msg.text}</Notice>}
    <div><Btn onClick={toggle} disabled={busy} tone={p.published ? C.warn : C.ok}>{p.published ? 'Retirer mon profil de la recherche' : 'Publier mon profil'}</Btn></div>
  </Section>;
}

function Preview({ auth }) {
  const p = auth.profile; if (p.caste !== 'expert') return null;
  const cr = p.criteria || {}; const tier = tierFor(Math.round((cr.desirability || 0) * 0.35 + (cr.media || 0) * 0.35 + (cr.performance || 0) * 0.25 + (cr.community || 0) * 0.05));
  return <Section n="Aperçu" title="Ta fiche vue par les autres" c={colors.core} hint="Compétences d'abord, puis jauges et nuage de mots. Le chiffre du score reste interne à TSAAK.">
    <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}><Avatar src={p.photo_url} name={p.display_name} size={56} /><div><b style={{ fontSize: 18 }}>{p.display_name}</b><div style={{ color: '#94a3b8' }}>{p.headline}</div></div><Badge c={tier.c}>Rang {tier.name}</Badge></div>
    {(p.skills || []).length > 0 ? <SkillChips skills={p.skills} big c={colors.talent} /> : <p style={{ color: C.warn, margin: 0 }}>Ajoute tes compétences clés : c'est la première chose que voient les demandeurs.</p>}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 24 }}><GameGauges values={p.criteria} /><WordCloud words={wordCloudOf(p.skills, p.keywords)} /></div>
    <p style={{ color: '#64748b', fontSize: 12, margin: 0 }}>Les jauges se remplissent avec tes preuves média, tes retours et les membres que tu invites. Formule provisoire, ajustée par l'équipe TSAAK.</p>
  </Section>;
}

export default function Profil() {
  const router = useRouter();
  return <Shell title="Mon profil">{(auth) => <div style={{ display: 'grid', gap: 22 }}>
    <div><h1 style={{ margin: 0, fontSize: 34 }}>Mon profil</h1><p style={{ color: '#94a3b8', margin: '6px 0 0' }}>{router.query.bienvenue ? 'Bienvenue sur TSAAK ! Complète ton profil en 4 étapes.' : 'Plus ton profil est précis, mieux tu es trouvé.'}</p></div>
    <Identity auth={auth} />
    {auth.profile.caste === 'expert' && <Proofs auth={auth} />}
    {auth.profile.caste === 'expert' && <Availability auth={auth} />}
    <Publication auth={auth} />
    <Preview auth={auth} />
  </div>}</Shell>;
}
