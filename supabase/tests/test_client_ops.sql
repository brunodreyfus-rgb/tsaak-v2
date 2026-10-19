-- Opérations exactement comme le fait le site (mêmes colonnes) — à lancer APRÈS test_schema.sql sur la même base
\set ON_ERROR_STOP on
\set B '00000000-0000-0000-0000-00000000000b'
\set D '00000000-0000-0000-0000-00000000000d'
\set C '00000000-0000-0000-0000-00000000000c'
set role authenticated; select set_config('request.jwt.claim.sub', :'D', false) \gset
\echo 'profil : lecture PROFILE_COLS + mise à jour liens/tags'
select id,caste,display_name,headline,bio,city,photo_url,skills,keywords,links,published,calendar_active,criteria,invited_by,created_at from profiles where id=auth.uid();
update profiles set display_name='Dan Interm', links='[{"label":"Site","url":"https://ex.fr/"}]'::jsonb, skills='{"Booking"}', keywords='{"radio"}' where id=auth.uid();
\echo 'wanted reçu : vu'
update wanted_recipients set status='seen' where wanted_id=(select id from wanteds limit 1) and status='sent';
\echo 'notifications : marquer lu'
update notifications set read_at=now() where read_at is null;
select count(*) as non_lues from notifications where read_at is null;
select set_config('request.jwt.claim.sub', :'C', false) \gset
\echo 'auteur : clore le wanted ; annuler une invitation ; shortlist ; ordre des preuves'
update wanteds set status='closed';
select status from wanteds;
insert into shortlists(owner_id,expert_id) values (:'C',:'B');
select expert_id from shortlists;
delete from shortlists where owner_id=:'C' and expert_id=:'B';
select set_config('request.jwt.claim.sub', :'B', false) \gset
select title from media_proofs where profile_id=auth.uid() order by published_on desc nulls first;
update conversation_members set last_read_at=now() where conversation_id=(select conversation_id from conversation_members where profile_id=auth.uid() limit 1);
\echo 'un membre ne peut PAS insérer une notification, ni modifier une invitation d''autrui, ni lire app_settings'
do $$ begin
  begin insert into notifications(profile_id,kind,title) values (auth.uid(),'x','y'); raise exception 'AURAIT DU ECHOUER 1'; exception when insufficient_privilege then raise notice 'OK notif'; end;
  begin perform * from app_settings; raise exception 'AURAIT DU ECHOUER 2'; exception when insufficient_privilege then raise notice 'OK settings'; end;
  begin perform notify(auth.uid(),'x','y','z',null); raise exception 'AURAIT DU ECHOUER 3'; exception when insufficient_privilege then raise notice 'OK notify()'; end;
  begin perform recompute_profile_score(auth.uid()); raise exception 'AURAIT DU ECHOUER 4'; exception when insufficient_privilege then raise notice 'OK recompute'; end;
end $$;
reset role;
\echo 'OPS CLIENT OK'
