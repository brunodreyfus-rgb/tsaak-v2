import { supabaseForToken, isConfigured } from './supabase';

// Lit le jeton « Authorization: Bearer … » et renvoie { token, user, db } (db agit au nom de l'utilisateur).
export async function requireUser(req, res) {
  if (!isConfigured) { res.status(503).json({ error: 'Supabase n\'est pas configuré (voir SETUP.md).' }); return null; }
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : '';
  if (!token) { res.status(401).json({ error: 'Connexion requise' }); return null; }
  const db = supabaseForToken(token);
  const { data, error } = await db.auth.getUser(token);
  if (error || !data?.user) { res.status(401).json({ error: 'Session expirée, reconnecte-toi' }); return null; }
  return { token, user: data.user, db };
}

// Limiteur très simple en mémoire (suffisant pour démarrer ; par instance serveur)
const buckets = new Map();
export function rateLimit(key, max, windowMs) {
  const now = Date.now(); const b = (buckets.get(key) || []).filter((t) => now - t < windowMs);
  if (b.length >= max) { buckets.set(key, b); return false; }
  b.push(now); buckets.set(key, b); return true;
}
