import { useState } from 'react';
import { page, card, button, colors, Badge, Masthead, Stepper, SignaturePad, useLocal, euro, field, Toggle } from '../components/RichDemoUI';

const TEMPLATES = ['Prestation Média (TV / Radio / Podcast)', 'Prestation Événement / Conférence', 'Contrat long-terme (Mercato)'];
const DELIVERABLES = ['Interview live', 'Captation vidéo', 'Slides fournis', 'Droits image & replay 30j'];

const DEFAULT_CONTRACT = {
  stage: 0, // 0 draft, 1 sent/signature, 2 signed->payment, 3 paid/done
  template: TEMPLATES[0],
  media: 'LCI',
  talent: 'Sarah Benali',
  intermediary: 'Nora Haddad',
  date: '2026-09-24', time: '18:00', duration: '12 min', location: 'Remote — studio distant',
  price: 1800, nda: false,
  deliverables: [DELIVERABLES[0], DELIVERABLES[3]],
  signature: null, paidAt: null,
};

export default function Contract(){
  const [ct, setCt] = useLocal('tsaak:contract:demo', DEFAULT_CONTRACT);
  const commissionRate = 0.10;
  const intermediaryRate = 0.10;
  const commission = Math.round(ct.price * commissionRate * 100) / 100;
  const total = ct.price + commission;
  const intermediaryFee = Math.round(ct.price * intermediaryRate * 100) / 100;

  const set = (k,v)=>setCt({...ct,[k]:v});
  const toggleDeliverable = (d)=>set('deliverables', ct.deliverables.includes(d) ? ct.deliverables.filter(x=>x!==d) : [...ct.deliverables, d]);

  const stageLabel = ['Draft','Sent','Signed','Paid'][ct.stage] || 'Draft';

  return <main style={page('organisation')}>
    <Masthead active='contrat'/>
    <Badge c={colors.organisation}>BUSINESS CASE · CONTRAT & PAIEMENT</Badge>
    <h1 style={{fontSize:50,maxWidth:920}}>Du brief signé au paiement, en un seul tunnel</h1>
    <p style={{color:'#C9D4E4',fontSize:19,maxWidth:900}}>Template → variables → prévisualisation → signature électronique → paiement post-signature → prestation ajoutée automatiquement aux dashboards.</p>

    <Stepper c={colors.organisation} active={ct.stage} steps={['Contrat','Signature','Paiement','Terminé']}/>

    {ct.stage===0 && <div style={{display:'grid',gridTemplateColumns:'1.1fr .9fr',gap:22}}>
      <section style={card(colors.organisation)}>
        <h2>Contract builder</h2>
        <label style={{fontSize:13,color:'#94a3b8'}}>Template</label>
        <select value={ct.template} onChange={e=>set('template',e.target.value)} style={{...field(),marginTop:6,marginBottom:14}}>
          {TEMPLATES.map(t=><option key={t} value={t} style={{color:'#000'}}>{t}</option>)}
        </select>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
          <div><label style={lbl}>Média / Organisation</label><input value={ct.media} onChange={e=>set('media',e.target.value)} style={field()}/></div>
          <div><label style={lbl}>Talent</label><input value={ct.talent} onChange={e=>set('talent',e.target.value)} style={field()}/></div>
          <div><label style={lbl}>Date</label><input type='date' value={ct.date} onChange={e=>set('date',e.target.value)} style={field()}/></div>
          <div><label style={lbl}>Heure</label><input value={ct.time} onChange={e=>set('time',e.target.value)} style={field()}/></div>
          <div><label style={lbl}>Durée</label><input value={ct.duration} onChange={e=>set('duration',e.target.value)} style={field()}/></div>
          <div><label style={lbl}>Lieu</label><input value={ct.location} onChange={e=>set('location',e.target.value)} style={field()}/></div>
        </div>
        <label style={{...lbl,display:'block',margin:'14px 0 8px'}}>Livrables & droits</label>
        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>{DELIVERABLES.map(d=><span key={d} onClick={()=>toggleDeliverable(d)} style={{cursor:'pointer',padding:'8px 12px',borderRadius:999,fontSize:12,border:`1px solid ${ct.deliverables.includes(d)?colors.organisation:'rgba(255,255,255,.18)'}`,background:ct.deliverables.includes(d)?colors.organisation+'22':'transparent',color:ct.deliverables.includes(d)?'#fff':'#94a3b8'}}>{ct.deliverables.includes(d)?'✓ ':''}{d}</span>)}</div>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',margin:'16px 0'}}>
          <div><label style={lbl}>Prix prestation</label><input type='number' value={ct.price} onChange={e=>set('price',Number(e.target.value)||0)} style={{...field(),width:160}}/></div>
          <div><label style={{...lbl,display:'block'}}>Clause NDA</label><Toggle on={ct.nda} onChange={v=>set('nda',v)} c={colors.organisation} labelOn='NDA activée' labelOff='Sans NDA'/></div>
        </div>
        <button onClick={()=>setCt({...ct,stage:1})} style={{...button(colors.organisation),border:'none',cursor:'pointer'}}>Envoyer à signature →</button>
      </section>

      <section style={card('rgba(255,255,255,.14)')}>
        <h2>Prévisualisation du contrat</h2>
        <p style={{color:'#94a3b8',fontSize:13}}>ID : PIVEO-C-{new Date().getFullYear()}-{String(ct.price).padStart(4,'0')}</p>
        <div style={{fontSize:14,color:'#C9D4E4',lineHeight:1.7,padding:16,borderRadius:14,background:'rgba(255,255,255,.04)'}}>
          <p><b>{ct.template}</b></p>
          <p>Entre <b>{ct.media}</b> (demandeur) et <b>{ct.talent}</b> (Talent), avec intermédiaire <b>{ct.intermediary}</b>.</p>
          <p>Intervention le <b>{ct.date}</b> à <b>{ct.time}</b>, durée <b>{ct.duration}</b>, lieu : {ct.location}.</p>
          <p>Livrables : {ct.deliverables.join(', ') || 'aucun sélectionné'}.</p>
          <p>Clause de confidentialité : {ct.nda ? 'NDA applicable' : 'non applicable'}. Annulation : jusqu’à J-1 sans frais.</p>
          <p>Montant prestation : <b>{euro(ct.price)}</b> + commission de service TSAAK ({Math.round(commissionRate*100)}%) : <b>{euro(commission)}</b>.</p>
          <p style={{color:colors.core,fontWeight:800}}>Total dû à la signature : {euro(total)}</p>
        </div>
      </section>
    </div>}

    {ct.stage===1 && <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:22}}>
      <section style={card(colors.organisation)}>
        <h2>Résumé du contrat</h2>
        <p style={{color:'#C9D4E4'}}>ID: PIVEO-C-{new Date().getFullYear()}-{String(ct.price).padStart(4,'0')} · Parties: {ct.media}, Talent {ct.talent}</p>
        <p style={{color:'#C9D4E4'}}>Montant: <b>{euro(ct.price)}</b> · {ct.date} à {ct.time} · {ct.duration}</p>
        <p style={{color:'#94a3b8',fontSize:13}}>En signant, {ct.talent} accepte les termes ci-dessus, y compris le calendrier de paiement post-signature.</p>
      </section>
      <section style={card(colors.talent)}>
        <h2>Signature électronique — {ct.talent}</h2>
        <SignaturePad c={colors.talent} name={ct.talent} signed={ct.signature} onSign={(name)=>setCt({...ct,signature:name,stage:2})}/>
      </section>
    </div>}

    {ct.stage===2 && <PaymentStep ct={ct} setCt={setCt} total={total} commission={commission} intermediaryFee={intermediaryFee}/>}

    {ct.stage===3 && <DoneStep ct={ct} total={total} commission={commission} intermediaryFee={intermediaryFee} reset={()=>setCt(DEFAULT_CONTRACT)}/>}

    <p style={{color:'#556',fontSize:12,marginTop:30}}>Statut contrat : <b style={{color:colors.organisation}}>{stageLabel}</b> — pipeline Annexe 1 : Draft → Sent → Signed → Paid → Done.</p>
  </main>;
}

