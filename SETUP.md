# TSAAK — mise en route du vrai site (≈ 15 min)

Le site contient deux choses dans le même projet :

* **La démo investisseurs** (pages `/`, `/search`, `/expert/...`, etc.) — inchangée dans son fonctionnement, 100 % simulée.
* **Le vrai site** : `/connexion`, `/rejoindre/[lien]` et tout `/espace/...` — vraie base de données (Supabase), vrais comptes.

Sans les clés Supabase, la démo marche normalement et le vrai site affiche « Site à configurer ».

## 1. Créer la base (Supabase)

1. Crée un projet sur https://supabase.com (région Europe).
2. **SQL Editor → New query** : colle tout le contenu de `supabase/schema.sql` → **Run**. (Rejouable sans risque.)
3. **Project Settings → API** : note l'**URL** et la clé **anon public**.
4. **Authentication → Providers → Email** : pour démarrer, tu peux désactiver « Confirm email » (le lien d'invitation personnel sert déjà de filtre). Si tu le laisses actif, la personne devra cliquer un lien reçu par mail avant de se connecter.
5. **Authentication → URL Configuration** : *Site URL* = l'adresse publique du site (ex. `https://tsaak.vercel.app`).

## 2. Créer ton compte administrateur (obligatoire, une seule fois)

L'inscription est **sur invitation uniquement**, donc le tout premier compte se crée à la main :

1. Supabase → **Authentication → Users → Add user → Create new user** : ton email + un mot de passe, coche *Auto Confirm User*.
2. Le premier compte créé est automatiquement **administrateur**. Il est « Expert » par défaut ; si tu préfères un autre type, dans le SQL Editor :
   `update public.profiles set caste = 'intermediaire' where id = (select id from auth.users where email = 'ton@email');`
   (valeurs : `expert`, `intermediaire`, `media`, `organisation`)
3. Connecte-toi sur `/connexion`, puis **Inviter**.

Pour ouvrir l'inscription à tout le monde plus tard : `update public.app_settings set value = 'false' where key = 'invite_only';`

## 3. Variables d'environnement

En local : copie `.env.example` en `.env.local`. Sur Vercel : *Settings → Environment Variables* (puis redéployer).

| Variable | Rôle |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | connexion à la base (obligatoires) |
| `NEXT_PUBLIC_SITE_URL` | adresse du site, utilisée dans les liens d'invitation |
| `RESEND_API_KEY`, `INVITE_FROM_EMAIL` | envoi des invitations par email (facultatif) |

**Email (Resend)** : crée un compte sur https://resend.com, vérifie ton domaine d'envoi, crée une clé API. Sans ça, tout fonctionne : le bouton « Envoyer par TSAAK » indique que l'envoi n'est pas configuré et tu utilises **Copier le lien / WhatsApp / Mon mail**.

Aucune clé secrète Supabase (`service_role`) n'est utilisée par le site : ne la mets nulle part.

## 4. Lancer

```bash
npm install
npm run dev      # http://localhost:3000/connexion
```

## Ce qui fonctionne déjà

* **Inviter** (`/espace/inviter`) : une personne ou une liste, par type (expert, intermédiaire, média, organisation), lien personnel, WhatsApp, mail, envoi par TSAAK (si Resend), suivi (lien créé / envoyé / a rejoint), annulation. Limite : 50 invitations par 24 h et par personne.
* **Inscription par lien** (`/rejoindre/[lien]`) : le type de profil vient de l'invitation (non modifiable par la personne).
* **Profil** : identité, photo, compétences, mots-clés, liens, **preuves média par lien collé** (lecture du titre, média, image, date — sans IA ; l'audience est saisie à la main, rien n'est inventé), calendrier de disponibilité, publication (consentement).
* **Recherche** : texte, compétences, date. Expert occupé ce jour-là = masqué (case pour l'afficher) ; expert **sans calendrier = affiché avec « Vérifier la dispo »**.
* **Fiche expert** : compétences en grand, rang + jauges façon jeu vidéo, nuage de mots, preuves, calendrier, message.
* **Shortlist**, **Wanted** (média/organisation → poussé à des intermédiaires choisis → ils répondent « partant / décline » et proposent des experts), **Messages** (temps réel) avec **multi-messaging** (un message → une conversation privée par destinataire, jamais de groupe visible), **notifications dans l'app** uniquement.

## Règles de sécurité (dans la base, pas seulement dans l'interface)

* Un membre ne peut ni changer son type de profil, ni se rendre admin, ni lire/modifier son score interne.
* Le **chiffre du score est interne** (algorithme, pricing) : le site n'affiche que le rang, les jauges, les compétences et le nuage de mots.
* Un profil n'est visible des autres que s'il est **publié** par son propriétaire.
* Chacun ne voit que ses conversations, ses invitations, ses Wanted (auteur ou destinataire).

## Score interne — formule PROVISOIRE (à valider)

Pondération du deck : Désirabilité 35 % · Passages média 35 % · Performance 25 % · Communauté 5 %.
Aujourd'hui : *Passages média* = 15 points par preuve (plafond 100) · *Performance* = 20 points par preuve avec audience saisie · *Communauté* = 10 points par membre invité qui a rejoint · *Désirabilité* = 50 par défaut, ajustable par un admin (`select admin_set_desirability('<id profil>', 70);`). Tout est dans `recompute_profile_score` (schema.sql) : modifiable à un seul endroit.

## Pas encore dans cette version

Connexion LinkedIn, paiement/commissions, notifications par email/SMS/WhatsApp, agent qui gère un profil à la place de l'expert, CGV/règles de remplacement, cooptation, abonnements. Les tables sont prêtes à les accueillir.

## Tests

`supabase/tests/` : `stub_supabase.sql` + `test_schema.sql` + `test_client_ops.sql` rejouent les règles (invitations, droits, recherche/dispo, Wanted, messagerie) sur un Postgres local. Ces tests n'ont pas été exécutés sur un vrai projet Supabase : fais un essai de bout en bout (inviter → rejoindre → publier → rechercher → écrire) avant d'inviter du monde.
