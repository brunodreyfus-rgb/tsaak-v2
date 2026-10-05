export const casteThemes = {
  media:{name:'Media', color:'#00E5FF', letter:'M', accent:'cyan', role:'Journalistes, producteurs, rédactions'},
  talent:{name:'Talent', color:'#00FF85', letter:'T', accent:'green', role:'Experts, créateurs, speakers'},
  intermediaire:{name:'Intermédiaire', color:'#FF2BD6', letter:'I', accent:'magenta', role:'Agents, bookers, curateurs'},
  organisation:{name:'Organisation', color:'#FF8A00', letter:'O', accent:'orange', role:'Entreprises, conférences, institutions'},
  communaute:{name:'Communauté', color:'#3B82FF', letter:'C', accent:'blue', role:'Fans, communautés, signaux faibles'}
};

const names=['Sarah Benali','James Carter','Elena Petrova','Omar Al Mansouri','Maya Chen','Victor Moreau','Aisha Rahman','Daniel Brooks','Nadia Kovacs','Luca Romano','Claire Dubois','Samir Haddad','Emily Johnson','Hugo Martin','Leila Hassan','Noah Williams','Anika Mehta','Gabriel Silva','Sofia Alvarez','Kenji Tanaka','Amelia Brown','Youssef Nasser','Mila Novak','Arthur Cohen','Olivia Smith','Karim Bensaid','Eva Müller','George Wilson','Ines Laurent','Ethan Davis','Rania Mansour','Tom Anderson','Lina Haddad','Julien Bernard','Fatima Khan','Oscar Lewis','Nora Haddad','Marc Vidal','Diana Rossi','Adam Clarke','Mina Park','Sergei Ivanov','Rachel Cohen','Bilal Osman','Camille Leroy','Ava Green','Mehdi Amrani','Julia Schneider','Theo Garnier','Isabella Costa'];
const roles=['Geopolitics Analyst','AI Researcher','Energy Transition Expert','Former Military Strategist','Climate Scientist','Cybersecurity Specialist','Emergency Doctor','Economist','Space Industry Expert','Crisis Communication Advisor'];
const countries=['France / UAE','USA','UK','Qatar','Singapore','France','Germany','Canada','Italy','Japan'];
const topics=['AI & society','Middle East','energy security','climate transition','defense','cyber risk','public health','future of work','space economy','social movements'];
export const talents = names.map((name,i)=>({
  id:name.toLowerCase().replaceAll(' ','-'), name, role:roles[i%roles.length], country:countries[i%countries.length], photo:`/avatars/${name.toLowerCase().replaceAll(' ','-')}.png`,
  score:86+(i%12), price:`€${800+(i%8)*350}`, languages:i%3===0?['FR','EN','AR']:i%3===1?['EN','FR']:['EN'],
  tags:[topics[i%topics.length], i%2?'TV ready':'Keynote ready', i%4?'Verified':'High demand'],
  linkedin:{headline:`${roles[i%roles.length]} · ${countries[i%countries.length]}`, followers:`${8+i}k`, company:i%2?'Independent Expert':'TSAAK verified network'},
  media:[
    {type:'Video', title:`Live interview on ${topics[i%topics.length]}`, source:i%2?'BBC World':'France 24'},
    {type:'Audio', title:'Podcast expert briefing', source:i%3?'The Brief':'Business Daily'},
    {type:'Written', title:'Opinion column and expert quote', source:i%2?'Le Monde':'Financial Times'}
  ],
  aiFound:[`Trending signal detected on ${topics[i%topics.length]}`, '3 credible media traces found', 'Strong match with current Wanted brief'],
  tsaakBackground:['Profile verified by TSAAK', 'Fast response history', 'Recommended by 2 intermediaries']
}));

// Sarah Benali est la Talent "porte d'entrée" de la démo (persona de connexion + parcours
// Connexion LinkedIn) : photo réelle et score alignés sur ce qui est affiché après connexion,
// pour que ce soit la même personne du login jusqu'au profil complet.
const _sarah = talents.find(t=>t.id==='sarah-benali');
if (_sarah) {
  _sarah.photo = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop';
  _sarah.score = 94;
}

