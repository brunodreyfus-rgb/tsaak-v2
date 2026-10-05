export const mediaProofs = [
  { type:'TV', icon:'▶', title:'France 24 · Live debate', source:'YouTube / TV channel', date:'May 2026', metric:'1.2M views', thumbnail:'/avatars/media-tv.png', note:'Strong clarity under pressure, excellent broadcast pacing.' },
  { type:'Podcast', icon:'🎙', title:'AI & Society Weekly', source:'Podcast · 42 min', date:'Apr 2026', metric:'Top 5% episode', thumbnail:'/avatars/media-podcast.png', note:'Long-form explanation, accessible and human.' },
  { type:'Article', icon:'✒', title:'Tribune · Le Monde / Opinion', source:'Daily newspaper', date:'Mar 2026', metric:'Shared 8.4k times', thumbnail:'/avatars/media-article.png', note:'Clear point of view, strong editorial authority.' },
  { type:'Seminar', icon:'◆', title:'Global Policy Forum', source:'Seminar / keynote', date:'Feb 2026', metric:'600 attendees', thumbnail:'/avatars/media-seminar.png', note:'High credibility for corporate and institutional audiences.' },
  { type:'Panel', icon:'◉', title:'Tech & Democracy Summit', source:'Conference panel', date:'Jan 2026', metric:'92/100 audience score', thumbnail:'/avatars/media-panel.png', note:'Good interaction with contradictory viewpoints.' }
];

export const onboardingPaths = [
  { id:'self', title:'Inscription personnelle directe', route:'/talent-onboarding/self', color:'#39FF88', steps:['LinkedIn import','AI scan public web','Media proof validation','TSAAK score generated'] },
  { id:'intermediaire', title:'Invitation intermédiaire', route:'/talent-onboarding/intermediaire', color:'#FF4FD8', steps:['Booker identifies external talent','Invite sent','Talent accepts','Profile becomes bookable'] },
  { id:'ai', title:'Invitation TSAAK via IA Search', route:'/talent-onboarding/ai', color:'#00E5FF', steps:['Patchwork detects external expert','AI checks media potential','TSAAK sends invite','Talent joins from demand'] }
];
