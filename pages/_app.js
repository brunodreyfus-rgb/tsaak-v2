import '../styles/globals.css';
import { DiscoveryPanel } from '../components/RichDemoUI';
export default function App({ Component, pageProps }) {
  return <>
    <Component {...pageProps} />
    <DiscoveryPanel/>
  </>;
}
