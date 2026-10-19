import '../styles/globals.css';
import { useRouter } from 'next/router';
import { DiscoveryPanel } from '../components/RichDemoUI';

// Le panneau « découverte » appartient à la démo investisseurs : on le masque sur le vrai site.
const REAL_SITE = ['/espace', '/connexion', '/rejoindre', '/mot-de-passe', '/diagnostic'];
export default function App({ Component, pageProps }) {
  const { pathname } = useRouter();
  const real = REAL_SITE.some((p) => pathname === p || pathname.startsWith(p + '/'));
  return <>
    <Component {...pageProps} />
    {!real && <DiscoveryPanel/>}
  </>;
}
