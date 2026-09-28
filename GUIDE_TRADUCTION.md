# Guide simple : changer la langue et traduire les messages

## Ce qui est déjà en place

Le bouton **English / Français** change les textes de la page d’inscription et de la page des conversations. Il ne fait pas appel à une API : pour le moment, les deux versions des textes sont rangées dans `src/js/app.js`. Les pages utilisent des repères `data-i18n` pour dire quel texte doit changer.

Le choix est mémorisé dans le navigateur. Pour ajouter une autre langue, il faut ajouter un nouveau bloc de textes dans `traductionsLocales`, puis lui donner la même clé pour chaque texte à traduire.

## API gratuite pour commencer

Pour un petit projet étudiant, **MyMemory** est une option simple à essayer : son API accepte une demande de traduction sans clé. La limite annoncée est de **5 000 caractères par jour** sans inscription, ou **50 000 caractères par jour** si on fournit une adresse e-mail dans le paramètre prévu. Une phrase ne peut pas dépasser 500 octets. Ces quotas peuvent changer, donc il faut les revérifier avant une mise en ligne. [Documentation de l’API](https://mymemory.translated.net/doc/spec.php) · [Limites d’utilisation](https://mymemory.translated.net/doc/usagelimits.php).

Exemple de demande depuis JavaScript :

```js
async function traduireTexte(texte, langueSource, langueCible) {
    const adresse = new URL("https://api.mymemory.translated.net/get");
    adresse.search = new URLSearchParams({
        q: texte,
        langpair: `${langueSource}|${langueCible}`
    });

    const reponse = await fetch(adresse);
    if (!reponse.ok) {
        throw new Error("La traduction n'a pas fonctionné.");
    }

    const resultat = await reponse.json();
    return resultat.responseData.translatedText;
}
```

On pourrait ensuite appeler cette fonction avec `traduireTexte("Bonjour", "fr", "en")`. Si la demande échoue ou si le quota est atteint, le site devrait garder le texte original et afficher un petit message d’erreur.

Si le navigateur bloque la demande à cause des règles CORS, il faudra faire l’appel depuis le serveur du site à la place. Et si une autre API demande une clé, on la garde côté serveur, jamais dans le JavaScript public.

## Pour traduire l’interface

Pour les boutons, les menus et les titres, le dictionnaire déjà commencé dans `app.js` est le plus simple. Ces phrases changent rarement : on les écrit une fois dans chaque langue et on n’utilise pas le quota de l’API à chaque visite.

Si le site grandit, on pourra déplacer les dictionnaires français et anglais dans deux fichiers JSON. Le bouton chargera alors le fichier correspondant à la langue choisie.

## Pour traduire les messages d’une conversation

Les messages sont différents des textes du site. Une méthode simple serait :

1. Garder et enregistrer le message original dans la conversation.
2. Choisir la langue préférée de la personne qui lit le message.
3. Demander une traduction quand un message arrive, ou quand la personne appuie sur **Traduire**.
4. Afficher la traduction sous le texte original, sans remplacer celui-ci.
5. Garder la traduction en mémoire pour ne pas envoyer la même phrase plusieurs fois à l’API.

Quand on envoie le texte d’un message à une API externe, le service reçoit ce texte. Il faudra donc prévenir les utilisateurs et vérifier les conditions du service avant d’activer cette fonction sur de vraies conversations.

## Si on veut héberger l’API soi-même

[LibreTranslate](https://docs.libretranslate.com/) est un logiciel libre avec une API. On peut l’installer sur son ordinateur pour faire des essais sans payer d’abonnement à une API. Pour que le site soit accessible à tout le monde, il faut ensuite un ordinateur ou un serveur qui reste en ligne. Le service hébergé public peut demander une clé API, donc il faut vérifier ses conditions avant de le choisir. [Installation](https://docs.libretranslate.com/guides/installation/) · [Exemple d’appel API](https://docs.libretranslate.com/guides/api_usage/).

## Ordre conseillé pour la suite

1. Finir les textes français et anglais de chaque page.
2. Tester le bouton sur toutes les pages du site.
3. Essayer l’API avec quelques phrases non personnelles.
4. Ajouter la traduction à une conversation de test, en gardant toujours le message original.
5. Vérifier les limites et les conditions de l’API avant de publier le site.
