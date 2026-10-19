-- =====================================================================
-- TSAAK — schéma Supabase (vrai site)
-- À coller dans Supabase > SQL Editor > New query > Run.
-- Rejouable : tout est « create or replace » / « if not exists » / « drop policy if exists ».
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- 0. Réglages
-- ---------------------------------------------------------------------
create table if not exists public.app_settings (
  key text primary key,
  value text not null
);
-- Inscription sur invitation uniquement (recommandé pour le lancement).
-- Pour ouvrir l'inscription à tous : update public.app_settings set value='false' where key='invite_only';
insert into public.app_settings(key, value) values ('invite_only', 'true') on conflict do nothing;
alter table public.app_settings enable row level security;
-- aucune policy : lisible uniquement par les fonctions security definer

-- ---------------------------------------------------------------------
-- 1. Profils
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  caste text not null default 'expert' check (caste in ('expert','intermediaire','media','organisation')),
  is_admin boolean not null default false,
  display_name text not null default '',
  headline text not null default '',
  bio text not null default '',
  city text not null default '',
  photo_url text,
  skills text[] not null default '{}',
  keywords text[] not null default '{}',
  links jsonb not null default '[]'::jsonb,         -- [{label,url}]
  published boolean not null default false,          -- consentement : visible dans la recherche
  calendar_active boolean not null default false,    -- l'expert tient son calendrier TSAAK à jour
  -- Données INTERNES (algorithme, pricing) : jamais exposées côté client
  internal_score int not null default 50 check (internal_score between 0 and 100),
  criteria jsonb not null default '{"desirability":50,"media":0,"performance":0,"community":0}'::jsonb,
  invited_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists profiles_caste_pub_idx on public.profiles(caste, published);

create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
drop trigger if exists profiles_touch on public.profiles;
create trigger profiles_touch before update on public.profiles for each row execute function public.touch_updated_at();

-- Rang affiché (le chiffre reste interne)
create or replace function public.tier_of(score int) returns text language sql immutable as $$
  select case when score >= 90 then 'Élite' when score >= 75 then 'Confirmé' when score >= 50 then 'Montant' else 'Émergent' end
$$;

-- Aide : suis-je admin ?
create or replace function public.is_admin() returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false)
$$;

-- ---------------------------------------------------------------------
-- 2. Preuves média, disponibilités, shortlist
-- ---------------------------------------------------------------------
create table if not exists public.media_proofs (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  url text not null,
  title text not null default '',
  source text not null default '',            -- ex. nom de domaine / média
  kind text not null default 'article' check (kind in ('article','video','podcast','tv','radio','event','other')),
  published_on date,
  metric text not null default '',            -- ex. « 120 000 vues » : saisi par l'expert, jamais inventé
  note text not null default '',
  thumbnail text,
  created_at timestamptz not null default now()
);
create index if not exists media_proofs_profile_idx on public.media_proofs(profile_id);

create table if not exists public.availability_blocks (   -- jours OCCUPÉS
  profile_id uuid not null references public.profiles(id) on delete cascade,
  day date not null,
  primary key (profile_id, day)
);

create table if not exists public.shortlists (
  owner_id uuid not null references public.profiles(id) on delete cascade,
  expert_id uuid not null references public.profiles(id) on delete cascade,
  note text not null default '',
  created_at timestamptz not null default now(),
  primary key (owner_id, expert_id)
);

