import React, { useEffect, useState, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { colors, card, button, ghost, field, Chip } from './RichDemoUI';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/useAuth';
import { casteOf, canPublishWanted } from '../lib/castes';

export const C = { bg: '#03040A', muted: '#94a3b8', text: '#E7ECF5', ok: '#7CFFB2', warn: '#FFB020', bad: '#FF8A8A' };

export function Notice({ kind = 'info', children }) {
  const c = kind === 'error' ? C.bad : kind === 'ok' ? C.ok : kind === 'warn' ? C.warn : colors.media;
  return <div style={{ padding: '12px 16px', borderRadius: 14, border: `1px solid ${c}66`, background: `${c}14`, color: '#fff', fontSize: 14, lineHeight: 1.5 }}>{children}</div>;
}

export function NotConfigured() {
  return <main style={pageBox()}><div style={{ ...card(colors.organisation), maxWidth: 640, margin: '12vh auto' }}>
    <h1 style={{ marginTop: 0 }}>Site à configurer</h1>
    <p style={{ color: '#C9D4E4' }}>Les clés Supabase ne sont pas encore renseignées. Suis les étapes de <b>SETUP.md</b> (10 minutes) : créer le projet Supabase, coller <code>supabase/schema.sql</code>, puis renseigner <code>NEXT_PUBLIC_SUPABASE_URL</code> et <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>.</p>
    <Link href="/" style={{ color: colors.media }}>← Retour à la démo</Link>
  </div></main>;
}

export function pageBox() {
  return { minHeight: '100vh', color: C.text, fontFamily: 'Inter,Arial,sans-serif', background: 'radial-gradient(circle at 12% 0%, #00D5FF22, transparent 30%), radial-gradient(circle at 90% 10%, #FF2FD614, transparent 30%), #03040A', padding: '0 0 80px' };
}

export function Btn({ children, onClick, href, tone = colors.media, disabled, type = 'button', small, ghostStyle }) {
  const base = ghostStyle ? ghost(tone) : button(tone);
  const st = { ...base, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1, fontFamily: 'inherit', fontSize: small ? 13 : 15, padding: small ? '8px 13px' : base.padding, color: '#fff' };
  if (href && !disabled) return <Link href={href} style={st}>{children}</Link>;
  return <button type={type} onClick={onClick} disabled={disabled} style={st}>{children}</button>;
}

export function Input(props) { return <input {...props} style={{ ...field(), ...(props.style || {}) }} />; }
export function Textarea(props) { return <textarea rows={4} {...props} style={{ ...field(), resize: 'vertical', ...(props.style || {}) }} />; }
export function Label({ text, hint, children }) {
  return <label style={{ display: 'grid', gap: 6, fontSize: 13, color: '#9FACBF' }}><span>{text}{hint && <span style={{ color: '#64748b' }}> · {hint}</span>}</span>{children}</label>;
}

// Saisie de tags : Entrée ou virgule pour ajouter, clic sur ✕ pour retirer
export function TagInput({ value = [], onChange, placeholder, c = colors.talent, suggestions = [] }) {
  const [txt, setTxt] = useState('');
  const add = (raw) => {
    const parts = String(raw).split(',').map((s) => s.trim()).filter(Boolean);
    if (!parts.length) return;
    const next = [...value]; parts.forEach((p) => { if (!next.some((x) => x.toLowerCase() === p.toLowerCase()) && next.length < 20) next.push(p.slice(0, 40)); });
    onChange(next); setTxt('');
  };
  return <div>
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: value.length ? 10 : 0 }}>
      {value.map((t) => <span key={t} style={{ display: 'inline-flex', gap: 8, alignItems: 'center', padding: '7px 12px', borderRadius: 999, border: `1px solid ${c}88`, background: `${c}1f`, fontWeight: 800, fontSize: 13 }}>{t}
        <button type="button" aria-label={`Retirer ${t}`} onClick={() => onChange(value.filter((x) => x !== t))} style={{ background: 'none', border: 0, color: '#fff', cursor: 'pointer', padding: 0, fontSize: 14 }}>✕</button></span>)}
    </div>
    <input value={txt} placeholder={placeholder} onChange={(e) => setTxt(e.target.value)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(txt); } else if (e.key === 'Backspace' && !txt && value.length) onChange(value.slice(0, -1)); }}
      onBlur={() => add(txt)} style={field()} />
    {suggestions.length > 0 && <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
      {suggestions.filter((s) => !value.includes(s)).slice(0, 8).map((s) => <Chip key={s} onClick={() => add(s)} c={c}>+ {s}</Chip>)}
    </div>}
  </div>;
}

export function Avatar({ src, name, size = 48 }) {
  const initials = String(name || '?').split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  if (src) return <img src={src} alt={name || ''} style={{ width: size, height: size, borderRadius: size / 3, objectFit: 'cover', border: '1px solid rgba(255,255,255,.18)', flex: 'none' }} />;
  return <div aria-label={name} style={{ width: size, height: size, borderRadius: size / 3, display: 'grid', placeItems: 'center', background: 'linear-gradient(135deg,#00D5FF44,#FF2FD644)', fontWeight: 900, fontSize: size / 2.6, flex: 'none' }}>{initials}</div>;
}

