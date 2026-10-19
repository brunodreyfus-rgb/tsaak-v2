// Lecture d'un lien collé (article, vidéo, podcast…) : titre, média, image, date. SANS IA : lecture des balises standard
// (Open Graph, Twitter, JSON-LD, <title>). Rien n'est inventé : un champ introuvable reste vide.
import dns from 'node:dns/promises';
import net from 'node:net';

// ---------- SSRF : refuse les adresses privées / locales ----------
export function isPrivateIp(ip) {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split('.').map(Number);
    return a === 0 || a === 10 || a === 127 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127) || a >= 224;
  }
  if (net.isIPv6(ip)) {
    const x = ip.toLowerCase();
    if (x === '::1' || x === '::') return true;
    if (x.startsWith('fe8') || x.startsWith('fe9') || x.startsWith('fea') || x.startsWith('feb') || x.startsWith('fc') || x.startsWith('fd')) return true;
    const m = x.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/); if (m) return isPrivateIp(m[1]);
    return false;
  }
  return true;
}
export async function assertPublicUrl(raw) {
  let u; try { u = new URL(raw); } catch { throw new Error('Lien invalide'); }
  if (!/^https?:$/.test(u.protocol)) throw new Error('Seuls les liens http(s) sont acceptés');
  if (u.username || u.password) throw new Error('Lien invalide');
  if (u.port && !['80', '443'].includes(u.port)) throw new Error('Port non autorisé');
  const host = u.hostname.replace(/^\[|\]$/g, '');
  if (host === 'localhost' || host.endsWith('.local') || host.endsWith('.internal')) throw new Error('Adresse non autorisée');
  const ips = net.isIP(host) ? [host] : (await dns.lookup(host, { all: true })).map((r) => r.address);
  if (!ips.length || ips.some(isPrivateIp)) throw new Error('Adresse non autorisée');
  return u;
}

// ---------- Récupération (redirections revérifiées, taille et durée limitées) ----------
export async function fetchPage(raw, { maxBytes = 1_500_000, timeoutMs = 8000, maxRedirects = 4 } = {}) {
  let url = raw;
  for (let i = 0; i <= maxRedirects; i++) {
    const u = await assertPublicUrl(url);
    const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), timeoutMs);
    let res;
    try {
      res = await fetch(u, { redirect: 'manual', signal: ctrl.signal, headers: { 'user-agent': 'Mozilla/5.0 (compatible; TSAAKBot/1.0; lecture de lien par un membre)', accept: 'text/html,application/xhtml+xml', 'accept-language': 'fr,en;q=0.8' } });
    } finally { clearTimeout(t); }
    if (res.status >= 300 && res.status < 400 && res.headers.get('location')) { url = new URL(res.headers.get('location'), u).toString(); continue; }
    if (!res.ok) throw new Error(`Le site a répondu ${res.status}`);
    const ct = res.headers.get('content-type') || '';
    if (!/text\/html|application\/xhtml/i.test(ct)) throw new Error('Ce lien n\'est pas une page web lisible');
    const reader = res.body.getReader(); const chunks = []; let size = 0;
    while (true) { const { done, value } = await reader.read(); if (done) break; size += value.length; chunks.push(value); if (size >= maxBytes) { try { await reader.cancel(); } catch {} break; } }
    const html = new TextDecoder('utf-8', { fatal: false }).decode(Buffer.concat(chunks.map((c) => Buffer.from(c))));
    return { html, finalUrl: u.toString() };
  }
  throw new Error('Trop de redirections');
}

// ---------- Extraction (pure : testable sans réseau) ----------
const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
  eacute: 'é', egrave: 'è', ecirc: 'ê', euml: 'ë', agrave: 'à', acirc: 'â', auml: 'ä', ccedil: 'ç', ocirc: 'ô', ouml: 'ö', ucirc: 'û', ugrave: 'ù', uuml: 'ü', icirc: 'î', iuml: 'ï', oelig: 'œ',
  Eacute: 'É', Egrave: 'È', Agrave: 'À', Ccedil: 'Ç', rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“', laquo: '«', raquo: '»', hellip: '…', ndash: '–', mdash: '—', euro: '€' };
