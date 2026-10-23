(() => {
    "use strict";

    const messageFields = "*,author:chat_profiles(display_name)";
    const client = () => {
        if (!window.messagerieSupabase) throw new Error("CHAT_UNAVAILABLE");
        return window.messagerieSupabase;
    };

    async function result(query) {
        const response = await query;
        if (response.error) throw response.error;
        return response.data;
    }

    const messages = channelId =>
        client().from("chat_messages").select(messageFields).eq("channel_id", channelId);

    // Use the date and ID together to load history without duplicates
    function cursorFilter(cursor, direction) {
        if (!/^[0-9a-f-]{36}$/i.test(cursor.id) || !Number.isFinite(Date.parse(cursor.created_at)))
            throw new Error("Invalid cursor");
        return `created_at.${direction}.${cursor.created_at},and(created_at.eq.${cursor.created_at},id.${direction}.${cursor.id})`;
    }

    window.chatApi = {
        async user() {
            const { data, error } = await client().auth.getUser();
            if (
                error?.name === "AuthSessionMissingError" ||
                ["session_not_found", "refresh_token_not_found"].includes(error?.code)
            )
                return null;
            if (error) throw error;
            return data.user;
        },

        channels() {
            return result(
                client()
                    .from("chat_channels")
                    .select("id,name,description,is_default,created_at,created_by")
                    .order("is_default", { ascending: false })
                    .order("created_at")
                    .order("id")
            );
        },

        createChannel(name, description, userId) {
            return result(
                client()
                    .from("chat_channels")
                    .insert({ id: crypto.randomUUID(), name, description, created_by: userId })
                    .select("id,name,description,is_default,created_at,created_by")
                    .single()
            );
        },

        history(channelId, before = null) {
            let query = messages(channelId);
            if (before) query = query.or(cursorFilter(before, "lt"));
            return result(
                query
                    .order("created_at", { ascending: false })
                    .order("id", { ascending: false })
                    .limit(50)
            );
        },

        after(channelId, cursor) {
            return result(
                messages(channelId)
                    .or(cursorFilter(cursor, "gt"))
                    .order("created_at")
                    .order("id")
                    .limit(100)
            );
        },

        message(id) {
            return result(
                client().from("chat_messages").select(messageFields).eq("id", id).single()
            );
        },

        loadedMessages(ids) {
            return result(client().from("chat_messages").select(messageFields).in("id", ids));
        },

        editMessage(id, body) {
            return result(
                client()
                    .from("chat_messages")
                    .update({ body })
                    .eq("id", id)
                    .select(messageFields)
                    .single()
            );
        },

        deleteMessage(id) {
            return result(
                client().from("chat_messages").delete().eq("id", id).select("id").single()
            );
        },

        deleteChannel(id) {
            return result(
                client().from("chat_channels").delete().eq("id", id).select("id").single()
            );
        },

        send(channelId, userId, content) {
            const message = {
                id: crypto.randomUUID(),
                channel_id: channelId,
                sender_id: userId,
                kind: content.kind,
                body: content.body,
                weather: content.weather
            };
            if (content.kind === "gif") message.gif = content.gif;
            if (content.kind === "cat") message.image = content.image;

            return result(
                client().from("chat_messages").insert(message).select(messageFields).single()
            );
        },

        subscribe(channelId, onMessage, onChannel, onStatus, onDelete = () => {}) {
            return client()
                .channel(`chat:${channelId}:${crypto.randomUUID()}`)
                .on(
                    "postgres_changes",
                    {
                        event: "INSERT",
                        schema: "public",
                        table: "chat_messages",
                        filter: `channel_id=eq.${channelId}`
                    },
                    payload => onMessage(payload.new.id)
                )
                .on(
                    "postgres_changes",
                    {
                        event: "UPDATE",
                        schema: "public",
                        table: "chat_messages",
                        filter: `channel_id=eq.${channelId}`
                    },
                    payload => onMessage(payload.new.id)
                )
                .on(
                    "postgres_changes",
                    { event: "DELETE", schema: "public", table: "chat_messages" },
                    payload => onDelete(payload.old.id)
                )
                .on(
                    "postgres_changes",
                    { event: "*", schema: "public", table: "chat_channels" },
                    onChannel
                )
                .subscribe(onStatus);
        },

        unsubscribe(subscription) {
            if (subscription) return client().removeChannel(subscription);
        },

        onSignOut(callback) {
            return client().auth.onAuthStateChange((event, session) => {
                if (event === "SIGNED_OUT" || (event === "TOKEN_REFRESHED" && !session)) callback();
            });
        }
    };
})();
