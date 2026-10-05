import { page, card, button, colors, Badge, Masthead, useLocal } from '../../components/RichDemoUI';

const DEFAULT_WANTED = { title:'Expert IA & société pour plateau TV', media:'LCI', budget:'1 800 €', deadline:'Demain 18:00', brief:'', status:'Open' };

export default function MediaProposals(){
  const [wanted,setWanted] = useLocal('tsaak:wanted', DEFAULT_WANTED);
  const [proposals,setProposals] = useLocal('tsaak:proposals', []);

  function setStatus(id, status){
    setProposals(proposals.map(p=>p.id===id?{...p,status}:p));
    if(status==='Shortlisted' && wanted.status==='Proposals') setWanted({...wanted,status:'Shortlist'});
    if(status==='Selected') setWanted({...wanted,status:'Selected'});
  }

  function createContract(p){
    const priceMatch = (wanted.budget||'').match(/[\d\s]+/);
    const price = priceMatch ? Number(priceMatch[0].replace(/\s/g,'')) : 1800;
    const contract = { stage:0, template:'Prestation Média (TV / Radio / Podcast)', media:wanted.media, talent:p.talentName, intermediary:p.by, date:new Date(Date.now()+86400000).toISOString().slice(0,10), time:'18:00', duration:'12 min', location:'Remote — studio distant', price, nda:false, deliverables:['Interview live','Droits image & replay 30j'], signature:null, paidAt:null };
    try{ window.localStorage.setItem('tsaak:contract:demo', JSON.stringify(contract)); }catch(e){}
    setWanted({...wanted,status:'Contract'});
    window.location.href='/contract';
  }

  const selected = proposals.find(p=>p.status==='Selected');

  return <main style={page('media')}>
    <Masthead active='recherche'/>
    <Badge c={colors.media}>BUSINESS CASE · PROPOSITIONS REÇUES</Badge>
    <h1 style={{fontSize:44,maxWidth:900}}>Réponses au Wanted</h1>
    <p style={{color:'#C9D4E4',fontSize:16,maxWidth:820}}><b>{wanted.title}</b> · {wanted.budget} · statut <b style={{color:colors.core}}>{wanted.status}</b></p>

    {proposals.length===0 ? <div style={{...card('rgba(255,255,255,.14)'),marginTop:10}}>
      <p style={{color:'#94a3b8'}}>Aucune proposition encore — <a href='/intermediaires/respond' style={{color:colors.intermediaire}}>simuler une réponse d’intermédiaire</a>.</p>
    </div> : <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:16,marginTop:14}}>
      {proposals.map(p=><div key={p.id} style={card(p.status==='Selected'?colors.core:colors.media)}>
        {p.talentPhoto && <img src={p.talentPhoto} style={{width:'100%',height:140,objectFit:'cover',borderRadius:14}}/>}
        <h3 style={{margin:'10px 0 2px'}}>{p.talentName}</h3>
        <p style={{color:'#94a3b8',fontSize:12,margin:0}}>Proposé par {p.by} · {p.note}</p>
        <Badge c={p.status==='Selected'?colors.core:colors.intermediaire}>{p.status}</Badge>
        <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:10}}>
          {p.status!=='Selected' && <button onClick={()=>setStatus(p.id,'Shortlisted')} style={{...button(colors.talent),border:'none',cursor:'pointer',fontSize:12,padding:'8px 12px'}}>Shortlister</button>}
          {p.status!=='Selected' && <button onClick={()=>setStatus(p.id,'Selected')} style={{...button(colors.core),border:'none',cursor:'pointer',fontSize:12,padding:'8px 12px'}}>Sélectionner</button>}
          {p.status==='Selected' && <button onClick={()=>createContract(p)} style={{...button(colors.organisation),border:'none',cursor:'pointer',fontSize:12,padding:'8px 12px'}}>Créer le contrat →</button>}
        </div>
      </div>)}
    </div>}
  </main>;
}
