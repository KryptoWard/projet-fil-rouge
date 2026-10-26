(() => {
    "use strict";
    const dialog = document.getElementById("logout-game");
    if (!dialog) return;
    const yes = document.getElementById("logout-game-yes");
    const no = document.getElementById("logout-game-no");
    const hint = document.getElementById("logout-game-hint");
    const skip = document.getElementById("logout-game-skip");
    const text = {
        fr: {
            title: "La grande déconnexion", yes: "Oui", no: "Non, je reste", skip: "Se déconnecter directement",
            questions: ["Tu veux vraiment partir ?", "Tu es vraiment, vraiment sûr ?", "Même si on te demande gentiment de rester ?", "Promis, c’est presque la dernière confirmation.", "Bon… d’accord. Une dernière fois : tu pars ?"],
            hint: "Le bouton Oui est un peu timide. Tu peux aussi l’attraper au clavier.",
            caught: "Bon, le bouton s’est calmé. Tu peux cliquer."
        },
        en: {
            title: "The great sign-out", yes: "Yes", no: "No, I’ll stay", skip: "Sign out directly",
            questions: ["Do you really want to leave?", "Are you really, really sure?", "Even if we politely ask you to stay?", "Promise, this is almost the last confirmation.", "Alright… one last time: are you leaving?"],
            hint: "The Yes button is a little shy. You can also catch it with your keyboard.",
            caught: "Alright, the button has calmed down. You can click it."
        }
    };
    let finish = null;
    let step = 0;
    let escapes = 0;
    const words = () => text[document.documentElement.lang === "en" ? "en" : "fr"];
    function resetPosition() { yes.removeAttribute("style"); }
    // Show the next question and reset the moving button
    function render() {
        const t = words();
        document.getElementById("logout-game-title").textContent = t.title;
        document.getElementById("logout-game-message").textContent = t.questions[step];
        document.getElementById("logout-game-progress").textContent = `${step + 1} / ${t.questions.length}`;
        hint.textContent = t.hint;
        yes.textContent = t.yes;
        no.textContent = t.no;
        skip.textContent = t.skip;
        escapes = 0;
        resetPosition();
    }
    function end(confirmed) {
        const resolve = finish;
        finish = null;
        resetPosition();
        dialog.close();
        resolve?.(confirmed);
    }
    // Let the account page wait for the final choice
    window.confirmLogout = () => {
        if (finish) return Promise.resolve(false);
        return new Promise(resolve => {
            finish = resolve;
            step = 0;
            render();
            dialog.showModal();
            no.focus();
        });
    };
    yes.addEventListener("click", () => {
        if (++step === words().questions.length) return end(true);
        render();
        yes.focus();
    });
    // Move the button a few times unless reduced motion is requested
    yes.addEventListener("pointerenter", event => {
        if (event.pointerType !== "mouse" || escapes >= 4 || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const rect = yes.getBoundingClientRect();
        let x, y;
        for (let attempt = 0; attempt < 20; attempt++) {
            x = 16 + Math.random() * Math.max(0, innerWidth - rect.width - 32);
            y = 16 + Math.random() * Math.max(0, innerHeight - rect.height - 32);
            const blocked = [no, skip].some(button => {
                const r = button.getBoundingClientRect();
                return x < r.right + 12 && x + rect.width > r.left - 12 && y < r.bottom + 12 && y + rect.height > r.top - 12;
            });
            if (!blocked && Math.hypot(x - event.clientX, y - event.clientY) > 120) break;
        }
        Object.assign(yes.style, { position: "fixed", left: `${x}px`, top: `${y}px` });
        if (++escapes === 4) hint.textContent = words().caught;
    });
    no.addEventListener("click", () => end(false));
    // Keep a direct way to sign out without finishing the game
    skip.addEventListener("click", () => end(true));
    dialog.addEventListener("cancel", event => { event.preventDefault(); end(false); });
    dialog.addEventListener("close", () => { if (finish) end(false); });
    window.addEventListener("resize", resetPosition);
})();
