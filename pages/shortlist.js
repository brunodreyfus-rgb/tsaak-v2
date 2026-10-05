import { useState } from 'react';
import { page, card, button, colors, Badge, Masthead, useLocal } from '../components/RichDemoUI';

export default function Shortlist(){
  const [shortlist,setShortlist] = useLocal('tsaak:shortlist', []);
  const [threads,setThreads] = useLocal('tsaak:threads', []);
  const [subject,setSubject] = useState('Invitation plateau TV — IA & société');
  const [body,setBody] = useState('Bonjour, nous préparons une émission demain à 18h. Seriez-vous disponible pour intervenir ?');
  const [sent,setSent] = useState(false);

  function remove(id){ setShortlist(shortlist.filter(x=>x.id!==id)); }

  function sendToAll(){
    const now = new Date().toISOString();
    const next = [...threads];
    shortlist.forEach(t=>{
      const existing = next.find(th=>th.id===t.id);
      const msg = { from:'media', text:`${subject}\n\n${body}`, ts:now };
      if(existing){ existing.messages.push(msg); existing.replied=false; }
      else next.push({ id:t.id, name:t.name, photo:t.photo, messages:[msg], replied:false });
    });
    setThreads(next);
    setSent(true);
  }

  return <main style={page('media')}>
    <Masthead active='recherche'/>
    <Badge c={colors.intermediaire}>BUSINESS CASE · MULTI-MESSAGE</Badge>
    <h1 style={{fontSize:48,maxWidth:900}}>Shortlist &amp; multi-message</h1>
    <p style={{color:'#C9D4E4',fontSize:18,maxWidth:880}}>Comparez les profils shortlistés depuis la <a href='/search' style={{color:colors.media}}>recherche</a> ou le <a href='/patchwork' style={{color:colors.media}}>Patchwork</a>, puis envoyez le même brief à tous en un clic.</p>

    {shortlist.length===0 ? <div style={{...card('rgba(255,255,255,.14)'),marginTop:10}}>
      <p style={{color:'#94a3b8'}}>Aucun talent en shortlist pour l’instant.</p>
      <a style={button(colors.media)} href='/search'>Aller à la recherche</a>
    </div> : <>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:14,marginTop:10}}>
        {shortlist.map(t=><div key={t.id} style={card(colors.media)}>
          <img src={t.photo} style={{width:'100%',height:120,objectFit:'cover',borderRadius:14}}/>
          <h3 style={{margin:'10px 0 2px',fontSize:16}}>{t.name}</h3>
          <p style={{color:'#94a3b8',fontSize:12,margin:0}}>{t.role}</p>
          <button onClick={()=>remove(t.id)} style={{marginTop:8,background:'none',border:'1px solid rgba(255,255,255,.2)',color:'#94a3b8',borderRadius:10,padding:'6px 10px',fontSize:11,cursor:'pointer'}}>Retirer</button>
        </div>)}
      </div>

      <section style={{...card(colors.intermediaire),marginTop:20}}>
        <h2>Message à {shortlist.length} talent{shortlist.length>1?'s':''}</h2>
        <p style={{color:'#94a3b8',fontSize:13}}>{shortlist.map(x=>x.name).join(' · ')}</p>
        <input value={subject} onChange={e=>setSubject(e.target.value)} style={{width:'100%',padding:14,borderRadius:12,background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.14)',color:'#fff',boxSizing:'border-box',marginBottom:10}}/>
        <textarea value={body} onChange={e=>setBody(e.target.value)} style={{width:'100%',minHeight:110,padding:14,borderRadius:12,background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.14)',color:'#fff',boxSizing:'border-box'}}/>
        {!sent ? <button onClick={sendToAll} style={{...button(colors.intermediaire),border:'none',cursor:'pointer',marginTop:12}}>Envoyer à {shortlist.length} talent{shortlist.length>1?'s':''}</button>
        : <div style={{marginTop:12}}>
            <Badge c={colors.core}>✓ ENVOYÉ</Badge>
            <p style={{color:'#C9D4E4',marginTop:8}}>Message envoyé. Suivez les réponses dans la messagerie.</p>
            <a style={button(colors.core)} href='/messaging'>Ouvrir la messagerie →</a>
          </div>}
      </section>
    </>}
  </main>;
}
