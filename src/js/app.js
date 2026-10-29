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
            profile_title: "Mon profil",
            profile_pseudo: "Pseudo",
            profile_photo: "Photo de profil (2 Mo maximum)",
            profile_photo_loading: "Chargement de la photo…",
            profile_crop_help: "Fais glisser la photo ou utilise les flèches du clavier pour la positionner.",
            profile_crop_zoom: "Zoom",
            profile_remove_photo: "Retirer la photo",
            profile_message_color: "Couleur de mes messages",
            profile_preview: "Aperçu",
            profile_preview_message: "Salut, on discute ?",
            profile_save: "Enregistrer le profil",
            profile_saving: "Enregistrement…",
            profile_saved: "Profil enregistré.",
            profile_failed: "Enregistrement impossible : ",
            profile_load_failed: "Profil indisponible : ",
            profile_login_required: "Connecte-toi pour modifier ton profil.",
            profile_name_required: "Saisis un pseudo.",
            profile_photo_error: "Choisis une image JPEG, PNG ou WebP de 2 Mo maximum.",
            color_terracotta: "Terre cuite",
            color_olive: "Olive",
            color_blue: "Bleu",
            color_plum: "Prune",
            color_ink: "Encre",
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
            profile_title: "My profile",
            profile_pseudo: "Display name",
            profile_photo: "Profile photo (2 MB maximum)",
            profile_photo_loading: "Loading photo…",
            profile_crop_help: "Drag the photo or use the keyboard arrows to position it.",
            profile_crop_zoom: "Zoom",
            profile_remove_photo: "Remove photo",
            profile_message_color: "My message color",
            profile_preview: "Preview",
            profile_preview_message: "Hi, want to chat?",
            profile_save: "Save profile",
            profile_saving: "Saving…",
            profile_saved: "Profile saved.",
            profile_failed: "Could not save profile: ",
            profile_load_failed: "Profile unavailable: ",
            profile_login_required: "Sign in to edit your profile.",
            profile_name_required: "Enter a display name.",
            profile_photo_error: "Choose a JPEG, PNG or WebP image up to 2 MB.",
            color_terracotta: "Terracotta",
            color_olive: "Olive",
            color_blue: "Blue",
            color_plum: "Plum",
            color_ink: "Ink",
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

    const profilFormulaire = document.querySelector("#profile-form");
    if (profilFormulaire) {
        const $ = selecteur => document.querySelector(selecteur);
        const nom = $("#profile-name"), photo = $("#profile-photo"), avatar = $("#profile-avatar");
        const statut = $("#profile-status"), apercu = $("#profile-preview");
        const zoneRecadrage = $("#profile-crop"), cadreRecadrage = $("#profile-crop-frame");
        const imageRecadrage = $("#profile-crop-image"), zoomRecadrage = $("#profile-zoom");
        const palette = ["#a64f32", "#6b7051", "#526f80", "#80536b", "#342e27"];
        const stockage = () => supabase.storage.from("profile-avatars");
        let utilisateur, profil, photoChoisie, retirerPhoto = false, apercuPhoto, dimensionsPhoto, decalage = { x: 0, y: 0 }, glissement;

        const message = (cle, detail = "") => {
            statut.dataset.i18n = cle;
            statut.dataset.detail = detail;
            statut.textContent = traductions[langueActuelle][cle] + detail;
            statut.classList.toggle("erreur", cle.includes("failed") || cle.includes("error") || cle.includes("required"));
            statut.hidden = false;
        };
        const effacerMessage = () => {
            statut.hidden = true;
            delete statut.dataset.i18n;
            delete statut.dataset.detail;
            statut.classList.remove("erreur");
        };
        const urlPhoto = chemin => chemin ? stockage().getPublicUrl(chemin).data.publicUrl : null;
        const initiales = texte => texte.trim().split(/\s+/).slice(0, 2).map(mot => Array.from(mot)[0]).join("").toUpperCase() || "?";
        const afficherPhoto = url => {
            avatar.hidden = !url;
            $("#profile-initials").hidden = Boolean(url);
            if (url) avatar.src = url;
            else avatar.removeAttribute("src");
        };

        async function chargerProfil() {
            try {
                const { data, error } = await supabase.auth.getUser();
                if (error) throw error;
                if (!data.user) return message("profile_login_required");
                utilisateur = data.user;
                const { data: profile, error: profileError } = await supabase.from("chat_profiles")
                    .select("display_name,avatar_path,message_color").eq("id", utilisateur.id).single();
                if (profileError) throw profileError;
                profil = profile;
                $("#profile-identity").hidden = false;
                profilFormulaire.hidden = false;
                nom.value = profile.display_name;
                $("#profile-display-name").textContent = profile.display_name;
                $("#profile-email").textContent = utilisateur.email || "";
                $("#profile-initials").textContent = initiales(profile.display_name);
                const color = palette.includes(profile.message_color) ? profile.message_color : palette[0];
                profilFormulaire.querySelector(`input[name="message_color"][value="${color}"]`).checked = true;
                apercu.style.setProperty("--message-color", color);
                afficherPhoto(urlPhoto(profile.avatar_path));
            } catch (error) {
                message("profile_load_failed", error.message ? ` ${error.message}` : "");
            }
        }

        profilFormulaire.addEventListener("change", event => {
            if (event.target.matches('input[name="message_color"]')) {
                apercu.style.setProperty("--message-color", event.target.value);
            }
        });
        function dessinerRecadrage() {
            if (!dimensionsPhoto) return;
            const tailleCadre = 180, zoom = Number(zoomRecadrage.value);
            const tailleSource = Math.min(dimensionsPhoto.width, dimensionsPhoto.height) / zoom;
            const echelle = tailleCadre / tailleSource;
            const largeur = dimensionsPhoto.width * echelle, hauteur = dimensionsPhoto.height * echelle;
            decalage.x = Math.max(-(largeur - tailleCadre) / 2, Math.min((largeur - tailleCadre) / 2, decalage.x));
            decalage.y = Math.max(-(hauteur - tailleCadre) / 2, Math.min((hauteur - tailleCadre) / 2, decalage.y));
            imageRecadrage.style.width = `${largeur}px`;
            imageRecadrage.style.height = `${hauteur}px`;
            imageRecadrage.style.transform = `translate(calc(-50% + ${decalage.x}px), calc(-50% + ${decalage.y}px))`;
            const canvas = document.createElement("canvas");
            canvas.width = canvas.height = 96;
            const contexte = canvas.getContext("2d");
            const centreX = dimensionsPhoto.width / 2 - decalage.x / echelle;
            const centreY = dimensionsPhoto.height / 2 - decalage.y / echelle;
            contexte.fillStyle = "#fff";
            contexte.fillRect(0, 0, 96, 96);
            contexte.drawImage(imageRecadrage, centreX - tailleSource / 2, centreY - tailleSource / 2, tailleSource, tailleSource, 0, 0, 96, 96);
            avatar.src = canvas.toDataURL("image/jpeg", 0.8);
            avatar.hidden = false;
            $("#profile-initials").hidden = true;
        }
        imageRecadrage.addEventListener("load", () => {
            dimensionsPhoto = { width: imageRecadrage.naturalWidth, height: imageRecadrage.naturalHeight };
            decalage = { x: 0, y: 0 };
            zoomRecadrage.value = "1";
            zoneRecadrage.hidden = false;
            profilFormulaire.querySelector('[type="submit"]').disabled = false;
            effacerMessage();
            dessinerRecadrage();
        });
        imageRecadrage.addEventListener("error", () => {
            profilFormulaire.querySelector('[type="submit"]').disabled = false;
            photoChoisie = null;
            dimensionsPhoto = null;
            photo.value = "";
            zoneRecadrage.hidden = true;
            if (apercuPhoto) URL.revokeObjectURL(apercuPhoto);
            apercuPhoto = null;
            afficherPhoto(urlPhoto(profil?.avatar_path));
            message("profile_photo_error");
        });
        zoomRecadrage.addEventListener("input", dessinerRecadrage);
        cadreRecadrage.addEventListener("pointerdown", event => {
            glissement = { pointerX: event.clientX, pointerY: event.clientY, offsetX: decalage.x, offsetY: decalage.y };
            cadreRecadrage.setPointerCapture(event.pointerId);
        });
        cadreRecadrage.addEventListener("pointermove", event => {
            if (!glissement) return;
            decalage.x = glissement.offsetX + event.clientX - glissement.pointerX;
            decalage.y = glissement.offsetY + event.clientY - glissement.pointerY;
            dessinerRecadrage();
        });
        ["pointerup", "pointercancel", "lostpointercapture"].forEach(type => cadreRecadrage.addEventListener(type, () => glissement = null));
        cadreRecadrage.addEventListener("keydown", event => {
            const pas = event.shiftKey ? 20 : 5;
            const mouvements = { ArrowLeft: [-pas, 0], ArrowRight: [pas, 0], ArrowUp: [0, -pas], ArrowDown: [0, pas] };
            if (!mouvements[event.key]) return;
            event.preventDefault();
            decalage.x += mouvements[event.key][0];
            decalage.y += mouvements[event.key][1];
            dessinerRecadrage();
        });
        photo.addEventListener("change", () => {
            const file = photo.files[0];
            if (!file) return;
            if (!/^image\/(jpeg|png|webp)$/.test(file.type) || file.size > 2_097_152) {
                photo.value = "";
                photoChoisie = null;
                dimensionsPhoto = null;
                retirerPhoto = false;
                zoneRecadrage.hidden = true;
                profilFormulaire.querySelector('[type="submit"]').disabled = false;
                if (apercuPhoto) URL.revokeObjectURL(apercuPhoto);
                apercuPhoto = null;
                afficherPhoto(urlPhoto(profil?.avatar_path));
                message("profile_photo_error");
                return;
            }
            photoChoisie = file;
            retirerPhoto = false;
            if (apercuPhoto) URL.revokeObjectURL(apercuPhoto);
            apercuPhoto = URL.createObjectURL(file);
            profilFormulaire.querySelector('[type="submit"]').disabled = true;
            message("profile_photo_loading");
            imageRecadrage.src = apercuPhoto;
        });
        $("#profile-remove-photo").addEventListener("click", () => {
            retirerPhoto = true;
            photoChoisie = null;
            photo.value = "";
            dimensionsPhoto = null;
            zoneRecadrage.hidden = true;
            if (apercuPhoto) URL.revokeObjectURL(apercuPhoto);
            apercuPhoto = null;
            afficherPhoto(null);
            effacerMessage();
        });
        profilFormulaire.addEventListener("submit", async event => {
            event.preventDefault();
            const displayName = nom.value.trim();
            if (!displayName) return message("profile_name_required");
            const submit = profilFormulaire.querySelector('[type="submit"]');
            const color = profilFormulaire.querySelector('input[name="message_color"]:checked')?.value || palette[0];
            let newPath = null;
            effacerMessage();
            submit.disabled = true;
            submit.textContent = traductions[langueActuelle].profile_saving;
            try {
                let avatarPath = retirerPhoto ? null : profil.avatar_path;
                if (photoChoisie) {
                    newPath = `${utilisateur.id}/${crypto.randomUUID()}`;
                    const tailleSource = Math.min(dimensionsPhoto.width, dimensionsPhoto.height) / Number(zoomRecadrage.value);
                    const echelle = 180 / tailleSource;
                    const centreX = dimensionsPhoto.width / 2 - decalage.x / echelle;
                    const centreY = dimensionsPhoto.height / 2 - decalage.y / echelle;
                    const canvas = document.createElement("canvas");
                    canvas.width = canvas.height = 512;
                    const contexte = canvas.getContext("2d");
                    contexte.fillStyle = "#fff";
                    contexte.fillRect(0, 0, 512, 512);
                    contexte.drawImage(imageRecadrage, centreX - tailleSource / 2, centreY - tailleSource / 2, tailleSource, tailleSource, 0, 0, 512, 512);
                    const photoFinale = await new Promise(resolve => canvas.toBlob(resolve, "image/jpeg", 0.88));
                    if (!photoFinale) throw new Error("Photo invalide");
                    const upload = await stockage().upload(newPath, photoFinale, { contentType: "image/jpeg" });
                    if (upload.error) throw upload.error;
                    avatarPath = newPath;
                }
                const { data: saved, error } = await supabase.from("chat_profiles")
                    .update({ display_name: displayName, avatar_path: avatarPath, message_color: color })
                    .eq("id", utilisateur.id).select("display_name,avatar_path,message_color").single();
                if (error) throw error;
                if (profil.avatar_path && profil.avatar_path !== avatarPath) await stockage().remove([profil.avatar_path]).catch(() => null);
                profil = saved;
                $("#user-display-name").textContent = saved.display_name;
                $("#profile-display-name").textContent = saved.display_name;
                $("#profile-initials").textContent = initiales(saved.display_name);
                nom.value = saved.display_name;
                afficherPhoto(urlPhoto(saved.avatar_path));
                photoChoisie = null;
                retirerPhoto = false;
                dimensionsPhoto = null;
                zoneRecadrage.hidden = true;
                if (apercuPhoto) URL.revokeObjectURL(apercuPhoto);
                apercuPhoto = null;
                photo.value = "";
                message("profile_saved");
            } catch (error) {
                if (newPath) await stockage().remove([newPath]).catch(() => null);
                message("profile_failed", error.message ? ` ${error.message}` : "");
            } finally {
                submit.disabled = false;
                submit.textContent = traductions[langueActuelle].profile_save;
            }
        });
        void chargerProfil();
    }

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

    async function afficherUtilisateurConnecte() {
        const badgeUtilisateur = document.querySelector("#user-display-name");
        if (!badgeUtilisateur || !supabase) return;

        try {
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (authError || !user) {
                badgeUtilisateur.textContent = "";
                badgeUtilisateur.hidden = true;
                return;
            }

            // Retrieve display name from chat_profiles table
            const { data: profile, error: profileError } = await supabase
                .from("chat_profiles")
                .select("display_name")
                .eq("id", user.id)
                .single();

            const displayName = profile?.display_name || user.email;
            badgeUtilisateur.textContent = displayName;
            badgeUtilisateur.hidden = false;
        } catch (err) {
            console.error("Unable to load user profile:", err);
        }
    }

    void afficherUtilisateurConnecte();
    
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
