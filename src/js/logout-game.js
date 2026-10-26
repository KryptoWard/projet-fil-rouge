(() => {
    "use strict";
    const dialog = document.getElementById("logout-game");
    if (!dialog) return;
    const yes = document.getElementById("logout-game-yes");
    const no = document.getElementById("logout-game-no");
    const hint = document.getElementById("logout-game-hint");
    const skip = document.getElementById("logout-game-skip");
    const byId = id => document.getElementById(id);
    const map = byId("logout-map");
    const countries = byId("logout-map-countries");
    const viewport = byId("logout-map-viewport");
    const mapStatus = byId("logout-map-status");
    const retry = byId("logout-map-retry");
    const targets = ["CAN", "USA", "MEX", "BRA", "ARG", "DZA", "ZAF", "IND", "CHN", "AUS", "KAZ", "SAU"];
    const text = {
        fr: {
            title: "La grande déconnexion", yes: "Oui", no: "Non, je reste", skip: "Se déconnecter directement",
            questions: ["Tu veux vraiment partir ?", "Tu es vraiment, vraiment sûr ?", "Même si on te demande gentiment de rester ?", "Promis, c’est presque la dernière confirmation.", "Bon… d’accord. Une dernière fois : tu pars ?"],
            hint: "Le bouton Oui est un peu timide. Tu peux aussi l’attraper au clavier.",
            caught: "Bon, le bouton s’est calmé. Tu peux cliquer.",
            mapTitle: "Un dernier pays avant de partir", mapIntro: "La déconnexion directe a aussi son petit défi.",
            find: "Retrouve ce pays", mapHelp: "Clique sur le pays indiqué pour te déconnecter.",
            keyboard: "Au clavier, utilise les flèches pour parcourir les pays et Entrée pour choisir.",
            loading: "Chargement de la carte…", unavailable: "Carte indisponible", failed: "La carte n’a pas pu se charger. Réessaie ou reste connecté.",
            wrong: "Ce n’est pas le pays demandé. Essaie encore.", retry: "Réessayer",
            mapLabel: "Carte du monde", zoomIn: "Agrandir la carte", zoomOut: "Réduire la carte"
        },
        en: {
            title: "The great sign-out", yes: "Yes", no: "No, I’ll stay", skip: "Sign out directly",
            questions: ["Do you really want to leave?", "Are you really, really sure?", "Even if we politely ask you to stay?", "Promise, this is almost the last confirmation.", "Alright… one last time: are you leaving?"],
            hint: "The Yes button is a little shy. You can also catch it with your keyboard.",
            caught: "Alright, the button has calmed down. You can click it.",
            mapTitle: "One last country before you go", mapIntro: "Direct sign-out has a little challenge too.",
            find: "Find this country", mapHelp: "Click the requested country to sign out.",
            keyboard: "Use the arrow keys to move between countries and Enter to choose.",
            loading: "Loading the map…", unavailable: "Map unavailable", failed: "The map could not load. Try again or stay signed in.",
            wrong: "That is not the requested country. Try again.", retry: "Try again",
            mapLabel: "World map", zoomIn: "Zoom in", zoomOut: "Zoom out"
        }
    };
    let finish = null;
    let step = 0;
    let escapes = 0;
    let mapMode = false;
    let mapData = null;
    let target = null;
    let round = 0;
    let zoom = 1;
    let statusKey = "";
    const words = () => text[document.documentElement.lang === "en" ? "en" : "fr"];
    function resetPosition() { yes.removeAttribute("style"); }
    const countryName = country => document.documentElement.lang === "en" ? country.name : country.nameFr || country.name;

    // Keep the same challenge when the interface language changes
    function translateMap() {
        const t = words();
        byId("logout-game-title").textContent = t.mapTitle;
        byId("logout-game-message").textContent = t.mapIntro;
        byId("logout-map-question").textContent = target ? `${t.find} : ${countryName(target)}` : t[statusKey === "failed" ? "unavailable" : "loading"];
        byId("logout-map-help").textContent = t.mapHelp;
        byId("logout-map-keyboard").textContent = t.keyboard;
        byId("logout-map-cancel").textContent = t.no;
        byId("logout-map-zoom-in").setAttribute("aria-label", t.zoomIn);
        byId("logout-map-zoom-out").setAttribute("aria-label", t.zoomOut);
        countries.setAttribute("aria-label", t.mapLabel);
        retry.textContent = t.retry;
        mapStatus.textContent = t[statusKey] || "";
        if (mapData) countries.querySelectorAll("path").forEach((path, index) => {
            path.setAttribute("aria-label", countryName(mapData.countries[index]));
        });
    }

    // Load local country outlines and ignore requests from a closed challenge
    async function openMap() {
        if (!finish) return;
        const currentRound = ++round;
        mapMode = true;
        target = null;
        statusKey = "loading";
        resetPosition();
        dialog.classList.add("map-challenge");
        map.hidden = false;
        hint.hidden = skip.hidden = byId("logout-game-progress").hidden = true;
        dialog.querySelector(".logout-game-actions").hidden = true;
        viewport.hidden = true;
        dialog.querySelector(".logout-map-tools").hidden = true;
        retry.hidden = true;
        countries.replaceChildren();
        translateMap();
        byId("logout-map-question").focus();
        try {
            if (!mapData) {
                const response = await fetch("src/assets/maps/world-countries.json", { signal: AbortSignal.timeout(10000) });
                if (!response.ok) throw new Error("Map unavailable");
                const data = await response.json();
                if (!Array.isArray(data.countries) || !targets.every(id => data.countries.some(country => country.id === id)))
                    throw new Error("Invalid map");
                if (round !== currentRound || !finish) return;
                mapData = data;
            }
            if (round !== currentRound || !finish) return;
            const choices = mapData.countries.filter(country => targets.includes(country.id));
            target = choices[Math.floor(Math.random() * choices.length)];
            const fragment = document.createDocumentFragment();
            mapData.countries.forEach((country, index) => {
                const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
                path.setAttribute("d", country.path);
                path.setAttribute("fill-rule", "evenodd");
                path.setAttribute("role", "button");
                path.setAttribute("tabindex", index ? "-1" : "0");
                path.dataset.country = country.id;
                fragment.append(path);
            });
            countries.append(fragment);
            viewport.hidden = false;
            dialog.querySelector(".logout-map-tools").hidden = false;
            statusKey = "";
            setZoom(1);
            viewport.scrollTop = viewport.scrollLeft = 0;
            translateMap();
        } catch {
            if (round !== currentRound || !finish) return;
            statusKey = "failed";
            retry.hidden = false;
            translateMap();
        }
    }

    function setZoom(value) {
        zoom = Math.max(1, Math.min(3, value));
        countries.style.width = `${zoom * 100}%`;
        byId("logout-map-zoom-out").disabled = zoom === 1;
        byId("logout-map-zoom-in").disabled = zoom === 3;
    }

    // Only the requested country can confirm this sign-out path
    function chooseCountry(path) {
        if (!finish || !mapMode || !target || !path) return;
        if (path.dataset.country === target.id) return end(true);
        countries.querySelector('[tabindex="0"]')?.setAttribute("tabindex", "-1");
        path.setAttribute("tabindex", "0");
        countries.querySelector(".wrong")?.classList.remove("wrong");
        path.classList.add("wrong");
        statusKey = "wrong";
        mapStatus.textContent = words().wrong;
    }
    // Show the next question and reset the moving button
    function render() {
        mapMode = false;
        target = null;
        map.hidden = true;
        dialog.classList.remove("map-challenge");
        hint.hidden = skip.hidden = byId("logout-game-progress").hidden = false;
        dialog.querySelector(".logout-game-actions").hidden = false;
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
        round++;
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
        if (!finish || mapMode) return;
        if (++step === words().questions.length) return end(true);
        render();
        yes.focus();
    });
    // Move the button a few times unless reduced motion is requested
    yes.addEventListener("pointerenter", event => {
        if (mapMode || event.pointerType !== "mouse" || escapes >= 4 || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
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
    skip.addEventListener("click", () => { if (!mapMode) void openMap(); });
    retry.addEventListener("click", () => { void openMap(); });
    byId("logout-map-cancel").addEventListener("click", () => end(false));
    byId("logout-map-zoom-in").addEventListener("click", () => setZoom(zoom + 0.5));
    byId("logout-map-zoom-out").addEventListener("click", () => setZoom(zoom - 0.5));
    countries.addEventListener("click", event => chooseCountry(event.target.closest("path")));
    // Use one tab stop for the map and arrow keys to reach the other countries
    countries.addEventListener("keydown", event => {
        const path = event.target.closest("path");
        if (!path) return;
        if (["Enter", " "].includes(event.key)) {
            event.preventDefault();
            chooseCountry(path);
        } else if (["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp", "Home", "End"].includes(event.key)) {
            event.preventDefault();
            const paths = [...countries.children];
            const index = paths.indexOf(path);
            const nextIndex = event.key === "Home" ? 0 : event.key === "End" ? paths.length - 1 :
                (index + (["ArrowRight", "ArrowDown"].includes(event.key) ? 1 : -1) + paths.length) % paths.length;
            countries.querySelector('[tabindex="0"]')?.setAttribute("tabindex", "-1");
            paths[nextIndex].setAttribute("tabindex", "0");
            paths[nextIndex].focus();
        }
    });
    new MutationObserver(() => {
        if (dialog.open) mapMode ? translateMap() : render();
    }).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
    dialog.addEventListener("cancel", event => { event.preventDefault(); end(false); });
    dialog.addEventListener("close", () => { if (finish) end(false); });
    window.addEventListener("resize", resetPosition);
})();
