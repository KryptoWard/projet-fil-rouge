# Activer la messagerie persistante

Le site utilise Supabase Auth, PostgreSQL et Realtime. Les canaux sont communs à **tous les utilisateurs connectés**, comme convenu. Les visiteurs déconnectés n'ont aucun accès aux tables de chat.

## Mise en place

1. Ouvrir le projet Supabase correspondant à l'URL de `src/js/app.js`.
2. Appliquer `migrations/202610220001_chat.sql` dans le SQL Editor, ou avec les migrations de la CLI Supabase configurée pour ce projet.
3. Vérifier que les tables `chat_channels` et `chat_messages` figurent dans la publication `supabase_realtime`. La migration les ajoute automatiquement.
4. Servir le site en HTTP, puis se connecter avec deux comptes différents dans deux navigateurs ou profils distincts.

La migration crée uniquement les tables et fonctions préfixées `chat_`, complète les profils des comptes existants et crée le canal Général. Elle ne remplace aucune table existante du projet. Elle peut être réappliquée pour vérifier la configuration.

## Données et accès

- `chat_profiles` : identifiant et nom affiché, sans adresse e-mail. Un déclencheur crée le profil à l'inscription.
- `chat_channels` : nom, description, auteur et date de création.
- `chat_messages` : canal, auteur, date, texte ou instantané météo structuré.

Les politiques RLS autorisent la lecture aux utilisateurs connectés et imposent `auth.uid()` comme auteur de chaque nouvel envoi. Les clients ne peuvent pas modifier la date d'envoi, réécrire ou supprimer les messages via cette première version. Le texte est limité à 4 000 caractères. Les cartes météo sont reconstruites avec les données enregistrées, sans stocker de HTML ou de SVG fourni par un utilisateur.

Le client charge les 50 derniers messages, puis propose les messages précédents. Les événements Realtime sont dédupliqués par identifiant. Un rattrapage de l'historique est effectué à la reconnexion, et une actualisation toutes les 15 secondes permet de récupérer les messages si Realtime est indisponible.

## Configuration du site

`src/js/app.js` contient l'URL et la clé publique du projet déjà utilisées par le site. Il crée un seul client partagé par l'authentification et la messagerie. Aucune clé `service_role`, aucun mot de passe de base et aucun jeton d'administration ne doit être ajouté au site ou à GitHub Pages.

Si la confirmation d'adresse e-mail est activée, il faut confirmer son compte avant de se connecter. Un accès direct à Conversations sans session redirige vers l'accueil. Une erreur d'enregistrement conserve le brouillon et ne crée pas de faux message local.

## Vérification après activation

Depuis le compte A, créer un canal et envoyer un message. Le compte B doit voir le canal et le message, pouvoir répondre et retrouver les deux messages après rechargement. Vérifier également une carte `/meteo [ville]`, le chargement d'un historique de plus de 50 messages et le retour après une coupure réseau.

Les contrôles locaux du SQL et de l'interface ne remplacent pas cette vérification avec deux vraies sessions sur le projet Supabase.

## GIF avec KLIPY

1. Appliquer uniquement la nouvelle migration `migrations/202610220002_gifs.sql` dans le SQL Editor si la première migration est déjà installée.
2. Créer une clé pour le site dans le [Partner Panel KLIPY](https://partner.klipy.com/), puis la renseigner dans `KLIPY_API_KEY`, en haut de `src/js/gifs.js`. Utiliser la clé prévue pour l'intégration web, jamais un jeton d'administration.
3. Publier les fichiers modifiés sur GitHub Pages. Le bouton GIF ouvre la recherche ; un clic sur un résultat envoie le GIF dans le canal ouvert au départ.

Les requêtes de recherche et les images sont chargées directement depuis KLIPY. Les mots recherchés sont donc transmis à ce service. Les résultats gardent l'ordre de KLIPY et la grille affiche son attribution. La base conserve les liens et les informations du GIF, pas de copie du fichier média. Un lien pourra devenir indisponible si le fournisseur retire le contenu.

Le mode de test KLIPY est limité à 100 requêtes par heure ; demander l'accès Production depuis le Partner Panel pour la mise en ligne. Suivre les [consignes et attributions KLIPY](https://docs.klipy.com/) avant la publication.

Sans clé ou avant application de la migration GIF, la recherche ou l'envoi affiche un message explicatif. Les messages texte et météo restent utilisables avec la première migration.
