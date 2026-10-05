import { page, card, colors, Badge, Masthead, PERSONAS, StatCard, PerfCard, ActivityCard } from '../components/RichDemoUI';

export default function Organisation(){
  const c = colors.organisation;
  const me = PERSONAS.find(p=>p.key==='organisation');
  return <main style={page('organisation')}>
    <Masthead active='castes'/>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:16,marginBottom:22}}>
      <div><Badge c={c}>CASTE ORGANISATION</Badge><h1 style={{margin:'10px 0 4px'}}>Salut {me.name} 👋</h1><p style={{color:'#AAB3C5',margin:0}}>{me.role} — 3 panels peuvent être composés avec les talents shortlistés.</p></div>
      <img src={me.photo} style={{width:64,height:64,borderRadius:20,objectFit:'cover',border:`1px solid ${c}55`}}/>
    </div>

    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:14,marginBottom:18}}>
      <StatCard c={c} label='Briefs events' value='3'/>
      <StatCard c={c} label='Contrats prêts' value='2'/>
      <StatCard c={colors.core} label='Budget engagé' value='12 600 €' delta='+2 100 €'/>
      <StatCard c={c} label='Speakers shortlistés' value='9'/>
    </div>

    <div style={{display:'grid',gridTemplateColumns:'1.1fr 1.4fr',gap:16,marginBottom:26,alignItems:'stretch'}}>
      <PerfCard c={c} title='Budget engagé' value='12 600 €' data={[4200,6100,7400,8900,10200,11500,12600]} caption='Cumul des contrats signés sur les événements en cours.'/>
      <ActivityCard c={c} title='Event briefs en cours' badge='3 actifs' rows={[
        { icon:'🎤', title:'Panel « IA & démocratie »', subtitle:'9 speakers shortlistés · 2 contrats prêts', right:'55%', rightSub:'Statut' },
        { icon:'🏟', title:'Convention annuelle — keynote ouverture', subtitle:'Recherche en cours via Assistant IA', right:'20%', rightSub:'Statut' },
      ]} cta={{ href:'/search', label:'Chercher des speakers' }}/>
    </div>

    <h2>Business cases à tester depuis cette caste</h2>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(210px,1fr))',gap:14,marginBottom:26}}>
      <Case c={c} href='/search' title='Recherche proactive' text='Composez un panel selon vos critères.'/>
      <Case c={colors.talent} href='/ai-search' title='Assistant IA' text='Décrivez votre événement, laissez l’IA proposer.'/>
      <Case c={colors.organisation} href='/contract' title='Contrat & paiement' text='Même tunnel que les Médias.'/>
      <Case c={colors.core} href='/score-explained' title='Score TSAAK' text='Évaluez la valeur média réelle de vos speakers.'/>
      <Case c={colors.intermediaire} href='/mercato' title='Mercato' text='Sécurisez un Guest en avance.'/>
    </div>
  </main>;
}
function Case({c,href,title,text}){return <a href={href} style={{...card(c),textDecoration:'none',color:'#fff',padding:18}}><Badge c={c}>{title}</Badge><p style={{color:'#C9D4E4',margin:'8px 0 0',fontSize:13}}>{text}</p></a>;}
