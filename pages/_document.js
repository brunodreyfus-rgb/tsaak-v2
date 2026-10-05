import { Html, Head, Main, NextScript } from 'next/document';

export default function Document(){
  return <Html lang="fr">
    <Head>
      <title>TSAAK — Easy Booking Ecosystem</title>
      <meta name="description" content="Démo interactive TSAAK — connexion LinkedIn, contrat & paiement, score, mercato." />
      <link rel="icon" href="/tsaak-logo.jpg" type="image/jpeg" />
    </Head>
    <body>
      <Main />
      <NextScript />
    </body>
  </Html>;
}
