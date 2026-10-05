import { useEffect } from 'react';
import { page, card, button, colors, Badge, Masthead } from '../components/RichDemoUI';

// Merged into /search — this route now redirects there so old links keep working.
export default function ProactiveSearch(){
  useEffect(()=>{ window.location.replace('/search'); },[]);
  return <main style={page('media')}>
    <Masthead active='recherche'/>
    <Badge c={colors.media}>RECHERCHE</Badge>
    <h1 style={{fontSize:44}}>Redirection…</h1>
    <p style={{color:'#C9D4E4'}}>La recherche proactive a été fusionnée avec la nouvelle page Recherche.</p>
    <a style={button(colors.media)} href='/search'>Aller à la recherche →</a>
  </main>;
}
