import { useState } from 'react';
import { page, card, button, colors, Badge, Masthead, Progress, ProofCard, useLocal } from '../components/RichDemoUI';
import { mediaProofs } from '../data/mediaProofs';
import { talents } from '../data/talents';

const t = talents;
const picks = [
  { talent:t[0], tag:'TSAAK Talent', why:['Trending topic : sécurité mer Rouge','2 passages TV récents','Score de clarté élevé'], score:94, c:colors.talent, external:false },
  { talent:{ name:'Prof. Maya Chen', role:'Semiconductors · Asia', photo:'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=500&auto=format&fit=crop' }, tag:'Hors TSAAK', why:['Détectée via une vidéo de conférence','Forte autorité éditoriale','Invitation recommandée'], score:91, c:colors.media, external:true },
  { talent:t[13], tag:'Réseau intermédiaire', why:['Relation booker existante','TV ready en anglais','Disponibilité rapide'], score:89, c:colors.intermediaire, external:false },
];

export default function Patchwork(){
  const [status,setStatus] = useState({});
  const [shortlist,setShortlist] = useLocal('tsaak:shortlist', []);

  function follow(p,i){
    if(p.external){ window.location.href='/talent-onboarding/ai'; return; }
    const talent = p.talent;
    if(!shortlist.some(x=>x.id===talent.id)) setShortlist([...shortlist, {id:talent.id,name:talent.name,role:talent.role,photo:talent.photo,score:talent.score,price:talent.price}]);
    setStatus(s=>({...s,[i]:'followed'}));
  }
  function reject(i){ setStatus(s=>({...s,[i]:'rejected'})); }

  return <main style={page('media')}>
    <Masthead active='recherche'/>
    <Badge c={colors.media}>BUSINESS CASE · PATCHWORK</Badge>
    <h1 style={{fontSize:52}}>TSAAK pousse les bons guests avant même la recherche</h1>
    <p style={{fontSize:19,color:'#C9D4E4',maxWidth:920}}>Patchwork combine tendance éditoriale, historique média, signaux FanTSAak, disponibilité et profils hors plateforme. Suivez ou rejetez chaque suggestion — l’IA apprend de vos choix.</p>

    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:20,marginTop:24}}>
      {picks.map((p,i)=>{
        const st = status[i];
        const photo = p.talent.photo || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&auto=format&fit=crop';
        return <section key={i} style={{...card(p.c),opacity:st==='rejected'?.45:1,transition:'opacity .3s'}}>
          <img src={photo} style={{width:'100%',height:150,objectFit:'cover',borderRadius:16,marginBottom:10}}/>
          <Badge c={p.c}>{p.tag}</Badge>
          <h2 style={{margin:'10px 0 2px'}}>{p.talent.name}</h2>
          <p style={{color:'#C9D4E4',margin:0}}>{p.talent.role || p.talent.title}</p>
          <Progress label='Patchwork fit' value={p.score+'%'} c={p.c}/>
          <h3 style={{marginBottom:6}}>Pourquoi ce talent ?</h3>
          {p.why.map(w=><p key={w} style={{color:'#DDE7F4',margin:'4px 0',fontSize:13}}>• {w}</p>)}
          {!st && <div style={{display:'flex',gap:10,flexWrap:'wrap',marginTop:10}}>
            <button onClick={()=>follow(p,i)} style={{...button(colors.core),border:'none',cursor:'pointer'}}>{p.external ? 'Inviter dans TSAAK' : '✓ Suivre'}</button>
            <button onClick={()=>reject(i)} style={{...button('rgba(255,255,255,.25)'),background:'rgba(255,255,255,.04)',boxShadow:'none',border:'1px solid rgba(255,255,255,.25)',cursor:'pointer'}}>Rejeter</button>
          </div>}
          {st==='followed' && <p style={{color:colors.core,fontWeight:800,marginTop:10}}>✓ {p.external?'Invitation envoyée':'Ajouté à la shortlist'}</p>}
          {st==='rejected' && <button onClick={()=>setStatus(s=>({...s,[i]:undefined}))} style={{...button('rgba(255,255,255,.25)'),background:'rgba(255,255,255,.04)',boxShadow:'none',border:'1px solid rgba(255,255,255,.25)',cursor:'pointer',marginTop:8}}>↺ Annuler le rejet</button>}
        </section>;
      })}
    </div>

    {shortlist.length>0 && <p style={{marginTop:18,color:'#94a3b8'}}><a href='/shortlist' style={{color:colors.core}}>{shortlist.length} talent{shortlist.length>1?'s':''} en shortlist →</a></p>}

    <h2 style={{marginTop:36}}>Preuves média utilisées par Patchwork</h2>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(230px,1fr))',gap:16}}>{mediaProofs.map(p=><ProofCard key={p.title} p={p} c={colors.media}/>)}</div>
  </main>;
}
