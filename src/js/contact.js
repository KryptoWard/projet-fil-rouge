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

    async function chargerContacts() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            window.location.replace("index.html");
            return;
        }

        // 1.Retrieving relationships with associated profiles
        const { data: contacts, error } = await supabase
            .from("user_contacts")
            .select(`
                id, status, requester_id, addressee_id,
                requester:chat_profiles!requester_id(display_name),
                addressee:chat_profiles!addressee_id(display_name)
            `);

        if (error) {
            console.error("Erreur contacts :", error);
            return;
        }

        // 2. Invitations received (pending)
        const recues = contacts.filter(c => c.status === "pending" && c.addressee_id === user.id);
        listeRecues.replaceChildren();

        if (recues.length === 0) {
            listeRecues.innerHTML = "<li>Aucune invitation reçue.</li>";
        } else {
            recues.forEach(item => {
                const li = document.createElement("li");
                const nom = item.requester?.display_name || "Membre";
                li.textContent = `${nom} souhaite vous ajouter. `;

                const btnAccepter = document.createElement("button");
                btnAccepter.type = "button";
                btnAccepter.textContent = "Accepter";
                btnAccepter.addEventListener("click", async () => {
                    await supabase
                        .from("user_contacts")
                        .update({ status: "accepted" })
                        .eq("id", item.id);
                    await chargerContacts();
                });

                li.append(btnAccepter);
                listeRecues.append(li);
            });
        }

        // 3. Invitations sent (pending)
        const envoyees = contacts.filter(c => c.status === "pending" && c.requester_id === user.id);
        listeEnvoyees.replaceChildren();

        if (envoyees.length === 0) {
            listeEnvoyees.innerHTML = "<li>Aucune invitation envoyée.</li>";
        } else {
            envoyees.forEach(item => {
                const li = document.createElement("li");
                const nom = item.addressee?.display_name || "Membre";
                li.textContent = `En attente d'une réponse de ${nom}.`;
                listeEnvoyees.append(li);
            });
        }

        // 4. Confirmed contacts
        const amis = contacts.filter(c => c.status === "accepted");
        listeContacts.replaceChildren();

        if (amis.length === 0) {
            listeContacts.innerHTML = "<li>Aucun contact pour le moment.</li>";
        } else {
            amis.forEach(item => {
                const estDemandeur = item.requester_id === user.id;
                const contactProfil = estDemandeur ? item.addressee : item.requester;
                const contactId = estDemandeur ? item.addressee_id : item.requester_id;
                const nom = contactProfil?.display_name || "Contact";

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

    // 5.Managing the sending of invitations by full name
    if (formAjout) {
        formAjout.addEventListener("submit", async (e) => {
            e.preventDefault();
            const nomSaisi = inputNom.value.trim();
            if (!nomSaisi) return;

            notifier("Recherche du contact…");

            const { data: { user } } = await supabase.auth.getUser();

            //Search for a profile by its display_name
            const { data: cibles, error: errCible } = await supabase
                .from("chat_profiles")
                .select("id, display_name")
                .ilike("display_name", nomSaisi);

            if (errCible) {
                console.error("Erreur recherche profil :", errCible);
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
                console.error("Détail de l'erreur Supabase :", errInsert);
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