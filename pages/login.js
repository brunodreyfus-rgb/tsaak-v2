import { page, card, button, colors, Masthead, PERSONAS } from '../components/RichDemoUI';

export default function Login(){
  return <main style={page('media')}>
    <Masthead/>
    <div style={{display:'grid',placeItems:'center',marginTop:20}}>
      <div style={{...card(colors.media),maxWidth:440,width:'100%',textAlign:'center'}}>
        <img src="/tsaak-logo.jpg" style={{width:130,margin:'0 auto 10px'}}/>
        <h1 style={{fontSize:28}}>Connexion TSAAK</h1>
        <p style={{color:'#94a3b8',fontSize:14,marginTop:-6}}>Démo investisseur — aucune donnée réelle n’est utilisée.</p>
        <div style={{display:'grid',gap:12,marginTop:18,textAlign:'left'}}>
          <input placeholder='Email' style={inp}/>
          <input placeholder='Mot de passe' type='password' style={inp}/>
        </div>
        <a style={{...button(colors.media),display:'block',marginTop:16,border:'none'}} href="/select-caste">Se connecter</a>
        <a style={{...button('#0A66C2'),display:'flex',alignItems:'center',justifyContent:'center',gap:10,marginTop:10}} href="/talent-onboarding/self">
          <span style={{width:20,height:20,borderRadius:5,background:'#fff',color:'#0A66C2',display:'grid',placeItems:'center',fontWeight:900,fontSize:11}}>in</span>
          Continuer avec LinkedIn
        </a>
        <p style={{marginTop:16,fontSize:13}}><a href='/signup' style={{color:colors.media}}>Créer un compte</a></p>
      </div>
    </div>

    <div style={{maxWidth:720,margin:'34px auto 0',textAlign:'center'}}>
      <p style={{color:'#556',fontSize:13,letterSpacing:1,textTransform:'uppercase'}}>Accès rapide pour la démo</p>
      <div style={{display:'flex',gap:12,flexWrap:'wrap',justifyContent:'center'}}>
        {PERSONAS.map(p=><a key={p.key} href={p.href} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 14px 8px 8px',borderRadius:999,border:`1px solid ${p.c}55`,background:'rgba(255,255,255,.04)',textDecoration:'none',color:'#fff'}}>
          <img src={p.photo} style={{width:30,height:30,borderRadius:'50%',objectFit:'cover'}}/>
          <span style={{fontSize:13,fontWeight:700}}>{p.name}</span>
        </a>)}
      </div>
    </div>
  </main>;
}
const inp = {width:'100%',padding:14,borderRadius:14,background:'rgba(255,255,255,.06)',color:'#fff',border:'1px solid rgba(255,255,255,.14)',boxSizing:'border-box'};
