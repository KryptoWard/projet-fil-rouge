begin;

alter table public.chat_channels add column if not exists recipient_id uuid references public.chat_profiles(id) on delete cascade;
alter table public.chat_messages add column if not exists mentions uuid[] not null default '{}';
alter table public.chat_messages drop constraint if exists chat_messages_mentions_limit;
alter table public.chat_messages add constraint chat_messages_mentions_limit check (cardinality(mentions) <= 10);
grant insert (recipient_id) on public.chat_channels to authenticated;
grant insert (mentions) on public.chat_messages to authenticated;

create table if not exists public.chat_channel_reads (
    user_id uuid not null references public.chat_profiles(id) on delete cascade,
    channel_id uuid not null references public.chat_channels(id) on delete cascade,
    last_read_at timestamptz not null,
    last_read_id uuid,
    primary key (user_id, channel_id)
);
alter table public.chat_channel_reads enable row level security;
revoke all on public.chat_channel_reads from public, anon, authenticated;
grant select, insert, update on public.chat_channel_reads to authenticated;

create or replace function public.chat_seed_reads()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
    insert into public.chat_channel_reads (user_id, channel_id, last_read_at, last_read_id)
    select new.id, c.id, coalesce(m.created_at, now()), m.id
    from public.chat_channels c
    left join lateral (
        select created_at, id from public.chat_messages where channel_id = c.id
        order by created_at desc, id desc limit 1
    ) m on true
    where c.recipient_id is null or new.id in (c.created_by, c.recipient_id)
    on conflict do nothing;
    return new;
end;
$$;
revoke all on function public.chat_seed_reads() from public, anon, authenticated;
drop trigger if exists chat_profile_seed_reads on public.chat_profiles;
create trigger chat_profile_seed_reads after insert on public.chat_profiles
    for each row execute function public.chat_seed_reads();
insert into public.chat_channel_reads (user_id, channel_id, last_read_at, last_read_id)
select p.id, c.id, coalesce(m.created_at, now()), m.id
from public.chat_profiles p cross join public.chat_channels c
left join lateral (
    select created_at, id from public.chat_messages where channel_id = c.id
    order by created_at desc, id desc limit 1
) m on true
where c.recipient_id is null or p.id in (c.created_by, c.recipient_id)
on conflict do nothing;
create or replace function public.chat_keep_read_forward()
returns trigger language plpgsql set search_path = '' as $$
begin
    if (new.last_read_at, coalesce(new.last_read_id, '00000000-0000-0000-0000-000000000000'::uuid)) <
       (old.last_read_at, coalesce(old.last_read_id, '00000000-0000-0000-0000-000000000000'::uuid)) then
        new.last_read_at = old.last_read_at;
        new.last_read_id = old.last_read_id;
    end if;
    return new;
end;
$$;
revoke all on function public.chat_keep_read_forward() from public, anon, authenticated;
drop trigger if exists chat_channel_read_forward on public.chat_channel_reads;
create trigger chat_channel_read_forward before update on public.chat_channel_reads
    for each row execute function public.chat_keep_read_forward();

-- un compte ne voit que les salons prives dont il fait partie
drop policy if exists chat_channels_read on public.chat_channels;
create policy chat_channels_read on public.chat_channels for select to authenticated
    using (recipient_id is null or created_by = (select auth.uid()) or recipient_id = (select auth.uid()));
drop policy if exists chat_channels_create on public.chat_channels;
create policy chat_channels_create on public.chat_channels for insert to authenticated
    with check (created_by = (select auth.uid()) and not is_default and (
        recipient_id is null or exists (
            select 1 from public.user_contacts c where c.status = 'accepted' and
            ((c.requester_id = (select auth.uid()) and c.addressee_id = recipient_id) or
             (c.addressee_id = (select auth.uid()) and c.requester_id = recipient_id))
        )
    ));
drop policy if exists chat_messages_read on public.chat_messages;
create policy chat_messages_read on public.chat_messages for select to authenticated
    using (exists (select 1 from public.chat_channels c where c.id = channel_id));
drop policy if exists chat_messages_send on public.chat_messages;
create policy chat_messages_send on public.chat_messages for insert to authenticated
    with check (sender_id = (select auth.uid()) and exists (
        select 1 from public.chat_channels c where c.id = channel_id
    ));

drop policy if exists chat_channel_reads_own on public.chat_channel_reads;
create policy chat_channel_reads_own on public.chat_channel_reads for all to authenticated
    using (user_id = (select auth.uid()) and exists (select 1 from public.chat_channels c where c.id = channel_id))
    with check (user_id = (select auth.uid()) and exists (select 1 from public.chat_channels c where c.id = channel_id));

create or replace function public.validate_chat_mentions()
returns trigger language plpgsql set search_path = '' as $$
begin
    if exists (
        select 1 from unnest(new.mentions) mention(id)
        where mention.id is null
           or not exists (select 1 from public.chat_profiles p where p.id = mention.id)
           or not exists (
               select 1 from public.chat_channels c where c.id = new.channel_id and
               (c.recipient_id is null or mention.id in (c.created_by, c.recipient_id))
           )
    ) then raise exception 'Invalid mention target' using errcode = '23514';
    end if;
    return new;
end;
$$;
drop trigger if exists chat_message_mentions_check on public.chat_messages;
create trigger chat_message_mentions_check before insert or update of mentions, channel_id
    on public.chat_messages for each row execute function public.validate_chat_mentions();

create or replace function public.chat_unread_counts()
returns table(channel_id uuid, unread_count bigint, mention_count bigint)
language sql stable security invoker set search_path = '' as $$
    select m.channel_id, count(*)::bigint,
        count(*) filter (where m.mentions @> array[(select auth.uid())])
    from public.chat_messages m
    left join public.chat_channel_reads r on r.channel_id = m.channel_id and r.user_id = (select auth.uid())
    where m.sender_id <> (select auth.uid()) and
        (r.channel_id is null or m.created_at > r.last_read_at or
         (m.created_at = r.last_read_at and (r.last_read_id is null or m.id > r.last_read_id)))
    group by m.channel_id;
$$;
revoke all on function public.chat_unread_counts() from public, anon;
grant execute on function public.chat_unread_counts() to authenticated;

notify pgrst, 'reload schema';
commit;
