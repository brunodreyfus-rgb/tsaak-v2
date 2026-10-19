import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Le site compile et s'affiche même sans configuration : les pages /espace montrent alors un écran « à configurer ».
export const isConfigured = Boolean(url && anon);

export const supabase = isConfigured
  ? createClient(url, anon, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } })
  : null;

// Client « serveur » qui agit AU NOM de l'utilisateur (son jeton) : les règles RLS s'appliquent, aucune clé secrète n'est nécessaire.
export function supabaseForToken(token) {
  if (!isConfigured) throw new Error('Supabase non configuré');
  return createClient(url, anon, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
