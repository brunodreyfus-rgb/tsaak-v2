import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { card, colors } from '../components/RichDemoUI';
import { pageBox, Btn } from '../components/Espace';

const ICON = { ok: ['✔', '#7CFFB2'], warn: ['!', '#FFB020'], error: ['✕', '#FF8A8A'], info: ['i', '#00D5FF'] };

export default function Diagnostic() {
  const [r, setR] = useState(null); const [loading, setLoading] = useState(true);
  const run = () => { setLoading(true); fetch('/api/health').then((x) => x.json()).then(setR).catch(() => setR({ checks: [], errors: 1, warns: 0, ready: false, failed: true })).finally(() => setLoading(false)); };
  useEffect(run, []);
  return <main style={pageBox()}><Head><title>Diagnostic · TSAAK</title><meta name="robots" content="noindex" /></Head>
    <div style={{ maxWidth: 820, margin: '0 auto', padding: '40px 24px', display: 'grid', gap: 18 }}>
      <h1 style={{ margin: 0, fontSize: 32 }}>Diagnostic d'installation</h1>
      <p style={{ margin: 0, color: '#94a3b8' }}>Vérifie que le vrai site est correctement relié à Supabase. Aucune clé ni donnée n'est affichée. Après chaque correction, clique sur « Revérifier ».</p>
      {r && !loading && <div style={{ ...card(r.ready ? '#7CFFB2' : '#FF8A8A') }}><b style={{ fontSize: 18 }}>{r.ready ? (r.warns ? 'Presque prêt' : 'Tout est prêt') : `${r.errors} point(s) à corriger`}</b>{r.warns > 0 && <span style={{ color: '#FFB020' }}> · {r.warns} attention</span>}
        {r.ready && <div style={{ marginTop: 10 }}><Btn href="/connexion" tone="#7CFFB2">Aller à la connexion</Btn></div>}</div>}
      {loading && <p style={{ color: '#94a3b8' }}>Vérification…</p>}
      {r && r.failed && <p style={{ color: '#FF8A8A' }}>Impossible de lancer le diagnostic : le serveur du site ne répond pas.</p>}
      <div style={{ display: 'grid', gap: 10 }}>
        {(r ? r.checks : []).map((c) => { const [ic, col] = ICON[c.status]; return <div key={c.id} style={{ display: 'flex', gap: 14, padding: 14, borderRadius: 16, border: `1px solid ${col}55`, background: `${col}0f` }}>
          <div style={{ width: 28, height: 28, borderRadius: 14, background: `${col}33`, color: col, fontWeight: 900, display: 'grid', placeItems: 'center', flex: 'none' }}>{ic}</div>
          <div><b>{c.label}</b>{c.detail && <div style={{ color: '#C9D4E4', fontSize: 14, marginTop: 2 }}>{c.detail}</div>}{c.fix && <div style={{ color: col, fontSize: 14, marginTop: 6 }}>→ {c.fix}</div>}</div></div>; })}
      </div>
      <div><Btn onClick={run} ghostStyle disabled={loading}>Revérifier</Btn><Link href="/connexion" style={{ color: '#94a3b8', marginLeft: 12, fontSize: 14 }}>Connexion</Link></div>
    </div></main>;
}