-- ---------------------------------------------------------------------
-- 3. Invitations
-- ---------------------------------------------------------------------
create table if not exists public.invitations (
  id uuid primary key default gen_random_uuid(),
  token text not null unique default replace(gen_random_uuid()::text, '-', ''),
  inviter_id uuid not null references public.profiles(id) on delete cascade,
  email text,
  name text not null default '',
  caste text not null check (caste in ('expert','intermediaire','media','organisation')),
  message text not null default '',
  status text not null default 'pending' check (status in ('pending','sent','accepted','revoked')),
  email_sent_at timestamptz,
  accepted_by uuid references public.profiles(id) on delete set null,
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists invitations_inviter_idx on public.invitations(inviter_id, created_at desc);

-- Limite anti-abus : 50 invitations / 24 h / personne
create or replace function public.invitations_rate_limit() returns trigger language plpgsql as $$
begin
  if (select count(*) from public.invitations where inviter_id = new.inviter_id and created_at > now() - interval '24 hours') >= 50 then
    raise exception 'Limite de 50 invitations par 24 h atteinte';
  end if;
  return new;
end $$;
drop trigger if exists invitations_rl on public.invitations;
create trigger invitations_rl before insert on public.invitations for each row execute function public.invitations_rate_limit();

-- Lecture publique (page /rejoindre/[token]) : uniquement l'invitation demandée
create or replace function public.get_invitation(p_token text)
returns table(caste text, name text, email text, status text, inviter_name text, message text)
language sql stable security definer set search_path = public as $$
  select i.caste, i.name, i.email, i.status, coalesce(nullif(p.display_name,''), 'Un membre TSAAK'), i.message
  from public.invitations i join public.profiles p on p.id = i.inviter_id
  where i.token = p_token
$$;
grant execute on function public.get_invitation(text) to anon, authenticated;

-- ---------------------------------------------------------------------
-- 4. Création du profil à l'inscription
-- ---------------------------------------------------------------------
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  inv public.invitations%rowtype;
  v_caste text;
  v_first boolean;
  v_invite_only boolean := coalesce((select value from public.app_settings where key = 'invite_only'), 'true') = 'true';
begin
  select not exists(select 1 from public.profiles) into v_first;

  if coalesce(meta->>'invite_token','') <> '' then
    select * into inv from public.invitations where token = meta->>'invite_token' and status in ('pending','sent');
  end if;

  if inv.id is null and v_invite_only and not v_first then
    raise exception 'Inscription sur invitation uniquement';
  end if;

  v_caste := coalesce(inv.caste, meta->>'caste', 'expert');
  if v_caste not in ('expert','intermediaire','media','organisation') then v_caste := 'expert'; end if;

  insert into public.profiles(id, caste, is_admin, display_name, invited_by)
  values (new.id, v_caste, v_first, coalesce(nullif(meta->>'display_name',''), nullif(inv.name,''), split_part(coalesce(new.email,''),'@',1)), inv.inviter_id);

  if inv.id is not null then
    update public.invitations set status='accepted', accepted_by=new.id, accepted_at=now() where id = inv.id;
  end if;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- 5. Notifications (dans l'app uniquement — pas de relance email/SMS/WhatsApp)
-- ---------------------------------------------------------------------
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null,
  title text not null,
  body text not null default '',
  link text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists notifications_profile_idx on public.notifications(profile_id, created_at desc);

create or replace function public.notify(p_to uuid, p_kind text, p_title text, p_body text, p_link text) returns void
language sql security definer set search_path = public as $$
  insert into public.notifications(profile_id, kind, title, body, link) values (p_to, p_kind, p_title, p_body, p_link)
$$;
revoke all on function public.notify(uuid,text,text,text,text) from public, anon, authenticated;

-- Quand une invitation est acceptée → on prévient la personne qui a invité
create or replace function public.on_invitation_accepted() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'accepted' and old.status <> 'accepted' then
    perform public.notify(new.inviter_id, 'invitation', 'Invitation acceptée',
      coalesce(nullif((select display_name from public.profiles where id = new.accepted_by),''), 'Quelqu''un') || ' a rejoint TSAAK grâce à toi.', '/espace/inviter');
  end if;
  return new;
end $$;
drop trigger if exists invitations_accepted on public.invitations;
create trigger invitations_accepted after update on public.invitations for each row execute function public.on_invitation_accepted();

-- ---------------------------------------------------------------------
-- 6. Wanted + push vers les intermédiaires
-- ---------------------------------------------------------------------
create table if not exists public.wanteds (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  theme text not null default '',
  target text not null default '',
  angle text not null default '',
  brief text not null default '',
  deadline date,
  status text not null default 'open' check (status in ('open','closed')),
  created_at timestamptz not null default now()
);
create table if not exists public.wanted_recipients (
  wanted_id uuid not null references public.wanteds(id) on delete cascade,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'sent' check (status in ('sent','seen','interested','declined')),
  response text not null default '',
  responded_at timestamptz,
  created_at timestamptz not null default now(),
  primary key (wanted_id, recipient_id)
);
create table if not exists public.wanted_proposals (
  id uuid primary key default gen_random_uuid(),
  wanted_id uuid not null references public.wanteds(id) on delete cascade,
  proposer_id uuid not null references public.profiles(id) on delete cascade,
  expert_id uuid not null references public.profiles(id) on delete cascade,
  note text not null default '',
  created_at timestamptz not null default now(),
  unique (wanted_id, proposer_id, expert_id)
);

create or replace function public.is_wanted_recipient(p_wanted uuid) returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.wanted_recipients where wanted_id = p_wanted and recipient_id = auth.uid())
$$;
create or replace function public.is_wanted_author(p_wanted uuid) returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.wanteds where id = p_wanted and author_id = auth.uid())
$$;

