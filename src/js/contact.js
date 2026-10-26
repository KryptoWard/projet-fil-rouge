(() => {
    "use strict";

    const supabase = window.messagerieSupabase;
    if (!supabase) return;

    const formAjout = document.querySelector("#form-ajouter-contact");
    const inputNom = document.querySelector("#contact-name");
    const feedback = document.querySelector("#contact-status");
    const listeEnvoyees = document.querySelector("#liste-invitations-envoyees");
    const listeRecues = document.querySelector("#liste-invitations-recues");
    const listeContacts = document.querySelector("#liste-contacts");

    function notifier(message, erreur = false) {
        if (!feedback) return;
        feedback.textContent = message;
        feedback.style.color = erreur ? "#933e27" : "#556b2f";
        feedback.hidden = false;
        feedback.removeAttribute("hidden");
    }

    function creerElementVide(texte) {
        const li = document.createElement("li");
        li.textContent = texte;
        return li;
    }

    async function chargerContacts() {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            window.location.replace("index.html");
            return;
        }

        // fetch raw contacts first to avoid join syntax issues
        const { data: contacts, error: contactsError } = await supabase
            .from("user_contacts")
            .select("id, status, requester_id, addressee_id, created_at");

        if (contactsError) {
            console.error("Contacts loading error:", contactsError);
            notifier("Impossible de charger les contacts.", true);
            return;
        }

        // Fetch profile display names for all associated user IDs
        const userIds = [
            ...new Set(contacts.flatMap(c => [c.requester_id, c.addressee_id]))
        ];

        let profilesMap = new Map();
        if (userIds.length > 0) {
            const { data: profiles, error: profilesError } = await supabase
                .from("chat_profiles")
                .select("id, display_name")
                .in("id", userIds);

            if (!profilesError && profiles) {
                profilesMap = new Map(profiles.map(p => [p.id, p.display_name]));
            }
        }

        // Render received pending invitations
        const recues = contacts.filter(c => c.status === "pending" && c.addressee_id === user.id);
        listeRecues.replaceChildren();

        if (recues.length === 0) {
            listeRecues.append(creerElementVide("Aucune invitation reçue."));
        } else {
            recues.forEach(item => {
                const li = document.createElement("li");
                const nom = profilesMap.get(item.requester_id) || "Membre";
                li.textContent = `${nom} souhaite vous ajouter. `;

                const btnAccepter = document.createElement("button");
                btnAccepter.type = "button";
                btnAccepter.textContent = "Accepter";
                btnAccepter.addEventListener("click", async () => {
                    btnAccepter.disabled = true;
                    const { error: updateError } = await supabase
                        .from("user_contacts")
                        .update({ status: "accepted" })
                        .eq("id", item.id);

                    if (updateError) {
                        console.error("Error accepting contact:", updateError);
                        notifier("Impossible d'accepter l'invitation.", true);
                        btnAccepter.disabled = false;
                    } else {
                        await chargerContacts();
                    }
                });

                li.append(btnAccepter);
                listeRecues.append(li);
            });
        }

        // Render sent pending invitations
        const envoyees = contacts.filter(c => c.status === "pending" && c.requester_id === user.id);
        listeEnvoyees.replaceChildren();

        if (envoyees.length === 0) {
            listeEnvoyees.append(creerElementVide("Aucune invitation envoyée."));
        } else {
            envoyees.forEach(item => {
                const li = document.createElement("li");
                const nom = profilesMap.get(item.addressee_id) || "Membre";
                li.textContent = `En attente d'une réponse de ${nom}.`;
                listeEnvoyees.append(li);
            });
        }

        // render confirmed contacts
        const amis = contacts.filter(c => c.status === "accepted");
        listeContacts.replaceChildren();

        if (amis.length === 0) {
            listeContacts.append(creerElementVide("Aucun contact pour le moment."));
        } else {
            amis.forEach(item => {
                const estDemandeur = item.requester_id === user.id;
                const contactId = estDemandeur ? item.addressee_id : item.requester_id;
                const nom = profilesMap.get(contactId) || "Contact";

                const li = document.createElement("li");
                li.textContent = `${nom} `;

                const btnChat = document.createElement("button");
                btnChat.type = "button";
                btnChat.textContent = "Discuter";
                btnChat.addEventListener("click", () => {
                    window.sessionStorage.setItem("direct_chat_target", contactId);
                    window.sessionStorage.setItem("direct_chat_name", nom);
                    window.location.href = "conversations.html";
                });

                li.append(btnChat);
                listeContacts.append(li);
            });
        }
    }

    // Send contact invitation
    if (formAjout) {
        formAjout.addEventListener("submit", async (e) => {
            e.preventDefault();
            const nomSaisi = inputNom.value.trim();
            if (!nomSaisi) return;

            notifier("Recherche du contact…");

            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (authError || !user) {
                window.location.replace("index.html");
                return;
            }

            // Lookup profile by display_name
            const { data: cibles, error: errCible } = await supabase
                .from("chat_profiles")
                .select("id, display_name")
                .ilike("display_name", nomSaisi);

            if (errCible) {
                console.error("Profile search error:", errCible);
                notifier("Erreur lors de la recherche du profil.", true);
                return;
            }

            if (!cibles || cibles.length === 0) {
                notifier("Aucun utilisateur trouvé avec ce nom.", true);
                return;
            }

            const cible = cibles.find(c => c.id !== user.id);

            if (!cible) {
                notifier("Tu ne peux pas t'inviter toi-même en contact.", true);
                return;
            }

            const { error: errInsert } = await supabase
                .from("user_contacts")
                .insert({ requester_id: user.id, addressee_id: cible.id });

            if (errInsert) {
                console.error("Supabase insert error:", errInsert);
                if (errInsert.code === "23505") {
                    notifier("Une invitation existe déjà avec ce membre.", true);
                } else {
                    notifier(`Erreur lors de l'envoi : ${errInsert.message}`, true);
                }
            } else {
                notifier(`Invitation envoyée à ${cible.display_name} !`);
                formAjout.reset();
                await chargerContacts();
            }
        });
    }

    void chargerContacts();
})();