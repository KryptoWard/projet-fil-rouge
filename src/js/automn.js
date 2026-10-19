
// Add varied leaves at different points in the animation
const decorFeuilles = document.querySelector(".feuilles-automne");
if (decorFeuilles) {
    const symboles = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    symboles.setAttribute("aria-hidden", "true");
    symboles.setAttribute("width", "0");
    symboles.setAttribute("height", "0");
    symboles.style.position = "absolute";
    symboles.innerHTML = '<defs>'
        + '<symbol id="feuille-erable" viewBox="0 0 64 64"><path fill="currentColor" d="M31 5 39 20 45 14 44 28 58 23 51 37 58 40 39 48 34 47 34 59 30 59 30 47 25 48 7 40 14 37 6 23 20 28 19 14 25 20Z"/><path d="M32 18V52M32 37 20 30M32 37 44 30M32 43 21 40M32 43 43 40" fill="none" stroke="#65432b" stroke-width="1.5" opacity=".5"/></symbol>'
        + '<symbol id="feuille-longue" viewBox="0 0 64 64"><path fill="currentColor" d="M32 5C16 12 10 25 15 38 18 46 25 49 30 50L29 60 33 60 34 50C44 46 51 35 48 24 46 15 40 9 32 5Z"/><path d="M32 13 32 53M32 27 23 22M32 34 42 27M32 42 22 35" fill="none" stroke="#65432b" stroke-width="1.5" opacity=".5"/></symbol>'
        + '</defs>';
    document.body.prepend(symboles);

    const couleursFeuilles = ["#b24e2c", "#c98a30", "#8e5939", "#a96726", "#858052"];
    const fragmentsFeuilles = document.createDocumentFragment();

    for (let index = 0; index < 24; index += 1) {
        const feuille = document.createElement("span");
        feuille.className = "feuille";
        feuille.style.setProperty("--position", ((index * 37 + 3) % 100) + "%");
        feuille.style.setProperty("--taille", (20 + (index * 7) % 23) + "px");
        feuille.style.setProperty("--couleur", couleursFeuilles[index % couleursFeuilles.length]);
        feuille.style.setProperty("--opacite", (0.35 + (index % 4) * 0.12).toFixed(2));
        feuille.style.setProperty("--duree", (14 + index % 11) + "s");
        feuille.style.setProperty("--retard", -(index * 2.7 + 4) + "s");
        feuille.style.setProperty("--derive", ((index % 2 ? 1 : -1) * (30 + index % 6 * 12)) + "px");
        feuille.style.setProperty("--oscillation", (2.8 + index % 4 * 0.6) + "s");
        feuille.style.setProperty("--rotation", (6 + index % 7) + "s");

        const forme = index % 3 === 0 ? "feuille-longue" : "feuille-erable";
        feuille.innerHTML = '<span class="feuille-balancement"><svg viewBox="0 0 64 64"><use href="#' + forme + '"></use></svg></span>';
        fragmentsFeuilles.appendChild(feuille);
    }

    decorFeuilles.appendChild(fragmentsFeuilles);
}

// Pause or resume the falling leaves
const boutonPause = document.querySelector(".pause-feuilles");
if (boutonPause) {
    boutonPause.addEventListener("click", () => {
        const enPause = document.body.classList.toggle("feuilles-en-pause");
        boutonPause.setAttribute("aria-pressed", String(enPause));
        boutonPause.dataset.i18n = enPause ? "play_leaves" : "pause_leaves";
        const anglais = document.documentElement.lang === "en";
        boutonPause.textContent = enPause
            ? (anglais ? "Resume falling leaves" : "Reprendre les feuilles")
            : (anglais ? "Pause falling leaves" : "Mettre les feuilles en pause");
    });
}
