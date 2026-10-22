begin;

-- Chat profiles expose a display name only, never account email addresses.
create table if not exists public.chat_profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    display_name text not null check (char_length(btrim(display_name)) between 1 and 80)
);

create table if not exists public.chat_channels (
    id uuid primary key default gen_random_uuid(),
    name text not null check (char_length(btrim(name)) between 1 and 40),
    description text not null default '' check (char_length(description) <= 120),
    created_by uuid references public.chat_profiles(id) on delete set null,
    is_default boolean not null default false,
    created_at timestamptz not null default now()
);
create unique index if not exists chat_channels_name_key on public.chat_channels (lower(btrim(name)));
create unique index if not exists chat_channels_default_key on public.chat_channels (is_default) where is_default;

create table if not exists public.chat_messages (
    id uuid primary key default gen_random_uuid(),
    channel_id uuid not null references public.chat_channels(id) on delete cascade,
    sender_id uuid not null references public.chat_profiles(id) on delete cascade,
    kind text not null check (kind in ('text', 'weather')),
    body text,
    weather jsonb,
    created_at timestamptz not null default now(),
    constraint chat_messages_content_check check (
        (kind = 'text' and body is not null and char_length(btrim(body)) between 1 and 4000 and weather is null)
        or
        (kind = 'weather' and body is null and weather is not null
            and jsonb_typeof(weather) = 'object' and octet_length(weather::text) <= 32768
            and jsonb_typeof(weather->'city') = 'object'
            and jsonb_typeof(weather->'weather') = 'object'
            and coalesce(jsonb_typeof(weather->'city'->'name') = 'string', false)
            and coalesce(jsonb_typeof(weather->'weather'->'temperature_2m') = 'number', false)
            and coalesce(jsonb_typeof(weather->'weather'->'apparent_temperature') = 'number', false)
            and coalesce(jsonb_typeof(weather->'weather'->'wind_speed_10m') = 'number', false)
            and coalesce(jsonb_typeof(weather->'weather'->'weather_code') = 'number', false))
    )
);
create index if not exists chat_messages_channel_history on public.chat_messages (channel_id, created_at desc, id desc);
create index if not exists chat_messages_sender on public.chat_messages (sender_id);
create index if not exists chat_channels_creator on public.chat_channels (created_by);

create or replace function public.chat_create_profile()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
    insert into public.chat_profiles (id, display_name)
    values (new.id, left(coalesce(nullif(btrim(concat_ws(' ',
        new.raw_user_meta_data->>'first_name', new.raw_user_meta_data->>'last_name')), ''), 'Membre'), 80))
    on conflict (id) do nothing;
    return new;
end;
$$;
revoke all on function public.chat_create_profile() from public, anon, authenticated;
drop trigger if exists chat_profile_created on auth.users;
create trigger chat_profile_created after insert on auth.users for each row execute function public.chat_create_profile();

-- Include accounts that were registered before this migration.
insert into public.chat_profiles (id, display_name)
select id, left(coalesce(nullif(btrim(concat_ws(' ',
    raw_user_meta_data->>'first_name', raw_user_meta_data->>'last_name')), ''), 'Membre'), 80)
from auth.users on conflict (id) do nothing;

insert into public.chat_channels (id, name, description, is_default)
values ('00000000-0000-4000-8000-000000000001', 'Général', 'Un espace pour échanger au quotidien.', true)
on conflict do nothing;

alter table public.chat_profiles enable row level security;
alter table public.chat_channels enable row level security;
alter table public.chat_messages enable row level security;
revoke all on public.chat_profiles, public.chat_channels, public.chat_messages from public, anon, authenticated;
grant select on public.chat_profiles, public.chat_channels, public.chat_messages to authenticated;
grant insert (id, name, description, created_by) on public.chat_channels to authenticated;
grant insert (id, channel_id, sender_id, kind, body, weather) on public.chat_messages to authenticated;

-- Every signed-in user can participate in the site's shared channels.
drop policy if exists chat_profiles_read on public.chat_profiles;
create policy chat_profiles_read on public.chat_profiles for select to authenticated using (true);
drop policy if exists chat_channels_read on public.chat_channels;
create policy chat_channels_read on public.chat_channels for select to authenticated using (true);
drop policy if exists chat_channels_create on public.chat_channels;
create policy chat_channels_create on public.chat_channels for insert to authenticated
with check (created_by = (select auth.uid()) and not is_default);
drop policy if exists chat_messages_read on public.chat_messages;
create policy chat_messages_read on public.chat_messages for select to authenticated using (true);
drop policy if exists chat_messages_send on public.chat_messages;
create policy chat_messages_send on public.chat_messages for insert to authenticated
with check (sender_id = (select auth.uid()));

-- Realtime is scoped to these new tables, without changing existing publications.
do $$
begin
    if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
        create publication supabase_realtime;
    end if;
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'chat_channels') then
        alter publication supabase_realtime add table public.chat_channels;
    end if;
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'chat_messages') then
        alter publication supabase_realtime add table public.chat_messages;
    end if;
end;
$$;

notify pgrst, 'reload schema';
commit;
