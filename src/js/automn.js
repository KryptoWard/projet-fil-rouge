// Reuse the SVG leaf shapes with varied positions and animation speeds
const decorFeuilles = document.querySelector(".feuilles-automne");
if (decorFeuilles) {
    const couleursFeuilles = ["#b24e2c", "#c98a30", "#8e5939", "#a96726", "#858052"];
    const fragmentsFeuilles = document.createDocumentFragment();
    const svgNamespace = "http://www.w3.org/2000/svg";

    for (let index = 0; index < 24; index += 1) {
        const feuille = document.createElement("span");
        feuille.className = "feuille";
        feuille.style.setProperty("--position", ((index * 37 + 3) % 100) + "%");
        feuille.style.setProperty("--taille", 20 + ((index * 7) % 23) + "px");
        feuille.style.setProperty("--couleur", couleursFeuilles[index % couleursFeuilles.length]);
        feuille.style.setProperty("--opacite", (0.35 + (index % 4) * 0.12).toFixed(2));
        feuille.style.setProperty("--duree", 14 + (index % 11) + "s");
        feuille.style.setProperty("--retard", -(index * 2.7 + 4) + "s");
        feuille.style.setProperty(
            "--derive",
            (index % 2 ? 1 : -1) * (30 + (index % 6) * 12) + "px"
        );
        feuille.style.setProperty("--oscillation", 2.8 + (index % 4) * 0.6 + "s");
        feuille.style.setProperty("--rotation", 6 + (index % 7) + "s");

        const forme = index % 3 === 0 ? "feuille-longue" : "feuille-erable";
        // Build the leaf with DOM nodes and keep SVG elements in their namespace
        const balancement = document.createElement("span");
        balancement.className = "feuille-balancement";
        const svg = document.createElementNS(svgNamespace, "svg");
        svg.setAttribute("viewBox", "0 0 64 64");
        const reference = document.createElementNS(svgNamespace, "use");
        reference.setAttribute("href", "src/assets/svg/feuilles.svg#" + forme);
        svg.append(reference);
        balancement.append(svg);
        feuille.append(balancement);
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
        const anglais = document.documentElement.lang === "en";
        const libelle = enPause
            ? anglais
                ? "Resume falling leaves"
                : "Reprendre les feuilles"
            : anglais
              ? "Pause falling leaves"
              : "Mettre les feuilles en pause";
        boutonPause.setAttribute("aria-label", libelle);
        boutonPause.title = libelle;
    });
}
