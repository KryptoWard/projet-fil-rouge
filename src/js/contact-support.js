(() => {
    "use strict";
    const form = document.getElementById("form-contact");
    if (!form) return;
    const button = form.querySelector("button[type=submit]");
    const status = form.querySelector("[role=status]");
    const text = {
        fr: {
            sending: "Envoi en cours…",
            sent: "Ton message a été envoyé. Nous te répondrons par e-mail.",
            limited: "Trop de messages ont été envoyés. Réessaie plus tard.",
            unavailable: "L’envoi est momentanément indisponible. Tu peux écrire à contact@a49.fr.",
            failed: "L’envoi n’a pas pu être confirmé. Réessaie plus tard ou écris à contact@a49.fr."
        },
        en: {
            sending: "Sending…",
            sent: "Your message was sent. We will reply by email.",
            limited: "Too many messages have been sent. Please try again later.",
            unavailable: "Sending is temporarily unavailable. You can email contact@a49.fr.",
            failed: "We could not confirm delivery. Try again later or email contact@a49.fr."
        }
    };
    // Keep the delivery status in the current interface language
    const show = key => {
        status.textContent = text[document.documentElement.lang === "en" ? "en" : "fr"][key];
        status.hidden = false;
        status.dataset.contactStatus = key;
        status.classList.toggle("erreur", !["sending", "sent"].includes(key));
    };
    new MutationObserver(() => {
        if (status.dataset.contactStatus) show(status.dataset.contactStatus);
    }).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
    button.disabled = false;
    // Send the form to the separate mail service and check its reply
    form.addEventListener("submit", async event => {
        event.preventDefault();
        if (button.disabled || !form.reportValidity()) return;
        button.disabled = true;
        form.setAttribute("aria-busy", "true");
        show("sending");
        try {
            const response = await fetch("https://mail.a49.fr/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: form.querySelector("#contact-name").value.trim(),
                    email: form.querySelector("#contact-email").value.trim(),
                    subject: form.querySelector("#contact-subject").value.trim(),
                    message: form.querySelector("#contact-message").value.trim(),
                    website: form.querySelector("#contact-website").value
                })
            });
            const data = await response.json();
            if (!response.ok || data?.sent !== true) {
                const code = response.status;
                show(code === 429 ? "limited" : code === 503 || code === 404 ? "unavailable" : "failed");
                return;
            }
            form.reset();
            show("sent");
        } catch {
            show("unavailable");
        } finally {
            button.disabled = false;
            form.removeAttribute("aria-busy");
        }
    });
})();
