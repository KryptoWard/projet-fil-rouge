(() => {
    "use strict";

    // Use the KLIPY key created for this website in the Partner Panel
    const KLIPY_API_KEY = "crIQlMuLVcBNdXKQQpRPjbMwecmQ9R65gxdSqJJlEpxjp9gEzKw3tjv01w2CmJgv";
    const button = document.getElementById("share-gif");
    if (!button) return;

    const dialog = document.getElementById("gif-dialog");
    const form = document.getElementById("gif-search-form");
    const query = document.getElementById("gif-query");
    const results = document.getElementById("gif-results");
    const status = document.getElementById("gif-status");
    const more = document.getElementById("more-gifs");
    const searchButton = document.getElementById("search-gifs");
    const closeButton = document.getElementById("close-gifs");
    const text = {
        fr: {
            title: "Rechercher un GIF",
            label: "Rechercher sur KLIPY",
            search: "Rechercher",
            close: "Fermer",
            more: "Voir plus",
            results: "Résultats des GIF",
            hint: "Écris un mot pour trouver un GIF.",
            loading: "Recherche…",
            sending: "Envoi…",
            empty: "Aucun GIF trouvé.",
            select: "Choisis un GIF pour l’envoyer.",
            missingKey: "La recherche de GIF n’est pas encore configurée.",
            failed: "La recherche a échoué. Réessaie dans un instant.",
            sendFailed: "Le GIF n’a pas pu être enregistré. Réessaie.",
            setup: "Les messages GIF doivent encore être activés sur le serveur.",
            unavailable: "GIF indisponible",
            sent: "GIF envoyé."
        },
        en: {
            title: "Find a GIF",
            label: "Search KLIPY",
            search: "Search",
            close: "Close",
            more: "Load more",
            results: "GIF results",
            hint: "Enter a word to find a GIF.",
            loading: "Searching…",
            sending: "Sending…",
            empty: "No GIFs found.",
            select: "Choose a GIF to send it.",
            missingKey: "GIF search is not configured yet.",
            failed: "Search failed. Please try again shortly.",
            sendFailed: "The GIF could not be saved. Please try again.",
            setup: "GIF messages still need to be enabled on the server.",
            unavailable: "GIF unavailable",
            sent: "GIF sent."
        }
    };
    const words = () => text[document.documentElement.lang] || text.fr;
    let request = null;
    let next = "";
    let lastQuery = "";
    let destination = null;
    let sending = false;
    let message = "hint";

    function feedback(key) {
        message = key;
        status.textContent = words()[key];
    }

    function allowedUrl(value) {
        try {
            const url = new URL(value);
            return (
                url.protocol === "https:" &&
                !url.username &&
                !url.password &&
                !url.port &&
                (url.hostname === "klipy.com" || url.hostname.endsWith(".klipy.com"))
            );
        } catch {
            return false;
        }
    }

    function valid(gif) {
        return (
            gif?.provider === "klipy" &&
            typeof gif.id === "string" &&
            gif.id.length > 0 &&
            gif.id.length <= 100 &&
            typeof gif.title === "string" &&
            gif.title.length <= 200 &&
            typeof gif.media_url === "string" &&
            gif.media_url.length <= 2048 &&
            typeof gif.page_url === "string" &&
            gif.page_url.length <= 2048 &&
            allowedUrl(gif.media_url) &&
            allowedUrl(gif.page_url)
        );
    }

    function render(gif) {
        const article = document.createElement("article");
        article.className = "gif-message";
        const figure = document.createElement("figure");
        const image = document.createElement("img");
        image.src = gif.media_url;
        image.alt = gif.title || "GIF";
        image.loading = "lazy";
        image.addEventListener(
            "error",
            () => {
                image.hidden = true;
                const fallback = document.createElement("p");
                fallback.textContent = words().unavailable;
                figure.prepend(fallback);
            },
            { once: true }
        );
        const caption = document.createElement("figcaption");
        const credit = document.createElement("a");
        credit.href = gif.page_url;
        credit.target = "_blank";
        credit.rel = "noopener noreferrer";
        credit.textContent = "KLIPY";
        caption.append(credit);
        figure.append(image, caption);
        article.append(figure);
        return article;
    }
    window.chatGifs = { valid, render };

    async function send(gif) {
        if (sending || !window.conversationView?.ready || !destination) return;
        sending = true;
        form.inert = true;
        results.inert = true;
        more.disabled = true;
        feedback("sending");
        const channelId = destination;
        try {
            await window.conversationView.send(
                { kind: "gif", body: null, weather: null, gif },
                channelId
            );
            dialog.close();
            if (window.conversationView.activeId === channelId) {
                document.getElementById("weather-status").textContent = words().sent;
            }
        } catch (error) {
            feedback(["PGRST204", "23514"].includes(error.code) ? "setup" : "sendFailed");
        } finally {
            sending = false;
            form.inert = false;
            results.inert = false;
            more.disabled = false;
        }
    }

    function showResult(result) {
        const media = result.media_formats?.gif;
        const preview = result.media_formats?.tinygif || media;
        const gif = {
            provider: "klipy",
            id: String(result.id || ""),
            title: String(result.content_description || result.title || "GIF").slice(0, 200),
            media_url: media?.url,
            page_url: result.itemurl
        };
        const item = document.createElement("li");
        const choice = document.createElement("button");
        choice.type = "button";
        if (valid(gif) && allowedUrl(preview?.url)) {
            const image = document.createElement("img");
            image.src = preview.url;
            image.alt = gif.title;
            image.loading = "lazy";
            choice.setAttribute("aria-label", gif.title);
            choice.append(image);
            choice.addEventListener("click", () => {
                void send(gif);
            });
        } else {
            choice.disabled = true;
            choice.textContent = words().unavailable;
        }
        item.append(choice);
        results.append(item);
    }

    async function search(append = false) {
        if (sending) return;
        request?.abort();
        if (!KLIPY_API_KEY.trim()) {
            feedback("missingKey");
            return;
        }
        if (!query.value.trim()) return;
        const controller = new AbortController();
        request = controller;
        if (!append) {
            results.replaceChildren();
            next = "";
            lastQuery = query.value;
        }
        more.hidden = true;
        more.disabled = true;
        searchButton.disabled = true;
        feedback("loading");
        const url = new URL("https://api.klipy.com/v2/search");
        url.search = new URLSearchParams({
            key: KLIPY_API_KEY,
            q: lastQuery,
            client_key: "projet_fil_rouge",
            locale: document.documentElement.lang,
            contentfilter: "high",
            media_filter: "gif,tinygif",
            limit: "12",
            pos: append ? next : ""
        });
        try {
            const response = await fetch(url, { signal: controller.signal });
            if (!response.ok) throw new Error("GIF search failed");
            const data = await response.json();
            if (request !== controller || !dialog.open) return;
            if (!Array.isArray(data.results)) throw new Error("Invalid GIF response");
            // Keep the provider's result order and load media directly from KLIPY.
            data.results.forEach(showResult);
            next = data.next ? String(data.next) : "";
            more.hidden = !next || next === "0";
            feedback(results.childElementCount ? "select" : "empty");
        } catch (error) {
            if (request === controller && error.name !== "AbortError") feedback("failed");
        } finally {
            if (request === controller) {
                searchButton.disabled = false;
                more.disabled = false;
            }
        }
    }

    function open(searchText = "", channelId = window.conversationView?.activeId) {
        if (sending || !window.conversationView?.ready) return false;
        destination = channelId;
        dialog.showModal();
        feedback(KLIPY_API_KEY.trim() ? "hint" : "missingKey");
        query.value = searchText;
        query.focus();
        if (searchText.trim()) void search();
        return true;
    }
    window.chatGifs.open = open;

    button.addEventListener("click", () => {
        open();
    });
    closeButton.addEventListener("click", () => dialog.close());
    dialog.addEventListener("close", () => {
        request?.abort();
        request = null;
        searchButton.disabled = false;
        more.disabled = false;
    });
    form.addEventListener("submit", event => {
        event.preventDefault();
        void search();
    });
    more.addEventListener("click", () => {
        if (!sending) void search(true);
    });

    function translate() {
        button.setAttribute("aria-label", words().title);
        document.getElementById("gif-dialog-title").textContent = words().title;
        form.querySelector("label").textContent = words().label;
        searchButton.textContent = words().search;
        closeButton.setAttribute("aria-label", words().close);
        more.textContent = words().more;
        results.setAttribute("aria-label", words().results);
        feedback(message);
    }
    new MutationObserver(translate).observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["lang"]
    });
    translate();
})();
