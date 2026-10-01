// Récupération des données d'un commit effacé pour restaurer le fichier.
// Textes disponibles pour le bouton de langue (pour l'instant : français et anglais).


const traductionsLocales = {
    fr: {
        titre_site: "Messagerie instantanée",
        nom_appli: "Messagerie instantanée",
        accueil: "Accueil",
        contacts: "Contacts",
        parametres: "Paramètres",
        titre_inscription: "Créer un compte",
        nom: "Nom",
        prenom: "Prénom",
        email: "Adresse e-mail",
        mot_de_passe: "Mot de passe",
        inscrire: "S'inscrire",
        titre_conversations: "Mes conversations",
        mes_contacts: "Mes contacts",
        nouvelle_conversation: "Nouvelle conversation",
        message: "Message :",
        envoyer: "Envoyer",
        changer_langue: "English",
        aria_langue: "Changer la langue d’affichage"
    },
    en: {
        titre_site: "Instant messaging",
        nom_appli: "Instant messaging",
        accueil: "Home",
        contacts: "Contacts",
        parametres: "Settings",
        titre_inscription: "Create an account",
        nom: "Last name",
        prenom: "First name",
        email: "Email address",
        mot_de_passe: "Password",
        inscrire: "Sign up",
        titre_conversations: "My conversations",
        mes_contacts: "My contacts",
        nouvelle_conversation: "New conversation",
        message: "Message:",
        envoyer: "Send",
        changer_langue: "Français",
        aria_langue: "Change the display language"
    }
};

// Corriger le fait que le boutonLangue ne fonctionne pas.

const boutonLangue = document.getElementById("bouton-langue");

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