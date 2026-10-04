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
            message_placeholder: "Ton message...",
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
            message_placeholder: "Your message...",
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
    const inscription = document.querySelector("main form");
    const inputNom = document.querySelector("#nom");
    const inputPrenom = document.querySelector("#prenom");
    const inputMdp = document.querySelector("#mdp");

    const regexNom = /^[A-ZÀ-ÖØ-ß][a-zA-ZÀ-ÿ\s'-]{1,}$/;
    const regexSpecialOuChiffre = /[0-9!@#$%^&*(),.?":{}|<>_\-+=/\\~`]/;

    function getMsgs() {
        const lang = document.documentElement.lang || "fr";
        return messagesErreurs[lang] || messagesErreurs.fr;
    }

    function validerChamp(input, conditionValide, messageErreur) {
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

    function Mdp() {
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

    if (inputNom) inputNom.addEventListener("input", Nom); // Met à jour si l'erreur est réglée, donc écoute en temps réel
    if (inputPrenom) inputPrenom.addEventListener("input", Prenom);
    if (inputMdp) inputMdp.addEventListener("input", Mdp);

    if (inscription) {
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