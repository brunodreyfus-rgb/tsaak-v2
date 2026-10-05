import { useMemo } from 'react';
import { page, card, button, colors, Badge, Progress, Masthead, CountUp, Slider, Stepper, useLocal, ProofCard } from '../components/RichDemoUI';
import { mediaProofs } from '../data/mediaProofs';

const FACTORS = [
  { k:'desirability', name:'Désirabilité du Talent', desc:'Demandes entrantes, rareté du sujet, tension marché, budget média.', weight:0.30, c:colors.talent },
  { k:'fan', name:'Indice FanTSAak', desc:'Signaux communauté, recommandations, engagement sur contenus et suivis.', weight:0.20, c:colors.communaute },
  { k:'media', name:'Passages média', desc:'TV, podcast, presse, tribunes, panels, séminaires et récence des preuves.', weight:0.30, c:colors.media },
  { k:'performance', name:'Performance', desc:'Fiabilité, rapidité de réponse, qualité brief, ponctualité, satisfaction post-intervention.', weight:0.20, c:colors.organisation },
];

const HISTORY = [78,81,83,85,86,88,89,90,91,92];
const STEPS = ['Score en direct','Ajuster les facteurs','Historique','Où ça compte'];

export default function Score(){
  const [values, setValues] = useLocal('tsaak:score:factors', { desirability:92, fan:81, media:88, performance:94 });
  const [stage, setStage] = useLocal('tsaak:score:stage', 0);

  const score = useMemo(()=> FACTORS.reduce((sum,f)=> sum + (values[f.k]||0)*f.weight, 0), [values]);

  return <main style={page('talent')}>
    <Masthead active='score'/>
    <Badge c={colors.talent}>BUSINESS CASE · SCORE TSAAK</Badge>
    <h1 style={{fontSize:52,maxWidth:920}}>Comment TSAAK calcule le score d'un Talent</h1>
    <p style={{color:'#C9D4E4',fontSize:19,maxWidth:900}}>Le score ne mesure pas seulement la notoriété : il mesure la capacité réelle à matcher, performer et créer de la valeur dans l'écosystème. Recalculé automatiquement et quotidiennement.</p>

    <Stepper c={colors.talent} active={stage} steps={STEPS} onStepClick={setStage} maxReached={STEPS.length-1}/>

    {stage===0 && <section style={{...card(colors.core),display:'grid',gridTemplateColumns:'220px 1fr',gap:24,alignItems:'center'}}>
      <div style={{fontSize:76,fontWeight:900,color:colors.core,textShadow:`0 0 34px ${colors.core}`}}><CountUp value={score} decimals={0}/></div>
      <div>
        <h2 style={{margin:'0 0 8px'}}>Score TSAAK live</h2>
        <p style={{color:'#C9D4E4',margin:0}}>score = Σ (valeur du facteur × poids) — mis à jour selon les preuves média, demandes, réponses, feedbacks et signaux FanTSAak.</p>
        <div style={{display:'grid',gap:8,marginTop:14}}>
          {FACTORS.map(f=><div key={f.k} style={{display:'flex',justifyContent:'space-between',fontSize:13,color:'#C9D4E4'}}><span>{f.name} · poids {Math.round(f.weight*100)}%</span><b style={{color:f.c}}>{values[f.k]}</b></div>)}
        </div>
        <button onClick={()=>setStage(1)} style={{...button(colors.talent),border:'none',cursor:'pointer',marginTop:16}}>Ajuster les facteurs →</button>
      </div>
    </section>}

    {stage===1 && <>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:20}}>
        {FACTORS.map(f=><section key={f.k} style={card(f.c)}>
          <Badge c={f.c}>{f.name} · poids {Math.round(f.weight*100)}%</Badge>
          <Slider label='Valeur actuelle' value={values[f.k]} c={f.c} onChange={v=>setValues({...values,[f.k]:v})}/>
          <p style={{color:'#C9D4E4',fontSize:14}}>{f.desc}</p>
          <p style={{color:f.c,fontSize:13,fontWeight:800}}>Contribution au score : {(values[f.k]*f.weight).toFixed(1)} pts</p>
        </section>)}
      </div>
      <div style={{...card(colors.core),marginTop:20,display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:14}}>
        <div><span style={{color:'#94a3b8',fontSize:13}}>Nouveau score simulé</span><div style={{fontSize:34,fontWeight:900,color:colors.core}}><CountUp value={score} decimals={0}/></div></div>
        <button onClick={()=>setStage(2)} style={{...button(colors.talent),border:'none',cursor:'pointer'}}>Voir l'historique →</button>
      </div>
    </>}

    {stage===2 && <section style={card('rgba(255,255,255,.12)')}>
      <h2>Historique & leviers</h2>
      <p style={{color:'#C9D4E4'}}>Évolution du score sur les 10 dernières interventions — chaque contrat signé, avis FanTSAak et passage média recalcule la valeur.</p>
      <div style={{display:'flex',alignItems:'flex-end',gap:8,height:120,marginTop:14}}>
        {HISTORY.map((h,i)=><div key={i} title={h} style={{flex:1,background:`linear-gradient(180deg,${colors.talent},${colors.talent}33)`,borderRadius:6,height:`${h}%`,opacity:i===HISTORY.length-1?1:.55}}/>)}
      </div>
      <div style={{display:'flex',justifyContent:'space-between',color:'#64748b',fontSize:12,marginTop:6}}><span>Il y a 10 interventions</span><span>Aujourd'hui</span></div>
      <button onClick={()=>setStage(3)} style={{...button(colors.talent),border:'none',cursor:'pointer',marginTop:16}}>Voir où le score compte →</button>
    </section>}

    {stage===3 && <>
      <section style={card(colors.talent)}>
        <h2>Où le score TSAAK compte</h2>
        <div style={{display:'flex',gap:10,flexWrap:'wrap',marginTop:10}}>
          <a style={button(colors.talent)} href='/talent/sarah-benali'>Voir exemple Sarah Benali</a>
          <a style={button(colors.intermediaire)} href='/mercato'>Voir l'impact sur le Mercato</a>
          <a style={button(colors.organisation)} href='/contract'>Voir l'impact sur un contrat</a>
        </div>
      </section>
      <h2 style={{marginTop:32}}>Preuves qui nourrissent le score</h2>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:16}}>{mediaProofs.map(p=><ProofCard key={p.title} p={p} c={colors.talent}/>)}</div>
    </>}
  </main>;
}