-- Publier un Wanted et le pousser à des intermédiaires choisis
create or replace function public.send_wanted(p_title text, p_theme text, p_target text, p_angle text, p_brief text, p_deadline date, p_recipients uuid[])
returns uuid language plpgsql security definer set search_path = public as $$
declare
  me public.profiles%rowtype;
  w uuid;
  r uuid;
  n int := 0;
begin
  select * into me from public.profiles where id = auth.uid();
  if me.id is null then raise exception 'Connexion requise'; end if;
  if me.caste not in ('media','organisation') and not me.is_admin then raise exception 'Seuls les médias et les organisations publient un Wanted'; end if;
  if coalesce(trim(p_title),'') = '' then raise exception 'Titre requis'; end if;
  if coalesce(array_length(p_recipients,1),0) = 0 then raise exception 'Choisis au moins un intermédiaire'; end if;
  if array_length(p_recipients,1) > 50 then raise exception '50 destinataires maximum'; end if;

  insert into public.wanteds(author_id, title, theme, target, angle, brief, deadline)
  values (me.id, trim(p_title), coalesce(p_theme,''), coalesce(p_target,''), coalesce(p_angle,''), coalesce(p_brief,''), p_deadline) returning id into w;

  for r in select distinct x from unnest(p_recipients) x loop
    if exists(select 1 from public.profiles where id = r and caste = 'intermediaire' and r <> me.id) then
      insert into public.wanted_recipients(wanted_id, recipient_id) values (w, r) on conflict do nothing;
      perform public.notify(r, 'wanted', 'Nouveau Wanted : ' || trim(p_title),
        coalesce(nullif(me.display_name,''),'Un membre') || ' cherche un profil' || case when coalesce(p_theme,'')<>'' then ' (' || p_theme || ')' else '' end || '.', '/espace/wanted/' || w);
      n := n + 1;
    end if;
  end loop;
  if n = 0 then raise exception 'Aucun intermédiaire valide parmi les destinataires'; end if;
  return w;
end $$;
grant execute on function public.send_wanted(text,text,text,text,text,date,uuid[]) to authenticated;

-- Réponse d'un intermédiaire : prévient l'auteur
create or replace function public.on_wanted_response() returns trigger language plpgsql security definer set search_path = public as $$
declare w public.wanteds%rowtype;
begin
  if new.status in ('interested','declined') and new.status is distinct from old.status then
    new.responded_at := now();
    select * into w from public.wanteds where id = new.wanted_id;
    perform public.notify(w.author_id, 'wanted_response',
      case when new.status='interested' then 'Un intermédiaire est partant' else 'Un intermédiaire décline' end,
      coalesce((select display_name from public.profiles where id = new.recipient_id),'') || ' — « ' || w.title || ' »', '/espace/wanted/' || w.id);
  end if;
  return new;
end $$;
drop trigger if exists wanted_recipients_resp on public.wanted_recipients;
create trigger wanted_recipients_resp before update on public.wanted_recipients for each row execute function public.on_wanted_response();

