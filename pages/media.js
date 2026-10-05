import { page, card, colors, Badge, Masthead, PERSONAS, StatCard, PerfCard, ActivityCard } from '../components/RichDemoUI';

export default function Media(){
  const c = colors.media;
  const me = PERSONAS.find(p=>p.key==='media');
  return <main style={page('media')}>
    <Masthead active='castes'/>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:16,marginBottom:22}}>
      <div><Badge c={c}>CASTE MEDIA</Badge><h1 style={{margin:'10px 0 4px'}}>Salut {me.name} 👋</h1><p style={{color:'#AAB3C5',margin:0}}>{me.role} — 4 Wanted actifs attendent une shortlist.</p></div>
      <img src={me.photo} style={{width:64,height:64,borderRadius:20,objectFit:'cover',border:`1px solid ${c}55`}}/>
    </div>

    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:14,marginBottom:18}}>
      <StatCard c={c} label='Wanted actifs' value='4'/>
      <StatCard c={c} label='Réponses reçues' value='12' delta='+3 cette semaine'/>
      <StatCard c={c} label='Contrats en cours' value='2'/>
      <StatCard c={colors.core} label='Score moyen guests' value='89' delta='+4 pts'/>
    </div>

    <div style={{display:'grid',gridTemplateColumns:'1.1fr 1.4fr',gap:16,marginBottom:26,alignItems:'stretch'}}>
      <PerfCard c={c} title='Score moyen des guests invités' value='89' data={[72,76,79,81,84,86,89]} caption='Recalculé à chaque nouvelle preuve média ajoutée par un guest.'/>
      <ActivityCard c={c} title='Wanted en cours' badge='4 actifs' rows={[
        { icon:'🎙', title:'Expert IA & société pour plateau TV', subtitle:'3 propositions reçues · 1 talent externe à inviter', right:'75%', rightSub:'Statut' },
        { icon:'🌍', title:'Chroniqueur économie — matinale', subtitle:'1 proposition reçue · en attente intermédiaire', right:'40%', rightSub:'Statut' },
      ]} cta={{ href:'/media/proposals', label:'Voir toutes les propositions' }}/>
    </div>

    <h2>Business cases à tester depuis cette caste</h2>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(210px,1fr))',gap:14,marginBottom:26}}>
      <Case c={c} href='/search' title='Recherche' text='Filtrez la base de talents en direct.'/>
      <Case c={colors.intermediaire} href='/patchwork' title='Patchwork' text='Suggestions passives poussées par l’IA.'/>
      <Case c={c} href='/wanted' title='Créer un Wanted' text='Publiez un besoin, recevez des propositions.'/>
      <Case c={colors.talent} href='/ai-search' title='Assistant IA' text='Décrivez votre besoin en langage naturel.'/>
      <Case c={colors.organisation} href='/help-me' title='Help Me urgent' text='Un besoin en moins de 2h ? Activez le réseau.'/>
      <Case c={colors.core} href='/shortlist' title='Multi-message' text='Contactez plusieurs talents en un clic.'/>
      <Case c={colors.organisation} href='/contract' title='Contrat & paiement' text='Signature électronique puis paiement en ligne.'/>
      <Case c={colors.intermediaire} href='/mercato' title='Mercato' text='Positionnez-vous sur un Guest libre.'/>
    </div>
  </main>;
}
function Case({c,href,title,text}){return <a href={href} style={{...card(c),textDecoration:'none',color:'#fff',padding:18}}><Badge c={c}>{title}</Badge><p style={{color:'#C9D4E4',margin:'8px 0 0',fontSize:13}}>{text}</p></a>;}