// Cadre de toutes les pages /espace : session obligatoire, menu selon le type de compte, cloche de notifications
export function Shell({ title, children, wide }) {
  const router = useRouter();
  const auth = useAuth();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!auth.loading && auth.configured && !auth.session) router.replace('/connexion?next=' + encodeURIComponent(router.asPath));
  }, [auth.loading, auth.configured, auth.session, router]);

  const countUnread = useCallback(async () => {
    if (!auth.session) return;
    const { count } = await supabase.from('notifications').select('id', { count: 'exact', head: true }).is('read_at', null);
    setUnread(count || 0);
  }, [auth.session]);
  useEffect(() => {
    if (!auth.session) return;
    countUnread();
    const iv = setInterval(countUnread, 30000);
    const ch = supabase.channel('notif-' + auth.session.user.id)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `profile_id=eq.${auth.session.user.id}` }, countUnread).subscribe();
    return () => { clearInterval(iv); supabase.removeChannel(ch); };
  }, [auth.session, countUnread]);

  if (!auth.configured) return <NotConfigured />;
  if (auth.loading || !auth.session) return <main style={pageBox()}><p style={{ padding: 40, color: C.muted }}>Chargement…</p></main>;
  if (!auth.profile) return <main style={pageBox()}><div style={{ ...card(), maxWidth: 560, margin: '12vh auto' }}><h2 style={{ marginTop: 0 }}>Profil introuvable</h2><p style={{ color: '#C9D4E4' }}>{auth.error || 'Ton compte existe mais son profil n\'a pas été créé. Contacte l\'équipe TSAAK.'}</p><Btn onClick={() => supabase.auth.signOut()}>Se déconnecter</Btn></div></main>;

  const p = auth.profile; const ct = casteOf(p.caste);
  const nav = [
    ['/espace', 'Tableau de bord'],
    ['/espace/recherche', 'Recherche'],
    ...(p.caste !== 'expert' ? [['/espace/shortlist', 'Shortlist']] : []),
    ['/espace/wanted', 'Wanted'],
    ['/espace/messages', 'Messages'],
    ['/espace/inviter', 'Inviter'],
    ['/espace/profil', 'Mon profil'],
  ];
  const isActive = (href) => href === '/espace' ? router.pathname === '/espace' : router.pathname.startsWith(href);
  return <main style={pageBox()}>
    <Head><title>{title ? `${title} · TSAAK` : 'TSAAK'}</title><meta name="robots" content="noindex" /></Head>
    <header style={{ borderBottom: '1px solid rgba(255,255,255,.08)', background: 'rgba(3,4,10,.7)', position: 'sticky', top: 0, zIndex: 20, backdropFilter: 'blur(14px)' }}>
      <div style={{ maxWidth: wide ? 1240 : 1100, margin: '0 auto', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
        <Link href="/espace" style={{ display: 'flex', alignItems: 'center' }}><img src="/tsaak-logo.jpg" alt="TSAAK" style={{ height: 34 }} /></Link>
        <nav style={{ display: 'flex', gap: 4, flexWrap: 'wrap', flex: 1 }}>
          {nav.map(([href, label]) => <Link key={href} href={href} style={{ padding: '8px 12px', borderRadius: 10, color: isActive(href) ? '#fff' : '#a7b0c2', background: isActive(href) ? 'rgba(255,255,255,.1)' : 'transparent', textDecoration: 'none', fontSize: 14, fontWeight: 700 }}>{label}</Link>)}
        </nav>
        <Link href="/espace/notifications" aria-label="Notifications" style={{ position: 'relative', textDecoration: 'none', fontSize: 20 }}>🔔{unread > 0 && <span style={{ position: 'absolute', top: -6, right: -8, minWidth: 18, height: 18, borderRadius: 9, background: '#FF2FD6', color: '#fff', fontSize: 11, fontWeight: 900, display: 'grid', placeItems: 'center', padding: '0 4px' }}>{unread > 99 ? '99+' : unread}</span>}</Link>
        <span style={{ fontSize: 12, fontWeight: 800, padding: '6px 10px', borderRadius: 999, color: ct.color, border: `1px solid ${ct.color}66` }}>{ct.emoji} {ct.label}</span>
        <button onClick={async () => { await supabase.auth.signOut(); router.push('/connexion'); }} style={{ background: 'none', border: 0, color: C.muted, cursor: 'pointer', fontSize: 13 }}>Déconnexion</button>
      </div>
    </header>
    <section style={{ maxWidth: wide ? 1240 : 1100, margin: '0 auto', padding: '28px 24px' }}>
      {typeof children === 'function' ? children({ ...auth, unread, refreshUnread: countUnread, caste: ct, canWanted: canPublishWanted(p.caste) }) : children}
    </section>
  </main>;
}
