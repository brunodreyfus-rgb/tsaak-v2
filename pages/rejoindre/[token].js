import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabase, isConfigured } from '../../lib/supabase';
import { casteOf } from '../../lib/castes';
import { card } from '../../components/RichDemoUI';
import { pageBox, NotConfigured, Notice, Btn, Input, Label } from '../../components/Espace';

export default function Rejoindre() {
  const router = useRouter(); const token = router.query.token;
  const [inv, setInv] = useState(undefined); // undefined = chargement, null = introuvable
  const [name, setName] = useState(''); const [email, setEmail] = useState(''); const [pw, setPw] = useState(''); const [cgu, setCgu] = useState(false);
  const [busy, setBusy] = useState(false); const [msg, setMsg] = useState(null); const [checkMail, setCheckMail] = useState(false);

  useEffect(() => {
    if (!isConfigured || !token) return;
    supabase.rpc('get_invitation', { p_token: String(token) }).then(({ data, error }) => {
      const row = Array.isArray(data) ? data[0] : null;
      setInv(error || !row ? null : row);
      if (row) { setName(row.name || ''); setEmail(row.email || ''); }
    });
  }, [token]);
  if (!isConfigured) return <NotConfigured />;

  async function join(e) {
    e.preventDefault(); setMsg(null);
    if (pw.length < 8) { setMsg({ kind: 'error', text: 'Mot de passe : 8 caractères minimum.' }); return; }
    if (!cgu) { setMsg({ kind: 'error', text: 'Merci de confirmer que tu acceptes d\'utiliser TSAAK.' }); return; }
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({ email: email.trim(), password: pw, options: { data: { display_name: name.trim(), invite_token: String(token) } } });
    setBusy(false);
    if (error) { setMsg({ kind: 'error', text: /already|registered/i.test(error.message) ? 'Un compte existe déjà avec cet email : connecte-toi.' : /database error/i.test(error.message) ? 'Cette invitation n\'est plus valide (déjà utilisée ou annulée).' : error.message }); return; }
    if (data.session) router.replace('/espace/profil?bienvenue=1'); else setCheckMail(true);
  }

  const ct = inv ? casteOf(inv.caste) : null;
  const usable = inv && (inv.status === 'pending' || inv.status === 'sent');
  return <main style={pageBox()}><Head><title>Rejoindre TSAAK</title><meta name="robots" content="noindex" /></Head>
    <div style={{ ...card(ct ? ct.color : undefined), maxWidth: 500, margin: '8vh auto 0', display: 'grid', gap: 16 }}>
      <img src="/tsaak-logo.jpg" alt="TSAAK" style={{ height: 54, justifySelf: 'start' }} />
      {inv === undefined && <p style={{ color: '#94a3b8' }}>Chargement de ton invitation…</p>}
      {inv === null && <><h1 style={{ margin: 0, fontSize: 26 }}>Invitation introuvable</h1><Notice kind="error">Ce lien n'est pas valide. Demande un nouveau lien à la personne qui t'a invité(e).</Notice><Link href="/connexion" style={{ color: '#00D5FF' }}>J'ai déjà un compte</Link></>}
      {inv && !usable && <><h1 style={{ margin: 0, fontSize: 26 }}>Invitation {inv.status === 'accepted' ? 'déjà utilisée' : 'annulée'}</h1><Notice kind="warn">{inv.status === 'accepted' ? 'Ce lien a déjà servi à créer un compte.' : 'Cette invitation a été annulée.'}</Notice><Link href="/connexion" style={{ color: '#00D5FF' }}>Se connecter</Link></>}
      {usable && !checkMail && <form onSubmit={join} style={{ display: 'grid', gap: 16 }}>
        <div><div style={{ color: ct.color, fontWeight: 900, fontSize: 13, letterSpacing: 1.5, textTransform: 'uppercase' }}>{ct.emoji} Invitation · {ct.label}</div>
          <h1 style={{ margin: '8px 0 4px', fontSize: 28 }}>{inv.inviter_name} t'invite sur TSAAK</h1>
          <p style={{ margin: 0, color: '#9FACBF' }}>{ct.blurb}</p></div>
        {inv.message && <blockquote style={{ margin: 0, padding: '10px 14px', borderRadius: 12, background: 'rgba(255,255,255,.06)', color: '#C9D4E4' }}>« {inv.message} »</blockquote>}
        {msg && <Notice kind={msg.kind}>{msg.text}</Notice>}
        <Label text="Nom affiché"><Input required value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" /></Label>
        <Label text="Email"><Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></Label>
        <Label text="Mot de passe" hint="8 caractères minimum"><Input type="password" required minLength={8} value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="new-password" /></Label>
        <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 13, color: '#9FACBF' }}><input type="checkbox" checked={cgu} onChange={(e) => setCgu(e.target.checked)} style={{ marginTop: 3 }} />Je crée mon compte TSAAK. Mon profil ne sera visible des autres membres que lorsque je le publierai moi-même.</label>
        <Btn type="submit" tone={ct.color} disabled={busy}>{busy ? 'Création…' : 'Créer mon compte'}</Btn>
      </form>}
      {checkMail && <><h1 style={{ margin: 0, fontSize: 26 }}>Vérifie ta boîte mail</h1><Notice kind="ok">Un email de confirmation vient d'être envoyé à {email}. Clique sur le lien, puis <Link href="/connexion" style={{ color: '#fff' }}>connecte-toi</Link>.</Notice></>}
    </div></main>;
}
