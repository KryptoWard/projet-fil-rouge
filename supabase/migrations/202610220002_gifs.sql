begin;

alter table public.chat_messages add column if not exists gif jsonb;

alter table public.chat_messages drop constraint if exists chat_messages_kind_check;
alter table public.chat_messages add constraint chat_messages_kind_check
check (kind in ('text', 'weather', 'gif'));

alter table public.chat_messages drop constraint if exists chat_messages_content_check;
alter table public.chat_messages add constraint chat_messages_content_check check (
    (kind = 'text' and body is not null and char_length(btrim(body)) between 1 and 4000
        and weather is null and gif is null)
    or
    (kind = 'weather' and body is null and gif is null and weather is not null
        and jsonb_typeof(weather) = 'object' and octet_length(weather::text) <= 32768
        and jsonb_typeof(weather->'city') = 'object'
        and jsonb_typeof(weather->'weather') = 'object'
        and coalesce(jsonb_typeof(weather->'city'->'name') = 'string', false)
        and coalesce(jsonb_typeof(weather->'weather'->'temperature_2m') = 'number', false)
        and coalesce(jsonb_typeof(weather->'weather'->'apparent_temperature') = 'number', false)
        and coalesce(jsonb_typeof(weather->'weather'->'wind_speed_10m') = 'number', false)
        and coalesce(jsonb_typeof(weather->'weather'->'weather_code') = 'number', false))
    or
    (kind = 'gif' and body is null and weather is null and gif is not null
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
);

grant insert (gif) on public.chat_messages to authenticated;
notify pgrst, 'reload schema';

commit;
