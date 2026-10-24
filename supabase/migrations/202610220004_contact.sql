begin;

-- Table de gestion des contacts et invitations
create table if not exists public.user_contacts (
    id uuid primary key default gen_random_uuid(),
    requester_id uuid not null references public.chat_profiles(id) on delete cascade,
    addressee_id uuid not null references public.chat_profiles(id) on delete cascade,
    status text not null check (status in ('pending', 'accepted')) default 'pending',
    created_at timestamptz not null default now(),
    constraint user_contacts_no_self check (requester_id <> addressee_id),
    constraint user_contacts_unique unique (requester_id, addressee_id)
);

create index if not exists user_contacts_requester on public.user_contacts (requester_id);
create index if not exists user_contacts_addressee on public.user_contacts (addressee_id);

-- Activation de la sécurité Row Level Security
alter table public.user_contacts enable row level security;
revoke all on public.user_contacts from public, anon, authenticated;
grant select, insert, update, delete on public.user_contacts to authenticated;

-- Politiques RLS
drop policy if exists contacts_read on public.user_contacts;
create policy contacts_read on public.user_contacts for select to authenticated
using (requester_id = (select auth.uid()) or addressee_id = (select auth.uid()));

drop policy if exists contacts_send on public.user_contacts;
create policy contacts_send on public.user_contacts for insert to authenticated
with check (requester_id = (select auth.uid()));

drop policy if exists contacts_update on public.user_contacts;
create policy contacts_update on public.user_contacts for update to authenticated
using (addressee_id = (select auth.uid()));

drop policy if exists contacts_delete on public.user_contacts;
create policy contacts_delete on public.user_contacts for delete to authenticated
using (requester_id = (select auth.uid()) or addressee_id = (select auth.uid()));

-- Ajout au flux temps réel Supabase
do $$
begin
    if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
        if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'user_contacts') then
            alter publication supabase_realtime add table public.user_contacts;
        end if;
    end if;
end;
$$;

notify pgrst, 'reload schema';
commit;