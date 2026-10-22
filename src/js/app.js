(() => {
    "use strict";

    const SUPABASE_URL = "https://ysdhfkeeaibwvcyfmlnf.supabase.co";
    const SUPABASE_ANON_KEY =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzZGhma2VlYWlid3ZjeWZtbG5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE0ODE1ODgsImV4cCI6MjEwNzA1NzU4OH0.13fDNjWCjanXiy8A7vhiH389NnjgpJiM8wQemwDtVkI";

    // Share one client between authentication and chat
    const supabase = window.supabase?.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) || null;
    window.messagerieSupabase = supabase;

    // 1. General translations
    const traductions = {
        fr: {
            site_title: "Messagerie instantanée",
            brand: "Messagerie instantanée",
            home: "Accueil",
            conversations: "Conversations",
            contacts: "Contacts",
            settings: "Paramètres",
            account_session: "Session",
            logout: "Se déconnecter",
            logging_out: "Déconnexion…",
            logout_error: "La déconnexion a échoué. Vérifie ta connexion et réessaie.",
            pause_leaves: "Mettre les feuilles en pause",
            play_leaves: "Reprendre les feuilles",
            // Weather card settings and conversation controls
            weather_settings_title: "Ville pour la météo",
            weather_settings_description:
                "Choisis la ville utilisée pour les cartes météo. Elle sera enregistrée dans ce navigateur.",
            weather_city_label: "Ville",
            weather_search: "Rechercher",
            weather_city_not_set: "Aucune ville enregistrée.",
            weather_attribution: "Données météo fournies par",
            share_weather: "Partager une carte météo",
            weather_tool_label: "Météo",
            message_toolbar_label: "Options du message",
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
            account_session: "Session",
            logout: "Sign out",
            logging_out: "Signing out…",
            logout_error: "Sign out failed. Check your connection and try again.",
            pause_leaves: "Pause falling leaves",
            play_leaves: "Resume falling leaves",
            // Weather card settings and conversation controls
            weather_settings_title: "Weather city",
            weather_settings_description:
                "Choose the city used for weather cards. It will be saved in this browser.",
            weather_city_label: "City",
            weather_search: "Search",
            weather_city_not_set: "No city saved.",
            weather_attribution: "Weather data provided by",
            share_weather: "Share a weather card",
            weather_tool_label: "Weather",
            message_toolbar_label: "Message tools",
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

    // 2. Error validation messages
    const messagesErreurs = {
        fr: {
            nom_majuscule:
                "Le nom doit commencer par une majuscule et comporter au moins 2 lettres.",
            prenom_majuscule:
                "Le prénom doit commencer par une majuscule et comporter au moins 2 lettres.",
            mdp_longueur: "Le mot de passe doit comporter au moins 8 caractères.",
            mdp_special:
                "Le mot de passe doit contenir au moins un chiffre ou un caractère spécial."
        },
        en: {
            nom_majuscule:
                "Last name must start with an uppercase letter and have at least 2 characters.",
            prenom_majuscule:
                "First name must start with an uppercase letter and have at least 2 characters.",
            mdp_longueur: "Password must be at least 8 characters long.",
            mdp_special: "Password must include at least one number or special character."
        }
    };

    const boutonLangue = document.querySelector("#langue-switch");
    const boutonPauseFeuilles = document.querySelector(".pause-feuilles");
    const boutonMeteo = document.querySelector("#share-weather");
    const barreOutilsMessage = document.querySelector("#message-toolbar");
    let langueActuelle = "fr";

    try {
        const langueEnregistree = window.localStorage.getItem("langue-interface");
        if (Object.prototype.hasOwnProperty.call(traductions, langueEnregistree)) {
            langueActuelle = langueEnregistree;
        }
    } catch (erreur) {
        // Storage disabled
    }

    function appliquerLangue(langue) {
        const textes = traductions[langue] || traductions.fr;
        document.documentElement.lang = langue;

        document.querySelectorAll("[data-i18n]").forEach(element => {
            const cle = element.dataset.i18n;
            if (Object.prototype.hasOwnProperty.call(textes, cle)) {
                element.textContent = textes[cle];
            }
        });

        document.querySelectorAll("[data-i18n-placeholder]").forEach(element => {
            const cle = element.dataset.i18nPlaceholder;
            if (Object.prototype.hasOwnProperty.call(textes, cle)) {
                element.placeholder = textes[cle];
            }
        });

        if (boutonLangue) {
            boutonLangue.textContent = textes.language_button;
            boutonLangue.setAttribute("aria-label", textes.change_language);
        }

        if (boutonPauseFeuilles) {
            const clePause =
                boutonPauseFeuilles.getAttribute("aria-pressed") === "true"
                    ? "play_leaves"
                    : "pause_leaves";
            boutonPauseFeuilles.setAttribute("aria-label", textes[clePause]);
            boutonPauseFeuilles.title = textes[clePause];
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

    // Sign out of this browser and redirect only after success
    const boutonDeconnexion = document.querySelector("#logout-button");
    if (boutonDeconnexion) {
        boutonDeconnexion.addEventListener("click", async () => {
            if (boutonDeconnexion.disabled) return;
            const libelle = boutonDeconnexion.querySelector("[data-i18n]");
            const erreurDeconnexion = document.querySelector("#logout-error");
            boutonDeconnexion.disabled = true;
            boutonDeconnexion.setAttribute("aria-busy", "true");
            erreurDeconnexion.hidden = true;
            libelle.dataset.i18n = "logging_out";
            libelle.textContent = traductions[langueActuelle].logging_out;

            try {
                if (!supabase) throw new Error("Auth unavailable");
                const { error } = await supabase.auth.signOut({ scope: "local" });
                if (error) throw error;
                window.location.replace("index.html");
            } catch (erreur) {
                erreurDeconnexion.textContent = traductions[langueActuelle].logout_error;
                erreurDeconnexion.hidden = false;
                libelle.dataset.i18n = "logout";
                libelle.textContent = traductions[langueActuelle].logout;
                boutonDeconnexion.disabled = false;
                boutonDeconnexion.removeAttribute("aria-busy");
            }
        });
    }

    // 3. Registration form validation
    // Retrieving DOM elements
    const formInscription = document.querySelector("#form-inscription");
    const inputNom = document.querySelector("#nom");
    const inputPrenom = document.querySelector("#prenom");
    const inputEmail = document.querySelector("#email");
    const inputMdp = document.querySelector("#mdp");

    const formConnexion = document.querySelector("#form-connexion");
    const inputLoginEmail = document.querySelector("#login-email");
    const inputLoginMdp = document.querySelector("#login-mdp");

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

    function validerNom() {
        if (!inputNom) return true;
        return validerChamp(
            inputNom,
            regexNom.test(inputNom.value.trim()),
            getMsgs().nom_majuscule
        );
    }

    function validerPrenom() {
        if (!inputPrenom) return true;
        return validerChamp(
            inputPrenom,
            regexNom.test(inputPrenom.value.trim()),
            getMsgs().prenom_majuscule
        );
    }

    function validerMdp() {
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

    if (inputNom) inputNom.addEventListener("input", validerNom);
    if (inputPrenom) inputPrenom.addEventListener("input", validerPrenom);
    if (inputMdp) inputMdp.addEventListener("input", validerMdp);

    // Fonction d'inscription Supabase

    async function inscrireUtilisateur(email, motDePasse, nom, prenom) {
        try {
            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: motDePasse,
                options: {
                    data: {
                        first_name: prenom,
                        last_name: nom
                    }
                }
            });

            if (error) {
                alert("Erreur d'inscription : " + error.message);
                return;
            }

            if (data.session) {
                window.location.href = "conversations.html";
            } else {
                alert(
                    document.documentElement.lang === "en"
                        ? "Check your email to confirm your account before signing in."
                        : "Vérifie tes e-mails pour confirmer ton compte avant de te connecter."
                );
            }
        } catch (err) {
            console.error("Erreur inattendue :", err);
        }
    }

    // Gestion de la soumission de l'inscription
    if (formInscription) {
        formInscription.addEventListener("submit", async evenement => {
            evenement.preventDefault();

            const nomOk = validerNom();
            const prenomOk = validerPrenom();
            const mdpOk = validerMdp();

            if (!nomOk) {
                inputNom.reportValidity();
            } else if (!prenomOk) {
                inputPrenom.reportValidity();
            } else if (!mdpOk) {
                inputMdp.reportValidity();
            } else {
                await inscrireUtilisateur(
                    inputEmail.value,
                    inputMdp.value,
                    inputNom.value,
                    inputPrenom.value
                );
            }
        });
    }

    // Fonction de connexion Supabase

    async function connecterUtilisateur(email, motDePasse) {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: motDePasse
            });

            if (error) {
                alert("Identifiants incorrects : " + error.message);
                return;
            }

            window.location.href = "conversations.html";
        } catch (err) {
            console.error("Erreur de connexion :", err);
        }
    }

    // Gestion de la soumission de la connexion
    if (formConnexion) {
        formConnexion.addEventListener("submit", async evenement => {
            evenement.preventDefault();
            await connecterUtilisateur(inputLoginEmail.value, inputLoginMdp.value);
        });
    }
})();
