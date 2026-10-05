import { page, card, button, colors } from '../components/RichDemoUI';

export default function Signup(){
  return <main style={{...page('talent'),display:'grid',placeItems:'center'}}>
    <div style={{...card(colors.talent),maxWidth:480,width:'100%',textAlign:'center'}}>
      <img src="/tsaak-logo.jpg" style={{width:130,margin:'0 auto 10px'}}/>
      <h1 style={{fontSize:28}}>Créer un compte TSAAK</h1>
      <p style={{color:'#94a3b8'}}>Email classique ou connexion LinkedIn simulée — au choix.</p>
      <a style={{...button(colors.talent),display:'block',border:'none'}} href="/select-caste">Démarrer avec un email</a>
      <a style={{...button('#0A66C2'),display:'flex',alignItems:'center',justifyContent:'center',gap:10,marginTop:10}} href="/talent-onboarding/self">
        <span style={{width:20,height:20,borderRadius:5,background:'#fff',color:'#0A66C2',display:'grid',placeItems:'center',fontWeight:900,fontSize:11}}>in</span>
        Je suis Talent → connexion LinkedIn
      </a>
    </div>
  </main>;
}