create or replace function public.on_wanted_proposal() returns trigger language plpgsql security definer set search_path = public as $$
declare w public.wanteds%rowtype;
begin
  select * into w from public.wanteds where id = new.wanted_id;
  perform public.notify(w.author_id, 'wanted_proposal', 'Un profil est proposé',
    coalesce((select display_name from public.profiles where id = new.expert_id),'Un expert') || ' pour « ' || w.title || ' »', '/espace/wanted/' || w.id);
  return new;
end $$;
drop trigger if exists wanted_proposals_notify on public.wanted_proposals;
create trigger wanted_proposals_notify after insert on public.wanted_proposals for each row execute function public.on_wanted_proposal();

-- ---------------------------------------------------------------------
-- 7. Messagerie (+ multi-messaging)
-- ---------------------------------------------------------------------
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  subject text not null default '',
  created_by uuid not null references public.profiles(id) on delete cascade,
  direct_key text,                       -- « idA:idB » trié, pour réutiliser une conversation 1-1
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists conversations_direct_key_idx on public.conversations(direct_key) where direct_key is not null;
create table if not exists public.conversation_members (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  last_read_at timestamptz not null default now(),
  primary key (conversation_id, profile_id)
);
create index if not exists conv_members_profile_idx on public.conversation_members(profile_id);
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (length(trim(body)) > 0 and length(body) <= 5000),
  created_at timestamptz not null default now()
);
create index if not exists messages_conv_idx on public.messages(conversation_id, created_at);

create or replace function public.is_member(p_conv uuid) returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.conversation_members where conversation_id = p_conv and profile_id = auth.uid())
$$;

-- Nouveau message → notification aux autres membres + conversation remontée
create or replace function public.on_message_insert() returns trigger language plpgsql security definer set search_path = public as $$
declare m record; sname text;
begin
  update public.conversations set updated_at = now() where id = new.conversation_id;
  select coalesce(nullif(display_name,''),'Un membre') into sname from public.profiles where id = new.sender_id;
  for m in select profile_id from public.conversation_members where conversation_id = new.conversation_id and profile_id <> new.sender_id loop
    perform public.notify(m.profile_id, 'message', 'Message de ' || sname, left(new.body, 140), '/espace/messages/' || new.conversation_id);
  end loop;
  return new;
end $$;
drop trigger if exists messages_after_insert on public.messages;
create trigger messages_after_insert after insert on public.messages for each row execute function public.on_message_insert();

-- Ouvre (ou réutilise) une conversation 1-1 et envoie le premier message
create or replace function public.start_conversation(p_recipient uuid, p_subject text, p_body text) returns uuid
language plpgsql security definer set search_path = public as $$
declare me uuid := auth.uid(); conv uuid; k text;
begin
  if me is null then raise exception 'Connexion requise'; end if;
  if p_recipient = me then raise exception 'Impossible de s''écrire à soi-même'; end if;
  if not exists(select 1 from public.profiles where id = p_recipient and (published or is_admin)) then raise exception 'Destinataire introuvable'; end if;
  k := least(me::text, p_recipient::text) || ':' || greatest(me::text, p_recipient::text);
  select id into conv from public.conversations where direct_key = k;
  if conv is null then
    insert into public.conversations(subject, created_by, direct_key) values (coalesce(p_subject,''), me, k) returning id into conv;
    insert into public.conversation_members(conversation_id, profile_id) values (conv, me), (conv, p_recipient);
  end if;
  insert into public.messages(conversation_id, sender_id, body) values (conv, me, p_body);
  return conv;
end $$;
grant execute on function public.start_conversation(uuid,text,text) to authenticated;

-- Multi-messaging : un même message, une conversation PRIVÉE par destinataire (jamais de groupe visible)
create or replace function public.send_broadcast(p_recipients uuid[], p_subject text, p_body text) returns int
language plpgsql security definer set search_path = public as $$
declare r uuid; n int := 0;
begin
  if auth.uid() is null then raise exception 'Connexion requise'; end if;
  if coalesce(array_length(p_recipients,1),0) = 0 then raise exception 'Aucun destinataire'; end if;
  if array_length(p_recipients,1) > 50 then raise exception '50 destinataires maximum par envoi'; end if;
  for r in select distinct x from unnest(p_recipients) x loop
    if r <> auth.uid() and exists(select 1 from public.profiles where id = r and published) then
      perform public.start_conversation(r, p_subject, p_body);
      n := n + 1;
    end if;
  end loop;
  return n;
