import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { supabase, isConfigured } from '../lib/supabase';
import { card, colors } from '../components/RichDemoUI';
import { pageBox, NotConfigured, Notice, Btn, Input, Label } from '../components/Espace';

// Arrivée depuis l'email « mot de passe oublié » : Supabase ouvre une session, on choisit un nouveau mot de passe.
export default function MotDePasse() {
  const router = useRouter();
  const [ready, setReady] = useState(false); const [pw, setPw] = useState(''); const [msg, setMsg] = useState(null); const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!isConfigured) return;
    supabase.auth.getSession().then(({ data }) => setReady(Boolean(data.session)));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setReady(Boolean(s)));
    return () => sub.subscription.unsubscribe();
  }, []);
  if (!isConfigured) return <NotConfigured />;
  async function save(e) {
    e.preventDefault();
    if (pw.length < 8) { setMsg({ kind: 'error', text: '8 caractères minimum.' }); return; }
    setBusy(true); const { error } = await supabase.auth.updateUser({ password: pw }); setBusy(false);
    if (error) setMsg({ kind: 'error', text: error.message }); else router.replace('/espace');
  }
  return <main style={pageBox()}><Head><title>Nouveau mot de passe · TSAAK</title></Head>
    <form onSubmit={save} style={{ ...card(colors.media), maxWidth: 440, margin: '10vh auto 0', display: 'grid', gap: 16 }}>
      <h1 style={{ margin: 0, fontSize: 26 }}>Nouveau mot de passe</h1>
      {msg && <Notice kind={msg.kind}>{msg.text}</Notice>}
      {!ready ? <Notice kind="warn">Ouvre cette page depuis le lien reçu par email.</Notice> : <>
        <Label text="Nouveau mot de passe" hint="8 caractères minimum"><Input type="password" minLength={8} required autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} /></Label>
        <Btn type="submit" disabled={busy}>Enregistrer</Btn></>}
    </form></main>;
}
