-- Scénarios de test (local, avec stub_supabase.sql). Chaque \echo annonce un test ; une erreur inattendue stoppe le script.
\set ON_ERROR_STOP on
\set A '00000000-0000-0000-0000-00000000000a'
\set B '00000000-0000-0000-0000-00000000000b'
\set C '00000000-0000-0000-0000-00000000000c'
\set D '00000000-0000-0000-0000-00000000000d'
\echo '1. premier inscrit = admin, sans invitation'
insert into auth.users(id,email,raw_user_meta_data) values (:'A','a@x.fr','{"display_name":"Admin A"}');
select is_admin, caste from profiles where id=:'A';

\echo '2. inscription sans invitation refusée ensuite'
do $$ begin
  begin insert into auth.users(id,email) values ('00000000-0000-0000-0000-0000000000ff','z@x.fr'); raise exception 'AURAIT DU ECHOUER';
  exception when others then if sqlerrm like 'AURAIT%' then raise; end if; raise notice 'OK refusé : %', sqlerrm; end;
end $$;

\echo '3. A invite un expert (B) et un média (C) — token, get_invitation en anon'
set role authenticated; select set_config('request.jwt.claim.sub', :'A', false);
insert into invitations(inviter_id,email,name,caste) values (:'A','b@x.fr','Bea Expert','expert'),(:'A','c@x.fr','Chloé Média','media');
reset role;
select token as tok_b from invitations where email='b@x.fr' \gset
select token as tok_c from invitations where email='c@x.fr' \gset
set role anon; select caste,name,status,inviter_name from get_invitation(:'tok_b'); reset role;

\echo '4. B et C s''inscrivent via invitation (la caste vient de l''invitation, pas du client)'
insert into auth.users(id,email,raw_user_meta_data) values (:'B','b@x.fr', json_build_object('invite_token',:'tok_b','caste','media')::jsonb);
insert into auth.users(id,email,raw_user_meta_data) values (:'C','c@x.fr', json_build_object('invite_token',:'tok_c')::jsonb);
select p.display_name, p.caste, p.invited_by = :'A' as invited_by_a from profiles p where id in (:'B',:'C') order by caste;
select status from invitations where token=:'tok_b';
\echo '   token réutilisé → refus'
do $$ begin
  begin insert into auth.users(id,email,raw_user_meta_data) values ('00000000-0000-0000-0000-0000000000ee','r@x.fr', json_build_object('invite_token',(select token from invitations where email='b@x.fr'))::jsonb); raise exception 'AURAIT DU ECHOUER';
  exception when others then if sqlerrm like 'AURAIT%' then raise; end if; raise notice 'OK refusé : %', sqlerrm; end;
end $$;

\echo '5. un expert ne peut pas se promouvoir (caste / admin / score)'
set role authenticated; select set_config('request.jwt.claim.sub', :'B', false);
do $$ begin
  begin update profiles set caste='media' where id = auth.uid(); raise exception 'AURAIT DU ECHOUER';
  exception when insufficient_privilege then raise notice 'OK caste protégée'; end;
  begin update profiles set internal_score=100 where id = auth.uid(); raise exception 'AURAIT DU ECHOUER';
  exception when insufficient_privilege then raise notice 'OK score protégé'; end;
  begin perform internal_score from profiles where id = auth.uid(); raise exception 'AURAIT DU ECHOUER';
  exception when insufficient_privilege then raise notice 'OK score illisible'; end;
end $$;
update profiles set headline='Expert IA', bio='Parle IA et événementiel', city='Paris', skills='{"Intelligence artificielle","Keynote"}', keywords='{"IA","souveraineté"}', published=true where id=auth.uid();
insert into media_proofs(profile_id,url,title,source,kind,metric) values (auth.uid(),'https://ex.fr/a','Passage radio','ex.fr','radio','120 000 auditeurs'),(auth.uid(),'https://ex.fr/b','Tribune','ex.fr','article','');
reset role;
\echo '   score interne recalculé (media=30, perf=20, desir=50, comm=0 → 0.35*50+0.35*30+0.25*20=33)'
select internal_score, criteria from profiles where id=:'B';

\echo '6. recherche : B sans calendrier → « verifier » ; avec calendrier + jour bloqué → indispo masqué'
set role authenticated; select set_config('request.jwt.claim.sub', :'C', false);
update profiles set published=true where id=auth.uid();
select display_name, tier, availability from search_experts('ia', null, '2026-11-03', false);
select count(*) as skill_filter_hit from search_experts(null, array['keynote'], null, false);
select count(*) as no_match from search_experts('zzzz', null, null, false);
select set_config('request.jwt.claim.sub', :'B', false);
update profiles set calendar_active=true where id=auth.uid();
insert into availability_blocks values (auth.uid(),'2026-11-03');
select set_config('request.jwt.claim.sub', :'C', false);
select 'jour bloqué masqué' as t, count(*) from search_experts('ia', null, '2026-11-03', false);
select 'jour bloqué + afficher' as t, availability from search_experts('ia', null, '2026-11-03', true);
select 'autre jour' as t, availability from search_experts('ia', null, '2026-11-04', false);
reset role;