export function decodeEntities(s) {
  return String(s || '').replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (m, e) => {
    if (e[0] === '#') { const n = e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10); try { return String.fromCodePoint(n); } catch { return ''; } }
    return ENT[e] ?? ENT[e.toLowerCase()] ?? m;
  }).replace(/\s+/g, ' ').trim();
}
function metaMap(html) {
  const map = {};
  const re = /<meta\s+([^>]*?)\/?>/gi; let m;
  while ((m = re.exec(html))) {
    const attrs = {}; const ar = /([a-zA-Z:_-]+)\s*=\s*("([^"]*)"|'([^']*)')/g; let a;
    while ((a = ar.exec(m[1]))) attrs[a[1].toLowerCase()] = a[3] ?? a[4] ?? '';
    const key = (attrs.property || attrs.name || attrs.itemprop || '').toLowerCase();
    if (key && attrs.content != null && !(key in map)) map[key] = decodeEntities(attrs.content);
  }
  return map;
}
function jsonLd(html) {
  const out = []; const re = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi; let m;
  while ((m = re.exec(html))) { try { const j = JSON.parse(m[1].trim()); (Array.isArray(j) ? j : j['@graph'] || [j]).forEach((x) => x && typeof x === 'object' && out.push(x)); } catch {} }
  return out;
}
export function kindOf(url, ogType = '') {
  const h = (() => { try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return ''; } })();
  if (/youtube\.com|youtu\.be|vimeo\.com|dailymotion\.com|twitch\.tv/.test(h) || /video/i.test(ogType)) return 'video';
  if (/spotify\.com|podcasts\.apple\.com|deezer\.com|soundcloud\.com|acast\.com|podcast/.test(h)) return 'podcast';
  if (/radiofrance\.fr|franceinter\.fr|franceinfo\.fr|rtl\.fr|europe1\.fr|rmc\.bfmtv\.com|radio/.test(h)) return 'radio';
  if (/tf1info\.fr|france\.tv|francetvinfo\.fr|bfmtv\.com|cnews\.fr|lci\.fr|tv/.test(h)) return 'tv';
  return 'article';
}
export function extractMeta(html, url) {
  const m = metaMap(html || '');
  const ld = jsonLd(html || '');
  const ldMain = ld.find((x) => /Article|NewsArticle|VideoObject|PodcastEpisode|AudioObject|WebPage|BlogPosting/i.test(String([].concat(x['@type'] || []).join(' ')))) || {};
  const titleTag = (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1];
  const title = decodeEntities(m['og:title'] || m['twitter:title'] || ldMain.headline || ldMain.name || titleTag || '');
  const rawImage = m['og:image'] || m['og:image:url'] || m['twitter:image'] || (typeof ldMain.image === 'string' ? ldMain.image : (ldMain.image && (ldMain.image.url || (Array.isArray(ldMain.image) && (ldMain.image[0].url || ldMain.image[0]))))) || '';
  let thumbnail = ''; try { if (rawImage) { const u = new URL(rawImage, url); if (/^https?:$/.test(u.protocol)) thumbnail = u.toString(); } } catch {}
  const source = decodeEntities(m['og:site_name'] || m['application-name'] || (ldMain.publisher && (ldMain.publisher.name || '')) || '') || (() => { try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return ''; } })();
  const dateRaw = m['article:published_time'] || m['og:published_time'] || m['date'] || m['pubdate'] || m['datepublished'] || m['video:release_date'] || ldMain.datePublished || ldMain.uploadDate || ldMain.dateCreated || '';
  let published_on = ''; const d = String(dateRaw).match(/^(\d{4})-(\d{2})-(\d{2})/); if (d) published_on = `${d[1]}-${d[2]}-${d[3]}`;
  const description = decodeEntities(m['og:description'] || m['description'] || m['twitter:description'] || ldMain.description || '').slice(0, 400);
  return { title: title.slice(0, 200), source: source.slice(0, 80), thumbnail, published_on, description, kind: kindOf(url, m['og:type']) };
}
