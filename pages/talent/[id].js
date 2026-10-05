import { useRouter } from 'next/router';
import { page, card, button, colors, Badge, Masthead, Progress, ProofCard } from '../../components/RichDemoUI';
import { talents, realTalents } from '../../data/talents';
import { mediaProofs } from '../../data/mediaProofs';

const TEXTURES = { Video:'/avatars/proof-video.png', Audio:'/avatars/proof-podcast.png', Written:'/avatars/proof-press.png' };

function realProofsFor(t){
  if (!t || !Array.isArray(t.media)) return null;
  if (t.media.length === 0) return [];
  return t.media.map(m => ({
    type: m.type === 'Video' ? 'TV' : m.type === 'Audio' ? 'Podcast' : 'Article',
    icon: m.type === 'Video' ? '▶' : m.type === 'Audio' ? '●' : '✒',
    title: m.title,
    source: m.source,
    date: m.date || 'Source publique',
    metric: 'Vérifié',
    thumbnail: TEXTURES[m.type] || TEXTURES.Written,
    note: 'Réalisation publique reprise telle quelle, sans donnée inventée.',
  }));
}

export default function TalentProfile(){
  const {query}=useRouter();
  const all = [...(Array.isArray(realTalents) ? realTalents : []), ...(Array.isArray(talents) ? talents : [])];
  const t = all.find(x=>x.id===query.id) || all[0] || {name:'Sarah Benali',role:'Geopolitics Analyst',country:'France / UAE',score:94,avatar:'/avatars/sarah-benali.png',languages:['FR','EN','AR'],topics:['Geopolitics','AI governance','Middle East']};
  const c=colors.talent;
  const proofs = realProofsFor(t) || mediaProofs;
  const isReal = Array.isArray(realTalents) && realTalents.some(x=>x.id===t.id);
  return <main style={page('talent')}><Masthead/>
    <section style={{display:'grid',gridTemplateColumns:'280px 1fr',gap:26,alignItems:'stretch'}}>
      <div style={{...card(c),padding:0,overflow:'hidden'}}>
        <div style={{height:320,backgroundImage:`linear-gradient(180deg,transparent,#02030A),url(${t.avatar || t.photo || '/avatars/sarah-benali.png'})`,backgroundSize:'cover',backgroundPosition:'center'}}/>
        <div style={{padding:22}}>
          <Badge c={c}>{isReal ? 'TALENT PROFILE · EXEMPLE RÉEL' : 'TALENT PROFILE'}</Badge>
          <h1>{t.name}</h1>
          <p style={{color:'#C9D4E4'}}>{t.role} · {t.country}</p>
          <Progress label='TSAAK Score' value={(t.score || 92)+'%'} c={c}/>
          <a href='/messaging' style={button(c)}>Contacter / multi-message</a>
        </div>
      </div>
      <div style={{display:'grid',gap:18}}>
        <section style={card(c)}>
          <h2>LinkedIn imported background</h2>
          <p style={{color:'#C9D4E4'}}>Current position, education, topics, languages and public expertise are imported from LinkedIn-like data, then enriched by AI scan.</p>
          <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
            {(t.languages || ['FR','EN']).map(x=><Badge key={x} c={c}>{x}</Badge>)}
            {(t.topics || t.tags || ['AI','Media','Policy']).map(x=><Badge key={x} c={colors.media}>{x}</Badge>)}
          </div>
        </section>
        <section style={card(colors.media)}>
          <h2>TSAAK background</h2>
          <p style={{color:'#C9D4E4'}}>{isReal ? (t.tsaakBackground || []).join(' · ') : '4 requests received · 2 accepted · Avg response time 18 min · Performance feedback 94/100.'}</p>
          {!isReal && <>
            <Progress label='Reliability' value='94%' c={colors.organisation}/>
            <Progress label='Media readiness' value='89%' c={colors.media}/>
          </>}
        </section>
      </div>
    </section>
    <h2 style={{marginTop:34}}>Media proof wall</h2>
    {proofs.length === 0
      ? <p style={{color:'#9FACBF'}}>Aucune preuve média publique recensée à ce jour — le score reste honnête, rien n'est inventé pour le faire monter.</p>
      : <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(230px,1fr))',gap:16}}>
          {proofs.map(p=><ProofCard key={p.title} p={p} c={p.type==='TV'?colors.media:p.type==='Podcast'?colors.intermediaire:p.type==='Article'?colors.core:colors.organisation}/>)}
        </div>}
  </main>
}