function PaymentStep({ct,setCt,total,commission,intermediaryFee}){
  const [method,setMethod] = useState('card');
  const [processing,setProcessing] = useState(false);
  function pay(){ setProcessing(true); setTimeout(()=>{ setCt({...ct,stage:3,paidAt:new Date().toISOString()}); setProcessing(false); }, 1200); }
  return <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:22}}>
    <section style={card(colors.organisation)}>
      <h2>Récapitulatif de la commande</h2>
      <Row a='Prestation' b={ct.talent}/>
      <Row a='Montant prestation' b={euro(ct.price)}/>
      <Row a='Commission de service TSAAK (10%)' b={euro(commission)}/>
      <div style={{height:1,background:'rgba(255,255,255,.14)',margin:'10px 0'}}/>
      <Row a={<b>Total</b>} b={<b style={{color:colors.core}}>{euro(total)}</b>}/>
    </section>
    <section style={card(colors.talent)}>
      <h2>Paiement sécurisé</h2>
      <div style={{display:'flex',gap:10,marginBottom:14}}>
        <MethodBtn active={method==='card'} onClick={()=>setMethod('card')} label='💳 Carte de crédit'/>
        <MethodBtn active={method==='paypal'} onClick={()=>setMethod('paypal')} label='🅿️ PayPal'/>
      </div>
      {method==='card' ? <div style={{display:'grid',gap:10}}>
        <input defaultValue='4242 4242 4242 4242' style={field()} placeholder='Numéro de carte'/>
        <input defaultValue={ct.media} style={field()} placeholder='Nom sur la carte'/>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}><input defaultValue='12/29' style={field()} placeholder='MM/AA'/><input defaultValue='123' style={field()} placeholder='CVV'/></div>
      </div> : <p style={{color:'#C9D4E4'}}>Vous serez redirigé vers PayPal pour confirmer le paiement de {euro(total)}.</p>}
      <button disabled={processing} onClick={pay} style={{...button(colors.talent),border:'none',cursor:'pointer',marginTop:16,opacity:processing?.6:1}}>{processing ? 'Paiement en cours…' : `Payer ${euro(total)} en toute sécurité`}</button>
      <p style={{color:'#556',fontSize:12,marginTop:8}}>🔒 Transactions chiffrées et sécurisées. Paiement libéré au Talent après prestation.</p>
    </section>
  </div>;
}

