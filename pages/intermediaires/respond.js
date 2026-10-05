import { page, card, button, colors, Badge, Masthead, PERSONAS, useLocal } from '../../components/RichDemoUI';
import { talents } from '../../data/talents';

const DEFAULT_WANTED = { title:'Expert IA & société pour plateau TV', media:'LCI', budget:'1 800 €', deadline:'Demain 18:00', brief:'Nous cherchons un profil TV ready, FR/EN, capable de vulgariser les impacts de l’IA sur l’emploi et la démocratie.', status:'Open' };

export default function Respond(){
  const [wanted,setWanted] = useLocal('tsaak:wanted', DEFAULT_WANTED);
  const [proposals,setProposals] = useLocal('tsaak:proposals', []);
  const me = PERSONAS.find(p=>p.key==='intermediaire');
  const picks = talents.slice(3,7);

  function propose(t){
    const id = 'p'+Date.now()+Math.random().toString(36).slice(2,6);
    setProposals([...proposals, { id, by:me.name, talentId:t.id, talentName:t.name, talentPhoto:t.photo, note:`Disponible et TV ready · score ${t.score}`, status:'Sent' }]);
    if(wanted && wanted.status==='Open') setWanted({...wanted, status:'Proposals'});
  }
  function proposeExternal(){
    const id = 'p'+Date.now();
    setProposals([...proposals, { id, by:me.name, talentId:null, talentName:'Dr. Alex Morgan (externe, non-inscrit)', talentPhoto:null, note:'Invitation TSAAK à créer son profil en cours.', status:'Sent' }]);
    if(wanted && wanted.status==='Open') setWanted({...wanted, status:'Proposals'});
  }

  const already = id => proposals.some(p=>p.talentId===id);

  return <main style={page('intermediaire')}>
    <Masthead active='recherche'/>
    <Badge c={colors.intermediaire}>BUSINESS CASE · RÉPONDRE AU WANTED</Badge>
    <h1 style={{fontSize:44,maxWidth:900}}>Répondre au Wanted</h1>

    {wanted ? <section style={{...card(colors.media),marginBottom:20}}>
      <Badge c={colors.media}>{wanted.media}</Badge>
      <h2 style={{margin:'10px 0 4px'}}>{wanted.title}</h2>
      <p style={{color:'#C9D4E4'}}>{wanted.brief}</p>
      <p style={{color:'#94a3b8',fontSize:13}}>Budget {wanted.budget} · Deadline {wanted.deadline} · Statut : <b style={{color:colors.core}}>{wanted.status}</b></p>
    </section> : <p style={{color:'#94a3b8'}}>Aucun Wanted actif — <a href='/wanted' style={{color:colors.media}}>en publier un</a>.</p>}

    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:16}}>
      {picks.map(t=>{
        const done = already(t.id);
        return <div key={t.id} style={card(colors.intermediaire)}>
          <img src={t.photo} style={{width:'100%',height:150,objectFit:'cover',borderRadius:16}}/>
          <h3 style={{margin:'10px 0 2px'}}>{t.name}</h3>
          <p style={{color:'#94a3b8',fontSize:12,margin:0}}>{t.role}</p>
          <button disabled={done} onClick={()=>propose(t)} style={{...button(done?colors.core:colors.intermediaire),border:'none',cursor:done?'default':'pointer',marginTop:10,width:'100%',opacity:done?.7:1}}>{done?'✓ Proposé':'Proposer ce talent'}</button>
        </div>;
      })}
      <div style={card(colors.intermediaire)}>
        <h3>Profil externe</h3>
        <p style={{color:'#C9D4E4',fontSize:13}}>Dr. Alex Morgan — non inscrit TSAAK. Simule une invitation à créer son profil.</p>
        <button onClick={proposeExternal} style={{...button(colors.talent),border:'none',cursor:'pointer',width:'100%'}}>Inviter + proposer</button>
      </div>
    </div>

    <a style={{...button(colors.media),marginTop:22}} href='/media/proposals'>Voir côté Media →</a>
  </main>;
}
