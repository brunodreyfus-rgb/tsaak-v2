import { useState, useEffect } from 'react';
import { page, card, button, colors, Badge, Masthead, Progress, Stepper, useLocal } from '../components/RichDemoUI';
import { talents } from '../data/talents';

const ACTIVATIONS = [
  { k:'patchwork', label:'Patchwork : suggestions IA parmi les talents disponibles', c:colors.media },
  { k:'inter', label:'Réseau intermédiaire : 14 bookers notifiés', c:colors.intermediaire },
  { k:'talents', label:'Talents disponibles sous 2h identifiés et alertés', c:colors.talent },
];

const CANDIDATES = [ { ...talents[3], tag:'Patchwork', c:colors.media, note:'Disponible immédiatement · déjà passé 2 fois sur ce sujet' }, { ...talents[13], tag:'Réseau intermédiaire', c:colors.intermediaire, note:'Proposé par Jean · TV ready en anglais' }, { ...talents[6], tag:'Talent disponible', c:colors.talent, note:'A activé sa disponibilité "Urgent" il y a 20 min' } ];

const STEPS = ['Brief','Activation','Réponses'];

export default function HelpMe(){
  const c = colors.media;
  const [stage,setStage] = useLocal('tsaak:helpme:stage', 0); // 0 brief, 1 activating, 2 done
  const [brief,setBrief] = useLocal('tsaak:helpme:brief', { sujet:'AI Act & régulation européenne', format:'Live TV · 8 minutes · FR/EN', delai:'2h' });
  const [n,setN] = useState(0);
  const set = (k,v)=>setBrief({...brief,[k]:v});

  useEffect(()=>{
    if(stage!==1) return;
    setN(0);
    const id = setInterval(()=>{ setN(x=>{ if(x>=ACTIVATIONS.length-1){ clearInterval(id); setTimeout(()=>setStage(2),600); return ACTIVATIONS.length; } return x+1; }); }, 700);
    return ()=>clearInterval(id);
  },[stage]);

  return <main style={page('media')}>
    <Masthead active='help'/>
    <Badge c={c}>BUSINESS CASE · HELP ME URGENT</Badge>
    <h1 style={{fontSize:50,maxWidth:900}}>Besoin d'un guest en moins de 2h</h1>
    <p style={{color:'#C9D4E4',fontSize:19,maxWidth:880}}>Le média ne cherche pas : il décrit son besoin et TSAAK active Patchwork, le réseau d'intermédiaires et les talents disponibles, en même temps.</p>

    <Stepper c={c} active={stage} steps={STEPS} onStepClick={stage===2?setStage:undefined} maxReached={2}/>

    {stage===0 && <section style={{...card(c),maxWidth:640}}>
      <h2>Brief urgence</h2>
      <div style={{display:'grid',gap:12}}>
        <label style={{display:'grid',gap:6,fontSize:13,color:'#9FACBF'}}>Sujet
          <input value={brief.sujet} onChange={e=>set('sujet',e.target.value)} style={inp}/>
        </label>
        <label style={{display:'grid',gap:6,fontSize:13,color:'#9FACBF'}}>Format
          <input value={brief.format} onChange={e=>set('format',e.target.value)} style={inp}/>
        </label>
        <label style={{display:'grid',gap:6,fontSize:13,color:'#9FACBF'}}>Délai
          <input value={brief.delai} onChange={e=>set('delai',e.target.value)} style={inp}/>
        </label>
      </div>
      <button onClick={()=>setStage(1)} style={{...button(c),border:'none',cursor:'pointer',marginTop:16}}>Lancer Help Me →</button>
    </section>}

    {stage===1 && <section style={{...card(colors.intermediaire),maxWidth:720}}>
      <h2>Activation du réseau en cours…</h2>
      <p style={{color:'#94a3b8',fontSize:13,marginTop:-6}}><b>{brief.sujet}</b> · {brief.format} · délai {brief.delai}</p>
      <div style={{display:'grid',gap:10,marginTop:16}}>
        {ACTIVATIONS.map((a,i)=>{
          const done = i<n;
          const active = i===n;
          return <div key={a.k}>
            {active && <Progress label={a.label} value='62%' c={a.c}/>}
            {!active && <div style={{display:'flex',gap:10,padding:'10px 12px',borderRadius:12,background:done?'rgba(124,255,178,.08)':'rgba(255,255,255,.03)',border:`1px solid ${done?a.c+'55':'rgba(255,255,255,.08)'}`,opacity:done?1:.35}}>
              <span style={{color:done?a.c:'#556'}}>{done?'✓':'○'}</span>
              <span style={{color:'#C9D4E4',fontSize:13}}>{a.label}</span>
            </div>}
          </div>;
        })}
      </div>
    </section>}

    {stage===2 && <>
      <section style={{...card(colors.core),marginBottom:10}}>
        <Badge c={colors.core}>3 RÉPONSES EN 2 MINUTES</Badge>
        <h2 style={{margin:'10px 0 2px'}}>{brief.sujet}</h2>
        <p style={{color:'#C9D4E4',margin:0}}>{brief.format} · délai {brief.delai} — le réseau a répondu.</p>
      </section>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:18,marginTop:6}}>
        {CANDIDATES.map(t=><div key={t.id} style={card(t.c)}>
          <img src={t.photo} style={{width:'100%',height:140,objectFit:'cover',borderRadius:14}}/>
          <Badge c={t.c}>{t.tag}</Badge>
          <h3 style={{margin:'10px 0 2px'}}>{t.name}</h3>
          <p style={{color:'#94a3b8',fontSize:12,margin:'0 0 6px'}}>{t.role} · score {t.score}</p>
          <p style={{color:'#DDE7F4',fontSize:13}}>{t.note}</p>
          <a href='/shortlist' style={{...button(colors.core),border:'none',fontSize:12,padding:'8px 12px',marginTop:6}}>+ Shortlist</a>
        </div>)}
      </div>
      <div style={{display:'flex',gap:10,flexWrap:'wrap',marginTop:20}}>
        <a style={button(colors.organisation)} href='/contract'>Créer un contrat directement →</a>
        <a style={button(colors.media)} href='/patchwork'>Voir toutes les suggestions Patchwork</a>
        <button onClick={()=>setStage(0)} style={{...button('rgba(255,255,255,.25)'),background:'rgba(255,255,255,.04)',boxShadow:'none',border:'1px solid rgba(255,255,255,.25)',cursor:'pointer'}}>↺ Refaire la démo</button>
      </div>
    </>}
  </main>;
}

const inp = {width:'100%',padding:13,borderRadius:12,background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.14)',color:'#fff',boxSizing:'border-box'};
