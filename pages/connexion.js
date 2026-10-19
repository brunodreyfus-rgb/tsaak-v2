import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabase, isConfigured } from '../lib/supabase';
import { siteUrl } from '../lib/castes';
import { card, colors } from '../components/RichDemoUI';
import { pageBox, NotConfigured, Notice, Btn, Input, Label } from '../components/Espace';

export default function Connexion() {
  const router = useRouter();
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false); const [msg, setMsg] = useState(null);
  if (!isConfigured) return <NotConfigured />;

  const next = typeof router.query.next === 'string' && router.query.next.startsWith('/espace') ? router.query.next : '/espace';
  async function login(e) {
    e.preventDefault(); setBusy(true); setMsg(null);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (error) setMsg({ kind: 'error', text: /confirm/i.test(error.message) ? 'Confirme d\'abord ton adresse email (lien reçu par mail).' : 'Email ou mot de passe incorrect.' });
    else router.replace(next);
  }
  async function forgot() {
    if (!email.trim()) { setMsg({ kind: 'warn', text: 'Saisis ton email ci-dessus, puis reclique sur « Mot de passe oublié ».' }); return; }
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: siteUrl() + '/mot-de-passe' });
    setBusy(false);
    setMsg(error ? { kind: 'error', text: error.message } : { kind: 'ok', text: 'Si cette adresse existe, un lien de réinitialisation vient d\'être envoyé.' });
  }
  return <main style={pageBox()}>
    <Head><title>Connexion · TSAAK</title><meta name="robots" content="noindex" /></Head>
    <form onSubmit={login} style={{ ...card(colors.media), maxWidth: 440, margin: '10vh auto 0', display: 'grid', gap: 16 }}>
      <img src="/tsaak-logo.jpg" alt="TSAAK" style={{ height: 54, justifySelf: 'start' }} />
      <h1 style={{ margin: 0, fontSize: 28 }}>Connexion</h1>
      {msg && <Notice kind={msg.kind}>{msg.text}</Notice>}
      <Label text="Email"><Input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} /></Label>
      <Label text="Mot de passe"><Input type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} /></Label>
      <Btn type="submit" disabled={busy}>{busy ? 'Connexion…' : 'Se connecter'}</Btn>
      <button type="button" onClick={forgot} style={{ background: 'none', border: 0, color: colors.media, cursor: 'pointer', textAlign: 'left', padding: 0, fontSize: 14 }}>Mot de passe oublié ?</button>
      <p style={{ margin: 0, color: '#94a3b8', fontSize: 13 }}>TSAAK est ouvert sur invitation. Tu as reçu un lien personnel ? Ouvre-le pour créer ton compte. <Link href="/" style={{ color: '#94a3b8' }}>Voir la démo</Link></p>
    </form>
  </main>;
}
