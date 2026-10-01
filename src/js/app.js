// Corriger le fait que le boutonLangue ne fonctionne pas.

// Applique le choix enregistré; français est la langue par défaut.
let langueActuelle = "fr";
try {
    const langueEnregistree = localStorage.getItem("langue-interface");
    if (langueEnregistree in traductionsLocales) {
        langueActuelle = langueEnregistree;
    }
} catch (erreur) {
    // Le site reste utilisable même si le navigateur bloque le stockage local.
}

function afficherLangue(langue) {
    const textes = traductionsLocales[langue];
    document.documentElement.lang = langue;

    document.querySelectorAll("[data-i18n]").forEach((element) => {
        const cle = element.dataset.i18n;
        if (textes[cle]) {
            element.textContent = textes[cle];
        }
    });

    if (boutonLangue) {
        boutonLangue.textContent = textes.changer_langue;
        boutonLangue.setAttribute("aria-label", textes.aria_langue);
    }

    langueActuelle = langue;
    try {
        localStorage.setItem("langue-interface", langue);
    } catch (erreur) {
        // Le choix s'applique à la page, même s'il ne peut pas être mémorisé.
    }
}

if (boutonLangue) { // boutonLangue is not defined, pourquoi ?
    boutonLangue.addEventListener("click", () => {
        afficherLangue(langueActuelle === "fr" ? "en" : "fr");
    });
}

afficherLangue(langueActuelle);