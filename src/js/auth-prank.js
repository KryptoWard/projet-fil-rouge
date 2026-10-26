(() => {
    const dialog = document.getElementById("auth-prank");
    if (!dialog) return;
    const form = dialog.querySelector("form");
    const input = document.getElementById("auth-prank-code");
    const number = document.getElementById("auth-prank-number");
    const error = document.getElementById("auth-prank-error");
    const text = {
        fr: {
            title: "Vérification A2F", before: "Nous avons envoyé le code",
            after: "à la boîte mail suivante :", label: "Code de vérification",
            confirm: "Valider le code", cancel: "Annuler",
            error: "Code incorrect. Réessaie."
        },
        en: {
            title: "Two-factor verification", before: "We have sent the code",
            after: "to this email address:", label: "Verification code",
            confirm: "Verify code", cancel: "Cancel",
            error: "Incorrect code. Try again."
        }
    };
    let finish = null;
    // Resolve the waiting authentication step when the dialog closes
    function end(confirmed) {
        const resolve = finish;
        finish = null;
        dialog.close();
        resolve?.(confirmed);
    }
    // Display a new five digit code before continuing to authentication
    window.confirmAuthPrank = email => {
        if (dialog.open) return Promise.resolve(false);
        return new Promise(resolve => {
            const words = text[document.documentElement.lang === "en" ? "en" : "fr"];
            dialog.querySelectorAll("[data-prank-text]").forEach(element => {
                element.textContent = words[element.dataset.prankText];
            });
            number.textContent = String(Math.floor(Math.random() * 100000)).padStart(5, "0");
            document.getElementById("auth-prank-email").textContent = email;
            form.reset();
            error.hidden = true;
            finish = resolve;
            dialog.showModal();
            input.focus();
        });
    };
    // Check the displayed code locally without sending an email
    form.addEventListener("submit", event => {
        event.preventDefault();
        if (input.value !== number.textContent) {
            error.hidden = false;
            input.focus();
            input.select();
            return;
        }
        end(true);
    });
    input.addEventListener("input", () => { error.hidden = true; });
    document.getElementById("auth-prank-cancel").addEventListener("click", () => end(false));
    dialog.addEventListener("cancel", event => { event.preventDefault(); end(false); });
    dialog.addEventListener("close", () => { if (!dialog.open && finish) end(false); });
})();
