import { useState, useEffect } from 'react';
import { page, card, button, colors, Badge, Progress, ProofCard, Masthead, CountUp, Stepper, useLocal } from '../../components/RichDemoUI';
import { mediaProofs } from '../../data/mediaProofs';

const IMPORT_FIELDS = [
  { k:'photo', label:'Photo de profil', v:'Importée' },
  { k:'name', label:'Nom', v:'Sarah Benali' },
  { k:'headline', label:'Poste actuel', v:'Analyste Géopolitique · Moyen-Orient' },
  { k:'loc', label:'Localisation', v:'Paris, France' },
  { k:'lang', label:'Langues', v:'Français · Anglais · Arabe' },
  { k:'net', label:'Relations LinkedIn', v:'8 214 relations · 3 400 abonnés' },
  { k:'exp', label:'Expérience', v:'Ex-conseillère, Institut de relations internationales' },
];

const SCAN_ITEMS = [
  { k:'tv', label:'2 interventions TV détectées (France 24, BBC World)', pct:100 },
  { k:'pod', label:'1 podcast expert retrouvé', pct:100 },
  { k:'art', label:'1 tribune presse (Le Monde) indexée', pct:100 },
  { k:'sem', label:'Sujets d’expertise extraits (géopolitique, Ukraine, Moyen-Orient)', pct:100 },
];