\echo '7. Wanted : C (média) pousse à un intermédiaire D ; expert B refusé comme auteur'
insert into auth.users(id,email,raw_user_meta_data)
  select :'D','d@x.fr', json_build_object('invite_token',token)::jsonb from (select token from invitations limit 0) s;  -- (rien)
insert into invitations(inviter_id,email,name,caste) values (:'A','d@x.fr','Dan Interm','intermediaire');
select token as tok_d from invitations where email='d@x.fr' \gset
insert into auth.users(id,email,raw_user_meta_data) values (:'D','d@x.fr', json_build_object('invite_token',:'tok_d')::jsonb);
set role authenticated; select set_config('request.jwt.claim.sub', :'D', false);
update profiles set published=true where id=auth.uid();
select set_config('request.jwt.claim.sub', :'B', false);
do $$ begin
  begin perform send_wanted('x','','','','',null,array['00000000-0000-0000-0000-00000000000d']::uuid[]); raise exception 'AURAIT DU ECHOUER';
  exception when others then if sqlerrm like 'AURAIT%' then raise; end if; raise notice 'OK refusé : %', sqlerrm; end;
end $$;
select set_config('request.jwt.claim.sub', :'C', false);
select send_wanted('Un expert IA pour le 20h','IA','Grand public','Souveraineté','Brief',null, array[:'D',:'B']::uuid[]) as w \gset
select count(*) as destinataires from wanted_recipients where wanted_id=:'w';  -- B n'est pas intermédiaire → ignoré
select set_config('request.jwt.claim.sub', :'D', false);
select title from wanteds;
select count(*) as notifs_D from notifications where kind='wanted';
update wanted_recipients set status='interested', response='Je propose B' where wanted_id=:'w';
insert into wanted_proposals(wanted_id,proposer_id,expert_id,note) values (:'w', :'D', :'B', 'Parfait');
select set_config('request.jwt.claim.sub', :'C', false);
select kind, title from notifications order by created_at;
select set_config('request.jwt.claim.sub', :'B', false);
select count(*) as wanted_visible_to_B from wanteds;
reset role;

\echo '8. Messagerie : multi-messaging = une conversation privée par destinataire'
set role authenticated; select set_config('request.jwt.claim.sub', :'C', false);
select send_broadcast(array[:'B',:'D']::uuid[], 'Invitation plateau', 'Bonjour, dispo le 20 ?') as envoyes;
select count(*) as mes_convs from conversations;
select set_config('request.jwt.claim.sub', :'B', false);
select count(*) as convs_B, (select count(*) from messages) as msgs_B from conversations;
select count(*) as notifs_message_B from notifications where kind='message';
select set_config('request.jwt.claim.sub', :'D', false);
select count(*) as convs_D from conversations;  -- D ne voit pas la conv C-B
\echo '   B répond dans sa conversation'
select set_config('request.jwt.claim.sub', :'B', false);
insert into messages(conversation_id,sender_id,body) select id, :'B', 'Oui, avec plaisir' from conversations limit 1;
\echo '   B ne peut pas écrire en se faisant passer pour C'
do $$ begin
  begin insert into messages(conversation_id,sender_id,body) select id, '00000000-0000-0000-0000-00000000000c', 'usurpation' from conversations limit 1; raise exception 'AURAIT DU ECHOUER';
  exception when others then if sqlerrm like 'AURAIT%' then raise; end if; raise notice 'OK refusé'; end;
end $$;
\echo '   conversation 1-1 réutilisée'
select set_config('request.jwt.claim.sub', :'C', false);
select start_conversation(:'B','sujet','2e message') = (select id from conversations c where exists(select 1 from conversation_members m where m.conversation_id=c.id and m.profile_id=:'B') limit 1) as reutilisee;
reset role;

\echo '9. Score communauté : A a invité B, C, D → 3 invités = 30'
select criteria->>'community' as community_A from profiles where id=:'A';
\echo '10. Un non-invitant ne voit pas les invitations des autres'
set role authenticated; select set_config('request.jwt.claim.sub', :'B', false);
select count(*) as invitations_vues_par_B from invitations;
reset role;
\echo 'TOUS LES TESTS PASSÉS (vérifier les valeurs affichées ci-dessus)'

\echo '11. my_conversations / get_wanted / my_received_wanteds'
set role authenticated; select set_config('request.jwt.claim.sub', :'B', false);
select peer_name, peer_caste, unread, last_body from my_conversations();
select set_config('request.jwt.claim.sub', :'D', false);
select title, author_name, my_status from my_received_wanteds();
select title, author_name, is_author from get_wanted((select id from wanteds limit 1));
select set_config('request.jwt.claim.sub', :'B', false);
select count(*) as get_wanted_pour_B_doit_etre_0 from get_wanted((select w from (select '00000000-0000-0000-0000-000000000000'::uuid w) x));
reset role;
