begin;

alter table public.chat_profiles add column if not exists avatar_path text;
alter table public.chat_profiles add column if not exists message_color text not null default '#a64f32';
alter table public.chat_profiles drop constraint if exists chat_profiles_message_color_check;
alter table public.chat_profiles add constraint chat_profiles_message_color_check
    check (message_color in ('#a64f32', '#6b7051', '#526f80', '#80536b', '#342e27'));
alter table public.chat_profiles drop constraint if exists chat_profiles_avatar_path_check;
alter table public.chat_profiles add constraint chat_profiles_avatar_path_check
    check (avatar_path is null or avatar_path like id::text || '/%');

grant update (display_name, avatar_path, message_color) on public.chat_profiles to authenticated;
drop policy if exists chat_profiles_update_own on public.chat_profiles;
create policy chat_profiles_update_own on public.chat_profiles for update to authenticated
    using (id = (select auth.uid())) with check (id = (select auth.uid()));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('profile-avatars', 'profile-avatars', true, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = excluded.public,
    file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists profile_avatars_insert_own on storage.objects;
create policy profile_avatars_insert_own on storage.objects for insert to authenticated
    with check (bucket_id = 'profile-avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists profile_avatars_update_own on storage.objects;
create policy profile_avatars_update_own on storage.objects for update to authenticated
    using (bucket_id = 'profile-avatars' and (storage.foldername(name))[1] = (select auth.uid())::text)
    with check (bucket_id = 'profile-avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists profile_avatars_delete_own on storage.objects;
create policy profile_avatars_delete_own on storage.objects for delete to authenticated
    using (bucket_id = 'profile-avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

notify pgrst, 'reload schema';
commit;
