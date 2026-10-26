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
            about: "À propos",
            contact_us: "Nous contacter",
            terms: "Conditions d’utilisation",
            privacy: "Confidentialité",
            legal: "Mentions légales",
            cookie_choices: "Gérer les cookies",
            about_project: "Cette messagerie est un projet scolaire réalisé en binôme dans le cadre d’un cours de conception et de programmation de sites web.",
            about_features: "Elle permet de discuter et de partager des GIF ou des cartes météo. Des commandes interactives et des surprises complètent les échanges.",
            about_technology: "Le site est développé en HTML, CSS et JavaScript. Les comptes et les conversations utilisent Supabase.",
            about_contact: "Une question ou un problème ? Contacte-nous.",
            contact_intro: "Une question, un problème ou une suggestion ? Écris-nous avec ce formulaire.",
            contact_name: "Nom (facultatif)",
            contact_subject: "Objet",
            contact_message: "Ton message",
            contact_data: "Ton adresse e-mail et ton message servent à traiter ta demande.",
            contact_send: "Envoyer le message",
            contact_direct: "Tu peux aussi écrire directement à",
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
            show_password: "Afficher le mot de passe",
            confirm_email: "Vérifie tes e-mails pour confirmer ton compte avant de te connecter.",
            signup_error: "Inscription impossible : ",
            login_error: "Connexion impossible : ",
            network_error: "Une erreur est survenue. Réessaie dans un instant.",
            captcha_required: "Termine la vérification de sécurité. Si elle ne s’affiche pas, recharge la page et vérifie que Cloudflare n’est pas bloqué.",
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
            send_recovery_code: "Envoyer le lien de réinitialisation",
            recovery_instructions:
                "Saisis l’adresse e-mail associée à ton compte. Si un compte existe, un lien de réinitialisation sera envoyé.",
            send_recovery_link: "Envoyer le lien de réinitialisation",
            recovery_sent:
                "Si un compte correspond à cette adresse, un lien vient d’être envoyé. Vérifie aussi tes courriers indésirables.",
            recovery_invalid: "Ce lien de réinitialisation est invalide ou a expiré. Demande un nouveau lien.",
            new_password_title: "Définir un nouveau mot de passe",
            new_password: "Nouveau mot de passe",
            confirm_new_password: "Confirmer le nouveau mot de passe",
            save_new_password: "Enregistrer le nouveau mot de passe",
            recovery_send_error: "Impossible d’envoyer le lien de réinitialisation : ",
            recovery_update_error: "Impossible de modifier le mot de passe : ",
            recovery_password_mismatch: "Les deux mots de passe ne correspondent pas.",
            recovery_password_updated: "Mot de passe modifié. Tu peux maintenant te connecter.",
            recovery_back_to_login: "Retour à la connexion",
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
            about: "About",
            contact_us: "Contact us",
            terms: "Terms of use",
            privacy: "Privacy",
            legal: "Legal notice",
            cookie_choices: "Cookie settings",
            about_project: "This messaging app is a school project built by a team of two for a web design and programming course.",
            about_features: "You can chat and share GIFs or weather cards. Interactive commands and surprises add to the conversations.",
            about_technology: "The site uses HTML, CSS and JavaScript. Accounts and conversations use Supabase.",
            about_contact: "Have a question or a problem? Contact us.",
            contact_intro: "Have a question, a problem or a suggestion? Write to us using this form.",
            contact_name: "Name (optional)",
            contact_subject: "Subject",
            contact_message: "Your message",
            contact_data: "Your email address and message are used to handle your request.",
            contact_send: "Send message",
            contact_direct: "You can also email us directly at",
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
            show_password: "Show password",
            confirm_email: "Check your email to confirm your account before signing in.",
            signup_error: "Unable to sign up: ",
            login_error: "Unable to sign in: ",
            network_error: "Something went wrong. Please try again shortly.",
            captcha_required: "Complete the security check. If it does not appear, reload the page and check that Cloudflare is not blocked.",
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
            send_recovery_code: "Send a password reset link",
            recovery_instructions:
                "Enter the email address associated with your account. If an account exists, we will send a reset link.",
            send_recovery_link: "Send password reset link",
            recovery_sent:
                "If an account matches this address, a reset link has been sent. Check your spam folder too.",
            recovery_invalid: "This password reset link is invalid or has expired. Request a new link.",
            new_password_title: "Set a new password",
            new_password: "New password",
            confirm_new_password: "Confirm new password",
            save_new_password: "Save new password",
            recovery_send_error: "Unable to send the password reset link: ",
            recovery_update_error: "Unable to change the password: ",
            recovery_password_mismatch: "The passwords do not match.",
            recovery_password_updated: "Your password has been changed. You can now sign in.",
            recovery_back_to_login: "Back to sign in",
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
                "Le mot de passe doit contenir au moins un chiffre ou un caractère spécial.",
            mdp_correspondance: "Les deux mots de passe ne correspondent pas."
        },
        en: {
            nom_majuscule:
                "Last name must start with an uppercase letter and have at least 2 characters.",
            prenom_majuscule:
                "First name must start with an uppercase letter and have at least 2 characters.",
            mdp_longueur: "Password must be at least 8 characters long.",
            mdp_special: "Password must include at least one number or special character.",
            mdp_correspondance: "The passwords do not match."
        }
    };

    const boutonLangue = document.querySelector("#langue-switch");
    const boutonPauseFeuilles = document.querySelector(".pause-feuilles");
    const boutonMeteo = document.querySelector("#share-weather");
    const barreOutilsMessage = document.querySelector("#message-toolbar");
    let langueActuelle = "fr";

    document.querySelectorAll(".voir-mot-de-passe").forEach(bouton => {
        bouton.addEventListener("click", () => {
            const champ = document.getElementById(bouton.getAttribute("aria-controls"));
            champ.type = champ.type === "password" ? "text" : "password";
            bouton.setAttribute("aria-pressed", String(champ.type === "text"));
            const oeil = bouton.querySelector("img");
            oeil.src = `src/assets/svg/${champ.type === "text" ? "oeil" : "oeil-ferme"}.svg`;
            if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                oeil.getAnimations().forEach(animation => animation.cancel());
                oeil.animate([{ transform: "scaleY(0.2)" }, { transform: "scaleY(1)" }], { duration: 180 });
            }
        });
    });

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
        document.querySelectorAll(".voir-mot-de-passe").forEach(bouton => {
            bouton.setAttribute("aria-label", textes.show_password);
        });

        document.querySelectorAll("[data-i18n]").forEach(element => {
            const cle = element.dataset.i18n;
            if (Object.prototype.hasOwnProperty.call(textes, cle)) {
                element.textContent = textes[cle] + (element.dataset.detail || "");
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
            // Storage is unavailable in this browser
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
            if (window.confirmLogout && !(await window.confirmLogout())) return;
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

    function afficherMessage(formulaire, cle, erreur = false, detail = "") {
        const message = formulaire.querySelector(".message-formulaire");
        message.dataset.i18n = cle;
        message.dataset.detail = detail;
        message.textContent = traductions[langueActuelle][cle] + detail;
        message.classList.toggle("erreur", erreur);
        message.hidden = false;
    }

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

    // Create the account with Supabase Auth

    async function inscrireUtilisateur(email, motDePasse, nom, prenom) {
        formInscription.querySelector(".message-formulaire").hidden = true;
        const bouton = formInscription.querySelector('button[type="submit"]');
        if (bouton.disabled) return;
        bouton.disabled = true;
        let tentative = false;
        try {
            if (typeof window.confirmAuthPrank === "function" && !(await window.confirmAuthPrank(email))) return;
            const captchaToken = verifierCaptcha(formInscription);
            if (!captchaToken) return;
            tentative = true;
            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: motDePasse,
                options: {
                    captchaToken,
                    data: {
                        first_name: prenom,
                        last_name: nom
                    }
                }
            });

            if (error) {
                afficherMessage(formInscription, "signup_error", true, error.message);
                return;
            }

            if (data.session) {
                window.location.href = "conversations.html";
            } else {
                afficherMessage(formInscription, "confirm_email");
            }
        } catch (err) {
            console.error("Erreur inattendue :", err);
            afficherMessage(formInscription, "network_error", true);
        } finally {
            if (tentative) window.authCaptcha?.reset(formInscription);
            bouton.disabled = false;
        }
    }

    // Validate the registration form before sending it
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

    // Sign in with Supabase Auth

    async function connecterUtilisateur(email, motDePasse) {
        formConnexion.querySelector(".message-formulaire").hidden = true;
        const bouton = formConnexion.querySelector('button[type="submit"]');
        if (bouton.disabled) return;
        bouton.disabled = true;
        let tentative = false;
        try {
            if (typeof window.confirmAuthPrank === "function" && !(await window.confirmAuthPrank(email))) return;
            const captchaToken = verifierCaptcha(formConnexion);
            if (!captchaToken) return;
            tentative = true;
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: motDePasse,
                options: { captchaToken }
            });

            if (error) {
                afficherMessage(formConnexion, "login_error", true, error.message);
                return;
            }

            window.location.href = "conversations.html";
        } catch (err) {
            console.error("Erreur de connexion :", err);
            afficherMessage(formConnexion, "network_error", true);
        } finally {
            if (tentative) window.authCaptcha?.reset(formConnexion);
            bouton.disabled = false;
        }
    }

    function verifierCaptcha(formulaire) {
        const token = window.authCaptcha?.token(formulaire);
        if (!token) afficherMessage(formulaire, "captcha_required", true);
        return token;
    }

    // Submit the login form
    if (formConnexion) {
        formConnexion.addEventListener("submit", async evenement => {
            evenement.preventDefault();
            await connecterUtilisateur(inputLoginEmail.value, inputLoginMdp.value);
        });
    }


    // Request a password reset and accept the recovery link on this page
    const formDemandeRecuperation = document.querySelector("#form-demande-recuperation");
    const formNouveauMotDePasse = document.querySelector("#form-nouveau-mot-de-passe");

    if (formDemandeRecuperation && formNouveauMotDePasse) {
        const emailRecuperation = document.querySelector("#recovery-email");
        const nouveauMotDePasse = document.querySelector("#new-password");
        const confirmationMotDePasse = document.querySelector("#confirm-new-password");
        const titreRecuperation = document.querySelector("#recovery-heading");
        const instructionsRecuperation = document.querySelector("#recovery-instructions");

        function afficherFormulaireNouveauMotDePasse() {
            formDemandeRecuperation.hidden = true;
            formNouveauMotDePasse.hidden = false;
            instructionsRecuperation.hidden = true;
            titreRecuperation.dataset.i18n = "new_password_title";
            titreRecuperation.textContent = traductions[langueActuelle].new_password_title;
        }

        function nettoyerUrlRecuperation() {
            window.history.replaceState({}, document.title, window.location.pathname);
        }

        const hashParams = new URLSearchParams(window.location.hash.slice(1));
        const queryParams = new URLSearchParams(window.location.search);
        const lienRecuperation =
            hashParams.get("type") === "recovery" ||
            queryParams.get("type") === "recovery" ||
            hashParams.has("error_code") ||
            queryParams.has("error_code");

        if (supabase) {
            supabase.auth.onAuthStateChange((event, session) => {
                if (event === "PASSWORD_RECOVERY" && session) {
                    afficherFormulaireNouveauMotDePasse();
                    nettoyerUrlRecuperation();
                }
            });
        }

        async function initialiserRecuperation() {
            if (!lienRecuperation) return;
            if (!supabase) {
                afficherMessage(formDemandeRecuperation, "network_error", true);
                return;
            }

            const { data, error } = await supabase.auth.getSession();
            if (!error && data.session) {
                afficherFormulaireNouveauMotDePasse();
                nettoyerUrlRecuperation();
                return;
            }

            afficherMessage(formDemandeRecuperation, "recovery_invalid", true);
        }

        void initialiserRecuperation();

        formDemandeRecuperation.addEventListener("submit", async evenement => {
            evenement.preventDefault();
            const message = formDemandeRecuperation.querySelector(".message-formulaire");
            const bouton = formDemandeRecuperation.querySelector('button[type="submit"]');
            message.hidden = true;
            const captchaToken = verifierCaptcha(formDemandeRecuperation);
            if (!captchaToken || bouton.disabled) return;
            bouton.disabled = true;
            bouton.setAttribute("aria-busy", "true");

            try {
                if (!supabase) throw new Error("Auth unavailable");
                const redirectTo = new URL("pwdforgotten.html", window.location.href).href;
                const { error } = await supabase.auth.resetPasswordForEmail(
                    emailRecuperation.value.trim(),
                    { redirectTo, captchaToken }
                );

                if (error) {
                    afficherMessage(formDemandeRecuperation, "recovery_send_error", true, error.message);
                } else {
                    afficherMessage(formDemandeRecuperation, "recovery_sent");
                }
            } catch (erreur) {
                afficherMessage(formDemandeRecuperation, "network_error", true);
            } finally {
                window.authCaptcha?.reset(formDemandeRecuperation);
                bouton.disabled = false;
                bouton.removeAttribute("aria-busy");
            }
        });

        function validerNouveauMotDePasse() {
            const messages = getMsgs();
            if (nouveauMotDePasse.value.length < 8) {
                validerChamp(nouveauMotDePasse, false, messages.mdp_longueur);
                return false;
            }
            if (!regexSpecialOuChiffre.test(nouveauMotDePasse.value)) {
                validerChamp(nouveauMotDePasse, false, messages.mdp_special);
                return false;
            }

            validerChamp(nouveauMotDePasse, true, "");
            if (confirmationMotDePasse.value !== nouveauMotDePasse.value) {
                validerChamp(confirmationMotDePasse, false, messages.mdp_correspondance);
                return false;
            }

            validerChamp(confirmationMotDePasse, true, "");
            return true;
        }

        nouveauMotDePasse.addEventListener("input", validerNouveauMotDePasse);
        confirmationMotDePasse.addEventListener("input", validerNouveauMotDePasse);

        formNouveauMotDePasse.addEventListener("submit", async evenement => {
            evenement.preventDefault();
            if (!validerNouveauMotDePasse()) {
                const champInvalide = [nouveauMotDePasse, confirmationMotDePasse].find(
                    champ => !champ.validity.valid
                );
                champInvalide?.reportValidity();
                return;
            }

            const message = formNouveauMotDePasse.querySelector(".message-formulaire");
            const bouton = formNouveauMotDePasse.querySelector('button[type="submit"]');
            message.hidden = true;
            bouton.disabled = true;
            bouton.setAttribute("aria-busy", "true");

            try {
                const { error } = await supabase.auth.updateUser({
                    password: nouveauMotDePasse.value
                });
                if (error) {
                    afficherMessage(formNouveauMotDePasse, "recovery_update_error", true, error.message);
                } else {
                    formNouveauMotDePasse.reset();
                    afficherMessage(formNouveauMotDePasse, "recovery_password_updated");
                }
            } catch (erreur) {
                afficherMessage(formNouveauMotDePasse, "network_error", true);
            } finally {
                bouton.disabled = false;
                bouton.removeAttribute("aria-busy");
            }
        });
    }
})();
