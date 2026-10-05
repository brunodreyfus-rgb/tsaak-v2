import { page, card, colors, Badge, Masthead, PERSONAS, StatCard, PerfCard, ActivityCard } from '../components/RichDemoUI';

export default function Communaute(){
  const c = colors.communaute;
  const me = PERSONAS.find(p=>p.key==='communaute');
  return <main style={page('communaute')}>
    <Masthead active='castes'/>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:16,marginBottom:22}}>
      <div><Badge c={c}>CASTE COMMUNAUTÉ</Badge><h1 style={{margin:'10px 0 4px'}}>Salut {me.name} 👋</h1><p style={{color:'#AAB3C5',margin:0}}>{me.role} — tes recommandations ont généré 6 nouveaux signaux cette semaine.</p></div>
      <img src={me.photo} style={{width:64,height:64,borderRadius:20,objectFit:'cover',border:`1px solid ${c}55`}}/>
    </div>

    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:14,marginBottom:18}}>
      <StatCard c={c} label='Talents suivis' value='28'/>
      <StatCard c={c} label='Recommandations utiles' value='6' delta='+2 cette semaine'/>
      <StatCard c={colors.core} label='Indice FanTSAak' value='81%'/>
      <StatCard c={c} label='Guests investis (Mercato)' value='2'/>
    </div>

    <div style={{display:'grid',gridTemplateColumns:'1.1fr 1.4fr',gap:16,marginBottom:26,alignItems:'stretch'}}>
      <PerfCard c={c} title='Indice FanTSAak' value='81%' data={[61,66,70,73,76,79,81]} caption='Poids de vos signaux dans le score des Talents que vous suivez.'/>
      <ActivityCard c={c} title='Signaux récents' badge='6 cette semaine' rows={[
        { avatar:'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop', title:'Recommandation — Sarah Benali', subtitle:'Partagée à 340 abonnés', right:'+4 pts', rightColor:colors.core },
        { icon:'💸', title:'Investissement Kaastbase — Guest Tier 2K', subtitle:'Mise actuelle : 180 €', right:'Actif', rightColor:c },
      ]} cta={{ href:'/mercato', label:'Investir via la Kaastbase' }}/>
    </div>

    <h2>Business cases à tester depuis cette caste</h2>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(210px,1fr))',gap:14,marginBottom:26}}>
      <Case c={colors.core} href='/score-explained' title='Score TSAAK' text='Voyez le poids exact de l’indice FanTSAak.'/>
      <Case c={colors.intermediaire} href='/mercato' title='Mercato' text='La Kaastbase peut investir jusqu’à 30%.'/>
      <Case c={colors.talent} href='/patchwork' title='Patchwork' text='Explorez les suggestions passives poussées aux médias.'/>
      <Case c={colors.organisation} href='/contract' title='Suivre un contrat' text='Suivez le paiement d’un Guest recommandé.'/>
    </div>
  </main>;
}
function Case({c,href,title,text}){return <a href={href} style={{...card(c),textDecoration:'none',color:'#fff',padding:18}}><Badge c={c}>{title}</Badge><p style={{color:'#C9D4E4',margin:'8px 0 0',fontSize:13}}>{text}</p></a>;}
