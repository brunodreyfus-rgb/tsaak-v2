import { useMemo, useState } from 'react';
import { page, card, button, colors, Badge, Masthead, Chip, useLocal } from '../components/RichDemoUI';
import { talents, realTalents } from '../data/talents';

const ALL_TAGS = ['AI & society','Middle East','energy security','climate transition','defense','cyber risk','public health','future of work','space economy','social movements','TV ready','Keynote ready','Verified','High demand','Talent TSAAK'];
const allTalents = [...(realTalents || []), ...talents];

export default function Search(){
  const [q,setQ] = useState('');
  const [tag,setTag] = useState(null);
  const [shortlist,setShortlist] = useLocal('tsaak:shortlist', []);

  const results = useMemo(()=>{
    const query = q.trim().toLowerCase();
    return allTalents.filter(t=>{
      const hay = (t.name+' '+t.role+' '+t.country+' '+t.tags.join(' ')).toLowerCase();
      const matchQ = !query || hay.includes(query);
      const matchTag = !tag || t.tags.includes(tag);
      return matchQ && matchTag;
    }).slice(0,12);
  },[q,tag]);

  function toggle(t){
    const in_ = shortlist.some(x=>x.id===t.id);
    setShortlist(in_ ? shortlist.filter(x=>x.id!==t.id) : [...shortlist, {id:t.id,name:t.name,role:t.role,photo:t.photo,score:t.score,price:t.price}]);
  }

  return <main style={page('media')}>
    <Masthead active='recherche'/>
    <Badge c={colors.media}>BUSINESS CASE · RECHERCHE</Badge>
    <h1 style={{fontSize:48,maxWidth:900}}>Recherche proactive multi-critères</h1>
    <p style={{color:'#C9D4E4',fontSize:18,maxWidth:880}}>Tapez un besoin (sujet, format, pays…) ou filtrez par tag. Les résultats se mettent à jour en direct sur les 50 talents de la base démo.</p>

    <div style={{...card(colors.media),marginTop:6}}>
      <input value={q} onChange={e=>setQ(e.target.value)} placeholder='Ex : “expert IA société”, “ancien militaire”, “climat énergie keynote”…' style={{width:'100%',padding:16,borderRadius:14,background:'rgba(255,255,255,.07)',border:'1px solid rgba(255,255,255,.16)',color:'#fff',boxSizing:'border-box',fontSize:15}}/>
      <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:14}}>
        <Chip active={!tag} onClick={()=>setTag(null)} c={colors.media}>Tous</Chip>
        {ALL_TAGS.map(t=><Chip key={t} active={tag===t} onClick={()=>setTag(tag===t?null:t)} c={colors.media}>{t}</Chip>)}
      </div>
    </div>

    <p style={{color:'#94a3b8',margin:'18px 0 10px'}}>{results.length} résultat{results.length>1?'s':''} {shortlist.length>0 && <>· <a href='/shortlist' style={{color:colors.core}}>{shortlist.length} en shortlist →</a></>}</p>

    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(250px,1fr))',gap:16}}>
      {results.map(t=>{
        const inList = shortlist.some(x=>x.id===t.id);
        return <div key={t.id} style={card(colors.media)}>
          <img src={t.photo} style={{width:'100%',height:150,objectFit:'cover',borderRadius:16}}/>
          <h3 style={{margin:'12px 0 2px'}}>{t.name}</h3>
          <p style={{color:'#94a3b8',fontSize:13,margin:0}}>{t.role} · {t.country}</p>
          <p style={{margin:'8px 0'}}><b style={{color:colors.talent}}>Score {t.score}</b> · {t.price}</p>
          <p style={{color:'#C9D4E4',fontSize:12}}>{t.aiFound && t.aiFound[0]}</p>
          <div style={{display:'flex',gap:8,marginTop:8}}>
            <a href={`/talent/${t.id}`} style={{...button(colors.media),padding:'9px 12px',fontSize:12}}>Profil</a>
            <button onClick={()=>toggle(t)} style={{...button(inList?colors.core:colors.intermediaire),padding:'9px 12px',fontSize:12,border:'none',cursor:'pointer'}}>{inList?'✓ Dans la shortlist':'+ Shortlist'}</button>
          </div>
        </div>;
      })}
    </div>
  </main>;
}
