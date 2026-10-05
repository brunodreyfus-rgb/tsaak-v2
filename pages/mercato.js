import { useEffect, useState } from 'react';
import { page, card, button, colors, Badge, Progress, Masthead, Countdown, Slider, Stepper, useLocal, euro } from '../components/RichDemoUI';

const TIERS = [ {v:2000,label:'Tier 2K',duration:'1 an'}, {v:4000,label:'Tier 4K',duration:'1 an'}, {v:6000,label:'Tier 6K',duration:'3 ans'} ];

const GUESTS = [
  { id:'g1', name:'Noam Weiss', role:'IA, cybersécurité & deepfake', score:93, photo:'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=500&auto=format&fit=crop' },
  { id:'g2', name:'Lina Moreau', role:'Climat & énergie', score:91, photo:'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop' },
  { id:'g3', name:'Sarah Benali', role:'Géopolitique Moyen-Orient', score:94, photo:'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&auto=format&fit=crop' },
  { id:'g4', name:'Marc Delcourt', role:'Économie & inflation', score:89, photo:'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=500&auto=format&fit=crop' },
  { id:'g5', name:'Colonel Hugo Martin', role:'Défense & stratégie', score:87, photo:'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&auto=format&fit=crop' },
  { id:'g6', name:'Dr Inès Carvalho', role:'Santé publique & urgences', score:86, photo:'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=500&auto=format&fit=crop' },
];

const DEFAULT_STATE = {
  selected: 'g1',
  offers: {
    g1: [ {id:'o1', media:'LCI', tier:6000, recommended:true}, {id:'o2', media:'BFM Business', tier:4000} ],
    g3: [ {id:'o3', media:'France 24', tier:4000, recommended:true} ],
  },
  contracts: {},
  investPct: 12,
  newMedia: '', newTier: 4000,
};

const STEPS = ['Choisir le Guest','Étudier les offres','Investissement Kaastbase','Contrat signé'];

