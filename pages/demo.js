import { page, card, button, colors, TsaakMark, Badge, Masthead, PERSONAS, Avatar } from '../components/RichDemoUI';

const flagship = [
  ['★ Connexion LinkedIn','Le Talent connecte LinkedIn, TSAAK importe le profil puis scanne le web pour retrouver ses preuves média.','/talent-onboarding/self',colors.talent],
  ['★ Contrat & paiement','Template → variables → prévisualisation → signature électronique → paiement sécurisé.','/contract',colors.organisation],
  ['★ Calcul du score','4 leviers pondérés (désirabilité, FanTSAak, passages média, performance) recalculés en direct, en 4 étapes.','/score-explained',colors.core],
  ['★ Mercato','2 mois par an : médias et guests se positionnent, 3 paliers de contrat, investissement Kaastbase, en 4 étapes.','/mercato',colors.intermediaire],
];

const cases=[
  ['Recherche','Filtres live sujet / mots-clés / disponibilité sur 50 talents, ajout direct à la shortlist.','/search',colors.media],
  ['Shortlist & multi-messaging','Composez un message et envoyez-le à toute la shortlist en un clic, avec réponses simulées.','/shortlist',colors.media],
  ['Patchwork','TSAAK pousse des guests TSAAK / hors TSAAK avant que le média cherche — suivre ou rejeter.','/patchwork',colors.intermediaire],
  ['Wanted → Propositions','Publiez un besoin, un intermédiaire répond, sélectionnez et créez le contrat.','/wanted',colors.media],
  ['Recherche IA (chat)',"Le média discute avec l'IA, qui clarifie le besoin et propose une shortlist expliquée.",'/ai-search',colors.media],
  ['Help Me urgent','Formulaire de brief → activation en direct du réseau → réponses en 2 minutes.','/help-me',colors.organisation],
  ['3 entrées Talent','Self signup, invitation intermédiaire, invitation TSAAK via IA Search.','/talent-onboarding',colors.talent],
  ['Profil Talent riche','LinkedIn, vidéos, podcast, articles, séminaires et background TSAAK.','/talent/sarah-benali',colors.talent],
];

export default function Demo(){return <main style={page('media')}>
  <Masthead active='démo'/>
  <TsaakMark size={160}/>
  <Badge c={colors.core}>MODE DÉMO</Badge>
  <h1 style={{fontSize:58,maxWidth:920}}>Comment tester la démo TSAAK</h1>
  <p style={{fontSize:20,color:'#C9D4E4',maxWidth:920}}>Connectez-vous d'abord comme un des 5 personas ci-dessous — c'est la vraie porte d'entrée du site. Puis testez les 4 business cases prioritaires, et les 8 cas secondaires désormais interactifs.</p>

  <h2 style={{marginTop:10}}>Se connecter comme…</h2>
  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:14,marginTop:10}}>
    {PERSONAS.map(p=><a key={p.key} href={p.href} style={{...card(p.c),textDecoration:'none',color:'#fff',display:'flex',alignItems:'center',gap:12}}>
      <Avatar src={p.photo} name={p.name} role={p.role} big/>
    </a>)}
  </div>

  <h2 style={{marginTop:36}}>Les 4 business cases à montrer en priorité</h2>
  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:20,marginTop:10}}>{flagship.map((x,i)=><section key={x[0]} style={card(x[3])}><Badge c={x[3]}>PRIORITAIRE</Badge><h2>{x[0]}</h2><p style={{color:'#C9D4E4'}}>{x[1]}</p><a href={x[2]} style={button(x[3])}>Tester →</a></section>)}</div>

  <h2 style={{marginTop:36}}>Cas secondaires — tous interactifs</h2>
  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:20,marginTop:10}}>{cases.map((x,i)=><section key={x[0]} style={card(x[3])}><Badge c={x[3]}>CASE {i+1}</Badge><h2>{x[0]}</h2><p style={{color:'#C9D4E4'}}>{x[1]}</p><a href={x[2]} style={button(x[3])}>Tester →</a></section>)}</div>
</main>}
