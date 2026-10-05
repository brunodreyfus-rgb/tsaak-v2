import { useEffect, useRef, useState } from 'react';
import { page, card, button, colors, Badge, Masthead, TypingDots, useLocal } from '../components/RichDemoUI';

const DEFAULT_THREADS = [
  { id:'sarah-benali', name:'Sarah Benali', photo:'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop', replied:true, messages:[
    { from:'media', text:'Bonjour Sarah, êtes-vous disponible demain ?' },
    { from:'talent', text:'Oui, pour quel sujet ?' },
    { from:'media', text:'Plateau LCI sur IA & société. Fee €1,800.' },
    { from:'talent', text:'J’accepte, envoyez les détails.' },
  ]},
];

const CANNED_REPLIES = ["Merci pour votre message, je regarde ma disponibilité et je reviens vers vous rapidement.", "C’est noté, je suis disponible — dites-moi les modalités exactes (durée, lieu, format).", "Avec plaisir, envoyez-moi le contrat dès que possible."];

export default function Messaging(){
  const [threads,setThreads] = useLocal('tsaak:threads', DEFAULT_THREADS);
  const [activeId,setActiveId] = useState(null);
  const [draft,setDraft] = useState('');
  const [typing,setTyping] = useState({});
  const scheduled = useRef(new Set());

  const active = threads.find(t=>t.id===activeId) || threads[0];

  useEffect(()=>{
    threads.forEach(t=>{
      const key = t.id+':'+t.messages.length;
      if(!t.replied && !scheduled.current.has(key)){
        scheduled.current.add(key);
        setTyping(s=>({...s,[t.id]:true}));
        setTimeout(()=>{
          setThreads(prev=>prev.map(x=> x.id===t.id ? {...x, replied:true, messages:[...x.messages, {from:'talent', text: CANNED_REPLIES[Math.floor(Math.random()*CANNED_REPLIES.length)]}]} : x));
          setTyping(s=>({...s,[t.id]:false}));
        }, 1800);
      }
    });
  },[threads]);

  function send(){
    if(!draft.trim() || !active) return;
    setThreads(prev=>prev.map(x=> x.id===active.id ? {...x, replied:false, messages:[...x.messages, {from:'media', text:draft.trim()}]} : x));
    setDraft('');
  }

  return <main style={page('media')}>
    <Masthead active='recherche'/>
    <Badge c={colors.media}>BUSINESS CASE · MESSAGERIE</Badge>
    <h1 style={{fontSize:44}}>Messagerie</h1>
    <p style={{color:'#C9D4E4',fontSize:16,maxWidth:800,marginBottom:20}}>Les envois multi-message depuis la <a href='/shortlist' style={{color:colors.media}}>shortlist</a> créent un fil par talent. Écrivez, et une réponse arrive automatiquement.</p>

    <div style={{display:'grid',gridTemplateColumns:'280px 1fr',gap:18}}>
      <div style={card(colors.media)}>
        {threads.map(t=><div key={t.id} onClick={()=>setActiveId(t.id)} style={{display:'flex',alignItems:'center',gap:10,padding:12,borderRadius:14,cursor:'pointer',background: (active&&active.id===t.id) ? 'rgba(0,213,255,.16)' : 'rgba(255,255,255,.03)',marginBottom:6}}>
          <img src={t.photo} style={{width:38,height:38,borderRadius:12,objectFit:'cover'}}/>
          <div style={{flex:1,minWidth:0}}>
            <b style={{fontSize:13}}>{t.name}</b>
            <p style={{margin:0,fontSize:11,color:'#94a3b8',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{t.messages[t.messages.length-1]?.text}</p>
          </div>
          {typing[t.id] && <span style={{width:8,height:8,borderRadius:99,background:colors.core}}/>}
        </div>)}
      </div>
      {active && <div style={card(colors.media)}>
        <h2>{active.name}</h2>
        <div style={{maxHeight:360,overflowY:'auto',marginBottom:12}}>
          {active.messages.map((m,i)=><div key={i} style={{textAlign:m.from==='media'?'right':'left',margin:'10px 0'}}>
            <span style={{display:'inline-block',padding:12,borderRadius:16,maxWidth:'80%',whiteSpace:'pre-wrap',background:m.from==='media'?'rgba(0,213,255,.18)':'rgba(0,255,133,.15)',border:'1px solid rgba(255,255,255,.1)',fontSize:14}}>{m.text}</span>
          </div>)}
          {typing[active.id] && <div style={{textAlign:'left'}}><TypingDots c={colors.talent}/></div>}
        </div>
        <div style={{display:'flex',gap:8}}>
          <input value={draft} onChange={e=>setDraft(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} placeholder='Écrire un message…' style={{flex:1,padding:12,borderRadius:12,background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.14)',color:'#fff'}}/>
          <button onClick={send} style={{...button(colors.media),border:'none',cursor:'pointer'}}>Envoyer</button>
        </div>
      </div>}
    </div>
  </main>;
}
