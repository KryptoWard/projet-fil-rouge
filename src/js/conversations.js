(() => {
    "use strict";

    const page = document.querySelector(".page-conversations");
    if (!page) return;
    const api = window.chatApi;
    const byId = id => document.getElementById(id);
    const list = byId("channel-list");
    const messages = byId("message-list");
    const input = byId("message");
    const search = byId("channel-search");
    const dialog = byId("channel-dialog");
    const createForm = byId("channel-create-form");
    const toggle = byId("toggle-channels");
    const scroll = byId("thread-scroll");
    const older = byId("load-older");
    const texts = {
        fr: {
            channels: "Canaux",
            newChannel: "Créer un canal",
            name: "Nom du canal",
            topic: "Description (facultatif)",
            cancel: "Annuler",
            create: "Créer",
            noResults: "Aucun canal trouvé.",
            welcome: "La discussion commence ici. Partagez votre premier message.",
            search: "Rechercher un canal",
            general: "Général",
            description: "Un espace pour échanger au quotidien.",
            start: "Bienvenue dans",
            duplicate: "Ce nom de canal est déjà utilisé.",
            invalid: "Saisissez un nom de canal.",
            showChannels: "Afficher les canaux",
            messages: "Messages",
            me: "Moi",
            member: "Membre",
            connecting: "Connexion…",
            synced: "En direct",
            polling: "Actualisation",
            offline: "Hors connexion",
            unavailable: "Indisponible",
            failed: "Impossible de charger la discussion. Vérifie ta connexion et réessaie.",
            setup: "La messagerie doit encore être activée sur le serveur.",
            older: "Messages précédents",
            retry: "Réessayer",
            shared: "Visible par tous les utilisateurs connectés du site."
        },
        en: {
            channels: "Channels",
            newChannel: "Create a channel",
            name: "Channel name",
            topic: "Description (optional)",
            cancel: "Cancel",
            create: "Create",
            noResults: "No channels found.",
            welcome: "The conversation starts here. Share your first message.",
            search: "Search channels",
            general: "General",
            description: "A space for everyday conversations.",
            start: "Welcome to",
            duplicate: "This channel name is already in use.",
            invalid: "Enter a channel name.",
            showChannels: "Show channels",
            messages: "Messages",
            me: "Me",
            member: "Member",
            connecting: "Connecting…",
            synced: "Live",
            polling: "Refreshing",
            offline: "Offline",
            unavailable: "Unavailable",
            failed: "Unable to load this conversation. Check your connection and try again.",
            setup: "Messaging still needs to be enabled on the server.",
            older: "Earlier messages",
            retry: "Try again",
            shared: "Visible to all signed-in users on this site."
        }
    };

    const words = () => texts[document.documentElement.lang] || texts.fr;
    const normalize = value =>
        value
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase();
    let user = null;
    let channels = [];
    let view = null;
    let ready = false;
    let subscription = null;
    let authListener = null;
    let poll = null;
    let live = false;
    let connection = "connecting";
    let lastError = null;
    let initializing = false;
    const drafts = new Map();
    const channelName = channel => (channel.is_default ? words().general : channel.name);
    const sorted = context =>
        [...context.rows.values()].sort(
            (a, b) => a.created_at.localeCompare(b.created_at) || a.id.localeCompare(b.id)
        );

    function setConnection(state) {
        connection = state;
        byId("chat-connection").textContent = words()[state];
    }

    function writable(value) {
        ready = value;
        [
            input,
            byId("share-weather"),
            byId("share-gif"),
            document.querySelector(".send-message"),
            byId("new-channel")
        ].forEach(element => {
            element.disabled = !value || element.dataset.busy === "true";
        });
    }

    function report(error) {
        if (error?.status === 401 || ["PGRST301", "PGRST303"].includes(error?.code)) {
            writable(false);
            window.location.replace("index.html");
            return;
        }
        lastError = ["PGRST205", "42P01"].includes(error?.code) ? "setup" : "failed";
        byId("chat-error").textContent = words()[lastError];
        byId("chat-error").hidden = false;
        byId("retry-chat").hidden = false;
        setConnection(navigator.onLine ? "unavailable" : "offline");
    }

    function clearError() {
        lastError = null;
        byId("chat-error").hidden = true;
        byId("retry-chat").hidden = true;
    }

    function renderChannels() {
        list.replaceChildren();
        const query = normalize(search.value.trim());
        channels
            .filter(channel => normalize(channelName(channel)).includes(query))
            .forEach(channel => {
                const item = document.createElement("li");
                const button = document.createElement("button");
                const label = document.createElement("span");
                button.type = "button";
                button.dataset.channelId = channel.id;
                button.setAttribute("aria-current", String(channel.id === view?.id));
                label.textContent = channelName(channel);
                button.title = channelName(channel);
                button.append(label);
                button.addEventListener("click", () => selectChannel(channel.id));
                item.append(button);
                list.append(item);
            });
        byId("channel-no-results").hidden = !user || list.childElementCount > 0;
    }

    function renderHeading() {
        const channel = channels.find(entry => entry.id === view?.id);
        byId("thread-welcome").hidden = !ready || !channel || view.rows.size > 0;
        if (!channel) return;
        byId("channel-title").textContent = channelName(channel);
        const description = byId("channel-description");
        description.textContent = channel.is_default ? words().description : channel.description;
        description.hidden = !description.textContent;
        byId("welcome-title").textContent = `${words().start} # ${channelName(channel)}`;
    }

    function renderMessages(stickToBottom = false) {
        if (!view) return;
        const position = scroll.scrollTop;
        const fragment = document.createDocumentFragment();
        sorted(view).forEach(message => {
            const item = document.createElement("li");
            item.dataset.messageId = message.id;
            let article;
            if (message.kind === "weather" && window.weatherCards?.valid(message.weather)) {
                article = window.weatherCards.render(message.weather.city, message.weather.weather);
            } else if (message.kind === "gif" && window.chatGifs?.valid(message.gif)) {
                article = window.chatGifs.render(message.gif);
            } else {
                article = document.createElement("article");
                article.className = "text-message";
                const paragraph = document.createElement("p");
                paragraph.textContent = message.kind === "text" ? message.body : "—";
                article.append(paragraph);
            }
            if (message.sender_id === user.id) article.classList.add("local-message");
            const author = document.createElement("h3");
            author.textContent =
                message.sender_id === user.id
                    ? words().me
                    : message.author?.display_name || words().member;
            article.prepend(author);
            const time = document.createElement("time");
            time.className = "message-time";
            time.dateTime = message.created_at;
            time.textContent = new Date(message.created_at).toLocaleString(
                document.documentElement.lang,
                { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }
            );
            article.append(time);
            item.append(article);
            fragment.append(item);
        });
        messages.replaceChildren(fragment);
        renderHeading();
        scroll.scrollTop = stickToBottom ? scroll.scrollHeight : position;
    }

    function merge(context, rows, forceBottom = false) {
        rows.forEach(row => context.rows.set(row.id, row));
        if (view === context) {
            const nearBottom = scroll.scrollHeight - scroll.scrollTop - scroll.clientHeight < 90;
            renderMessages(forceBottom || nearBottom);
        }
    }

    async function refreshChannels() {
        const data = await api.channels();
        channels = data;
        renderChannels();
        renderHeading();
    }
    // Read messages missed during a disconnect, using a stable timestamp and ID cursor.

    async function sync() {
        const context = view;
        if (!context || context.syncing || !ready) return;
        context.syncing = true;
        try {
            let latest = context.cursor;
            if (!latest) {
                const rows = await api.history(context.id);
                if (view !== context) return;
                context.oldest = rows.at(-1);
                context.cursor = rows[0] || null;
                older.hidden = rows.length < 50;
                merge(context, rows);
            } else {
                let rows;
                do {
                    rows = await api.after(context.id, latest);
                    if (view !== context) return;
                    merge(context, rows);
                    latest = rows.at(-1) || latest;
                    context.cursor = latest;
                } while (rows.length === 100);
            }
            if (view === context) {
                clearError();
                setConnection(live ? "synced" : "polling");
            }
        } catch (error) {
            if (view === context) report(error);
        } finally {
            context.syncing = false;
        }
    }

    async function selectChannel(id) {
        if (view) drafts.set(view.id, input.value);
        writable(false);
        clearError();
        setConnection("connecting");
        void api.unsubscribe(subscription);
        live = false;
        const context = { id, rows: new Map(), oldest: null, cursor: null, syncing: false };
        view = context;
        input.value = drafts.get(id) || "";
        messages.dataset.channelId = id;
        messages.replaceChildren();
        older.hidden = true;
        byId("weather-status").textContent = "";
        page.classList.remove("channels-open");
        toggle.setAttribute("aria-expanded", "false");
        renderChannels();
        renderHeading();
        subscription = api.subscribe(
            id,
            async messageId => {
                try {
                    const row = await api.message(messageId);
                    if (view === context) merge(context, [row]);
                } catch (error) {
                    if (view === context) report(error);
                }
            },
            () => {
                refreshChannels().catch(report);
            },
            status => {
                if (view !== context) return;
                live = status === "SUBSCRIBED";
                if (ready) {
                    if (live) void sync();
                    setConnection(live ? "synced" : "polling");
                }
            }
        );
        try {
            const rows = await api.history(id);
            if (view !== context) return;
            context.oldest = rows.at(-1);
            context.cursor = rows[0] || null;
            older.hidden = rows.length < 50;
            writable(true);
            merge(context, rows, true);
            setConnection(live ? "synced" : "polling");
            void sync();
        } catch (error) {
            if (view === context) report(error);
        }
    }

    window.conversationView = {
        get activeId() {
            return view?.id;
        },
        get ready() {
            return ready;
        },
        clearDraft(channelId, originalInput) {
            if (drafts.get(channelId) === originalInput) drafts.delete(channelId);
            if (view?.id === channelId && input.value === originalInput) input.value = "";
        },

        async send(content, channelId = view?.id) {
            if (!user || !channelId || !channels.some(channel => channel.id === channelId))
                throw new Error("Chat unavailable");
            const row = await api.send(channelId, user.id, content);
            if (view?.id === channelId) merge(view, [row], true);
            return row;
        }
    };

    older.addEventListener("click", async () => {
        const context = view;
        if (!context?.oldest) return;
        older.disabled = true;
        try {
            const rows = await api.history(context.id, context.oldest);
            if (view !== context) return;
            const height = scroll.scrollHeight;
            merge(context, rows);
            context.oldest = rows.at(-1) || context.oldest;
            older.hidden = rows.length < 50;
            scroll.scrollTop += scroll.scrollHeight - height;
        } catch (error) {
            if (view === context) report(error);
        } finally {
            older.disabled = false;
        }
    });

    search.addEventListener("input", renderChannels);
    toggle.addEventListener("click", () => {
        const open = page.classList.toggle("channels-open");
        toggle.setAttribute("aria-expanded", String(open));
        if (open) search.focus();
    });

    byId("new-channel").addEventListener("click", () => {
        createForm.reset();
        byId("channel-error").hidden = true;
        dialog.showModal();
        byId("channel-name").focus();
    });

    byId("cancel-channel").addEventListener("click", () => dialog.close());
    createForm.addEventListener("submit", async event => {
        event.preventDefault();
        const name = byId("channel-name")
            .value.trim()
            .replace(/^#+\s*/, "");
        const errorElement = byId("channel-error");
        if (
            !name ||
            channels.some(channel => normalize(channelName(channel)) === normalize(name))
        ) {
            errorElement.textContent = name ? words().duplicate : words().invalid;
            errorElement.hidden = false;
            return;
        }
        const button = createForm.querySelector('[type="submit"]');
        if (button.disabled) return;
        button.disabled = true;
        try {
            const channel = await api.createChannel(
                name,
                byId("channel-topic").value.trim(),
                user.id
            );
            await refreshChannels();
            search.value = "";
            dialog.close();
            await selectChannel(channel.id);
        } catch (error) {
            errorElement.textContent = error.code === "23505" ? words().duplicate : words().failed;
            errorElement.hidden = false;
        } finally {
            button.disabled = false;
        }
    });

    function translate() {
        document.querySelectorAll("[data-chat-text]").forEach(element => {
            element.textContent = words()[element.dataset.chatText];
        });
        search.placeholder = words().search;
        search.setAttribute("aria-label", words().search);
        toggle.setAttribute("aria-label", words().showChannels);
        byId("channels-navigation").setAttribute("aria-label", words().channels);
        messages.setAttribute("aria-label", words().messages);
        older.textContent = words().older;
        byId("retry-chat").textContent = words().retry;
        if (lastError) byId("chat-error").textContent = words()[lastError];
        setConnection(connection);
        renderChannels();
        renderHeading();
        renderMessages();
    }

    async function initialize() {
        if (initializing) return;
        initializing = true;
        writable(false);
        clearError();
        setConnection("connecting");
        try {
            user = await api.user();
            if (!user) {
                window.location.replace("index.html");
                return;
            }
            if (!authListener)
                authListener = api.onSignOut(() => {
                    writable(false);
                    void api.unsubscribe(subscription);
                    clearInterval(poll);
                    window.location.replace("index.html");
                });
            await refreshChannels();
            if (!channels.length) throw { code: "PGRST205" };
            await selectChannel(
                channels.some(channel => channel.id === view?.id) ? view.id : channels[0].id
            );
            if (!poll)
                poll = setInterval(() => {
                    void sync();
                    refreshChannels().catch(report);
                }, 15000);
        } catch (error) {
            report(error);
        } finally {
            initializing = false;
        }
    }
    byId("retry-chat").addEventListener("click", initialize);
    window.addEventListener("online", () => {
        if (ready) {
            void sync();
            refreshChannels().catch(report);
        } else void initialize();
    });

    window.addEventListener("offline", () => setConnection("offline"));
    document.addEventListener("visibilitychange", () => {
        if (!document.hidden && ready) void sync();
    });

    window.addEventListener("pagehide", () => {
        clearInterval(poll);
        void api.unsubscribe(subscription);
        authListener?.data.subscription.unsubscribe();
    });

    window.addEventListener("pageshow", event => {
        if (event.persisted) {
            poll = null;
            authListener = null;
            void initialize();
        }
    });
    new MutationObserver(translate).observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["lang"]
    });
    writable(false);
    translate();
    void initialize();
})();
