import { requireUser, rateLimit } from '../../lib/apiAuth';
import { fetchPage, extractMeta } from '../../lib/scrape';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST uniquement' });
  const auth = await requireUser(req, res); if (!auth) return;
  if (!rateLimit('scrape:' + auth.user.id, 20, 60_000)) return res.status(429).json({ error: 'Trop de lectures de liens, réessaie dans une minute.' });
  const url = String((req.body && req.body.url) || '').trim();
  if (!url || url.length > 2000) return res.status(400).json({ error: 'Colle un lien valide.' });
  try {
    const { html, finalUrl } = await fetchPage(url);
    const meta = extractMeta(html, finalUrl);
    const found = Boolean(meta.title);
    return res.status(200).json({ ok: true, url: finalUrl, found, ...meta });
  } catch (e) {
    // Message clair ; le membre peut toujours remplir la preuve à la main.
    return res.status(422).json({ error: (e && e.message) || 'Lecture impossible', manual: true });
  }
}
