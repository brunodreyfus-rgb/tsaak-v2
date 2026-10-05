# TSAAK — Démo investisseurs

Démo interactive (Next.js, pages router) qui simule l'écosystème TSAAK : 5 castes (Media, Talent,
Intermédiaire, Communauté, Organisation) et, surtout, les **4 business cases clés** attendus par les
investisseurs. Tout tourne en local dans le navigateur (`localStorage`), **sans backend**.

## Les 4 business cases simulés en priorité

| Business case | Route | Ce qui est simulé |
|---|---|---|
| **Connexion LinkedIn** | `/talent-onboarding/self` | Le Talent clique "Continuer avec LinkedIn", un écran d'autorisation façon OAuth s'affiche, puis TSAAK importe le profil champ par champ et lance un scan IA qui retrouve les preuves média, jusqu'au score final. |
| **Contrat & Paiement** | `/contract` (alias `/contracts`) | Contract builder (template, parties, variables, livrables, NDA) → prévisualisation → signature électronique (le Talent "signe" en tapant son nom) → paiement (carte / PayPal, récap + commission TSAAK) → reçu téléchargeable + mise à jour du ledger de commission de l'intermédiaire. |
| **Calcul du score** | `/score-explained` | Les 4 leviers du score TSAAK (désirabilité, indice FanTSAak, passages média, performance) sont pondérés et ajustables via des curseurs ; le score global se recalcule en direct sous les yeux de l'investisseur. |
| **Mercato** | `/mercato` | Fenêtre de 2 mois avec compte à rebours, Guests libres, enchères de médias sur 3 paliers (2K / 4K / 6K), acceptation d'offre par le Guest, et simulateur d'investissement de la Kaastbase (jusqu'à 30% de la valeur du Guest, avec ROI estimé). |

La page `/demo` liste ces 4 cas en priorité, puis les cas secondaires (recherche proactive, Patchwork,
recherche IA, Help Me, 3 parcours d'entrée Talent, profil Talent enrichi).

## Structure

- `pages/index.js` — landing page (réseau des 5 castes + les 4 business cases).
- `pages/media.js`, `talent.js`, `organisation.js`, `communaute.js`, `intermediaires.js` — cockpit
  personnalisé par caste (salutation, stats, raccourcis vers les business cases).
- `pages/contract.js` — tunnel contrat + paiement (business case 2).
- `pages/mercato.js` — Mercato (business case 4).
- `pages/score-explained.js` — calculateur de score (business case 3).
- `pages/talent-onboarding/self.js` — connexion LinkedIn (business case 1) ; `ai.js` et
  `intermediaire.js` couvrent les deux autres façons d'entrer un Talent dans TSAAK.
- `pages/talent/[id].js` — profil Talent enrichi (LinkedIn + preuves média + score).
- `components/RichDemoUI.js` — kit UI partagé (cartes, boutons, badges, curseurs, countdown,
  signature électronique, `Masthead` = nav commune). C'est le design system à utiliser pour toute
  nouvelle page.
- `components/TsaakUI.js` — ancien kit UI, encore utilisé par quelques pages secondaires
  (`wanted.js`, `shortlist.js`, `search.js`, `messaging.js`, `media/proposals.js`,
  `intermediaires/respond.js`). À migrer vers `RichDemoUI` si ces pages sont retravaillées.
- `data/talents.js` — jeu de données démo (talents, médias, Wanted, thèmes de caste).
- `data/mediaProofs.js` — preuves média factices + parcours d'onboarding Talent.

## Lancer en local

```bash
npm install
npm run dev
```

Puis ouvrir `http://localhost:3000` (ou `npm run build && npm run start` pour tester le build de
production).

## Notes

- Toute la simulation est côté client (`useLocal` dans `RichDemoUI.js` = wrapper `localStorage`) :
  aucune base de données, aucune API. Un bouton "↺ Refaire la démo" réinitialise chaque flow.
- Les photos sont des images Unsplash de démonstration (pas de vraies personnes associées aux noms
  utilisés).
- Déploiement : le repo est prêt pour Vercel (`vercel.json` présent).
