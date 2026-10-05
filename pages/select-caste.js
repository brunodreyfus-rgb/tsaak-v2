import { page, card, colors, Badge, Masthead, PERSONAS } from '../components/RichDemoUI';

export default function Select(){
  return <main style={page('media')}>
    <Masthead active='castes'/>
    <Badge c={colors.core}>DÉMO INVESTISSEUR</Badge>
    <h1 style={{fontSize:44,maxWidth:820}}>Je me connecte comme…</h1>
    <p style={{color:'#C9D4E4',fontSize:17,maxWidth:780}}>Choisissez un profil de démonstration. Chacun ouvre un cockpit différent, avec ses propres business cases.</p>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(230px,1fr))',gap:18,marginTop:24}}>
      {PERSONAS.map(p=><a key={p.key} href={p.href} style={{...card(p.c),textDecoration:'none',color:'#fff',display:'flex',flexDirection:'column',alignItems:'center',textAlign:'center'}}>
        <img src={p.photo} alt={p.name} style={{width:84,height:84,borderRadius:'50%',objectFit:'cover',border:`2px solid ${p.c}`,marginBottom:14}}/>
        <h2 style={{margin:'0 0 6px'}}>{p.name}</h2>
        <p style={{color:'#94a3b8',fontSize:13,margin:0}}>{p.role}</p>
        <span style={{marginTop:14,color:p.c,fontWeight:800,fontSize:13}}>Se connecter →</span>
      </a>)}
    </div>
  </main>;
}
