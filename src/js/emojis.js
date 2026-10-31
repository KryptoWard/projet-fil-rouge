(() => {
    "use strict";

    // Cache DOM elements
    const button = document.getElementById("share-emoji");
    const dialog = document.getElementById("emoji-dialog");
    const closeBtn = document.getElementById("close-emojis");
    const container = document.getElementById("emoji-picker-container");
    const messageInput = document.getElementById("message");

    if (!button || !dialog || !container || !messageInput) return;

    // categorized emoji palette
    const emojiCategories = [
        {
            name: { fr: "Automne & Nature", en: "Autumn & Nature" },
            emojis: ["🍁", "🍂", "🍃", "🍄", "🌰", "🎃", "☕", "🧣", "🌧️", "🦊", "🦔", "🍎"]
        },
        {
            name: { fr: "Sourires & Émotions", en: "Smiles & Emotions" },
            emojis: ["😊", "😄", "😂", "🥰", "😎", "🤔", "🥳", "🥺", "😴", "😇", "😍", "🤩"]
        },
        {
            name: { fr: "Gestes & Symboles", en: "Gestures & Symbols" },
            emojis: ["👍", "👋", "👏", "🙌", "✨", "🔥", "❤️", "💬", "🎉", "⭐"]
        }
    ];

    // Insert chosen emoji directly at cursor position in the message textarea
    function insertEmoji(emoji) {
        const start = messageInput.selectionStart;
        const end = messageInput.selectionEnd;
        const text = messageInput.value;

        messageInput.value = text.slice(0, start) + emoji + text.slice(end);
        
        // Reposition cursor right after the newly added emoji
        const newPosition = start + emoji.length;
        messageInput.setSelectionRange(newPosition, newPosition);
        messageInput.focus();

        // dispatch input event so drafts and automatic auto-resize handlers recognize the update
        messageInput.dispatchEvent(new Event("input", { bubbles: true }));
    }

    // build the emoji picker DOM hierarchy
    function buildEmojiPicker() {
        container.replaceChildren();
        const currentLang = document.documentElement.lang === "en" ? "en" : "fr";

        emojiCategories.forEach(category => {
            const group = document.createElement("section");
            group.className = "emoji-group";

            const heading = document.createElement("h3");
            heading.textContent = category.name[currentLang] || category.name.fr;
            group.appendChild(heading);

            const grid = document.createElement("div");
            grid.className = "emoji-grid";
            grid.setAttribute("role", "group");
            grid.setAttribute("aria-label", heading.textContent);

            category.emojis.forEach(emoji => {
                const itemBtn = document.createElement("button");
                itemBtn.type = "button";
                itemBtn.className = "emoji-item";
                itemBtn.textContent = emoji;
                itemBtn.setAttribute("aria-label", emoji);

                itemBtn.addEventListener("click", () => {
                    insertEmoji(emoji);
                    dialog.close();
                });

                grid.appendChild(itemBtn);
            });

            group.appendChild(grid);
            container.appendChild(group);
        });
    }

    // Toggle dialog visibility
    button.addEventListener("click", () => {
        buildEmojiPicker();
        dialog.showModal();
    });

    closeBtn.addEventListener("click", () => {
        dialog.close();
    });

    dialog.addEventListener("click", (event) => {
        // Close modal when clicking on the backdrop
        if (event.target === dialog) {
            dialog.close();
        }
    });

    // Sync button disabled state with conversation availability
    const observer = new MutationObserver(() => {
        const sendBtn = document.querySelector(".send-message");
        if (sendBtn) {
            button.disabled = sendBtn.disabled;
        }
    });

    const sendButton = document.querySelector(".send-message");
    if (sendButton) {
        observer.observe(sendButton, { attributes: true, attributeFilter: ["disabled"] });
    }
})();