export const colors = { media:'#00E5FF', talent:'#39FF88', intermediaire:'#FF4FD8', communaute:'#4D7CFF', organisation:'#FF9B3D', core:'#F6FF00' };

export function page(theme='media'){
  const c = colors[theme] || colors.media;
  return { minHeight:'100vh', color:'#F7FBFF', fontFamily:'Arial, sans-serif', padding:32, background:`radial-gradient(circle at 15% 10%, ${c}22, transparent 28%), radial-gradient(circle at 90% 0%, #F6FF0020, transparent 22%), linear-gradient(135deg,#02030A,#080B18 45%,#02030A)` };
}
export function nav(c=colors.media){ return <div style={{display:'flex',gap:12,alignItems:'center',marginBottom:28,flexWrap:'wrap'}}><a href='/' style={link(c)}>Home</a><a href='/demo' style={link(c)}>Mode démo</a><a href='/patchwork' style={link(c)}>Patchwork</a><a href='/talent-onboarding' style={link(c)}>Onboarding talent</a><a href='/score-explained' style={link(c)}>Score</a></div> }
export function link(c){return {color:'#fff',textDecoration:'none',padding:'10px 14px',border:`1px solid ${c}55`,borderRadius:999,background:'#ffffff08'}}
export function card(c=colors.media){return {border:`1px solid ${c}44`,background:'linear-gradient(180deg,#ffffff12,#ffffff06)',boxShadow:`0 0 36px ${c}18`,borderRadius:28,padding:24,backdropFilter:'blur(14px)'}}
export function button(c=colors.media){return {display:'inline-flex',alignItems:'center',justifyContent:'center',gap:8,padding:'13px 18px',borderRadius:999,border:`1px solid ${c}`,background:`linear-gradient(135deg,${c}33,#ffffff10)`,color:'#fff',textDecoration:'none',boxShadow:`0 0 26px ${c}33`,fontWeight:800}}
export function ghost(c=colors.media){return {...button(c),background:'#ffffff08',boxShadow:'none'}}
export function TsaakMark({size=120}={}){return <img src='/tsaak-logo.jpg' alt='TSAAK' style={{width:size,maxWidth:'70vw',filter:'drop-shadow(0 0 20px rgba(246,255,0,.25))'}}/>}
export function Badge({children,c=colors.media}){return <span style={{fontSize:12,padding:'7px 10px',borderRadius:999,border:`1px solid ${c}66`,color:c,background:`${c}12`,fontWeight:800}}>{children}</span>}
export function Progress({label,value,c=colors.media}){return <div style={{margin:'14px 0'}}><div style={{display:'flex',justifyContent:'space-between',color:'#C9D4E4',fontSize:13}}><span>{label}</span><b>{value}</b></div><div style={{height:9,borderRadius:99,background:'#ffffff12',overflow:'hidden',marginTop:7}}><div style={{height:'100%',width:value,background:`linear-gradient(90deg,${c},#F6FF00)`,boxShadow:`0 0 18px ${c}`}}/></div></div>}
export function ProofCard({p,c=colors.media}){return <div style={{...card(c),padding:0,overflow:'hidden'}}><div style={{height:130,backgroundImage:`linear-gradient(180deg,transparent,#02030A), url(${p.thumbnail})`,backgroundSize:'cover',backgroundPosition:'center'}}/><div style={{padding:18}}><Badge c={c}>{p.icon} {p.type}</Badge><h3 style={{margin:'14px 0 6px'}}>{p.title}</h3><p style={{color:'#9FACBF',margin:0}}>{p.source} · {p.date}</p><p style={{color:c,fontWeight:800}}>{p.metric}</p><p style={{color:'#C9D4E4'}}>{p.note}</p></div></div>}

