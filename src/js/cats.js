(() => {
    "use strict";

    const button = document.getElementById("share-cat");
    if (!button) return;
    const english = () => document.documentElement.lang === "en";

    // Only accept images from the expected CATAAS address
    function valid(image) {
        return (
            typeof image?.url === "string" &&
            /^https:\/\/cataas\.com\/cat\/[a-zA-Z0-9_-]+$/.test(image.url)
        );
    }

    // Build the photo message and keep the provider link visible
    function render(image) {
        const article = document.createElement("article");
        article.className = "cat-message";
        const figure = document.createElement("figure");
        const photo = document.createElement("img");
        photo.src = image.url;
        photo.alt = english() ? "Random cat photo" : "Photo de chat aléatoire";
        photo.loading = "lazy";
        const caption = document.createElement("figcaption");
        const link = document.createElement("a");
        link.href = image.url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = "CATAAS";
        photo.addEventListener(
            "error",
            () => {
                photo.hidden = true;
                link.textContent = english()
                    ? "Photo unavailable · CATAAS"
                    : "Photo indisponible · CATAAS";
            },
            { once: true }
        );
        caption.append(link);
        figure.append(photo, caption);
        article.append(figure);
        return article;
    }

    async function send(channelId = window.conversationView?.activeId) {
        if (!window.conversationView?.ready || button.dataset.busy === "true") return false;
        button.dataset.busy = "true";
        button.disabled = true;
        try {
            const response = await fetch("https://cataas.com/cat?json=true", {
                headers: { Accept: "application/json" },
                signal: AbortSignal.timeout(15000)
            });
            if (!response.ok) throw new Error("Cat request failed");
            const data = await response.json();
            if (data.mimetype && !data.mimetype.startsWith("image/"))
                throw new Error("Invalid cat image");
            if (!/^[a-zA-Z0-9_-]{1,100}$/.test(data.id)) throw new Error("Invalid cat ID");
            // Save a stable image address so everyone sees the same cat.
            const image = { url: `https://cataas.com/cat/${data.id}` };
            await window.conversationView.send(
                { kind: "cat", body: null, weather: null, image },
                channelId
            );
            return true;
        } finally {
            button.dataset.busy = "false";
            button.disabled = !window.conversationView?.ready;
        }
    }

    window.chatCats = { valid, render, send };
    button.addEventListener("click", async () => {
        const channelId = window.conversationView?.activeId;
        try {
            await send(channelId);
        } catch {
            if (window.conversationView?.activeId === channelId) {
                document.getElementById("weather-status").textContent = english()
                    ? "The cat photo could not be sent. Try again."
                    : "La photo de chat n’a pas pu être envoyée. Réessaie.";
            }
        }
    });

    function translate() {
        button.textContent = english() ? "Cat" : "Chat";
        button.title = english()
            ? "Send a random cat photo (/cat)"
            : "Envoyer une photo de chat (/cat)";
        button.setAttribute("aria-label", button.title);
    }
    new MutationObserver(translate).observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["lang"]
    });
    translate();
})();