export default function SelfSignup(){
  const c = colors.talent;
  const [stage, setStage] = useLocal('tsaak:linkedin:stage', 0); // 0 intro, 1 modal, 2 importing, 3 scanning, 4 done
  const [importedCount, setImportedCount] = useState(0);
  const [scanCount, setScanCount] = useState(0);

  useEffect(()=>{
    if(stage!==2) return;
    setImportedCount(0);
    const id = setInterval(()=>{ setImportedCount(n=>{ if(n>=IMPORT_FIELDS.length-1){ clearInterval(id); setTimeout(()=>setStage(3),500); return IMPORT_FIELDS.length; } return n+1; }); }, 420);
    return ()=>clearInterval(id);
  },[stage]);

  useEffect(()=>{
    if(stage!==3) return;
    setScanCount(0);
    const id = setInterval(()=>{ setScanCount(n=>{ if(n>=SCAN_ITEMS.length-1){ clearInterval(id); setTimeout(()=>setStage(4),500); return SCAN_ITEMS.length; } return n+1; }); }, 520);
    return ()=>clearInterval(id);
  },[stage]);

  return <main style={page('talent')}>
    <Masthead active='linkedin'/>
    <Badge c={c}>BUSINESS CASE · CONNEXION LINKEDIN</Badge>
    <h1 style={{fontSize:50,maxWidth:900}}>Sarah crée son espace Talent en 30 secondes</h1>
    <p style={{color:'#C9D4E4',fontSize:19,maxWidth:880}}>Le Talent connecte son profil LinkedIn, TSAAK importe ses données publiques puis scanne le web pour retrouver ses preuves média. Aucune saisie manuelle nécessaire.</p>

    <Stepper c={c} active={Math.min(stage,3)} steps={['Connexion LinkedIn','Import du profil','Scan média IA','Profil TSAAK prêt']}/>

    {stage===0 && <section style={{...card(c),maxWidth:640}}>
      <h2>Créer mon profil Talent</h2>
      <p style={{color:'#C9D4E4'}}>Choisissez comment démarrer. La connexion LinkedIn pré-remplit tout automatiquement.</p>
      <button onClick={()=>setStage(1)} style={{...button('#0A66C2'),border:'none',cursor:'pointer',display:'inline-flex',alignItems:'center',gap:10}}>
        <span style={{width:22,height:22,borderRadius:5,background:'#fff',color:'#0A66C2',display:'grid',placeItems:'center',fontWeight:900,fontSize:13}}>in</span>
        Continuer avec LinkedIn
      </button>
      <a href='#' onClick={e=>{e.preventDefault();setStage(4);}} style={{...button('rgba(255,255,255,.3)'),background:'rgba(255,255,255,.04)',boxShadow:'none'}}>Remplir manuellement</a>
    </section>}

    {stage===1 && <div style={overlayWrap}>
      <div style={overlayCard}>
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:18}}>
          <span style={{width:34,height:34,borderRadius:7,background:'#0A66C2',color:'#fff',display:'grid',placeItems:'center',fontWeight:900}}>in</span>
          <b style={{fontSize:15}}>Se connecter avec LinkedIn</b>
        </div>
        <p style={{color:'#334155',fontSize:14,lineHeight:1.5}}><b>TSAAK</b> souhaite accéder aux informations suivantes de votre profil LinkedIn :</p>
        <ul style={{color:'#334155',fontSize:14,lineHeight:1.9,paddingLeft:18}}>
          <li>Nom, photo et poste actuel</li>
          <li>Adresse e-mail principale</li>
          <li>Expériences et compétences</li>
          <li>Réseau et abonnés (statistiques uniquement)</li>
        </ul>
        <div style={{display:'flex',gap:10,marginTop:18,justifyContent:'flex-end'}}>
          <button onClick={()=>setStage(0)} style={{...ghostBtn}}>Annuler</button>
          <button onClick={()=>setStage(2)} style={{...solidBtn}}>Autoriser</button>
        </div>
      </div>
    </div>}

    {stage>=2 && <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:22,marginTop:26}}>
      <section style={card(c)}>
        <h2 style={{display:'flex',alignItems:'center',gap:10}}>
          <span style={{width:22,height:22,borderRadius:5,background:'#0A66C2',color:'#fff',display:'grid',placeItems:'center',fontWeight:900,fontSize:12}}>in</span>
          Import du profil LinkedIn
        </h2>
        {stage===2 && <Progress label='Import en cours' value={Math.round(importedCount/IMPORT_FIELDS.length*100)+'%'} c={c}/>}
        <div style={{display:'grid',gap:9,marginTop:10}}>
          {IMPORT_FIELDS.map((f,i)=>{
            const done = stage>2 || i<importedCount;
            return <div key={f.k} style={{display:'flex',justifyContent:'space-between',gap:12,padding:'10px 12px',borderRadius:12,background: done?'rgba(124,255,178,.08)':'rgba(255,255,255,.03)',border:`1px solid ${done?c+'55':'rgba(255,255,255,.08)'}`,opacity: done?1:.35,transition:'all .3s'}}>
              <span style={{color:'#C9D4E4',fontSize:13}}>{f.label}</span>
              <b style={{fontSize:13,color: done?c:'#556'}}>{done ? f.v : '···'} {done && '✓'}</b>
            </div>;
          })}
        </div>
      </section>

      <section style={card(stage>=3?colors.media:'rgba(255,255,255,.12)')}>
        <h2>Scan IA du web média</h2>
        {stage<3 && <p style={{color:'#64748b'}}>En attente de la fin de l’import LinkedIn…</p>}
        {stage===3 && <Progress label='Recherche de preuves média' value={Math.round(scanCount/SCAN_ITEMS.length*100)+'%'} c={colors.media}/>}
        {stage>=3 && <div style={{display:'grid',gap:9,marginTop:10}}>
          {SCAN_ITEMS.map((s,i)=>{
            const done = stage>3 || i<scanCount;
            return <div key={s.k} style={{display:'flex',gap:10,padding:'10px 12px',borderRadius:12,background:done?'rgba(0,213,255,.08)':'rgba(255,255,255,.03)',opacity:done?1:.35}}>
              <span style={{color:done?colors.media:'#556'}}>{done?'✓':'○'}</span>
              <span style={{color:'#C9D4E4',fontSize:13}}>{s.label}</span>
            </div>;
          })}
        </div>}
      </section>
    </div>}

    {stage===4 && <>
      <section style={{...card(colors.core),marginTop:22,display:'grid',gridTemplateColumns:'200px 1fr',gap:24,alignItems:'center'}}>
        <div style={{fontSize:64,fontWeight:900,color:colors.core,textShadow:`0 0 30px ${colors.core}`}}><CountUp value={92} suffix=''/></div>
        <div>
          <Badge c={colors.core}>PROFIL TSAAK GÉNÉRÉ</Badge>
          <h2 style={{margin:'10px 0'}}>Score TSAAK 92/100 — profil media-ready</h2>
          <p style={{color:'#C9D4E4'}}>Profil complété automatiquement depuis LinkedIn + 4 preuves média trouvées par l’IA. Sarah peut recevoir des demandes immédiatement.</p>
          <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
            <a style={button(c)} href='/talent/sarah-benali'>Voir mon profil complet</a>
            <a style={button(colors.core)} href='/score-explained'>Comprendre mon score</a>
            <button onClick={()=>{setStage(0);}} style={{...button('rgba(255,255,255,.25)'),background:'rgba(255,255,255,.04)',boxShadow:'none',border:'1px solid rgba(255,255,255,.25)',cursor:'pointer'}}>↺ Refaire la démo</button>
          </div>
        </div>
      </section>
      <h2 style={{marginTop:32}}>Preuves média retrouvées automatiquement</h2>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:16}}>{mediaProofs.slice(0,4).map(p=><ProofCard key={p.title} p={p} c={c}/>)}</div>
    </>}
  </main>;
}

const overlayWrap = {position:'fixed',inset:0,background:'rgba(2,4,10,.72)',display:'grid',placeItems:'center',zIndex:50,backdropFilter:'blur(4px)'};
const overlayCard = {width:420,maxWidth:'92vw',background:'#fff',borderRadius:14,padding:24,boxShadow:'0 30px 90px rgba(0,0,0,.5)'};
const ghostBtn = {padding:'11px 16px',borderRadius:8,border:'1px solid #cbd5e1',background:'#fff',color:'#334155',fontWeight:700,cursor:'pointer'};
const solidBtn = {padding:'11px 18px',borderRadius:8,border:'none',background:'#0A66C2',color:'#fff',fontWeight:700,cursor:'pointer'};
