(() => {
    "use strict";

    const page = document.querySelector(".page-conversations");
    if (!page) return;
    const api = window.chatApi;
    const byId = id => document.getElementById(id);
    const list = byId("channel-list");
    const messages = byId("message-list");
    const input = byId("message");
    const mentionList = byId("mention-suggestions");
    const search = byId("channel-search");
    const dialog = byId("channel-dialog");
    const createForm = byId("channel-create-form");
    const toggle = byId("toggle-channels");
    const scroll = byId("thread-scroll");
    const older = byId("load-older");
    const texts = {
        fr: {
            mentionLabel: "Personnes à mentionner",
            unreadCount: count => `${count} message${count > 1 ? "s" : ""} non lu${count > 1 ? "s" : ""}`,
            mentionCount: count => `${count} mention${count > 1 ? "s" : ""}`,
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
            shared: "Visible par tous les utilisateurs connectés du site.",
            edit: "Modifier",
            remove: "Supprimer",
            save: "Enregistrer",
            edited: "modifié",
            deleteChannel: "Supprimer le canal",
            confirmMessage: "Supprimer définitivement ce message ?",
            confirmChannel: "Supprimer ce canal et tous ses messages pour tout le monde ?",
            actionFailed: "Action impossible. Vérifie ta connexion et les droits du compte."
        },
        en: {
            mentionLabel: "People to mention",
            unreadCount: count => `${count} unread message${count > 1 ? "s" : ""}`,
            mentionCount: count => `${count} mention${count > 1 ? "s" : ""}`,
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
            shared: "Visible to all signed-in users on this site.",
            edit: "Edit",
            remove: "Delete",
            save: "Save",
            edited: "edited",
            deleteChannel: "Delete channel",
            confirmMessage: "Permanently delete this message?",
            confirmChannel: "Delete this channel and all its messages for everyone?",
            actionFailed: "Action failed. Check your connection and account permissions."
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
    let profiles = [];
    let unread = new Map();
    let unreadMentions = new Map();
    let notificationSubscription = null;
    let audioContext = null;
    let mentionRange = null;
    let mentionIndex = 0;
    let activeMentions = [];
    let previousDraft = input.value;
    const mentionDrafts = new Map();
    const drafts = new Map();
    const channelName = channel => (channel.is_default ? words().general : channel.name);
    const sorted = context =>
        [...context.rows.values()].sort(
            (a, b) => a.created_at.localeCompare(b.created_at) || a.id.localeCompare(b.id)
        );

    function unlockSound() {
        const Audio = window.AudioContext || window.webkitAudioContext;
        if (!Audio) return;
        audioContext ||= new Audio();
        if (audioContext.state === "suspended") void audioContext.resume().catch(() => {});
    }
    // le ping est genere ici sans fichier audio
    function playPing() {
        if (!audioContext || audioContext.state !== "running") return;
        const time = audioContext.currentTime, tone = audioContext.createOscillator(), volume = audioContext.createGain();
        tone.type = "sine";
        tone.frequency.setValueAtTime(880, time);
        tone.frequency.exponentialRampToValueAtTime(660, time + 0.18);
        volume.gain.setValueAtTime(0.001, time);
        volume.gain.exponentialRampToValueAtTime(0.12, time + 0.02);
        volume.gain.exponentialRampToValueAtTime(0.001, time + 0.2);
        tone.connect(volume).connect(audioContext.destination);
        tone.start(time);
        tone.stop(time + 0.21);
    }
    document.addEventListener("pointerdown", unlockSound, { once: true });
    document.addEventListener("keydown", unlockSound, { once: true });

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
            byId("share-cat"),
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
        lastError = ["PGRST202", "PGRST204", "PGRST205", "42P01"].includes(error?.code) ? "setup" : "failed";
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
                
                const prefix = channel.recipient_id ? "🔒 " : "";
                label.className = "channel-name";
                label.textContent = `${prefix}${channelName(channel)}`;
                button.title = channelName(channel);
                button.append(label);
                const count = unread.get(channel.id) || 0;
                button.classList.toggle("has-unread", count > 0);
                if (count) {
                    const badge = document.createElement("span");
                    badge.className = "channel-unread";
                    badge.textContent = count > 99 ? "99+" : String(count);
                    badge.setAttribute("aria-label", words().unreadCount(count));
                    button.append(badge);
                }
                const mentionCount = unreadMentions.get(channel.id) || 0;
                if (mentionCount) {
                    const badge = document.createElement("span");
                    badge.className = "channel-mention-count";
                    badge.textContent = `@${mentionCount > 99 ? "99+" : mentionCount}`;
                    badge.setAttribute("aria-label", words().mentionCount(mentionCount));
                    button.append(badge);
                }
                button.addEventListener("click", () => selectChannel(channel.id));
                item.append(button);
                list.append(item);
            });
        byId("channel-no-results").hidden = !user || list.childElementCount > 0;
    }

    function renderHeading() {
        const channel = channels.find(entry => entry.id === view?.id);
        byId("thread-welcome").hidden = !ready || !channel || view.rows.size > 0;
        const removeChannel = byId("delete-channel");
        removeChannel.hidden =
            !ready || !channel || channel.is_default || channel.created_by !== user?.id;
        removeChannel.textContent = words().deleteChannel;
        if (!channel) return;
        byId("channel-title").textContent = channelName(channel);
        const description = byId("channel-description");
        description.textContent = channel.is_default ? words().description : channel.description;
        description.hidden = !description.textContent;
        byId("welcome-title").textContent = `${words().start} # ${channelName(channel)}`;
    }

    function hideMentionList() {
        mentionRange = null;
        mentionList.hidden = true;
        input.setAttribute("aria-expanded", "false");
        input.removeAttribute("aria-activedescendant");
    }
    function updateMentionDraft() {
        const before = previousDraft, after = input.value;
        let start = 0, oldEnd = before.length, newEnd = after.length;
        while (start < oldEnd && start < newEnd && before[start] === after[start]) start++;
        while (oldEnd > start && newEnd > start && before[oldEnd - 1] === after[newEnd - 1]) { oldEnd--; newEnd--; }
        const shift = newEnd - oldEnd;
        activeMentions = activeMentions.filter(mention => {
            if (oldEnd <= mention.start) { mention.start += shift; mention.end += shift; return true; }
            return start >= mention.end;
        });
        previousDraft = after;
        if (view) mentionDrafts.set(view.id, activeMentions);
    }
    // l identifiant garde la mention fiable si le pseudo change
    function selectMention(profile) {
        if (!mentionRange) return;
        const { start, end } = mentionRange, name = profile.display_name.replace(/\s+/g, " ").trim();
        const token = `@${name}`, insertion = `${token} `, shift = insertion.length - (end - start);
        if (input.value.length + shift > input.maxLength) return hideMentionList();
        activeMentions = activeMentions.filter(mention => {
            if (end <= mention.start) { mention.start += shift; mention.end += shift; return true; }
            return start >= mention.end;
        });
        input.setRangeText(insertion, start, end, "end");
        activeMentions.push({ id: profile.id, name: token, start, end: start + token.length });
        previousDraft = input.value;
        if (view) mentionDrafts.set(view.id, activeMentions);
        hideMentionList();
        input.focus();
    }
    function updateMentionList() {
        const cursor = input.selectionStart, match = /(^|\s)@([^\s@]*)$/.exec(input.value.slice(0, cursor));
        if (!match || !view) return hideMentionList();
        const start = cursor - match[0].length + match[1].length;
        const channel = channels.find(entry => entry.id === view.id);
        const members = channel?.recipient_id ? [channel.created_by, channel.recipient_id] : null;
        const results = profiles.filter(profile => profile.id !== user.id && (!members || members.includes(profile.id)) &&
            normalize(profile.display_name).includes(normalize(match[2]))).slice(0, 6);
        mentionList.replaceChildren();
        if (!results.length) return hideMentionList();
        mentionRange = { start, end: cursor };
        mentionIndex = 0;
        mentionList.setAttribute("aria-label", words().mentionLabel);
        results.forEach((profile, index) => {
            const option = document.createElement("button");
            option.type = "button";
            option.id = `mention-option-${index}`;
            option.setAttribute("role", "option");
            option.setAttribute("aria-selected", String(index === mentionIndex));
            option.textContent = profile.display_name;
            option.addEventListener("mousedown", event => event.preventDefault());
            option.addEventListener("click", () => selectMention(profile));
            mentionList.append(option);
        });
        mentionList.hidden = false;
        input.setAttribute("aria-expanded", "true");
        input.setAttribute("aria-activedescendant", "mention-option-0");
    }
    input.addEventListener("input", () => { updateMentionDraft(); updateMentionList(); });
    input.addEventListener("keydown", event => {
        if (mentionList.hidden) return;
        const options = [...mentionList.children];
        if (event.key === "Escape") { event.preventDefault(); event.stopImmediatePropagation(); hideMentionList(); }
        else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault(); event.stopImmediatePropagation();
            mentionIndex = (mentionIndex + (event.key === "ArrowDown" ? 1 : -1) + options.length) % options.length;
            options.forEach((option, index) => option.setAttribute("aria-selected", String(index === mentionIndex)));
            input.setAttribute("aria-activedescendant", options[mentionIndex].id);
        } else if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault(); event.stopImmediatePropagation();
            options[mentionIndex]?.click();
        }
    }, true);

    // Keep message actions compact and accessible without visible text
    function messageAction(label, icon) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = `message-action message-action-${icon}`;
        button.title = label;
        button.setAttribute("aria-label", label);
        const image = document.createElement("img");
        image.src = `src/assets/svg/${icon}.svg`;
        image.alt = "";
        image.width = 18;
        image.height = 18;
        button.append(image);
        return button;
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
            } else if (message.kind === "cat" && window.chatCats?.valid(message.image)) {
                article = window.chatCats.render(message.image);
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
            if (message.mentions?.includes(user.id)) article.classList.add("mention-for-me");
            article.style.setProperty("--message-color", message.author?.message_color || "#a64f32");
            const author = document.createElement("h3");
            const authorName = message.author?.display_name || words().member;
            author.textContent = authorName;
            // Keep the date and owner tools beside the author
            const header = document.createElement("header");
            header.className = "message-header";
            const avatarPath = message.author?.avatar_path;
            const avatar = document.createElement(avatarPath ? "img" : "span");
            avatar.className = "message-avatar";
            if (avatarPath) {
                avatar.src = window.messagerieSupabase.storage.from("profile-avatars").getPublicUrl(avatarPath).data.publicUrl;
                avatar.alt = "";
            } else {
                avatar.textContent = authorName.trim().split(/\s+/).slice(0, 2).map(part => Array.from(part)[0]).join("").toUpperCase() || "?";
                avatar.setAttribute("aria-hidden", "true");
            }
            header.append(avatar);
            header.append(author);
            article.prepend(header);
            const time = document.createElement("time");
            time.className = "message-time";
            time.dateTime = message.created_at;
            time.textContent = new Date(message.created_at).toLocaleString(
                document.documentElement.lang,
                { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }
            );
            if (message.edited_at) time.textContent += ` · ${words().edited}`;
            header.append(time);
            // Show owner actions while Supabase checks the permissions again
            if (message.sender_id === user.id) {
                const actions = document.createElement("div");
                actions.className = "message-controls";
                if (message.kind === "text") {
                    const edit = messageAction(words().edit, "modifier");
                    edit.addEventListener("click", () => openEditor(message));
                    actions.append(edit);
                }
                const remove = messageAction(words().remove, "supprimer");
                remove.addEventListener("click", async () => {
                    if (!window.confirm(words().confirmMessage)) return;
                    remove.disabled = true;
                    const context = view;
                    try {
                        await api.deleteMessage(message.id);
                        context.rows.delete(message.id);
                        if (view === context) renderMessages();
                    } catch {
                        byId("weather-status").textContent = words().actionFailed;
                    } finally {
                        remove.disabled = false;
                    }
                });
                actions.append(remove);
                header.append(actions);
            }
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
            const reading = forceBottom || nearBottom;
            renderMessages(reading);
            if (reading && document.visibilityState === "visible") void markRead(context);
        }
    }

    function nearBottom() {
        return scroll.scrollHeight - scroll.scrollTop - scroll.clientHeight < 90;
    }
    // le salon passe en lu quand les derniers messages sont affiches
    async function markRead(context) {
        if (!user || !context || document.visibilityState !== "visible") return;
        const latest = sorted(context).at(-1), key = latest?.id || "empty";
        if (context.readKey === key) return;
        context.readKey = key;
        try {
            await api.markRead(user.id, context.id, latest?.created_at || new Date().toISOString(), latest?.id || null);
            unread.set(context.id, 0);
            unreadMentions.set(context.id, 0);
            renderChannels();
        } catch (error) {
            context.readKey = null;
            report(error);
        }
    }
    // le compteur reprend les messages depuis le dernier passage
    async function refreshUnread() {
        const counts = await api.unreadCounts();
        unread = new Map(counts.map(row => [row.channel_id, Number(row.unread_count)]));
        unreadMentions = new Map(counts.map(row => [row.channel_id, Number(row.mention_count)]));
        renderChannels();
    }
    scroll.addEventListener("scroll", () => {
        if (ready && view && document.visibilityState === "visible" && nearBottom()) void markRead(view);
    });
    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible" && ready && view && nearBottom()) void markRead(view);
    });

    async function refreshChannels() {
        const data = await api.channels();
        channels = data;
        await refreshUnread();
        renderHeading();
        if (view && !channels.some(channel => channel.id === view.id)) {
            if (channels.length) await selectChannel(channels[0].id);
            else writable(false);
        }
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
            const ids = [...context.rows.keys()];
            for (let offset = 0; offset < ids.length; offset += 100) {
                const batch = ids.slice(offset, offset + 100);
                const rows = await api.loadedMessages(batch);
                if (view !== context) return;
                const present = new Set(rows.map(row => row.id));
                batch.forEach(id => {
                    if (!present.has(id)) context.rows.delete(id);
                });
                merge(context, rows);
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

    // Keep the current draft before loading another conversation
    async function selectChannel(id) {
        if (view) {
            drafts.set(view.id, input.value);
            mentionDrafts.set(view.id, activeMentions);
        }
        writable(false);
        clearError();
        setConnection("connecting");
        void api.unsubscribe(subscription);
        live = false;
        const context = { id, rows: new Map(), oldest: null, cursor: null, syncing: false };
        view = context;
        input.value = drafts.get(id) || "";
        activeMentions = mentionDrafts.get(id) || [];
        previousDraft = input.value;
        hideMentionList();
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
                    if (view === context && error.code !== "PGRST116") report(error);
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
            },
            messageId => {
                context.rows.delete(messageId);
                if (view === context) renderMessages();
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
            const savedDraft = drafts.get(channelId) === originalInput;
            const currentDraft = view?.id === channelId && input.value === originalInput;
            if (savedDraft) drafts.delete(channelId);
            if (currentDraft || (savedDraft && view?.id !== channelId)) mentionDrafts.delete(channelId);
            if (currentDraft) {
                mentionDrafts.delete(channelId);
                input.value = "";
                activeMentions = [];
                previousDraft = "";
                hideMentionList();
            }
        },

        async send(content, channelId = view?.id) {
            if (!user || !channelId || !channels.some(channel => channel.id === channelId))
                throw new Error("Chat unavailable");
            const mentions = content.kind === "text" && channelId === view?.id
                ? [...new Set(activeMentions.filter(item => input.value.slice(item.start, item.end) === item.name && content.body.includes(item.name)).map(item => item.id))]
                : [];
            const row = await api.send(channelId, user.id, { ...content, mentions });
            if (view?.id === channelId) merge(view, [row], true);
            return row;
        }
    };

    let editing = null;
    const editDialog = byId("edit-message-dialog");
    const editForm = byId("edit-message-form");
    const editInput = byId("edit-message-text");

    function openEditor(message) {
        editing = { id: message.id, context: view };
        editInput.value = message.body;
        byId("edit-message-error").hidden = true;
        editDialog.showModal();
        editInput.focus();
    }

    byId("cancel-edit").addEventListener("click", () => editDialog.close());
    editForm.addEventListener("submit", async event => {
        event.preventDefault();
        const body = editInput.value.trim();
        const button = editForm.querySelector('[type="submit"]');
        if (!body || !editing || button.disabled) return;
        const target = editing;
        button.disabled = true;
        try {
            const row = await api.editMessage(target.id, body);
            merge(target.context, [row]);
            editDialog.close();
        } catch {
            byId("edit-message-error").textContent = words().actionFailed;
            byId("edit-message-error").hidden = false;
        } finally {
            button.disabled = false;
        }
    });

    byId("delete-channel").addEventListener("click", async () => {
        const channel = channels.find(entry => entry.id === view?.id);
        if (!channel || channel.is_default || channel.created_by !== user.id) return;
        if (!window.confirm(words().confirmChannel)) return;
        const button = byId("delete-channel");
        button.disabled = true;
        try {
            await api.deleteChannel(channel.id);
            await refreshChannels();
        } catch {
            byId("weather-status").textContent = words().actionFailed;
        } finally {
            button.disabled = false;
        }
    });

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

    byId("new-channel").addEventListener("click", async () => {
        createForm.reset();
        byId("channel-error").hidden = true;

        const selectPrivacy = byId("channel-privacy");
        if (selectPrivacy) {
            const optionPublic = document.createElement("option"); // Secure creation of the default public option
            optionPublic.value = "public";
            optionPublic.textContent = "Tout le monde (Public)";
            selectPrivacy.replaceChildren(optionPublic); // Clear the select element and add the public option
            const { data: contacts } = await window.messagerieSupabase // Retrieving accepted contacts from Supabase
                .from("user_contacts")
                .select(`
                    id, requester_id, addressee_id,
                    requester:chat_profiles!requester_id(display_name),
                    addressee:chat_profiles!addressee_id(display_name)
                `)
                .eq("status", "accepted");

            if (contacts) {
                contacts.forEach(c => {
                    const estDemandeur = c.requester_id === user.id;
                    const contactId = estDemandeur ? c.addressee_id : c.requester_id;
                    const contactNom = (estDemandeur ? c.addressee : c.requester)?.display_name || "Contact";

                    const option = document.createElement("option");
                    option.value = contactId;
                    option.textContent = `Privé avec ${contactNom}`;
                    selectPrivacy.append(option);
                });
            }
        }

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
        const privacy = byId("channel-privacy")?.value;
        const recipientId = privacy !== "public" ? privacy : null;
        try {
            const channel = await api.createChannel(
                name,
                byId("channel-topic").value.trim(),
                user.id,
                recipientId
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

    function incomingMessage(message) {
        if (!user || message.sender_id === user.id) return;
        if (message.mentions?.includes(user.id)) playPing();
        if (view?.id !== message.channel_id || document.visibilityState !== "visible" || !nearBottom())
            refreshUnread().catch(report);
    }

    // Check the session before loading channels and starting live updates
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
                    void api.unsubscribe(notificationSubscription);
                    notificationSubscription = null;
                    clearInterval(poll);
                    window.location.replace("index.html");
                });
            profiles = await api.profiles();
            if (!notificationSubscription)
                notificationSubscription = api.subscribeAllMessages(incomingMessage, status => {
                    if (status === "SUBSCRIBED") refreshUnread().catch(report);
                });
            await refreshChannels();
            // Open the contact selected on the contacts page
            const targetContactId = window.sessionStorage.getItem("direct_chat_target");
            const targetContactName = window.sessionStorage.getItem("direct_chat_name");

            if (targetContactId) {
                window.sessionStorage.removeItem("direct_chat_target");
                window.sessionStorage.removeItem("direct_chat_name");

                // Look for an existing discussion with this contact
                let existingChannel = channels.find(c => 
                    (c.created_by === user.id && c.recipient_id === targetContactId) ||
                    (c.created_by === targetContactId && c.recipient_id === user.id)
                );

                if (!existingChannel) {
                    // Create a discussion with the contact name if none exists
                    existingChannel = await api.createChannel(
                        targetContactName || "Discussion privée",
                        "Discussion privée",
                        user.id,
                        targetContactId
                    );
                    await refreshChannels();
                }

                await selectChannel(existingChannel.id);
                return;
            }
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
