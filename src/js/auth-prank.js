(() => {
    const dialog = document.getElementById("auth-prank");
    if (!dialog) return;
    const form = dialog.querySelector("form");
    const input = document.getElementById("auth-prank-code");
    const number = document.getElementById("auth-prank-number");
    const error = document.getElementById("auth-prank-error");
    const text = {
        fr: {
            title: "Vérification A2F (presque)", before: "Nous avons envoyé le code",
            after: "à la boîte mail suivante :", label: "Recopie le code (il est juste au-dessus)",
            note: "Vérification pour rire : aucun e-mail envoyé. La vraie confirmation du compte reste séparée.",
            confirm: "Valider le code", cancel: "Annuler",
            error: "Ce n’est pas le bon code. Indice : il est écrit juste au-dessus."
        },
        en: {
            title: "Two-factor verification (almost)", before: "We have sent the code",
            after: "to this email address:", label: "Copy the code (it is right above)",
            note: "Just a joke: no email was sent. Real account confirmation is separate.",
            confirm: "Verify code", cancel: "Cancel",
            error: "That is not the right code. Hint: it is written right above."
        }
    };
    let finish = null;
    function end(confirmed) {
        const resolve = finish;
        finish = null;
        dialog.close();
        resolve?.(confirmed);
    }
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