// ---- Dashboard kit (sparkline + activity rows, used by the 5 caste cockpits) ----
export function Sparkline({data, c=colors.media, w=280, h=64, strokeWidth=2.6}){
  if(!data || data.length<2) return null;
  const min=Math.min(...data), max=Math.max(...data), range=(max-min)||1;
  const stepX=w/(data.length-1);
  const pts=data.map((v,i)=>[i*stepX, h-((v-min)/range)*h*0.78-h*0.1]);
  const line=pts.map((p,i)=>(i===0?'M':'L')+p[0].toFixed(1)+','+p[1].toFixed(1)).join(' ');
  const area=line+` L${w},${h} L0,${h} Z`;
  const gid='sgrad-'+c.replace('#','');
  return <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{display:'block',overflow:'visible',maxWidth:'100%'}} preserveAspectRatio='none'>
    <defs><linearGradient id={gid} x1='0' y1='0' x2='0' y2='1'><stop offset='0%' stopColor={c} stopOpacity='0.38'/><stop offset='100%' stopColor={c} stopOpacity='0'/></linearGradient></defs>
    <path d={area} fill={`url(#${gid})`} stroke='none'/>
    <path d={line} fill='none' stroke={c} strokeWidth={strokeWidth} strokeLinecap='round' strokeLinejoin='round' style={{filter:`drop-shadow(0 0 5px ${c}aa)`}}/>
    <circle cx={pts[pts.length-1][0]} cy={pts[pts.length-1][1]} r={4.5} fill={c} style={{filter:`drop-shadow(0 0 7px ${c})`}}/>
  </svg>;
}

export function StatCard({c=colors.media,label,value,delta,deltaUp=true}){
  return <div style={{padding:18,borderRadius:18,background:'rgba(255,255,255,.05)',border:`1px solid ${c}44`}}>
    <div style={{fontSize:12,color:'#94a3b8'}}>{label}</div>
    <div style={{display:'flex',alignItems:'baseline',gap:8,marginTop:3,flexWrap:'wrap'}}>
      <div style={{fontSize:28,fontWeight:900,color:c}}>{value}</div>
      {delta && <span style={{fontSize:12,fontWeight:800,color:deltaUp?'#7CFFB2':'#FF8A8A'}}>{deltaUp?'↗':'↘'} {delta}</span>}
    </div>
  </div>;
}

export function PerfCard({c=colors.media,title,value,data,caption}){
  return <section style={{...card(c),display:'flex',flexDirection:'column',gap:4}}>
    <div style={{color:c,fontWeight:900,letterSpacing:1.5,fontSize:11,textTransform:'uppercase'}}>{title}</div>
    <div style={{fontSize:30,fontWeight:900,margin:'2px 0 10px'}}>{value}</div>
    <Sparkline data={data} c={c}/>
    {caption && <p style={{color:'#8CA0B8',fontSize:12,margin:'10px 0 0'}}>{caption}</p>}
  </section>;
}

