(() => {
    "use strict";

    // 1. Traductions générales
    const traductions = {
        fr: {
            site_title: "Messagerie instantanée",
            brand: "Messagerie instantanée",
            home: "Accueil",
            conversations: "Conversations",
            contacts: "Contacts",
            settings: "Paramètres",
            pause_leaves: "Mettre les feuilles en pause",
            play_leaves: "Reprendre les feuilles",
            // Weather card settings and conversation controls
            weather_settings_title: "Ville pour la météo",
            weather_settings_description: "Choisis la ville utilisée pour les cartes météo. Elle sera enregistrée dans ce navigateur.",
            weather_city_label: "Ville",
            weather_search: "Rechercher",
            weather_city_not_set: "Aucune ville enregistrée.",
            weather_attribution: "Données météo fournies par",
            share_weather: "Partager une carte météo",
            weather_tool_label: "Météo",
            message_toolbar_label: "Options du message",
            weather_command_hint: "Astuce : écris /meteo ou /meteo Montréal pour publier une carte.",
            local_message_notice: "Les messages restent sur cet appareil jusqu’à la mise en place du backend.",
            create_account: "Créer un compte",
            last_name: "Nom",
            first_name: "Prénom",
            email: "Adresse e-mail",
            password: "Mot de passe",
            signup: "S'inscrire",
            forgot_password: "Mot de passe oublié",
            conversations_page_title: "Conversations",
            my_conversations: "Mes conversations",
            discussions: "Discussions",
            new_conversation: "Nouvelle discussion",
            search_conversation: "Rechercher une discussion",
            search_placeholder: "Rechercher...",
            active_conversation: "Discussion active",
            me: "Moi",
            message: "Message :",
            // Show the weather command syntax directly in the composer
            message_placeholder: "Écris un message ou /meteo [ville]...",
            send: "Envoyer",
            contacts_page_title: "Contacts",
            my_contacts: "Mes contacts",
            settings_page_title: "Paramètres",
            forgotten_page_title: "Mot de passe oublié",
            send_recovery_code: "Envoyer un code à mon adresse mail",
            change_language: "Changer de langue",
            language_button: "English"
        },
        en: {
            site_title: "Instant messaging",
            brand: "Instant messaging",
            home: "Home",
            conversations: "Conversations",
            contacts: "Contacts",
            settings: "Settings",
            pause_leaves: "Pause falling leaves",
            play_leaves: "Resume falling leaves",
            // Weather card settings and conversation controls
            weather_settings_title: "Weather city",
            weather_settings_description: "Choose the city used for weather cards. It will be saved in this browser.",
            weather_city_label: "City",
            weather_search: "Search",
            weather_city_not_set: "No city saved.",
            weather_attribution: "Weather data provided by",
            share_weather: "Share a weather card",
            weather_tool_label: "Weather",
            message_toolbar_label: "Message tools",
            weather_command_hint: "Tip: type /meteo or /meteo Montreal to post a card.",
            local_message_notice: "Messages stay on this device until the backend is added.",
            create_account: "Create an account",
            last_name: "Last name",
            first_name: "First name",
            email: "Email address",
            password: "Password",
            signup: "Sign up",
            forgot_password: "Forgot password?",
            conversations_page_title: "Conversations",
            my_conversations: "My conversations",
            discussions: "Chats",
            new_conversation: "New chat",
            search_conversation: "Search conversations",
            search_placeholder: "Search...",
            active_conversation: "Active conversation",
            me: "Me",
            message: "Message:",
            // Show the weather command syntax directly in the composer
            message_placeholder: "Write a message or /meteo [city]...",
            send: "Send",
            contacts_page_title: "Contacts",
            my_contacts: "My contacts",
            settings_page_title: "Settings",
            forgotten_page_title: "Forgot password",
            send_recovery_code: "Send a code to my email address",
            change_language: "Change the display language",
            language_button: "Français"
        }
    };

    // 2. Messages d'erreurs de validation
    const messagesErreurs = {
        fr: {
            nom_majuscule: "Le nom doit commencer par une majuscule et comporter au moins 2 lettres.",
            prenom_majuscule: "Le prénom doit commencer par une majuscule et comporter au moins 2 lettres.",
            mdp_longueur: "Le mot de passe doit comporter au moins 8 caractères.",
            mdp_special: "Le mot de passe doit contenir au moins un chiffre ou un caractère spécial."
        },
        en: {
            nom_majuscule: "Last name must start with an uppercase letter and have at least 2 characters.",
            prenom_majuscule: "First name must start with an uppercase letter and have at least 2 characters.",
            mdp_longueur: "Password must be at least 8 characters long.",
            mdp_special: "Password must include at least one number or special character."
        }
    };

    const boutonLangue = document.querySelector("#langue-switch");
    const boutonMeteo = document.querySelector("#share-weather");
    const barreOutilsMessage = document.querySelector("#message-toolbar");
    let langueActuelle = "fr";

    try {
        const langueEnregistree = window.localStorage.getItem("langue-interface");
        if (Object.prototype.hasOwnProperty.call(traductions, langueEnregistree)) {
            langueActuelle = langueEnregistree;
        }
    } catch (erreur) {
        // Stockage désactivé
    }

    function appliquerLangue(langue) {
        const textes = traductions[langue] || traductions.fr;
        document.documentElement.lang = langue;

        document.querySelectorAll("[data-i18n]").forEach((element) => {
            const cle = element.dataset.i18n;
            if (Object.prototype.hasOwnProperty.call(textes, cle)) {
                element.textContent = textes[cle];
            }
        });

        document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
            const cle = element.dataset.i18nPlaceholder;
            if (Object.prototype.hasOwnProperty.call(textes, cle)) {
                element.placeholder = textes[cle];
            }
        });

        if (boutonLangue) {
            boutonLangue.textContent = textes.language_button;
            boutonLangue.setAttribute("aria-label", textes.change_language);
        }

        // Keep the weather icon button accessible in the selected language
        if (boutonMeteo) {
            boutonMeteo.setAttribute("aria-label", textes.share_weather);
            boutonMeteo.title = textes.share_weather;
        }

        // Keep the toolbar name available to assistive technology in both languages
        if (barreOutilsMessage) {
            barreOutilsMessage.setAttribute("aria-label", textes.message_toolbar_label);
        }

        langueActuelle = langue;
        try {
            window.localStorage.setItem("langue-interface", langue);
        } catch (erreur) {
            // Pas de stockage
        }
    }

    if (boutonLangue) {
        boutonLangue.addEventListener("click", () => {
            appliquerLangue(langueActuelle === "fr" ? "en" : "fr");
        });
    }

    appliquerLangue(langueActuelle);

    // 3. Validation formulaire d'inscription
    // Récupération éléments du DOM
    const inscription = document.querySelector("main form");
    const inputNom = document.querySelector("#nom");
    const inputPrenom = document.querySelector("#prenom");
    const inputMdp = document.querySelector("#mdp");

    const regexNom = /^[A-ZÀ-ÖØ-ß][a-zA-ZÀ-ÿ\s'-]{1,}$/; // Caractères pour prénom et nom, même avec accent, espace ou tiret
    const regexSpecialOuChiffre = /[0-9!@#$%^&*(),.?":{}|<>_\-+=/\\~`]/; // Caractères spéciaux pour mot de passe

    function getMsgs() { // Renvoie textes avec la bonne langue
        const lang = document.documentElement.lang || "fr";
        return messagesErreurs[lang] || messagesErreurs.fr;
    }

    function validerChamp(input, conditionValide, messageErreur) { // Vérifie si les champs sont valides ou pas
        if (!input) return true;
        if (!conditionValide) {
            input.setCustomValidity(messageErreur);
            return false;
        }
        input.setCustomValidity("");
        return true;
    }

    function Nom() {
        if (!inputNom) return true;
        return validerChamp(inputNom, regexNom.test(inputNom.value.trim()), getMsgs().nom_majuscule);
    }

    function Prenom() {
        if (!inputPrenom) return true;
        return validerChamp(inputPrenom, regexNom.test(inputPrenom.value.trim()), getMsgs().prenom_majuscule);
    }

    function Mdp() { // Vérifie que le mot de passe a au moins 8 caarctères et qu'il a un caractère spécial
        if (!inputMdp) return true;
        const msgs = getMsgs();
        const valeur = inputMdp.value;

        if (valeur.length < 8) {
            return validerChamp(inputMdp, false, msgs.mdp_longueur);
        }
        if (!regexSpecialOuChiffre.test(valeur)) {
            return validerChamp(inputMdp, false, msgs.mdp_special);
        }
        return validerChamp(inputMdp, true, "");
    }
    
    // Met à jour si l'erreur est réglée, donc écoute en temps réel
    if (inputNom) inputNom.addEventListener("input", Nom); 
    if (inputPrenom) inputPrenom.addEventListener("input", Prenom);
    if (inputMdp) inputMdp.addEventListener("input", Mdp);

    if (inscription) { // Envoie messages d'erreur si besoin
        inscription.addEventListener("submit", (evenement) => {
            const nomOk = Nom();
            const prenomOk = Prenom();
            const mdpOk = Mdp();

            if (!nomOk) {
                evenement.preventDefault(); // Bloque l'exécution d'une action
                inputNom.reportValidity();
            } else if (!prenomOk) {
                evenement.preventDefault();
                inputPrenom.reportValidity();
            } else if (!mdpOk) {
                evenement.preventDefault();
                inputMdp.reportValidity();
            }
        });
    }
})();
