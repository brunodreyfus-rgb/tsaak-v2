// Les 4 familles de membres du vrai site (la « communauté » n'a pas de compte à part au démarrage).
export const CASTES = {
  expert:        { key: 'expert',        label: 'Expert',        plural: 'Experts',        color: '#7CFFB2', emoji: '🎤', blurb: 'Je suis sollicité pour mon expertise (médias, conférences, événements).' },
  intermediaire: { key: 'intermediaire', label: 'Intermédiaire', plural: 'Intermédiaires', color: '#FF4FD8', emoji: '🤝', blurb: 'Je mets en relation médias, organisations et experts (agent, programmateur, facilitateur).' },
  media:         { key: 'media',         label: 'Média',         plural: 'Médias',         color: '#00D5FF', emoji: '🎬', blurb: 'Je cherche des experts pour mes émissions, articles, podcasts.' },
  organisation:  { key: 'organisation',  label: 'Organisation',  plural: 'Organisations',  color: '#FF9B3D', emoji: '🏢', blurb: 'J\'organise des événements, conférences, formations.' },
};
export const CASTE_LIST = Object.values(CASTES);
export const casteOf = (k) => CASTES[k] || CASTES.expert;

// Qui peut publier un Wanted (même règle que la base)
export const canPublishWanted = (caste) => caste === 'media' || caste === 'organisation';

export const PROOF_KINDS = [
  ['article', 'Article / presse'], ['video', 'Vidéo'], ['podcast', 'Podcast'], ['tv', 'TV'], ['radio', 'Radio'], ['event', 'Conférence / événement'], ['other', 'Autre'],
];
export const INVITE_STATUS = { pending: 'Lien créé', sent: 'Email envoyé', accepted: 'A rejoint', revoked: 'Annulée' };

export function tierColor(name) {
  return { 'Élite': '#F6FF00', 'Confirmé': '#7CFFB2', 'Montant': '#00D5FF', 'Émergent': '#FF9B3D' }[name] || '#00D5FF';
}
export function fmtDate(iso, opts) {
  if (!iso) return '';
  try { return new Date(iso).toLocaleDateString('fr-FR', opts || { day: 'numeric', month: 'short', year: 'numeric' }); } catch { return ''; }
}
export function fmtDateTime(iso) {
  if (!iso) return '';
  try { return new Date(iso).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }); } catch { return ''; }
}
export function isoDay(d) {
  const x = new Date(d); const m = String(x.getMonth() + 1).padStart(2, '0'); const dd = String(x.getDate()).padStart(2, '0');
  return `${x.getFullYear()}-${m}-${dd}`;
}
export function siteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '');
  if (typeof window !== 'undefined') return window.location.origin;
  return '';
}
export function inviteLink(token) { return `${siteUrl()}/rejoindre/${token}`; }

// Nuage de mots : compétences d'abord (plus gros), puis mots-clés. Taille déterministe.
export function wordCloudOf(skills = [], keywords = []) {
  const seen = new Set(); const out = [];
  const h = (s) => { let x = 2166136261; for (let i = 0; i < s.length; i++) { x ^= s.charCodeAt(i); x = Math.imul(x, 16777619); } return x >>> 0; };
  [...skills.map((w) => [w, 1]), ...keywords.map((w) => [w, 0])].forEach(([w, isSkill]) => {
    const k = String(w).trim(); if (!k || seen.has(k.toLowerCase())) return; seen.add(k.toLowerCase());
    out.push({ w: k, size: (isSkill ? 20 : 14) + (h(k) % 4) * 4 });
  });
  return out.slice(0, 16);
}
export function cleanTags(arr, max = 20) {
  const seen = new Set(); const out = [];
  (arr || []).forEach((t) => { const v = String(t).trim().replace(/\s+/g, ' ').slice(0, 40); if (v && !seen.has(v.toLowerCase())) { seen.add(v.toLowerCase()); out.push(v); } });
  return out.slice(0, max);
}
export function normalizeUrl(u) {
  let s = String(u || '').trim(); if (!s) return '';
  if (!/^https?:\/\//i.test(s)) s = 'https://' + s;
  try { const x = new URL(s); if (!/^https?:$/.test(x.protocol)) return ''; return x.toString(); } catch { return ''; }
}

export const EMAIL_RE = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;
// « Marie Durand <marie@x.fr> » | « marie@x.fr » | « Marie Durand, marie@x.fr » → { name, email }
export function parseInviteLine(line) {
  const s = String(line).trim(); if (!s) return null;
  let m = s.match(/^(.*?)<\s*([^>\s]+)\s*>$/); if (m && EMAIL_RE.test(m[2])) return { name: m[1].replace(/["',;]+/g, ' ').replace(/\s+/g, ' ').trim(), email: m[2].toLowerCase() };
  const parts = s.split(/[;,\t]/).map((x) => x.trim()).filter(Boolean);
  const em = parts.find((x) => EMAIL_RE.test(x)); if (em) return { name: parts.filter((x) => x !== em).join(' '), email: em.toLowerCase() };
  return { name: s.slice(0, 80), email: '' }; // simple prénom/nom : lien sans email
}

