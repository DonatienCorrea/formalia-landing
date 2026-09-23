# Formalia — landing page

Landing page (page d'accès anticipé) pour **Formalia**, un projet d'agent qui
remplit automatiquement les démarches administratives : passeport, CNI,
visas, titre de séjour, dossier CAF, logement, assurances, et plus.

> Le nom « Formalia » a été proposé par l'assistant en l'absence de réponse de
> l'utilisateur au moment de la conception (voir `PRODUCT.md`) — à confirmer
> ou changer librement avant de le rendre public plus largement (nom de
> domaine, marque, etc.).

Site statique (HTML/CSS/JS, sans framework ni build) pensé pour être servi
tel quel par **GitHub Pages**.

## Structure

```
index.html     Page unique
styles.css     Styles (monde visuel "le cachet officiel")
script.js      Animation du formulaire + gestion des formulaires
assets/        Favicon SVG
PRODUCT.md     Contexte produit (Impeccable) : hypothèses posées, à relire
```

## Développement local

Aucune dépendance : ouvrez `index.html` dans un navigateur, ou servez le
dossier avec n'importe quel serveur statique, par exemple :

```bash
python3 -m http.server 8080
```

## Formulaire d'accès anticipé

Les deux formulaires ("Rejoindre l'accès anticipé") ne sont **pas connectés
à un vrai service** aujourd'hui : ils valident l'e-mail côté client et
affichent un message de confirmation local, sans rien envoyer (c'est
documenté sur la page elle-même, section « En toute franchise »). Avant la
mise en ligne définitive, branchez un vrai service de collecte d'e-mails
(Formspree, Buttondown, Mailchimp, votre propre API…) dans `script.js`
(fonction `wireForm`).

## Déploiement (GitHub Pages)

Le site est publié via GitHub Pages, branche `main`, dossier racine. Toute
modification poussée sur `main` est republiée automatiquement.