// Profils réels — exemples concrets utilisés dans le deck investisseurs.
// Générés à partir d'informations publiques uniquement (mêmes principes que le générateur
// de profil outreach) : pas de photo réelle utilisée (avatar généré), pas de statistique
// inventée. Score calculé avec la même formule que le générateur (désirabilité/notoriété/
// passages média/performance).
export const realTalents = [
  {
    id:'jeremie-mani', name:'Jérémie Mani', role:'CEO Webhelp Canada', country:'Canada',
    photo:'/avatars/jeremie-mani.png', score:79, price:'Sur devis',
    languages:['FR','EN'], tags:['Outsourcing','Entrepreneuriat à impact','Talent TSAAK'],
    linkedin:{headline:'CEO Webhelp Canada · co-fondateur Podcasthon.org', followers:'—', company:'Webhelp Canada'},
    media:[
      {type:'Audio', title:'Invité — "Parlons de votre mental" (podcast)', source:'Podcast'},
      {type:'Audio', title:'"La voie de l’Entrepreneur" — Success Story (Ausha)', source:'Podcast'},
      {type:'Written', title:'Interviewé dans "Les Interviews Scale2Sell"', source:'Web / Interview'},
      {type:'Video', title:'Portrait vidéo YouTube — parcours d’entrepreneur', source:'YouTube'}
    ],
    aiFound:['CEO de la filiale canadienne de Webhelp', 'Co-fondateur d’altruwe.org', 'Co-fondateur de Podcasthon.org'],
    tsaakBackground:['Profil généré via le générateur TSAAK à partir d’informations publiques', 'Exemple concret présenté aux investisseurs']
  },
  {
    id:'david-hammel', name:'David Hammel', role:'Fondateur & CEO, Tsinor Venture Studio', country:'France',
    photo:'/avatars/david-hammel.png', score:75, price:'Sur devis',
    languages:['FR','EN'], tags:['Venture Studio','IA pour le BTP','Talent TSAAK'],
    linkedin:{headline:'Fondateur & CEO, Tsinor Venture Studio', followers:'—', company:'Tsinor Venture Studio'},
    media:[
      {type:'Written', title:'Interview — thèse IA de Tsinor Venture Studio', source:'CAO.fr'},
      {type:'Written', title:'"L’IA ne remplacera jamais un artisan, elle l’assistera"', source:'Mesinfos / Affiches Parisiennes'},
      {type:'Video', title:'Participation de Tsinor à la levée de fonds de Life Plus (3M€)', source:'Fusacq / Banque des Territoires'}
    ],
    aiFound:['16 ans à la tête du groupe familial AYOR (BTP)', 'Fondateur d’InProcess, à l’origine de Tsinor', 'Investisseur actif via Tsinor Venture Studio'],
    tsaakBackground:['Profil généré via le générateur TSAAK à partir d’informations publiques', 'Exemple concret présenté aux investisseurs']
  },
  {
    id:'bruno-dreyfus', name:'Bruno Dreyfus', role:'Co-CEO, TSAAK', country:'—',
    photo:'/avatars/bruno-dreyfus.png', score:45, price:'—',
    languages:['FR','EN'], tags:['Bijouterie','Innovation data','Talent TSAAK'],
    linkedin:{headline:'Tenengroup', followers:'—', company:'Tenengroup'},
    media:[],
    aiFound:['Aucune présence média publique recensée à ce jour'],
    tsaakBackground:['Profil généré via le générateur TSAAK — score honnête, aucune donnée inventée', 'Co-fondateur de TSAAK']
  },
  {
    id:'jonathan-allouche', name:'Jonathan Allouche', role:'Co-CEO, TSAAK', country:'Israël / France',
    photo:'/avatars/jonathan-allouche.png', score:82, price:'Sur devis',
    languages:['FR','EN','HE'], tags:['Stand-up & production', 'Metaverse', 'Talent TSAAK'],
    linkedin:{headline:'CEO Writing Metavers · Fondateur, Comedy Club Academy', followers:'—', company:'Writing Metavers'},
    media:[
      {type:'Written', title:'"À Tel Aviv, l’humour comme arme de résilience" — le Comedy Club Academy prépare son premier grand spectacle', source:'i24NEWS'},
      {type:'Written', title:'Lancement à Tel Aviv de la "première école de stand-up en Israël" destinée aux francophones', source:'Times of Israel'},
      {type:'Video', title:'Scénariste et chef de projet — "Un sac de billes" (2017), avec Patrick Bruel, Elsa Zylberstein, Christian Clavier', source:'Cinéma'},
    ],
    aiFound:[
      'Fondateur du Comedy Club Academy, première école de stand-up francophone en Israël (Tel Aviv, 2025)',
      'Co-auteur pour Gad Elmaleh, Arthur, Kev Adams',
      'Créateur de formats télévisés pour Canal+ ("The News Show"), "Le Grand Journal" et "La Méthode Cauet"',
      'CEO de Writing Metavers, fondateur du Collectif Writing'
    ],
    tsaakBackground:['Profil généré via le générateur TSAAK à partir d’informations publiques vérifiées', 'Co-fondateur de TSAAK']
  }
];
export const medias=[
{name:'France 24', type:'TV international', country:'France', contact:'Marc Vidal'},
{name:'LCI', type:'News TV', country:'France', contact:'Julie Perrin'},
{name:'BBC World', type:'International TV', country:'UK', contact:'Rachel Moore'},
{name:'Bloomberg', type:'Business TV', country:'USA', contact:'David Stein'},
{name:'The Brief Podcast', type:'Podcast', country:'UAE', contact:'Nora Aziz'},
{name:'Wired Events', type:'Conference media', country:'USA', contact:'Alan Scott'},
{name:'MENA Future Forum', type:'Event', country:'Qatar', contact:'Mariam Khaled'},
{name:'Arte', type:'Documentary', country:'France/Germany', contact:'Helene Wolf'},
{name:'TEDx Paris', type:'Conference', country:'France', contact:'Ines Robert'},
{name:'TechCrunch Live', type:'Digital media', country:'USA', contact:'Megan Lee'}
];
export const wanted=[
{id:'w1',title:'Expert IA & société pour plateau TV', media:'LCI', status:'Proposals', deadline:'Tomorrow 18:00', budget:'€1,800', brief:'Débat prime time sur IA, emploi et démocratie.', responses:5},
{id:'w2',title:'Speaker climat pour conférence corporate', media:'MENA Future Forum', status:'Shortlist', deadline:'Friday', budget:'€6,500', brief:'Keynote climat, énergie et géopolitique.', responses:8},
{id:'w3',title:'Ancien militaire pour analyse crise', media:'France 24', status:'Contact', deadline:'Today 21:00', budget:'€2,200', brief:'Analyse live sur situation sécuritaire.', responses:3}

];
  // compatibilité anciennes pages
export const casteColors = casteThemes;
