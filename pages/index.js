import { PERSONAS } from '../components/RichDemoUI';
import { talents, realTalents } from '../data/talents';

const NAV = [ ['/search','Talents'], ['#comment-ca-marche','Comment ça marche'], ['/select-caste','Castes'] ];

const CASTE_META = {
  media: { label:'Media', sub:'Rédactions & producteurs' },
  talent: { label:'Talent', sub:'Experts & speakers' },
  intermediaire: { label:'Intermédiaire', sub:'Bookers & agents' },
  organisation: { label:'Organisation', sub:'Marques & événements' },
  communaute: { label:'Communauté', sub:'FanTSAak & signaux' },
};

const FEATURES = [
  { title:'Connexion LinkedIn', text:'Import instantané du profil + scan IA des preuves média — un profil Talent prêt en 30 secondes.', href:'/talent-onboarding/self', color:'#7CFFB2', icon:'in' },
  { title:'Contrat & paiement', text:'Template → signature électronique → paiement sécurisé, sans échange de PDF ni relance.', href:'/contract', color:'#FF9B3D', icon:'€' },
  { title:'Score TSAAK transparent', text:'4 leviers pondérés, recalculés en direct — chaque acteur voit exactement pourquoi.', href:'/score-explained', color:'#F6FF00', icon:'◎' },
  { title:'Mercato saisonnier', text:'2 mois par an : médias et guests se repositionnent, 3 paliers de contrat indexés au score.', href:'/mercato', color:'#FF2FD6', icon:'⇄' },
];

const previewTalents = [...(realTalents ? realTalents.slice(0,3) : []), talents[4]];

