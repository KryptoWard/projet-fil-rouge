begin;

alter table public.chat_messages add column if not exists image jsonb;
alter table public.chat_messages add column if not exists edited_at timestamptz;
alter table public.chat_messages drop constraint if exists chat_messages_kind_check;
alter table public.chat_messages add constraint chat_messages_kind_check
check (kind in ('text', 'weather', 'gif', 'cat'));

alter table public.chat_messages drop constraint if exists chat_messages_content_check;
alter table public.chat_messages add constraint chat_messages_content_check check (
    (kind = 'text' and body is not null and char_length(btrim(body)) between 1 and 4000
        and weather is null and gif is null and image is null)
    or
    (kind = 'weather' and image is null and body is null and gif is null and weather is not null
        and jsonb_typeof(weather) = 'object' and octet_length(weather::text) <= 32768
        and jsonb_typeof(weather->'city') = 'object'
        and jsonb_typeof(weather->'weather') = 'object'
        and coalesce(jsonb_typeof(weather->'city'->'name') = 'string', false)
        and coalesce(jsonb_typeof(weather->'weather'->'temperature_2m') = 'number', false)
        and coalesce(jsonb_typeof(weather->'weather'->'apparent_temperature') = 'number', false)
        and coalesce(jsonb_typeof(weather->'weather'->'wind_speed_10m') = 'number', false)
        and coalesce(jsonb_typeof(weather->'weather'->'weather_code') = 'number', false))
    or
    (kind = 'gif' and image is null and body is null and weather is null and gif is not null
        and jsonb_typeof(gif) = 'object' and octet_length(gif::text) <= 8192
        and coalesce(gif->>'provider' = 'klipy', false)
        and coalesce(jsonb_typeof(gif->'id') = 'string' and char_length(gif->>'id') between 1 and 100, false)
        and coalesce(jsonb_typeof(gif->'title') = 'string' and char_length(gif->>'title') <= 200, false)
        and coalesce(jsonb_typeof(gif->'media_url') = 'string'
            and char_length(gif->>'media_url') <= 2048
            and gif->>'media_url' ~ '^https://([a-z0-9-]+[.])*klipy[.]com/[^[:space:]]+$', false)
        and coalesce(jsonb_typeof(gif->'page_url') = 'string'
            and char_length(gif->>'page_url') <= 2048
            and gif->>'page_url' ~ '^https://([a-z0-9-]+[.])*klipy[.]com/[^[:space:]]+$', false))
    or
    (kind = 'cat' and body is null and weather is null and gif is null and image is not null
        and jsonb_typeof(image) = 'object' and octet_length(image::text) <= 4096
        and coalesce(jsonb_typeof(image->'url') = 'string'
            and char_length(image->>'url') <= 2048
            and image->>'url' ~ '^https://cataas[.]com/cat/[a-zA-Z0-9_-]+$', false))
);


-- Clients may only change their own text, without changing authors or dates.
grant insert (image) on public.chat_messages to authenticated;
grant update (body) on public.chat_messages to authenticated;
grant delete on public.chat_messages, public.chat_channels to authenticated;

drop policy if exists chat_messages_edit on public.chat_messages;
create policy chat_messages_edit on public.chat_messages for update to authenticated
using (sender_id = (select auth.uid()) and kind = 'text')
with check (sender_id = (select auth.uid()) and kind = 'text');

drop policy if exists chat_messages_delete on public.chat_messages;
create policy chat_messages_delete on public.chat_messages for delete to authenticated
using (sender_id = (select auth.uid()));

drop policy if exists chat_channels_delete on public.chat_channels;
create policy chat_channels_delete on public.chat_channels for delete to authenticated
using (created_by = (select auth.uid()) and not is_default);

create or replace function public.chat_mark_edited()
returns trigger language plpgsql set search_path = '' as $$
begin
    if new.body is distinct from old.body then
        new.edited_at = now();
    end if;
    return new;
end;
$$;
revoke all on function public.chat_mark_edited() from public, anon, authenticated;
drop trigger if exists chat_message_edited on public.chat_messages;
create trigger chat_message_edited before update on public.chat_messages
for each row execute function public.chat_mark_edited();

notify pgrst, 'reload schema';
commit;
