import { useState } from 'react';
import { page, card, button, colors, Badge, Masthead, TypingDots, Chip, useLocal } from '../components/RichDemoUI';
import { talents } from '../data/talents';

const PROMPTS = ['Je prépare un débat sur l’AI Act, il me faut un profil clair et contradictoire', 'Besoin d’un expert énergie/climat pour une conférence corporate', 'Qui peut parler cybersécurité et deepfake en anglais, disponible ce soir ?'];
const CHOICES = ['Profil institutionnel','Profil tech / expert terrain','Société civile'];
const SHORTLIST_BY_CHOICE = { 'Profil institutionnel':[talents[3],talents[8]], 'Profil tech / expert terrain':[talents[5] || talents[1],talents[1]], 'Société civile':[talents[6] || talents[2],talents[2]] };

export default function AiSearch(){
  const [msgs,setMsgs] = useState([ {from:'ai', text:'Bonjour ! Décrivez votre besoin éditorial, ou choisissez un exemple ci-dessous.'} ]);
  const [input,setInput] = useState('');
  const [phase,setPhase] = useState('ask'); // ask -> clarify -> result
  const [typing,setTyping] = useState(false);
  const [shortlist,setShortlist] = useLocal('tsaak:shortlist', []);

  function userSend(text){
    if(!text.trim()) return;
    setMsgs(m=>[...m,{from:'user',text}]);
    setInput('');
    setTyping(true);
    setTimeout(()=>{
      setTyping(false);
      setMsgs(m=>[...m,{from:'ai',text:'Merci. Pour affiner : voulez-vous un profil plutôt institutionnel, tech/terrain, ou société civile ?'}]);
      setPhase('clarify');
    }, 1100);
  }

  function pickChoice(choice){
    setMsgs(m=>[...m,{from:'user',text:choice}]);
    setTyping(true);
    setTimeout(()=>{
      setTyping(false);
      setMsgs(m=>[...m,{from:'ai',text:'Voici une shortlist expliquée, classée par pertinence :',shortlist:choice}]);
      setPhase('result');
    }, 1100);
  }

  function addToShortlist(talent){
    if(!shortlist.some(x=>x.id===talent.id)) setShortlist([...shortlist, {id:talent.id,name:talent.name,role:talent.role,photo:talent.photo,score:talent.score,price:talent.price}]);
  }

  return <main style={page('media')}>
    <Masthead active='recherche'/>
    <Badge c={colors.media}>BUSINESS CASE · LIVECHAT IA</Badge>
    <h1 style={{fontSize:48,maxWidth:900}}>Recherche IA en livechat</h1>
    <p style={{color:'#C9D4E4',fontSize:17,maxWidth:860}}>Le média décrit une idée éditoriale en langage naturel dans un livechat ; l’assistant clarifie puis propose une shortlist expliquée.</p>

    <section style={{...card(colors.media),maxWidth:820}}>
      <div style={{minHeight:120}}>
        {msgs.map((m,i)=><div key={i} style={{textAlign:m.from==='user'?'right':'left',margin:'12px 0'}}>
          <span style={{display:'inline-block',padding:13,borderRadius:16,maxWidth:'85%',background:m.from==='user'?'rgba(0,213,255,.18)':'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.1)',fontSize:14}}>{m.text}</span>
        </div>)}
        {typing && <div style={{textAlign:'left'}}><TypingDots c={colors.media}/></div>}

        {phase==='result' && msgs[msgs.length-1]?.shortlist && <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:14,marginTop:14}}>
          {(SHORTLIST_BY_CHOICE[msgs[msgs.length-1].shortlist]||[]).filter(Boolean).map(t=><div key={t.id} style={{padding:14,borderRadius:16,background:'rgba(255,255,255,.05)',border:`1px solid ${colors.talent}55`}}>
            <img src={t.photo} style={{width:'100%',height:110,objectFit:'cover',borderRadius:12}}/>
            <b style={{display:'block',marginTop:8}}>{t.name}</b>
            <p style={{color:'#94a3b8',fontSize:12,margin:'2px 0 8px'}}>{t.role} · score {t.score}</p>
            <button onClick={()=>addToShortlist(t)} style={{...button(colors.core),border:'none',cursor:'pointer',fontSize:12,padding:'8px 12px'}}>+ Shortlist</button>
          </div>)}
        </div>}
      </div>

      {phase==='ask' && <>
        <div style={{display:'flex',gap:8,flexWrap:'wrap',margin:'14px 0'}}>{PROMPTS.map(p=><Chip key={p} onClick={()=>userSend(p)} c={colors.media}>{p}</Chip>)}</div>
        <div style={{display:'flex',gap:8}}>
          <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&userSend(input)} placeholder='Décrivez votre besoin…' style={{flex:1,padding:13,borderRadius:12,background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.14)',color:'#fff'}}/>
          <button onClick={()=>userSend(input)} style={{...button(colors.media),border:'none',cursor:'pointer'}}>Envoyer</button>
        </div>
      </>}
      {phase==='clarify' && <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:14}}>{CHOICES.map(c=><Chip key={c} onClick={()=>pickChoice(c)} c={colors.talent}>{c}</Chip>)}</div>}
      {phase==='result' && <div style={{display:'flex',gap:10,flexWrap:'wrap',marginTop:16}}>
        <a href='/shortlist' style={button(colors.core)}>Ouvrir la shortlist →</a>
        <a href='/help-me' style={button(colors.organisation)}>Convertir en Help Me</a>
      </div>}
    </section>
  </main>;
}
