// Vérifie l'installation (variables, Supabase joignable, schema.sql exécuté, compte admin…).
// Ne renvoie QUE des constats (ok / attention / erreur) : jamais de clé, jamais de données.
function jwtRole(key) {
  try { const p = JSON.parse(Buffer.from(String(key).split('.')[1], 'base64url').toString('utf8')); return p.role || ''; } catch { return ''; }
}
const C = (id, label, status, detail, fix) => ({ id, label, status, detail: detail || '', fix: fix || '' });

export async function runDiagnostics(env, fetchFn = fetch) {
  const out = [];
  const url = (env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
  const key = (env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();
  const site = (env.NEXT_PUBLIC_SITE_URL || '').trim();

  // 1. URL Supabase
  let urlOk = false;
  if (!url) out.push(C('url', 'Adresse Supabase (NEXT_PUBLIC_SUPABASE_URL)', 'error', 'Variable absente.', 'Supabase → Project Settings → API → « Project URL ». Colle-la dans la variable, puis redémarre (ou redéploie sur Vercel).'));
  else if (/supabase\.com\/dashboard/.test(url)) out.push(C('url', 'Adresse Supabase', 'error', 'Tu as collé l\'adresse du tableau de bord.', 'Il faut le « Project URL » de Project Settings → API, de la forme https://xxxx.supabase.co'));
  else if (!/^https?:\/\//.test(url)) out.push(C('url', 'Adresse Supabase', 'error', 'L\'adresse doit commencer par https://', 'Exemple : https://abcdefgh.supabase.co'));
  else if (/\/(rest|auth)\/v1/.test(url) || /\/$/.test(url)) out.push(C('url', 'Adresse Supabase', 'error', 'L\'adresse ne doit contenir ni « / » final ni « /rest/v1 ».', 'Garde seulement https://xxxx.supabase.co'));
  else { urlOk = true; out.push(C('url', 'Adresse Supabase', 'ok', 'Format correct.')); }

  // 2. Clé publique
  let keyOk = false;
  if (!key) out.push(C('key', 'Clé « anon public » (NEXT_PUBLIC_SUPABASE_ANON_KEY)', 'error', 'Variable absente.', 'Supabase → Project Settings → API → clé « anon public » (ou « publishable »).'));
  else if (/^sb_secret_/.test(key) || jwtRole(key) === 'service_role') out.push(C('key', 'Clé Supabase', 'error', 'DANGER : c\'est la clé secrète (service_role), pas la clé publique.', 'Remplace-la tout de suite par la clé « anon public », et régénère la clé secrète dans Supabase si elle a été publiée (GitHub, Vercel…).'));
  else if (/^sb_publishable_/.test(key) || jwtRole(key) === 'anon') { keyOk = true; out.push(C('key', 'Clé publique Supabase', 'ok', 'Bonne clé (publique).')); }
  else out.push(C('key', 'Clé publique Supabase', 'warn', 'Format inattendu.', 'Vérifie que c\'est bien la clé « anon public » (longue, commence par eyJ… ou sb_publishable_…).'));

  // 3. Adresse du site
  if (!site) out.push(C('site', 'Adresse du site (NEXT_PUBLIC_SITE_URL)', 'warn', 'Absente : les liens d\'invitation utiliseront l\'adresse du navigateur, et les emails d\'invitation celle du serveur.', 'Mets l\'adresse publique (ex. https://tsaak.vercel.app), sans « / » final.'));
  else if (/\/$/.test(site) || !/^https?:\/\//.test(site)) out.push(C('site', 'Adresse du site', 'warn', 'Doit être de la forme https://mon-site.fr, sans « / » final.', ''));
  else if (/localhost|127\.0\.0\.1/.test(site)) out.push(C('site', 'Adresse du site', 'warn', 'Adresse locale : les liens d\'invitation ne marcheront pas pour les autres.', 'En production, mets l\'adresse publique du site.'));
  else out.push(C('site', 'Adresse du site', 'ok', site));

  // 4. Resend
  const rk = !!(env.RESEND_API_KEY || '').trim(), rf = !!(env.INVITE_FROM_EMAIL || '').trim();
  if (rk && rf) out.push(C('resend', 'Envoi d\'emails (Resend)', 'ok', 'Configuré (non testé ici : un envoi réel le confirmera).'));
  else if (rk || rf) out.push(C('resend', 'Envoi d\'emails (Resend)', 'warn', 'Il manque ' + (rk ? 'INVITE_FROM_EMAIL' : 'RESEND_API_KEY') + '.', 'Renseigne les deux, ou aucun.'));
  else out.push(C('resend', 'Envoi d\'emails (Resend)', 'info', 'Non configuré — facultatif. Tu peux inviter avec « Copier le lien », WhatsApp ou ton mail.'));

  if (!urlOk || !keyOk) return summarize(out);

  const H = { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' };
  const call = async (path, init = {}) => {
    const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), 8000);
    try { const r = await fetchFn(url + path, { ...init, headers: { ...H, ...(init.headers || {}) }, signal: ctrl.signal }); let body = null; try { body = await r.json(); } catch {} return { status: r.status, body }; }
    catch (e) { return { status: 0, error: (e && e.name === 'AbortError') ? 'délai dépassé' : 'injoignable' }; }
    finally { clearTimeout(t); }
  };

  // 5. Supabase joignable + réglages d'authentification
  const st = await call('/auth/v1/settings');
  if (st.status === 0) { out.push(C('reach', 'Supabase joignable', 'error', 'Aucune réponse (' + st.error + ').', 'L\'adresse est probablement fausse, ou le projet est en pause (Supabase met en pause les projets gratuits inactifs : ouvre-le dans le tableau de bord et clique « Restore »).')); return summarize(out); }
  if (st.status === 401 || st.status === 403) { out.push(C('reach', 'Supabase joignable', 'error', 'La clé a été refusée.', 'Recopie la clé « anon public » du même projet que l\'adresse.')); return summarize(out); }
  if (st.status !== 200) { out.push(C('reach', 'Supabase joignable', 'error', 'Réponse inattendue (' + st.status + ').', 'Vérifie l\'adresse du projet.')); return summarize(out); }
  out.push(C('reach', 'Supabase joignable', 'ok', 'Adresse et clé acceptées.'));
  const s = st.body || {};
  if (s.disable_signup === true) out.push(C('signup', 'Inscriptions Supabase', 'error', 'Les inscriptions sont désactivées dans Supabase : personne ne pourra utiliser un lien d\'invitation.', 'Authentication → Sign In / Providers (ou Settings) : réactive « Allow new users to sign up ». TSAAK reste sur invitation grâce à sa propre règle.'));
  else if (s.external && s.external.email === false) out.push(C('signup', 'Connexion par email', 'error', 'Le fournisseur Email est désactivé.', 'Authentication → Sign In / Providers → Email : active-le.'));
  else out.push(C('signup', 'Inscriptions / connexion par email', 'ok', 'Autorisées.'));
  out.push(C('confirm', 'Confirmation d\'email', 'info', s.mailer_autoconfirm ? 'Désactivée : la personne est connectée dès la création du compte (recommandé pour démarrer).' : 'Activée : chaque invité doit cliquer un lien reçu par mail avant de se connecter. Les emails gratuits Supabase sont très limités ; pour démarrer, tu peux la désactiver (Authentication → Sign In / Providers → Email → « Confirm email »).'));

  // 6. schema.sql exécuté ?
  const ss = await call('/rest/v1/rpc/setup_status', { method: 'POST', body: '{}' });
  const missing = (r) => r.status === 404 || (r.body && /PGRST202|PGRST205|42883|42P01/.test(String(r.body.code)));
  if (missing(ss)) {
    const gi = await call('/rest/v1/rpc/get_invitation', { method: 'POST', body: JSON.stringify({ p_token: 'diagnostic' }) });
    if (missing(gi)) out.push(C('schema', 'Base de données (schema.sql)', 'error', 'Les tables TSAAK n\'existent pas.', 'Supabase → SQL Editor → New query → colle TOUT le fichier supabase/schema.sql → Run. Il doit se terminer par « Success ».'));
    else out.push(C('schema', 'Base de données (schema.sql)', 'warn', 'Ancienne version du schéma (il manque la fonction de diagnostic).', 'Rejoue le fichier supabase/schema.sql complet dans le SQL Editor : c\'est sans risque et ça ne supprime rien.'));
    return summarize(out);
  }
  if (ss.status !== 200 || !ss.body) { out.push(C('schema', 'Base de données (schema.sql)', 'error', 'Réponse inattendue (' + ss.status + ').', 'Rejoue supabase/schema.sql et lis le message d\'erreur éventuel.')); return summarize(out); }
  const b = ss.body;
  out.push(C('schema', 'Base de données (schema.sql)', 'ok', 'Schéma installé.'));
  out.push(b.trigger_ok ? C('trigger', 'Création automatique des profils', 'ok', '') : C('trigger', 'Création automatique des profils', 'error', 'Le déclencheur d\'inscription manque : les nouveaux comptes n\'auraient pas de profil.', 'Rejoue supabase/schema.sql en entier (le SQL Editor doit terminer sans erreur).'));
  out.push(b.has_admin ? C('admin', 'Compte administrateur', 'ok', 'Il existe.') : (b.has_profiles ? C('admin', 'Compte administrateur', 'warn', 'Des profils existent mais aucun administrateur.', 'Dans le SQL Editor : update public.profiles set is_admin = true where id = (select id from auth.users where email = \'ton@email\');') : C('admin', 'Compte administrateur', 'error', 'Aucun compte n\'existe encore. L\'inscription étant sur invitation, le premier compte se crée à la main.', 'Supabase → Authentication → Users → Add user → Create new user (ton email + mot de passe, coche « Auto Confirm User »). Il devient automatiquement administrateur. Puis connecte-toi sur /connexion.')));
  out.push(C('invite_only', 'Inscription', 'info', b.invite_only ? 'Sur invitation uniquement (recommandé).' : 'Ouverte à tous (invite_only = false).'));

  // 7. Droits anonymes (sécurité)
  const pr = await call('/rest/v1/profiles?select=id&limit=1');
  if (pr.status === 200 && Array.isArray(pr.body) && pr.body.length > 0) out.push(C('rls', 'Protection des données', 'error', 'Des profils sont lisibles sans connexion.', 'Rejoue supabase/schema.sql en entier (les droits sont posés à la fin du fichier).'));
  else out.push(C('rls', 'Protection des données', 'ok', 'Les tables ne sont pas lisibles sans connexion.'));

  // 8. Stockage des photos
  const bk = await call('/storage/v1/object/public/avatars/diagnostic.png');
  const msg = JSON.stringify(bk.body || {});
  if (/Bucket not found/i.test(msg)) out.push(C('storage', 'Stockage des photos', 'warn', 'Le dossier « avatars » n\'existe pas : l\'envoi de photos échouera.', 'Rejoue supabase/schema.sql (il crée le dossier), ou Storage → New bucket « avatars » en public.'));
  else out.push(C('storage', 'Stockage des photos', 'ok', 'Dossier « avatars » présent.'));
  return summarize(out);
}

function summarize(checks) {
  const errors = checks.filter((c) => c.status === 'error').length, warns = checks.filter((c) => c.status === 'warn').length;
  return { checks, errors, warns, ready: errors === 0 };
}