export default function Mercato(){
  const [st, setSt] = useLocal('tsaak:mercato', DEFAULT_STATE);
  const [stage, setStage] = useLocal('tsaak:mercato:stage', 0);
  const guest = GUESTS.find(g=>g.id===st.selected) || GUESTS[0];
  const offers = st.offers[guest.id] || [];
  const contract = st.contracts[guest.id];
  // Computed client-side only (after mount) to avoid a hydration mismatch against the statically prerendered HTML.
  const [windowEnd, setWindowEnd] = useState(null);
  useEffect(()=>{ setWindowEnd(Date.now() + 1000*60*60*24*46); },[]); // ~46 days mercato window

  function addOffer(){
    if(!st.newMedia.trim()) return;
    const o = { id:'o'+Date.now(), media: st.newMedia.trim(), tier: Number(st.newTier) };
    setSt({ ...st, offers: { ...st.offers, [guest.id]: [...offers, o] }, newMedia:'' });
  }
  function acceptOffer(o){
    const tier = TIERS.find(t=>t.v===o.tier);
    setSt({ ...st, contracts: { ...st.contracts, [guest.id]: { media:o.media, tier:o.tier, duration: tier.duration, at: new Date().toISOString() } } });
    setStage(3);
  }
  function pickGuest(id){ setSt({...st, selected:id}); }

  const investAmount = Math.round(guest.score*100 * (st.investPct/100));
  const roi = Math.round(investAmount * 0.34 * 3); // illustrative 3-year projection
  const maxReached = contract ? 3 : (offers.length || Object.keys(st.offers).length) ? 2 : 1;

  return <main style={page('intermediaire')}>
    <Masthead active='mercato'/>
    <Badge c={colors.intermediaire}>BUSINESS CASE · MERCATO</Badge>
    <h1 style={{fontSize:50,maxWidth:920}}>Le Mercato TSAAK — 2 mois pour recomposer les castes média</h1>
    <p style={{color:'#C9D4E4',fontSize:19,maxWidth:900}}>Chaque été, les Guests sans affiliation et les contrats arrivant à échéance entrent en Mercato, sur 3 paliers de contrat (2K / 4K / 6K) indexés au score TSAAK.</p>

    <section style={{...card(colors.intermediaire),display:'flex',flexWrap:'wrap',gap:24,alignItems:'center',justifyContent:'space-between',marginBottom:24}}>
      <div><Badge c={colors.intermediaire}>FENÊTRE OUVERTE</Badge><p style={{color:'#C9D4E4',margin:'8px 0 0'}}>Le Mercato ferme dans :</p></div>
      {windowEnd ? <Countdown to={windowEnd} c={colors.intermediaire}/> : <div style={{display:'flex',gap:8}}>{['J','H','M','S'].map(l=><div key={l} style={{textAlign:'center',padding:'10px 14px',borderRadius:14,background:'rgba(255,255,255,.06)',border:`1px solid ${colors.intermediaire}55`,minWidth:56}}><div style={{fontSize:22,fontWeight:900,color:colors.intermediaire}}>··</div><div style={{fontSize:10,color:'#94a3b8',letterSpacing:2}}>{l}</div></div>)}</div>}
    </section>

    <Stepper c={colors.intermediaire} active={stage} steps={STEPS} onStepClick={setStage} maxReached={maxReached}/>

    {stage===0 && <section style={{...card(colors.intermediaire)}}>
      <h2>Guests en Mercato — choisissez-en un</h2>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(210px,1fr))',gap:16,marginTop:14}}>
        {GUESTS.map(g=>{
          const signed = st.contracts[g.id];
          return <div key={g.id} onClick={()=>pickGuest(g.id)} style={{...card(g.id===guest.id?colors.intermediaire:'rgba(255,255,255,.12)'),cursor:'pointer',padding:0,overflow:'hidden'}}>
            <div style={{height:120,backgroundImage:`linear-gradient(180deg,transparent,#02030A),url(${g.photo})`,backgroundSize:'cover',backgroundPosition:'center'}}/>
            <div style={{padding:14}}>
              <b>{g.name}</b><p style={{color:'#94a3b8',fontSize:12,margin:'4px 0'}}>{g.role}</p>
              <Badge c={signed?colors.core:colors.intermediaire}>{signed ? `Signé · ${signed.media}` : `Score ${g.score} · Libre`}</Badge>
            </div>
          </div>;
        })}
      </div>
      <button onClick={()=>setStage(1)} style={{...button(colors.intermediaire),border:'none',cursor:'pointer',marginTop:18}}>Voir les offres pour {guest.name} →</button>
    </section>}

    {stage===1 && <section style={card(colors.intermediaire)}>
      <h2>Enchères — {guest.name} <span style={{color:'#94a3b8',fontWeight:400,fontSize:15}}>· Score {guest.score}</span></h2>
      {contract ? <div style={{padding:16,borderRadius:14,background:colors.core+'14',border:`1px solid ${colors.core}`}}>
        <Badge c={colors.core}>✓ CONTRAT SIGNÉ</Badge>
        <p style={{color:'#C9D4E4',margin:'10px 0'}}>{guest.name} rejoint <b>{contract.media}</b> — palier {contract.tier.toLocaleString('fr-FR')} € · durée {contract.duration}.</p>
        <button onClick={()=>setStage(3)} style={{...button(colors.core),border:'none',cursor:'pointer'}}>Voir le contrat →</button>
      </div> : <>
        {offers.length===0 && <p style={{color:'#64748b'}}>Aucune offre pour l'instant. Ajoutez la première ci-dessous.</p>}
        <div style={{display:'grid',gap:12}}>
          {offers.map(o=><div key={o.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:10,padding:'14px 16px',borderRadius:14,background:'rgba(255,255,255,.05)',border:`1px solid ${o.recommended?colors.talent:'rgba(255,255,255,.14)'}`}}>
            <div><b>{o.media}</b> {o.recommended && <Badge c={colors.talent}>Recommandé FanTSAak</Badge>}<p style={{color:'#94a3b8',fontSize:13,margin:'4px 0 0'}}>Palier {o.tier.toLocaleString('fr-FR')} € · {TIERS.find(t=>t.v===o.tier).duration}</p></div>
            <button onClick={()=>acceptOffer(o)} style={{...button(colors.intermediaire),border:'none',cursor:'pointer'}}>« Je veux rejoindre votre caste »</button>
          </div>)}
        </div>
        <div style={{display:'flex',gap:10,flexWrap:'wrap',marginTop:16,alignItems:'flex-end'}}>
          <input placeholder='Nom du média (ex: Bloomberg TV)' value={st.newMedia} onChange={e=>setSt({...st,newMedia:e.target.value})} style={{flex:1,minWidth:180,padding:'12px 14px',borderRadius:12,background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.16)',color:'#fff'}}/>
          <select value={st.newTier} onChange={e=>setSt({...st,newTier:Number(e.target.value)})} style={{padding:'12px 14px',borderRadius:12,background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.16)',color:'#fff'}}>
            {TIERS.map(t=><option key={t.v} value={t.v} style={{color:'#000'}}>{t.label} — {t.v.toLocaleString('fr-FR')} €</option>)}
          </select>
          <button onClick={addOffer} style={{...button(colors.media),border:'none',cursor:'pointer'}}>+ Rejoignez ma caste</button>
        </div>
      </>}
      <div style={{display:'flex',gap:10,marginTop:18}}>
        <button onClick={()=>setStage(0)} style={{...button('rgba(255,255,255,.25)'),background:'rgba(255,255,255,.04)',boxShadow:'none',border:'1px solid rgba(255,255,255,.25)',cursor:'pointer'}}>← Changer de Guest</button>
        <button onClick={()=>setStage(2)} style={{...button(colors.core),border:'none',cursor:'pointer'}}>Voir l'investissement Kaastbase →</button>
      </div>
    </section>}

    {stage===2 && <section style={card(colors.core)}>
      <h2>Investissement Kaastbase — {guest.name}</h2>
      <p style={{color:'#C9D4E4',fontSize:14}}>La Kaastbase peut investir jusqu'à 30% de la valeur d'un Guest pour sécuriser un contrat et se rémunérer sur les prestations futures (le Guest garde toujours ≥ 51%, avec jusqu'à 19% cessibles en plus).</p>
      <Slider label='Part investie' value={st.investPct} max={30} c={colors.core} onChange={v=>setSt({...st,investPct:v})}/>
      <Progress label='Valeur du Guest (score × 100)' value={(guest.score*100).toLocaleString('fr-FR')+' €'} c={colors.intermediaire}/>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginTop:10,maxWidth:480}}>
        <Mini label='Investissement' value={euro(investAmount)}/>
        <Mini label='Retour estimé (3 ans)' value={euro(roi)}/>
      </div>
      <p style={{color:'#556',fontSize:12,marginTop:10}}>Simulation illustrative basée sur les prestations moyennes générées par le score TSAAK.</p>
      <div style={{display:'flex',gap:10,marginTop:18}}>
        <button onClick={()=>setStage(1)} style={{...button('rgba(255,255,255,.25)'),background:'rgba(255,255,255,.04)',boxShadow:'none',border:'1px solid rgba(255,255,255,.25)',cursor:'pointer'}}>← Retour aux offres</button>
        {contract && <button onClick={()=>setStage(3)} style={{...button(colors.core),border:'none',cursor:'pointer'}}>Voir le contrat →</button>}
      </div>
    </section>}

    {stage===3 && <section style={card(contract?colors.core:'rgba(255,255,255,.14)')}>
      <h2>Contrat — {guest.name}</h2>
      {contract ? <>
        <Badge c={colors.core}>✓ CONTRAT SIGNÉ</Badge>
        <p style={{color:'#C9D4E4',margin:'10px 0'}}>{guest.name} rejoint <b>{contract.media}</b> — palier {contract.tier.toLocaleString('fr-FR')} € · durée {contract.duration}.</p>
        <a style={button(colors.core)} href='/contract'>Aller à la signature & au paiement →</a>
      </> : <>
        <p style={{color:'#94a3b8'}}>Aucun contrat signé encore pour {guest.name}.</p>
        <button onClick={()=>setStage(1)} style={{...button(colors.intermediaire),border:'none',cursor:'pointer'}}>← Retour aux offres</button>
      </>}
    </section>}

    <section style={{...card('rgba(255,255,255,.12)'),marginTop:24}}>
      <h2>Comment lire le Mercato</h2>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:14}}>
        <p style={{color:'#C9D4E4'}}>① Chaque été, période de 2 mois : seuls les Guests libres ou en fin de contrat participent.</p>
        <p style={{color:'#C9D4E4'}}>② Médias et Guests se positionnent mutuellement — "Je veux rejoindre votre caste / rejoignez ma caste".</p>
        <p style={{color:'#C9D4E4'}}>③ 3 paliers homogènes (2K/4K/6K), indexés au score TSAAK, contrat de 1 ou 3 ans.</p>
        <p style={{color:'#C9D4E4'}}>④ La Kaastbase peut lobbyer ou investir sur un Guest pour sécuriser et valoriser le contrat.</p>
      </div>
    </section>
  </main>;
}

function Mini({label,value}){return <div style={{padding:14,borderRadius:12,background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.12)'}}><div style={{fontSize:11,color:'#94a3b8'}}>{label}</div><div style={{fontSize:19,fontWeight:900}}>{value}</div></div>;}
