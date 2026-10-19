import { requireUser, rateLimit } from '../../lib/apiAuth';

const esc = (s) => String(s || '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const CASTE_FR = { expert: 'expert', intermediaire: 'intermédiaire', media: 'média', organisation: 'organisation' };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST uniquement' });
  const auth = await requireUser(req, res); if (!auth) return;
  const key = process.env.RESEND_API_KEY; const from = process.env.INVITE_FROM_EMAIL;
  if (!key || !from) return res.status(501).json({ error: 'L\'envoi d\'email n\'est pas encore configuré (RESEND_API_KEY / INVITE_FROM_EMAIL). Copie le lien et envoie-le toi-même.', manual: true });
  if (!rateLimit('invite:' + auth.user.id, 30, 60 * 60_000)) return res.status(429).json({ error: 'Trop d\'emails envoyés cette heure-ci.' });

  const id = String((req.body && req.body.invitation_id) || '');
  // RLS : on ne peut lire que SES invitations
  const { data: inv, error } = await auth.db.from('invitations').select('id,token,email,name,caste,message,status').eq('id', id).maybeSingle();
  if (error || !inv) return res.status(404).json({ error: 'Invitation introuvable' });
  if (!inv.email) return res.status(400).json({ error: 'Cette invitation n\'a pas d\'adresse email.' });
  if (inv.status === 'accepted' || inv.status === 'revoked') return res.status(409).json({ error: 'Cette invitation n\'est plus active.' });

  const { data: me } = await auth.db.from('profiles').select('display_name').eq('id', auth.user.id).maybeSingle();
  const inviter = (me && me.display_name) || 'Un membre TSAAK';
  const base = (process.env.NEXT_PUBLIC_SITE_URL || `https://${req.headers.host}`).replace(/\/$/, '');
  const link = `${base}/rejoindre/${inv.token}`;
  const role = CASTE_FR[inv.caste] || 'membre';
  const hello = inv.name ? `Bonjour ${esc(inv.name)},` : 'Bonjour,';
  const html = `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;color:#111">
    <h2 style="margin:0 0 12px">${esc(inviter)} t'invite à rejoindre TSAAK</h2>
    <p>${hello}</p>
    <p>TSAAK met en relation médias, organisations et experts. Tu es invité(e) en tant que <b>${esc(role)}</b>.</p>
    ${inv.message ? `<blockquote style="margin:16px 0;padding:10px 14px;background:#f3f4f6;border-radius:8px">${esc(inv.message)}</blockquote>` : ''}
    <p style="margin:24px 0"><a href="${esc(link)}" style="background:#00a8cc;color:#fff;padding:12px 20px;border-radius:10px;text-decoration:none;font-weight:bold">Créer mon profil</a></p>
    <p style="color:#555;font-size:13px">Ou copie ce lien : ${esc(link)}<br>Ce lien est personnel, ne le transfère pas.</p></div>`;
  const text = `${inviter} t'invite à rejoindre TSAAK en tant que ${role}.\n${inv.message ? `\n« ${inv.message} »\n` : ''}\nCréer mon profil : ${link}\n\nCe lien est personnel.`;

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: [inv.email], subject: `${inviter} t'invite à rejoindre TSAAK`, html, text }),
    });
    if (!r.ok) { const t = await r.text().catch(() => ''); return res.status(502).json({ error: 'Resend a refusé l\'envoi : ' + t.slice(0, 200) }); }
  } catch (e) { return res.status(502).json({ error: 'Envoi impossible : ' + (e.message || 'réseau') }); }

  await auth.db.from('invitations').update({ status: 'sent', email_sent_at: new Date().toISOString() }).eq('id', inv.id);
  return res.status(200).json({ ok: true });
}
