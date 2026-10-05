import { page, card, colors, Badge, Masthead, PERSONAS, StatCard, PerfCard, ActivityCard } from '../components/RichDemoUI';

export default function Intermediaires(){
  const c = colors.intermediaire;
  const me = PERSONAS.find(p=>p.key==='intermediaire');
  return <main style={page('intermediaire')}>
    <Masthead active='castes'/>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:16,marginBottom:22}}>
      <div><Badge c={c}>CASTE INTERMÉDIAIRE</Badge><h1 style={{margin:'10px 0 4px'}}>Salut {me.name} 👋</h1><p style={{color:'#AAB3C5',margin:0}}>{me.role} — 5 Wanted cherchent des profils que tu pourrais proposer.</p></div>
      <img src={me.photo} style={{width:64,height:64,borderRadius:20,objectFit:'cover',border:`1px solid ${c}55`}}/>
    </div>

    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:14,marginBottom:18}}>
      <StatCard c={c} label='Wanted ouverts' value='5'/>
      <StatCard c={c} label='Deals acceptés' value='2' delta='+1 cette semaine'/>
      <StatCard c={colors.core} label='Commission cumulée' value='4 200 €' delta='+650 €'/>
      <StatCard c={c} label='Guests en Mercato' value='3'/>
    </div>

    <div style={{display:'grid',gridTemplateColumns:'1.1fr 1.4fr',gap:16,marginBottom:26,alignItems:'stretch'}}>
      <PerfCard c={c} title='Commission cumulée' value='4 200 €' data={[1800,2300,2750,3100,3600,3950,4200]} caption='Suivez vos commissions passer de Pending à Paid.'/>
      <ActivityCard c={c} title='Wanted à pourvoir' badge='5 ouverts' rows={[
        { icon:'🔎', title:'Expert cybersécurité — table ronde Web3', subtitle:'Proposez un talent TSAAK ou externe', right:'Ouvert', rightColor:c },
        { icon:'⇄', title:'Guest Tier 4K — négociation Mercato', subtitle:'Palier proposé : 4 200 €/mois', right:'En cours', rightColor:colors.core },
      ]} cta={{ href:'/intermediaires/respond', label:'Répondre à un Wanted' }}/>
    </div>

    <h2>Business cases à tester depuis cette caste</h2>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(210px,1fr))',gap:14,marginBottom:26}}>
      <Case c={c} href='/intermediaires/respond' title='Répondre à un Wanted' text='Proposez vos talents ou un profil externe.'/>
      <Case c={colors.intermediaire} href='/mercato' title='Mercato' text='Placez vos Guests, négociez les paliers 2K/4K/6K.'/>
      <Case c={colors.organisation} href='/contract' title='Contrat & paiement' text='Voyez votre commission passer de Pending à Paid.'/>
      <Case c={colors.talent} href='/talent-onboarding/intermediaire' title='Inviter un talent externe' text='Simulez l’invitation d’un profil non-inscrit.'/>
      <Case c={colors.core} href='/score-explained' title='Score TSAAK' text='Le score détermine la valeur de vos placements.'/>
    </div>
  </main>;
}
function Case({c,href,title,text}){return <a href={href} style={{...card(c),textDecoration:'none',color:'#fff',padding:18}}><Badge c={c}>{title}</Badge><p style={{color:'#C9D4E4',margin:'8px 0 0',fontSize:13}}>{text}</p></a>;}