export function DashRow({avatar,icon,title,subtitle,right,rightSub,rightColor,badge,badgeColor,c=colors.media}){
  return <div style={{display:'flex',alignItems:'center',gap:13,padding:'11px 2px',borderBottom:'1px solid rgba(255,255,255,.08)'}}>
    {avatar ? <img src={avatar} style={{width:42,height:42,borderRadius:12,objectFit:'cover',border:`1px solid ${c}55`,flexShrink:0}}/>
      : icon ? <span style={{width:42,height:42,borderRadius:12,display:'grid',placeItems:'center',background:`${c}18`,border:`1px solid ${c}55`,fontSize:17,flexShrink:0}}>{icon}</span> : null}
    <div style={{flex:1,minWidth:0}}>
      <div style={{fontWeight:800,fontSize:14,color:'#fff',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{title}</div>
      {subtitle && <div style={{color:'#8CA0B8',fontSize:12,marginTop:2,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{subtitle}</div>}
    </div>
    {badge && <span style={{fontSize:10,fontWeight:800,padding:'5px 9px',borderRadius:999,color:badgeColor||c,border:`1px solid ${badgeColor||c}66`,background:`${badgeColor||c}14`,flexShrink:0}}>{badge}</span>}
    {right && <div style={{textAlign:'right',flexShrink:0,marginLeft:4}}>
      <div style={{fontWeight:900,fontSize:14,color:rightColor||c}}>{right}</div>
      {rightSub && <div style={{color:'#8CA0B8',fontSize:11}}>{rightSub}</div>}
    </div>}
  </div>;
}

const DAY_LABELS = ['L','M','M','J','V','S','D'];
export function useNextDays(n=7){
  const [days,setDays]=useState(null);
  useEffect(()=>{
    const out=[]; const now=new Date();
    for(let i=0;i<n;i++){ const d=new Date(now); d.setDate(now.getDate()+i); out.push({ label: DAY_LABELS[(d.getDay()+6)%7], num: d.getDate(), iso: d.toISOString().slice(0,10) }); }
    setDays(out);
  },[n]);
  return days;
}

export function AvailabilityCalendar({c=colors.talent,days,booked=[],value,onChange}){
  if(!days) return <div style={{height:84}}/>;
  return <div style={{display:'grid',gridTemplateColumns:`repeat(${days.length},1fr)`,gap:8}}>
    {days.map((d,i)=>{
      const isBooked = booked.includes(i);
      const avail = !!value[i];
      const bg = isBooked ? 'rgba(255,255,255,.04)' : avail ? c+'22' : 'rgba(255,255,255,.03)';
      const bd = isBooked ? 'rgba(255,255,255,.16)' : avail ? c : 'rgba(255,255,255,.16)';
      return <div key={d.iso} onClick={()=>!isBooked && onChange(i,!avail)}
        style={{textAlign:'center',padding:'10px 2px',borderRadius:12,background:bg,border:`1px solid ${bd}`,cursor:isBooked?'default':'pointer',opacity:isBooked?.6:1,transition:'all .15s'}}>
        <div style={{fontSize:10,color:'#8CA0B8',fontWeight:800,letterSpacing:1}}>{d.label}</div>
        <div style={{fontSize:16,fontWeight:900,color:isBooked?'#8CA0B8':avail?c:'#5b6b82',margin:'4px 0'}}>{d.num}</div>
        <div style={{fontSize:9,fontWeight:700,color:isBooked?'#8CA0B8':avail?c:'#5b6b82'}}>{isBooked?'Réservé':avail?'Dispo':'Indispo'}</div>
      </div>;
    })}
  </div>;
}

export function ActivityCard({c=colors.media,title,badge,rows,cta}){
  return <section style={card(c)}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
      <div style={{color:c,fontWeight:900,letterSpacing:1.5,fontSize:11,textTransform:'uppercase'}}>{title}</div>
      {badge && <Badge c={c}>{badge}</Badge>}
    </div>
    <div>{rows.map((r,i)=><DashRow key={i} c={c} {...r}/>)}</div>
    {cta && <a href={cta.href} style={{...button(c),marginTop:16,width:'100%'}}>{cta.label}</a>}
  </section>;
}

// ---- Extended kit (business-case simulations) --------------------------
import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';

export const BIZ_CASES = [
  { key:'linkedin', label:'Connexion LinkedIn', href:'/talent-onboarding/self', c:colors.talent, icon:'in' },
  { key:'contract', label:'Contrat & Paiement', href:'/contract', c:colors.organisation, icon:'€' },
  { key:'score', label:'Score TSAAK', href:'/score-explained', c:colors.core, icon:'◎' },
  { key:'mercato', label:'Mercato', href:'/mercato', c:colors.intermediaire, icon:'⇄' }
];

export function Masthead({active}){
  const links=[['/','Home'],['/demo','Démo'],...BIZ_CASES.map(b=>[b.href,b.label]),['/select-caste','Castes']];
  return <div style={{display:'flex',flexWrap:'wrap',gap:10,alignItems:'center',maxWidth:1180,margin:'0 auto 26px',padding:'18px 0'}}>
    <a href='/' style={{display:'flex',alignItems:'center',gap:10,textDecoration:'none',color:'#fff',marginRight:8}}><img src='/tsaak-logo.jpg' style={{width:40,filter:'drop-shadow(0 0 12px rgba(0,213,255,.6))'}}/><b style={{letterSpacing:2}}>TSAAK</b></a>
    {links.map(([href,label])=><a key={href} href={href} style={{textDecoration:'none',fontSize:13,fontWeight:700,padding:'9px 13px',borderRadius:999,color: (active&&label.toLowerCase().includes(active)) ? '#02040a' : '#cbd5e1', background: (active&&label.toLowerCase().includes(active)) ? 'linear-gradient(90deg,#00D5FF,#7CFFB2)' : 'rgba(255,255,255,.05)', border:'1px solid rgba(255,255,255,.1)'}}>{label}</a>)}
  </div>;
}

export function field(){return {width:'100%',padding:'14px 16px',borderRadius:14,background:'rgba(255,255,255,.06)',color:'#fff',border:'1px solid rgba(255,255,255,.14)',boxSizing:'border-box',fontSize:15,fontFamily:'inherit'};}
export function Field({label,children}){return <label style={{display:'grid',gap:7,fontSize:13,color:'#9FACBF'}}>{label}{children}</label>;}
export function Select({value,onChange,options,c=colors.media}){return <select value={value} onChange={e=>onChange(e.target.value)} style={{...field(),borderColor:c+'55'}}>{options.map(o=><option key={o} value={o} style={{color:'#000'}}>{o}</option>)}</select>;}

export function CountUp({value=0,duration=900,decimals=0,prefix='',suffix=''}){
  const [n,setN]=useState(0); const raf=useRef();
  useEffect(()=>{
    const start=performance.now(); const from=0; const to=Number(value)||0;
    function tick(t){ const p=Math.min(1,(t-start)/duration); const eased=1-Math.pow(1-p,3); setN(from+(to-from)*eased); if(p<1) raf.current=requestAnimationFrame(tick); else setN(to); }
    raf.current=requestAnimationFrame(tick);
    return ()=>cancelAnimationFrame(raf.current);
  },[value,duration]);
  return <span>{prefix}{n.toFixed(decimals)}{suffix}</span>;
}

export function Slider({label,value,onChange,min=0,max=100,c=colors.media,suffix='%'}){
  return <div style={{margin:'14px 0'}}>
    <div style={{display:'flex',justifyContent:'space-between',color:'#C9D4E4',fontSize:13,marginBottom:6}}><span>{label}</span><b style={{color:c}}>{value}{suffix}</b></div>
    <input type='range' min={min} max={max} value={value} onChange={e=>onChange(Number(e.target.value))} style={{width:'100%',accentColor:c}}/>
  </div>;
}

export function Toggle({on,onChange,c=colors.media,labelOn='ON',labelOff='OFF'}){
  return <span onClick={()=>onChange(!on)} style={{cursor:'pointer',display:'inline-flex',alignItems:'center',gap:8,padding:'8px 14px',borderRadius:999,border:`1px solid ${on?c:'rgba(255,255,255,.2)'}`,background:on?c+'22':'rgba(255,255,255,.05)',fontSize:12,fontWeight:800,color:on?c:'#94a3b8',userSelect:'none'}}>
    <span style={{width:10,height:10,borderRadius:99,background:on?c:'#475569',boxShadow:on?`0 0 10px ${c}`:'none'}}/>{on?labelOn:labelOff}
  </span>;
}

export function Countdown({to,c=colors.intermediaire}){
  const [left,setLeft]=useState(Math.max(0,to-Date.now()));
  useEffect(()=>{ const id=setInterval(()=>setLeft(Math.max(0,to-Date.now())),1000); return ()=>clearInterval(id); },[to]);
  const d=Math.floor(left/86400000), h=Math.floor(left/3600000)%24, m=Math.floor(left/60000)%60, s=Math.floor(left/1000)%60;
  const pad=n=>String(n).padStart(2,'0');
  return <div style={{display:'flex',gap:8}}>{[['J',d],['H',h],['M',m],['S',s]].map(([l,v])=><div key={l} style={{textAlign:'center',padding:'10px 14px',borderRadius:14,background:'rgba(255,255,255,.06)',border:`1px solid ${c}55`,minWidth:56}}><div style={{fontSize:22,fontWeight:900,color:c}}>{pad(v)}</div><div style={{fontSize:10,color:'#94a3b8',letterSpacing:2}}>{l}</div></div>)}</div>;
}

export function SignaturePad({name,onSign,signed,c=colors.talent}){
  const [val,setVal]=useState(name||'');
  if(signed) return <div style={{padding:'22px 18px',borderRadius:16,border:`1px solid ${c}`,background:c+'14'}}><div style={{fontFamily:'Georgia, "Brush Script MT", cursive',fontSize:34,color:c}}>{signed}</div><div style={{fontSize:12,color:'#94a3b8',marginTop:6}}>✓ Signé électroniquement · {new Date().toLocaleString('fr-FR')}</div></div>;
  return <div style={{padding:18,borderRadius:16,border:'1px dashed rgba(255,255,255,.25)',background:'rgba(255,255,255,.03)'}}>
    <div style={{fontSize:12,color:'#94a3b8',marginBottom:8}}>Zone de signature — tapez votre nom pour signer électroniquement</div>
    <input value={val} onChange={e=>setVal(e.target.value)} placeholder='Votre nom complet' style={{...field(),fontFamily:'Georgia, cursive',fontSize:22}}/>
    <button onClick={()=>val.trim() && onSign(val.trim())} style={{...button(c),marginTop:12,border:'none',cursor:'pointer'}}>Signer et valider le contrat</button>
  </div>;
}

export function Stepper({steps,active,c=colors.media,onStepClick,maxReached}){
  const cap = maxReached==null ? steps.length-1 : maxReached;
  return <div style={{display:'flex',gap:0,flexWrap:'wrap',marginBottom:26}}>{steps.map((s,i)=>{
    const state = i<active?'done':i===active?'active':'todo';
    const clickable = !!onStepClick && i<=cap;
    return <div key={s} style={{display:'flex',alignItems:'center'}}>
      <div onClick={()=>clickable&&onStepClick(i)} style={{display:'flex',alignItems:'center',gap:8,padding:'9px 14px',borderRadius:999,border:`1px solid ${state==='todo'?'rgba(255,255,255,.16)':c}`,background:state==='active'?c+'22':state==='done'?c+'11':'transparent',color:state==='todo'?'#5b6b82':'#fff',fontSize:13,fontWeight:800,cursor:clickable?'pointer':'default'}}>
        <span style={{width:20,height:20,borderRadius:99,display:'grid',placeItems:'center',fontSize:11,background:state==='todo'?'rgba(255,255,255,.08)':c,color:state==='todo'?'#5b6b82':'#02040a'}}>{state==='done'?'✓':i+1}</span>{s}
      </div>{i<steps.length-1 && <span style={{width:22,height:1,background:'rgba(255,255,255,.18)'}}/>}
    </div>;
  })}</div>;
}

export const PERSONAS = [
  { key:'media', name:'Bruno', role:'Media · Senior Producer, France 24', href:'/media', c:colors.media, photo:'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=240&auto=format&fit=crop' },
  { key:'talent', name:'Sarah Benali', role:'Talent · Analyste Géopolitique', href:'/talent', c:colors.talent, photo:'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop' },
  { key:'intermediaire', name:'Jean', role:'Intermédiaire · Booker international', href:'/intermediaires', c:colors.intermediaire, photo:'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=240&auto=format&fit=crop' },
  { key:'organisation', name:'Pascale', role:'Organisation · Directrice événementiel', href:'/organisation', c:colors.organisation, photo:'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=240&auto=format&fit=crop' },
  { key:'communaute', name:'Jessica', role:'Communauté · FanTSAak', href:'/communaute', c:colors.communaute, photo:'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=240&auto=format&fit=crop' },
];

export function Chip({active,onClick,children,c=colors.media}){return <span onClick={onClick} style={{cursor:onClick?'pointer':'default',display:'inline-flex',alignItems:'center',gap:6,padding:'8px 13px',borderRadius:999,border:`1px solid ${active?c:'rgba(255,255,255,.18)'}`,background:active?c+'22':'rgba(255,255,255,.04)',color:active?'#fff':'#94a3b8',fontSize:12,fontWeight:700,userSelect:'none'}}>{children}</span>;}

export function TypingDots({c=colors.media}){return <span style={{display:'inline-flex',gap:4,padding:'10px 14px'}}>{[0,1,2].map(i=><span key={i} style={{width:6,height:6,borderRadius:99,background:c,opacity:.7,animation:`tsaakBlink 1s ${i*0.15}s infinite`}}/>)}<style jsx>{`@keyframes tsaakBlink{0%,80%,100%{opacity:.25}40%{opacity:1}}`}</style></span>;}

export function useLocal(key, initial){
  const [v,setV]=useState(initial);
  useEffect(()=>{ try{ const raw=typeof window!=='undefined' && window.localStorage.getItem(key); if(raw) setV(JSON.parse(raw)); }catch(e){} },[key]);
  useEffect(()=>{ try{ if(typeof window!=='undefined') window.localStorage.setItem(key, JSON.stringify(v)); }catch(e){} },[key,v]);
  return [v,setV];
}

export function euro(n){ return (Math.round(n*100)/100).toLocaleString('fr-FR',{minimumFractionDigits:2,maximumFractionDigits:2})+' €'; }

export function Avatar({src,name,role,big=false}){return <div style={{display:'flex',alignItems:'center',gap:14}}><img src={src} alt={name} style={{width:big?74:44,height:big?74:44,borderRadius:24,objectFit:'cover',border:'1px solid rgba(255,255,255,.18)'}}/><div><b>{name}</b>{role&&<div style={{color:'#94a3b8',fontSize:13}}>{role}</div>}</div></div>;}

// ---- Mode Découverte : parcours guidés pas-à-pas par business case ----
export const DISCOVERY_CASES = [
  { key:'linkedin', label:'Connexion LinkedIn', c:colors.talent, steps:[
    { label:'Importer le profil LinkedIn', href:'/talent-onboarding/self' },
    { label:'Voir le profil généré', href:'/talent/sarah-benali' },
  ]},
  { key:'contract', label:'Contrat & paiement', c:colors.organisation, steps:[
    { label:'Générer et signer le contrat', href:'/contract' },
  ]},
  { key:'score', label:'Calcul du score', c:colors.core, steps:[
    { label:'Ajuster les facteurs du score', href:'/score-explained' },
  ]},
  { key:'mercato', label:'Mercato', c:colors.intermediaire, steps:[
    { label:'Explorer le Mercato', href:'/mercato' },
  ]},
  { key:'search', label:'Recherche', c:colors.media, steps:[
    { label:'Rechercher un talent', href:'/search' },
    { label:'Ouvrir un profil Talent', href:'/talent/sarah-benali' },
    { label:'Envoyer un message', href:'/messaging' },
  ]},
  { key:'shortlist', label:'Shortlist & multi-messaging', c:colors.media, steps:[
    { label:'Consulter la shortlist', href:'/shortlist' },
    { label:'Envoyer un message groupé', href:'/messaging' },
  ]},
  { key:'patchwork', label:'Patchwork', c:colors.intermediaire, steps:[
    { label:'Découvrir les recommandations Push', href:'/patchwork' },
  ]},
  { key:'wanted', label:'Wanted → Propositions', c:colors.media, steps:[
    { label:'Publier un Wanted', href:'/wanted' },
    { label:"Répondre comme intermédiaire", href:'/intermediaires/respond' },
    { label:'Voir les propositions reçues', href:'/media/proposals' },
  ]},
  { key:'ai-search', label:'Recherche IA (chat)', c:colors.media, steps:[
    { label:"Discuter avec l'IA", href:'/ai-search' },
    { label:'Ouvrir la shortlist générée', href:'/shortlist' },
  ]},
  { key:'help-me', label:'Help Me urgent', c:colors.organisation, steps:[
    { label:'Publier un besoin urgent', href:'/help-me' },
  ]},
  { key:'talent-entry', label:'3 entrées Talent', c:colors.talent, steps:[
    { label:"Choisir un parcours d'entrée", href:'/talent-onboarding' },
    { label:'Compléter le profil en self-service', href:'/talent-onboarding/self' },
  ]},
  { key:'talent-profile', label:'Profil Talent riche', c:colors.talent, steps:[
    { label:'Explorer un profil Talent complet', href:'/talent/sarah-benali' },
    { label:'Contacter ce talent', href:'/messaging' },
  ]},
];

function StepIcon({ done, active, c }){
  return <span style={{width:22,height:22,borderRadius:'50%',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:800,
    background: done ? c : active ? 'transparent' : 'rgba(255,255,255,.06)',
    border: `1.5px solid ${done ? c : active ? c : 'rgba(255,255,255,.22)'}`,
    color: done ? '#03040A' : active ? c : '#7A8699'}}>
    {done ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M5 13l5 5L19 7" stroke="#03040A" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/></svg> : null}
  </span>;
}

export function DiscoveryPanel(){
  const router = useRouter();
  const [open, setOpen] = useLocal('tsaak:discovery:open', false);
  const [sel, setSel] = useLocal('tsaak:discovery:case', null);
  const [mounted, setMounted] = useState(false);
  useEffect(()=>{ setMounted(true); }, []);
  if (!mounted) return null;
  const current = DISCOVERY_CASES.find(c => c.key === sel);
  const path = router.asPath ? router.asPath.split('?')[0].split('#')[0] : '';
  const stepIdx = current ? current.steps.findIndex(s => s.href === path) : -1;

  if (!open) {
    return <div onClick={()=>setOpen(true)} title='Mode découverte — guide pas à pas' style={{position:'fixed',right:20,bottom:20,zIndex:999,cursor:'pointer',
      width:56,height:56,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',
      background:'linear-gradient(135deg,#F6FF0033,#ffffff14)',border:'1px solid #F6FF0066',
      boxShadow:'0 8px 28px rgba(246,255,0,.25)',fontSize:22,lineHeight:1}}>
      🧭
    </div>;
  }

  return <div style={{position:'fixed',right:16,top:16,bottom:16,width:300,zIndex:999,overflowY:'auto',
    background:'linear-gradient(180deg,#0A0E1Cee,#060911ee)',border:'1px solid rgba(255,255,255,.12)',borderRadius:22,
    padding:18,boxShadow:'0 20px 60px rgba(0,0,0,.55)',backdropFilter:'blur(16px)'}}>
    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:4}}>
      <span style={{fontSize:11,fontWeight:800,letterSpacing:1.5,color:'#F6FF00'}}>● MODE DÉCOUVERTE</span>
      <span onClick={()=>setOpen(false)} style={{cursor:'pointer',color:'#7A8699',fontSize:18,lineHeight:1,padding:'2px 6px'}}>×</span>
    </div>
    <p style={{fontSize:12,color:'#7A8699',margin:'6px 0 14px',lineHeight:1.4}}>Choisissez un business case, suivez-le pas à pas.</p>

    {!current && <div style={{display:'grid',gap:8}}>
      {DISCOVERY_CASES.map(c => <div key={c.key} onClick={()=>{ setSel(c.key); router.push(c.steps[0].href); }}
        style={{cursor:'pointer',padding:'10px 12px',borderRadius:12,background:'rgba(255,255,255,.04)',border:`1px solid ${c.c}33`,
        display:'flex',alignItems:'center',justifyContent:'space-between',gap:8}}>
        <span style={{fontSize:13,fontWeight:700,color:'#fff'}}>{c.label}</span>
        <span style={{fontSize:10,color:c.c,fontWeight:800}}>{c.steps.length} étape{c.steps.length>1?'s':''}</span>
      </div>)}
    </div>}

    {current && <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
        <b style={{fontSize:15,color:current.c}}>{current.label}</b>
        <span onClick={()=>setSel(null)} style={{cursor:'pointer',fontSize:11,color:'#7A8699',fontWeight:700,textDecoration:'underline'}}>changer</span>
      </div>
      <div style={{display:'grid',gap:4}}>
        {current.steps.map((s,i) => {
          const isActive = i === stepIdx;
          const isDone = stepIdx >= 0 && i < stepIdx;
          return <a key={s.href} href={s.href} style={{textDecoration:'none',display:'flex',alignItems:'center',gap:10,padding:'9px 8px',borderRadius:10,
            background:isActive?`${current.c}18`:'transparent'}}>
            <StepIcon done={isDone} active={isActive} c={current.c}/>
            <span style={{fontSize:12.5,color:isActive?'#fff':isDone?'#C9D4E4':'#8B97A8',fontWeight:isActive?800:600}}>{s.label}</span>
          </a>;
        })}
      </div>
      <div style={{display:'flex',gap:8,marginTop:14}}>
        {stepIdx > 0 && <a href={current.steps[stepIdx-1].href} style={{...ghost(current.c),flex:1,padding:'9px 10px',fontSize:12,boxShadow:'none'}}>← Précédent</a>}
        {stepIdx >= 0 && stepIdx < current.steps.length-1 && <a href={current.steps[stepIdx+1].href} style={{...button(current.c),flex:1,padding:'9px 10px',fontSize:12}}>Suivant →</a>}
        {stepIdx === current.steps.length-1 && <span style={{flex:1,textAlign:'center',fontSize:11,color:'#7A8699',padding:'9px 0'}}>Parcours terminé ✓</span>}
      </div>
    </div>}
  </div>;
}
