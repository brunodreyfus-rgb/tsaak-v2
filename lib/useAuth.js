import { useCallback, useEffect, useState } from 'react';
import { supabase, isConfigured } from './supabase';

// Colonnes lisibles côté client (internal_score / is_admin sont volontairement exclus)
export const PROFILE_COLS = 'id,caste,display_name,headline,bio,city,photo_url,skills,keywords,links,published,calendar_active,criteria,invited_by,created_at';

export function useAuth() {
  const [state, setState] = useState({ loading: true, session: null, profile: null, error: '' });

  const loadProfile = useCallback(async (session) => {
    if (!session) { setState({ loading: false, session: null, profile: null, error: '' }); return; }
    const { data, error } = await supabase.from('profiles').select(PROFILE_COLS).eq('id', session.user.id).maybeSingle();
    setState({ loading: false, session, profile: data || null, error: error ? error.message : '' });
  }, []);

  useEffect(() => {
    if (!isConfigured) { setState({ loading: false, session: null, profile: null, error: '' }); return; }
    let alive = true;
    supabase.auth.getSession().then(({ data }) => { if (alive) loadProfile(data.session); });
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => { if (alive) loadProfile(session); });
    return () => { alive = false; sub.subscription.unsubscribe(); };
  }, [loadProfile]);

  const refresh = useCallback(() => loadProfile(state.session), [loadProfile, state.session]);
  const setProfile = useCallback((patch) => setState((s) => ({ ...s, profile: s.profile ? { ...s.profile, ...patch } : s.profile })), []);
  return { ...state, refresh, setProfile, configured: isConfigured };
}

// Jeton pour appeler nos routes /api/* (lecture de lien, email d'invitation)
export async function authHeaders() {
  const { data } = await supabase.auth.getSession();
  const t = data.session && data.session.access_token;
  return { 'Content-Type': 'application/json', ...(t ? { Authorization: `Bearer ${t}` } : {}) };
}
export async function callApi(path, body) {
  const r = await fetch(path, { method: 'POST', headers: await authHeaders(), body: JSON.stringify(body || {}) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) { const e = new Error(j.error || 'Erreur'); e.manual = j.manual; e.status = r.status; throw e; }
  return j;
}
