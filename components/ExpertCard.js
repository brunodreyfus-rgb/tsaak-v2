import Link from 'next/link';
import { card, colors, Badge, GameGauges, SkillChips, AvailabilityBadge, tierFor } from './RichDemoUI';
import { Avatar } from './Espace';

// Fiche résumée d'un expert dans la recherche : compétences d'abord, rang (pas de chiffre), jauges, dispo.
export default function ExpertCard({ e, selected, onSelect, inShortlist, onShortlist }) {
  const tierName = e.tier; const tier = { 'Élite': '#F6FF00', 'Confirmé': '#7CFFB2', 'Montant': '#00D5FF', 'Émergent': '#FF9B3D' }[tierName] || '#00D5FF';
  return <div style={{ ...card(selected ? colors.core : colors.talent), display: 'grid', gap: 14, alignContent: 'start', outline: selected ? `2px solid ${colors.core}` : 'none' }}>
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <Avatar src={e.photo_url} name={e.display_name} size={56} />
      <div style={{ minWidth: 0, flex: 1 }}>
        <Link href={`/espace/expert/${e.id}`} style={{ color: '#fff', fontWeight: 900, fontSize: 18, textDecoration: 'none' }}>{e.display_name}</Link>
        <div style={{ color: '#94a3b8', fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.headline}{e.city ? ` · ${e.city}` : ''}</div>
      </div>
      {onSelect && <input type="checkbox" checked={Boolean(selected)} onChange={() => onSelect(e.id)} aria-label={`Sélectionner ${e.display_name}`} style={{ width: 20, height: 20 }} />}
    </div>
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}><Badge c={tier}>Rang {tierName}</Badge><AvailabilityBadge status={e.availability === 'calendrier' ? 'dispo' : e.availability} /></div>
    {(e.skills || []).length > 0 ? <SkillChips skills={e.skills} max={4} c={colors.talent} /> : <span style={{ color: '#64748b', fontSize: 12 }}>Compétences non renseignées</span>}
    <GameGauges values={e.criteria} compact />
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <Link href={`/espace/expert/${e.id}`} style={{ ...{ textDecoration: 'none', color: '#fff', padding: '9px 14px', borderRadius: 999, border: `1px solid ${colors.talent}`, background: `${colors.talent}22`, fontSize: 13, fontWeight: 800 } }}>Voir la fiche</Link>
      {onShortlist && <button onClick={() => onShortlist(e.id)} style={{ cursor: 'pointer', color: '#fff', padding: '9px 14px', borderRadius: 999, border: '1px solid rgba(255,255,255,.25)', background: inShortlist ? 'rgba(246,255,0,.15)' : 'transparent', fontSize: 13, fontWeight: 800, fontFamily: 'inherit' }}>{inShortlist ? '★ En shortlist' : '☆ Shortlist'}</button>}
    </div>
  </div>;
}