function DoneStep({ct,total,commission,intermediaryFee,reset}){
  function downloadReceipt(){
    const txt = `TSAAK — Facture\nContrat: PIVEO-C-${new Date().getFullYear()}-${String(ct.price).padStart(4,'0')}\nMédia: ${ct.media}\nTalent: ${ct.talent}\nDate prestation: ${ct.date} ${ct.time}\n\nPrestation: ${ct.price} EUR\nCommission service TSAAK: ${commission} EUR\nTotal payé: ${total} EUR\n\nSigné par: ${ct.signature}\nPayé le: ${new Date(ct.paidAt||Date.now()).toLocaleString('fr-FR')}\n`;
    const blob = new Blob([txt], {type:'text/plain'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href=url; a.download='tsaak-facture.txt'; a.click(); URL.revokeObjectURL(url);
  }
  return <section style={{...card(colors.core)}}>
    <Badge c={colors.core}>✓ CONTRAT PAYÉ · PRESTATION PLANIFIÉE</Badge>
    <h2 style={{fontSize:34,margin:'12px 0'}}>Paiement confirmé — {total.toLocaleString('fr-FR')} € réglés</h2>
    <p style={{color:'#C9D4E4'}}>La prestation a été automatiquement ajoutée aux dashboards de {ct.media} et de {ct.talent}. La commission de l’intermédiaire {ct.intermediary} passe de <b>Pending</b> à <b>Payable</b>.</p>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:14,margin:'18px 0'}}>
      <Mini label='Commission intermédiaire' value={`${intermediaryFee.toLocaleString('fr-FR')} €`}/>
      <Mini label='Commission TSAAK' value={`${commission.toLocaleString('fr-FR')} €`}/>
      <Mini label='Net Talent' value={`${ct.price.toLocaleString('fr-FR')} €`}/>
      <Mini label='Statut ledger' value='Payable → Paid'/>
    </div>
    <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
      <button onClick={downloadReceipt} style={{...button(colors.core),border:'none',cursor:'pointer'}}>Télécharger la facture</button>
      <a style={button(colors.talent)} href='/talent/sarah-benali'>Dashboard Talent</a>
      <a style={button(colors.intermediaire)} href='/intermediaires'>Dashboard Intermédiaire</a>
      <button onClick={reset} style={{...button('rgba(255,255,255,.25)'),background:'rgba(255,255,255,.04)',boxShadow:'none',border:'1px solid rgba(255,255,255,.25)',cursor:'pointer'}}>↺ Refaire la démo</button>
    </div>
  </section>;
}

function Row({a,b}){return <div style={{display:'flex',justifyContent:'space-between',padding:'7px 0',color:'#C9D4E4',fontSize:14}}><span>{a}</span><span>{b}</span></div>;}
function Mini({label,value}){return <div style={{padding:16,borderRadius:14,background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.12)'}}><div style={{fontSize:12,color:'#94a3b8'}}>{label}</div><div style={{fontSize:20,fontWeight:900}}>{value}</div></div>;}
function MethodBtn({active,onClick,label}){return <span onClick={onClick} style={{cursor:'pointer',padding:'10px 14px',borderRadius:12,border:`1px solid ${active?colors.talent:'rgba(255,255,255,.18)'}`,background:active?colors.talent+'1f':'transparent',fontSize:13,fontWeight:700}}>{label}</span>;}
const lbl = {fontSize:12,color:'#94a3b8',display:'block',marginBottom:5};