export default function Home(){
  return <main style={s.page}>
    <div style={s.bgOrbA}/><div style={s.bgOrbB}/><div style={s.scan}/>

    <a href="/demo" style={s.demoTab}>Mode démo ↗</a>

    <nav style={s.nav}>
      <a href="/" style={s.brand}><img src="/tsaak-logo.jpg" alt="TSAAK" style={s.brandLogo}/><b>TSAAK</b></a>
      <div style={s.navLinks}>{NAV.map(([href,label])=><a key={label} href={href} style={s.navLink}>{label}</a>)}</div>
      <div style={s.navRight}>
        <a href="/demo" style={s.navGhost}>Mode démo</a>
        <a href="/select-caste" style={s.navPrimary}>Se connecter</a>
      </div>
    </nav>

    <section style={s.hero}>
      <div style={s.heroGrid}>
        <div style={s.heroText}>
          <span style={s.kicker}>TSAAK · EASY BOOKING ECOSYSTEM</span>
          <h1 style={s.title}>Bookez le meilleur talent pour vos besoins.<br/>En quelques clics, pas en semaines.</h1>
          <p style={s.sub}>TSAAK connecte rédactions, talents, intermédiaires, organisations et communautés dans un seul écosystème : recherche, scoring, contrats et paiement — sans friction, sans PDF perdu.</p>
          <div style={s.ctas}>
            <a style={s.primary} href="/search">Découvrir les talents →</a>
            <a style={s.secondary} href="/select-caste">Rejoindre TSAAK</a>
          </div>
        </div>
        <a href="/select-caste" style={s.conceptFrame} title="Cinq castes, un Talent au centre — la galaxie TSAAK">
          <img src="/images/galaxy-concept.jpg" alt="Cinq castes, un Talent au centre — la galaxie TSAAK" style={s.conceptImg}/>
        </a>
      </div>
      <div style={s.metrics}>
        <Metric n="50" t="talents vérifiés"/>
        <Metric n="5" t="castes connectées"/>
        <Metric n="<2h" t="délai moyen Help Me"/>
        <Metric n="100%" t="score transparent"/>
      </div>
    </section>

    <section style={s.section}>
      <SectionHead title="Une caste pour chaque rôle de l'écosystème" sub="Connectez-vous et explorez directement le cockpit qui correspond à votre rôle."/>
      <div style={s.casteGrid}>
        {PERSONAS.map(p=>{
          const meta = CASTE_META[p.key];
          return <a key={p.key} href={p.href} style={{...s.casteCard,borderColor:p.c}}>
            <div style={{...s.casteCardPhoto,backgroundImage:`linear-gradient(180deg,rgba(3,4,10,.05),rgba(3,4,10,.92)),url(${p.photo})`}}/>
            <div style={s.casteCardBody}>
              <span style={{...s.casteBar,background:p.c}}/>
              <b style={{fontSize:20}}>{p.name}</b>
              <span style={{color:p.c,fontWeight:800,fontSize:12,letterSpacing:1,textTransform:'uppercase'}}>{meta.label}</span>
              <span style={{color:'#8CA0B8',fontSize:12}}>{meta.sub}</span>
            </div>
          </a>;
        })}
      </div>
    </section>

    <section style={s.section}>
      <SectionHead title="Des talents vérifiés, prêts à intervenir" sub="Score TSAAK, preuves média retrouvées par l'IA, disponibilité en temps réel."/>
      <a href="/search" style={s.searchPreview}>
        <span style={s.searchIcon}>⌕</span>
        <span style={{color:'#8CA0B8'}}>Ex : “expert IA société”, “ancien militaire”, “climat énergie keynote”…</span>
        <span style={s.searchGo}>Rechercher →</span>
      </a>
      <div style={s.talentGrid}>
        {previewTalents.filter(Boolean).map(t=><a key={t.id} href={`/talent/${t.id}`} style={s.talentCard}>
          <img src={t.photo} style={s.talentPhoto}/>
          <b style={{margin:'12px 0 2px',display:'block'}}>{t.name}</b>
          <span style={{color:'#8CA0B8',fontSize:12}}>{t.role} · {t.country}</span>
          <div style={{marginTop:8,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <span style={{color:'#7CFFB2',fontWeight:800,fontSize:13}}>Score {t.score}</span>
            <span style={{color:'#8CA0B8',fontSize:12}}>{t.price}</span>
          </div>
        </a>)}
      </div>
      <a href="/search" style={s.seeAll}>Voir tous les talents →</a>
    </section>

    <section id="comment-ca-marche" style={s.section}>
      <SectionHead title="Ce qui fait tourner TSAAK" sub="Quatre mécaniques centrales, déjà en place et fonctionnelles."/>
      <div style={s.featureGrid}>{FEATURES.map(f=><a href={f.href} key={f.title} style={{...s.featureCard,borderColor:f.color,boxShadow:`0 0 26px ${f.color}22`}}>
        <span style={{...s.featureIcon,color:f.color,borderColor:f.color}}>{f.icon}</span>
        <strong style={{fontSize:18}}>{f.title}</strong>
        <p style={{color:'#AAB3C5',margin:'8px 0 0',fontSize:14}}>{f.text}</p>
        <span style={{color:f.color,fontWeight:800,fontSize:13,marginTop:12}}>Découvrir →</span>
      </a>)}</div>
      <p style={s.demoNote}>Envie de voir tous les cas d'usage enchaînés, comme pour une démo investisseur ? <a href="/demo" style={{color:'#00D5FF'}}>Ouvrir le mode démo →</a></p>
    </section>

    <footer style={s.footer}>
      <div style={s.footerTop}>
        <a href="/" style={s.brand}><img src="/tsaak-logo.jpg" alt="TSAAK" style={s.brandLogo}/><b>TSAAK</b></a>
        <p style={{color:'#8CA0B8',maxWidth:340,fontSize:14}}>Easy booking ecosystem — la marketplace qui connecte les castes, les signaux et les opportunités média.</p>
      </div>
      <div style={s.footerCols}>
        <FooterCol title="Produit" links={[['Talents','/search'],['Castes','/select-caste'],['Comment ça marche','#comment-ca-marche']]}/>
        <FooterCol title="Cas d'usage" links={[['Score TSAAK','/score-explained'],['Contrat & paiement','/contract'],['Mercato','/mercato'],['Patchwork','/patchwork']]}/>
        <FooterCol title="Démo investisseur" links={[['Mode démo','/demo'],['Se connecter','/select-caste']]}/>
      </div>
      <p style={s.copyright}>© 2026 TSAAK — démo investisseur, aucune donnée réelle.</p>
    </footer>

    <style jsx global>{`html,body{margin:0;background:#03040a;overflow-x:hidden;max-width:100%} a{box-sizing:border-box}`}</style>
  </main>
}

function Metric({n,t}){return <div style={s.metric}><b>{n}</b><span>{t}</span></div>}
function SectionHead({title,sub}){return <div style={s.sectionHead}><h2 style={s.sectionTitle}>{title}</h2><p style={s.sectionSub}>{sub}</p></div>}
function FooterCol({title,links}){return <div><b style={{fontSize:13,letterSpacing:1,color:'#8CA0B8',textTransform:'uppercase'}}>{title}</b><div style={{display:'grid',gap:9,marginTop:12}}>{links.map(([label,href])=><a key={label} href={href} style={{color:'#DDE7F4',textDecoration:'none',fontSize:14}}>{label}</a>)}</div></div>}

const s={
 page:{minHeight:'100vh',background:'#03040a',color:'white',fontFamily:'Arial, sans-serif',position:'relative'},
 bgOrbA:{position:'absolute',width:520,height:520,borderRadius:'50%',background:'radial-gradient(circle,#00D5FF33,transparent 65%)',left:-160,top:-170,filter:'blur(12px)',pointerEvents:'none'},
 bgOrbB:{position:'absolute',width:620,height:620,borderRadius:'50%',background:'radial-gradient(circle,#FF2FD633,transparent 65%)',right:-210,top:420,filter:'blur(18px)',pointerEvents:'none'},
 scan:{position:'absolute',inset:0,background:'linear-gradient(transparent 96%,rgba(255,255,255,.035) 97%)',backgroundSize:'100% 18px',opacity:.35,pointerEvents:'none'},

 demoTab:{position:'fixed',right:0,top:'50%',transform:'translateY(-50%)',zIndex:50,writingMode:'vertical-rl',textOrientation:'mixed',padding:'18px 10px',borderRadius:'14px 0 0 14px',background:'linear-gradient(180deg,#00D5FF,#7CFFB2)',color:'#031018',textDecoration:'none',fontWeight:800,fontSize:13,letterSpacing:1,boxShadow:'-4px 0 30px rgba(0,213,255,.35)'},

 nav:{position:'sticky',top:0,zIndex:20,display:'flex',alignItems:'center',gap:24,padding:'18px clamp(18px,4vw,70px)',borderBottom:'1px solid #ffffff12',background:'rgba(3,4,10,.72)',backdropFilter:'blur(14px)'},
 brand:{display:'flex',alignItems:'center',gap:10,textDecoration:'none',color:'#fff',fontSize:15,letterSpacing:2},
 brandLogo:{width:32,filter:'drop-shadow(0 0 10px #00D5FF88)'},
 navLinks:{display:'flex',gap:22,flex:1,marginLeft:12},
 navLink:{color:'#C6D2E3',textDecoration:'none',fontSize:14},
 navRight:{display:'flex',gap:10,alignItems:'center'},
 navGhost:{padding:'10px 16px',borderRadius:999,color:'#C6D2E3',border:'1px solid #ffffff22',textDecoration:'none',fontSize:13},
 navPrimary:{padding:'10px 18px',borderRadius:999,color:'#031018',background:'linear-gradient(90deg,#00D5FF,#7CFFB2)',textDecoration:'none',fontWeight:800,fontSize:13},

 hero:{position:'relative',zIndex:1,maxWidth:1180,padding:'clamp(50px,8vw,110px) clamp(18px,4vw,70px) 30px'},
 heroGrid:{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(380px,1fr))',gap:'32px 44px',alignItems:'stretch'},
 heroText:{minWidth:0,display:'flex',flexDirection:'column',justifyContent:'center'},
 kicker:{color:'#8CEEFF',letterSpacing:3,textTransform:'uppercase',fontSize:13,fontWeight:800},
 title:{fontSize:'clamp(32px,4.6vw,56px)',lineHeight:1.05,margin:'16px 0',letterSpacing:-1,fontWeight:800},
 sub:{color:'#B7C7D8',fontSize:17,lineHeight:1.6,maxWidth:560},
 ctas:{display:'flex',gap:14,flexWrap:'wrap',marginTop:28},
 primary:{padding:'16px 24px',borderRadius:16,color:'#031018',background:'linear-gradient(90deg,#00D5FF,#7CFFB2)',textDecoration:'none',fontWeight:800},
 secondary:{padding:'16px 24px',borderRadius:16,color:'white',border:'1px solid #ffffff33',background:'#ffffff0c',textDecoration:'none',fontWeight:700},
 metrics:{display:'flex',gap:12,marginTop:40,flexWrap:'wrap'},
 metric:{padding:'14px 18px',border:'1px solid #ffffff18',borderRadius:18,background:'#ffffff09',display:'grid'},

 conceptFrame:{display:'block',width:'100%',height:'100%',minHeight:260,borderRadius:20,overflow:'hidden',border:'1px solid #ffffff1c',boxShadow:'0 20px 50px rgba(0,0,0,.4), 0 0 40px rgba(0,213,255,.10)',textDecoration:'none'},
 conceptImg:{display:'block',width:'100%',height:'100%',objectFit:'cover',objectPosition:'center'},

 section:{position:'relative',zIndex:1,padding:'50px clamp(18px,4vw,70px)',borderTop:'1px solid #ffffff0c'},
 sectionHead:{marginBottom:28,maxWidth:720},
 sectionTitle:{fontSize:'clamp(26px,3.2vw,38px)',margin:'0 0 8px',letterSpacing:-0.5},
 sectionSub:{color:'#8CA0B8',fontSize:16,margin:0},

 casteGrid:{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))',gap:16},
 casteCard:{border:'1px solid',borderRadius:22,overflow:'hidden',textDecoration:'none',color:'white',position:'relative',height:280,display:'flex',flexDirection:'column',justifyContent:'flex-end'},
 casteCardPhoto:{position:'absolute',inset:0,backgroundSize:'cover',backgroundPosition:'center'},
 casteCardBody:{position:'relative',padding:16,display:'grid',gap:3},
 casteBar:{width:34,height:4,borderRadius:99,marginBottom:8},

 searchPreview:{display:'flex',alignItems:'center',gap:12,padding:'16px 20px',borderRadius:16,background:'rgba(255,255,255,.05)',border:'1px solid #ffffff1c',textDecoration:'none',marginBottom:20},
 searchIcon:{fontSize:18,color:'#00D5FF'},
 searchGo:{marginLeft:'auto',color:'#00D5FF',fontWeight:800,fontSize:13,whiteSpace:'nowrap'},
 talentGrid:{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:16},
 talentCard:{padding:16,borderRadius:20,background:'linear-gradient(160deg,rgba(255,255,255,.07),rgba(255,255,255,.02))',border:'1px solid #ffffff14',textDecoration:'none',color:'white'},
 talentPhoto:{width:'100%',height:130,objectFit:'cover',borderRadius:14},
 seeAll:{display:'inline-block',marginTop:20,color:'#00D5FF',fontWeight:800,textDecoration:'none'},

 featureGrid:{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(230px,1fr))',gap:16},
 featureCard:{padding:24,border:'1px solid',borderRadius:24,background:'linear-gradient(160deg,rgba(255,255,255,.07),rgba(255,255,255,.02))',color:'white',textDecoration:'none',display:'flex',flexDirection:'column'},
 featureIcon:{width:36,height:36,borderRadius:11,border:'1px solid',display:'grid',placeItems:'center',fontWeight:900,marginBottom:14},
 demoNote:{color:'#8CA0B8',fontSize:14,marginTop:26},

 footer:{position:'relative',zIndex:1,padding:'50px clamp(18px,4vw,70px) 34px',borderTop:'1px solid #ffffff12',display:'grid',gap:36},
 footerTop:{display:'grid',gap:12},
 footerCols:{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:24},
 copyright:{color:'#556',fontSize:12,margin:0},
};