end $$;
grant execute on function public.send_broadcast(uuid[],text,text) to authenticated;

-- Boîte de réception : mes conversations avec le nom de l'interlocuteur (même s'il n'a pas publié son profil)
create or replace function public.my_conversations()
returns table(id uuid, subject text, updated_at timestamptz, peer_id uuid, peer_name text, peer_caste text, peer_photo text, last_body text, last_at timestamptz, unread boolean)
language sql stable security definer set search_path = public as $$
  select c.id, c.subject, c.updated_at, pp.id, coalesce(nullif(pp.display_name,''),'Membre TSAAK'), pp.caste, pp.photo_url,
         lm.body, lm.created_at,
         (lm.sender_id <> auth.uid() and lm.created_at > me.last_read_at)
  from public.conversation_members me
  join public.conversations c on c.id = me.conversation_id
  left join public.conversation_members other on other.conversation_id = c.id and other.profile_id <> me.profile_id
  left join public.profiles pp on pp.id = other.profile_id
  left join lateral (select m.body, m.created_at, m.sender_id from public.messages m where m.conversation_id = c.id order by m.created_at desc limit 1) lm on true
  where me.profile_id = auth.uid()
  order by c.updated_at desc
$$;
grant execute on function public.my_conversations() to authenticated;

-- Fiche d'un Wanted avec le nom de l'auteur (visible par l'auteur et les destinataires)
create or replace function public.get_wanted(p_id uuid)
returns table(id uuid, title text, theme text, target text, angle text, brief text, deadline date, status text, created_at timestamptz, author_id uuid, author_name text, author_caste text, is_author boolean)
language sql stable security definer set search_path = public as $$
  select w.id, w.title, w.theme, w.target, w.angle, w.brief, w.deadline, w.status, w.created_at, w.author_id,
         coalesce(nullif(p.display_name,''),'Membre TSAAK'), p.caste, (w.author_id = auth.uid())
  from public.wanteds w join public.profiles p on p.id = w.author_id
  where w.id = p_id and (w.author_id = auth.uid() or public.is_wanted_recipient(w.id) or public.is_admin())
$$;
grant execute on function public.get_wanted(uuid) to authenticated;

-- Wanted reçus (pour un intermédiaire) avec le nom de l'auteur
create or replace function public.my_received_wanteds()
returns table(id uuid, title text, theme text, deadline date, status text, created_at timestamptz, author_name text, my_status text)
language sql stable security definer set search_path = public as $$
  select w.id, w.title, w.theme, w.deadline, w.status, w.created_at, coalesce(nullif(p.display_name,''),'Membre TSAAK'), r.status
  from public.wanted_recipients r join public.wanteds w on w.id = r.wanted_id join public.profiles p on p.id = w.author_id
  where r.recipient_id = auth.uid() order by w.created_at desc
$$;
grant execute on function public.my_received_wanteds() to authenticated;

-- ---------------------------------------------------------------------
-- 8. Score INTERNE (provisoire — formule à valider avec l'équipe)
--    Pondération du deck : Désirabilité 35 % · Passages média 35 % · Performance 25 % · Communauté 5 %
--    - media        : 15 pts par preuve média (plafond 100)
--    - performance  : 20 pts par preuve avec métrique saisie (plafond 100)
--    - community    : 10 pts par membre invité qui a rejoint (plafond 100)
--    - desirability : neutre (50) tant qu'il n'y a pas de données de demandes ; ajustable par un admin
-- ---------------------------------------------------------------------
create or replace function public.recompute_profile_score(p_profile uuid) returns void language plpgsql security definer set search_path = public as $$
declare c jsonb; d int; m int; pf int; co int;
begin
  select criteria into c from public.profiles where id = p_profile;
  if c is null then return; end if;
  d := coalesce((c->>'desirability')::int, 50);
  m := least(100, 15 * (select count(*) from public.media_proofs where profile_id = p_profile));
  pf := least(100, 20 * (select count(*) from public.media_proofs where profile_id = p_profile and trim(metric) <> ''));
  co := least(100, 10 * (select count(*) from public.profiles where invited_by = p_profile));
  update public.profiles set
    criteria = jsonb_build_object('desirability', d, 'media', m, 'performance', pf, 'community', co),
    internal_score = round(d*0.35 + m*0.35 + pf*0.25 + co*0.05)::int
  where id = p_profile;
end $$;
revoke all on function public.recompute_profile_score(uuid) from public, anon, authenticated;

create or replace function public.proofs_rescore() returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.recompute_profile_score(coalesce(new.profile_id, old.profile_id));
  return null;
end $$;
drop trigger if exists media_proofs_rescore on public.media_proofs;
create trigger media_proofs_rescore after insert or update or delete on public.media_proofs for each row execute function public.proofs_rescore();

create or replace function public.invited_rescore() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.invited_by is not null then perform public.recompute_profile_score(new.invited_by); end if;
  return null;
end $$;
drop trigger if exists profiles_invited_rescore on public.profiles;
create trigger profiles_invited_rescore after insert on public.profiles for each row execute function public.invited_rescore();

-- Un admin peut ajuster la « désirabilité » (0-100)
create or replace function public.admin_set_desirability(p_profile uuid, p_value int) returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Réservé aux admins'; end if;
  update public.profiles set criteria = jsonb_set(criteria, '{desirability}', to_jsonb(greatest(0, least(100, p_value)))) where id = p_profile;
  perform public.recompute_profile_score(p_profile);
end $$;
grant execute on function public.admin_set_desirability(uuid,int) to authenticated;

-- ---------------------------------------------------------------------
-- 9. Recherche d'experts (disponibilité incluse)
--    availability : 'dispo' | 'indispo' | 'verifier' (pas de calendrier) | 'calendrier' (calendrier tenu, aucune date demandée)
--    Un expert SANS calendrier reste affiché avec « Vérifier la dispo ».
-- ---------------------------------------------------------------------
create or replace function public.search_experts(p_q text default null, p_skills text[] default null, p_day date default null, p_include_busy boolean default false)
returns table(id uuid, display_name text, headline text, city text, photo_url text, skills text[], keywords text[], tier text, criteria jsonb, availability text)
language plpgsql stable security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'Connexion requise'; end if;
  return query
  with base as (
    select p.*,
      case
        when not p.calendar_active then 'verifier'
        when p_day is null then 'calendrier'
        when exists(select 1 from public.availability_blocks b where b.profile_id = p.id and b.day = p_day) then 'indispo'
        else 'dispo'
      end as av,
      concat_ws(' ', p.display_name, p.headline, p.bio, p.city, array_to_string(p.skills,' '), array_to_string(p.keywords,' ')) as hay
    from public.profiles p
    where p.caste = 'expert' and p.published
  )
  select b.id, b.display_name, b.headline, b.city, b.photo_url, b.skills, b.keywords, public.tier_of(b.internal_score), b.criteria, b.av
  from base b
  where (p_q is null or trim(p_q) = '' or not exists (
          select 1 from unnest(string_to_array(trim(p_q), ' ')) w
          where w <> '' and b.hay not ilike '%' || replace(replace(replace(w,'\','\\'),'%','\%'),'_','\_') || '%'))
    and (p_skills is null or coalesce(array_length(p_skills,1),0) = 0 or exists (
          select 1 from unnest(b.skills) s where lower(s) in (select lower(x) from unnest(p_skills) x)))
    and (p_include_busy or b.av <> 'indispo')
  order by case b.av when 'dispo' then 0 when 'calendrier' then 1 when 'verifier' then 2 else 3 end, b.internal_score desc, b.display_name
  limit 100;
end $$;
grant execute on function public.search_experts(text,text[],date,boolean) to authenticated;


-- Diagnostic d'installation (page /diagnostic) : ne renvoie que des booléens, jamais de données
create or replace function public.setup_status() returns json language sql stable security definer set search_path = public as $$
  select json_build_object(
    'has_profiles', exists(select 1 from public.profiles),
    'has_admin', exists(select 1 from public.profiles where is_admin),
    'invite_only', coalesce((select value from public.app_settings where key = 'invite_only'), 'true') = 'true',
    'trigger_ok', exists(select 1 from pg_trigger where tgname = 'on_auth_user_created' and not tgisinternal)
  )
$$;
grant execute on function public.setup_status() to anon, authenticated;

-- ---------------------------------------------------------------------
-- 10. RLS + droits par colonne
-- ---------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.media_proofs enable row level security;
alter table public.availability_blocks enable row level security;
alter table public.shortlists enable row level security;
alter table public.invitations enable row level security;
alter table public.notifications enable row level security;
alter table public.wanteds enable row level security;
alter table public.wanted_recipients enable row level security;
alter table public.wanted_proposals enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_members enable row level security;
alter table public.messages enable row level security;

-- profiles : on voit les profils publiés + le sien (+ tout pour un admin)
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles for select to authenticated
  using (published or id = auth.uid() or public.is_admin());
drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());
-- Droits par colonne : internal_score / caste / is_admin / criteria ne sont ni lisibles ni modifiables côté client
revoke all on public.profiles from anon, authenticated;
grant select (id, caste, display_name, headline, bio, city, photo_url, skills, keywords, links, published, calendar_active, criteria, invited_by, created_at, updated_at) on public.profiles to authenticated;
grant update (display_name, headline, bio, city, photo_url, skills, keywords, links, published, calendar_active) on public.profiles to authenticated;

-- media_proofs
drop policy if exists proofs_select on public.media_proofs;
create policy proofs_select on public.media_proofs for select to authenticated
  using (profile_id = auth.uid() or exists(select 1 from public.profiles p where p.id = profile_id and p.published));
drop policy if exists proofs_write on public.media_proofs;
create policy proofs_write on public.media_proofs for all to authenticated
  using (profile_id = auth.uid()) with check (profile_id = auth.uid());

-- availability_blocks
drop policy if exists avail_select on public.availability_blocks;
create policy avail_select on public.availability_blocks for select to authenticated
  using (profile_id = auth.uid() or exists(select 1 from public.profiles p where p.id = profile_id and p.published));
drop policy if exists avail_write on public.availability_blocks;
create policy avail_write on public.availability_blocks for all to authenticated
  using (profile_id = auth.uid()) with check (profile_id = auth.uid());

-- shortlists
drop policy if exists shortlists_all on public.shortlists;
create policy shortlists_all on public.shortlists for all to authenticated
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- invitations : l'invitant gère les siennes (admin : toutes)
drop policy if exists invitations_select on public.invitations;
create policy invitations_select on public.invitations for select to authenticated using (inviter_id = auth.uid() or public.is_admin());
drop policy if exists invitations_insert on public.invitations;
create policy invitations_insert on public.invitations for insert to authenticated with check (inviter_id = auth.uid());
drop policy if exists invitations_update on public.invitations;
create policy invitations_update on public.invitations for update to authenticated using (inviter_id = auth.uid()) with check (inviter_id = auth.uid());
revoke all on public.invitations from anon, authenticated;
grant select on public.invitations to authenticated;
grant insert (inviter_id, email, name, caste, message) on public.invitations to authenticated;
grant update (status, email_sent_at) on public.invitations to authenticated;

-- notifications : chacun les siennes ; création uniquement par les fonctions
drop policy if exists notifications_select on public.notifications;
create policy notifications_select on public.notifications for select to authenticated using (profile_id = auth.uid());
drop policy if exists notifications_update on public.notifications;
create policy notifications_update on public.notifications for update to authenticated using (profile_id = auth.uid()) with check (profile_id = auth.uid());
revoke all on public.notifications from anon, authenticated;
grant select on public.notifications to authenticated;
grant update (read_at) on public.notifications to authenticated;

-- wanteds
drop policy if exists wanteds_select on public.wanteds;
create policy wanteds_select on public.wanteds for select to authenticated using (author_id = auth.uid() or public.is_wanted_recipient(id) or public.is_admin());
drop policy if exists wanteds_update on public.wanteds;
create policy wanteds_update on public.wanteds for update to authenticated using (author_id = auth.uid()) with check (author_id = auth.uid());
revoke all on public.wanteds from anon, authenticated;
grant select on public.wanteds to authenticated;
grant update (status) on public.wanteds to authenticated;

drop policy if exists wrecip_select on public.wanted_recipients;
create policy wrecip_select on public.wanted_recipients for select to authenticated using (recipient_id = auth.uid() or public.is_wanted_author(wanted_id));
drop policy if exists wrecip_update on public.wanted_recipients;
create policy wrecip_update on public.wanted_recipients for update to authenticated using (recipient_id = auth.uid()) with check (recipient_id = auth.uid());
revoke all on public.wanted_recipients from anon, authenticated;
grant select on public.wanted_recipients to authenticated;
grant update (status, response) on public.wanted_recipients to authenticated;

drop policy if exists wprop_select on public.wanted_proposals;
create policy wprop_select on public.wanted_proposals for select to authenticated using (proposer_id = auth.uid() or public.is_wanted_author(wanted_id));
drop policy if exists wprop_insert on public.wanted_proposals;
create policy wprop_insert on public.wanted_proposals for insert to authenticated with check (proposer_id = auth.uid() and public.is_wanted_recipient(wanted_id));
revoke all on public.wanted_proposals from anon, authenticated;
grant select on public.wanted_proposals to authenticated;
grant insert (wanted_id, proposer_id, expert_id, note) on public.wanted_proposals to authenticated;

-- messagerie : on ne voit que ses conversations
drop policy if exists conv_select on public.conversations;
create policy conv_select on public.conversations for select to authenticated using (public.is_member(id));
drop policy if exists members_select on public.conversation_members;
create policy members_select on public.conversation_members for select to authenticated using (public.is_member(conversation_id));
drop policy if exists members_update on public.conversation_members;
create policy members_update on public.conversation_members for update to authenticated using (profile_id = auth.uid()) with check (profile_id = auth.uid());
drop policy if exists messages_select on public.messages;
create policy messages_select on public.messages for select to authenticated using (public.is_member(conversation_id));
drop policy if exists messages_insert on public.messages;
create policy messages_insert on public.messages for insert to authenticated with check (sender_id = auth.uid() and public.is_member(conversation_id));
revoke all on public.conversations, public.conversation_members, public.messages from anon, authenticated;
grant select on public.conversations, public.conversation_members, public.messages to authenticated;
grant update (last_read_at) on public.conversation_members to authenticated;
grant insert (conversation_id, sender_id, body) on public.messages to authenticated;

-- autres tables : droits de base
revoke all on public.media_proofs, public.availability_blocks, public.shortlists from anon, authenticated;
grant select, insert, update, delete on public.media_proofs, public.availability_blocks, public.shortlists to authenticated;
revoke all on public.app_settings from anon, authenticated;

-- ---------------------------------------------------------------------
-- 11. Temps réel + stockage des photos (ignorés si indisponibles)
-- ---------------------------------------------------------------------
do $$ begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    begin alter publication supabase_realtime add table public.messages; exception when duplicate_object then null; end;
    begin alter publication supabase_realtime add table public.notifications; exception when duplicate_object then null; end;
  end if;
end $$;

do $$ begin
  if exists (select 1 from information_schema.schemata where schema_name = 'storage') then
    insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true) on conflict (id) do nothing;
    drop policy if exists avatars_read on storage.objects;
    create policy avatars_read on storage.objects for select using (bucket_id = 'avatars');
    drop policy if exists avatars_insert on storage.objects;
    create policy avatars_insert on storage.objects for insert to authenticated
      with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
    drop policy if exists avatars_update on storage.objects;
    create policy avatars_update on storage.objects for update to authenticated
      using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
    drop policy if exists avatars_delete on storage.objects;
    create policy avatars_delete on storage.objects for delete to authenticated
      using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
  end if;
end $$;
