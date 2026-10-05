import { page, card, button, colors, Badge, Masthead, Stepper, useLocal } from '../components/RichDemoUI';

const STATUSES = ['Open','Proposals','Shortlist','Selected','Contract','Paid','Done'];

const DEFAULT_WANTED = { title:'Joueur de l’équipe de France, champion du monde de football, pour interview exclusive', media:'LCI', budget:'8 000 €', deadline:'Aujourd’hui 21:00', brief:'Recherche un joueur champion du monde disponible pour une interview exclusive en plateau, réaction à chaud après la victoire.', status:'Open' };

export default function Wanted(){
  const [w,setW] = useLocal('tsaak:wanted', DEFAULT_WANTED);
  const [proposals] = useLocal('tsaak:proposals', []);
  const set = (k,v)=>setW({...w,[k]:v});
  const stageIdx = Math.max(0, STATUSES.indexOf(w.status));

  return <main style={page('media')}>
    <Masthead active='recherche'/>
    <Badge c={colors.media}>BUSINESS CASE · WANTED</Badge>
    <h1 style={{fontSize:48,maxWidth:900}}>Wanted cockpit</h1>
    <p style={{color:'#C9D4E4',fontSize:18,maxWidth:880}}>Publiez un besoin précis. Les intermédiaires et bookers le voient dans leur inbox et proposent des talents.</p>

    <Stepper c={colors.media} active={stageIdx} steps={STATUSES}/>

    <div style={{display:'grid',gridTemplateColumns:'1.1fr .9fr',gap:22}}>
      <section style={card(colors.media)}>
        <h2>Éditer le Wanted</h2>
        <div style={{display:'grid',gap:10}}>
          <input value={w.title} onChange={e=>set('title',e.target.value)} style={inp} placeholder='Titre'/>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
            <input value={w.media} onChange={e=>set('media',e.target.value)} style={inp} placeholder='Média'/>
            <input value={w.budget} onChange={e=>set('budget',e.target.value)} style={inp} placeholder='Budget'/>
          </div>
          <input value={w.deadline} onChange={e=>set('deadline',e.target.value)} style={inp} placeholder='Deadline'/>
          <textarea value={w.brief} onChange={e=>set('brief',e.target.value)} style={{...inp,minHeight:100}} placeholder='Brief'/>
        </div>
        <button onClick={()=>set('status','Open')} style={{...button(colors.media),border:'none',cursor:'pointer',marginTop:12}}>Publier aux intermédiaires</button>
      </section>

      <section style={card(colors.intermediaire)}>
        <h2>Statut</h2>
        <p style={{color:'#C9D4E4'}}><b>{proposals.length}</b> proposition{proposals.length>1?'s':''} reçue{proposals.length>1?'s':''} · statut actuel : <b style={{color:colors.core}}>{w.status}</b></p>
        <p style={{color:'#94a3b8',fontSize:13}}>Les intermédiaires répondent depuis leur cockpit (« Répondre à un Wanted »).</p>
        <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
          <a style={button(colors.intermediaire)} href='/intermediaires/respond'>Simuler une réponse d’intermédiaire</a>
          <a style={button(colors.media)} href='/media/proposals'>Voir les propositions →</a>
        </div>
      </section>
    </div>
  </main>;
}
const inp = {width:'100%',padding:13,borderRadius:12,background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.14)',color:'#fff',boxSizing:'border-box'};
