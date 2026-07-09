# Configuration du Backend — DiwanE Al Maaref

Ce dossier contient le script qui reçoit les inscriptions du formulaire public,
enregistre les fichiers dans Google Drive, et écrit chaque dossier dans une
feuille Google Sheets, consultable ensuite depuis le tableau de bord admin.

Aucun serveur à héberger : tout tourne gratuitement sur l'infrastructure Google
(Google Sheets + Google Apps Script + Google Drive).

---

## Étape 1 — Créer la feuille de calcul

1. Allez sur [sheets.google.com](https://sheets.google.com) et créez une nouvelle feuille.
2. Nommez-la par exemple **"DiwanE Al Maaref — Inscriptions"**.
3. Le script créera automatiquement l'onglet `Inscriptions` avec les bons en-têtes
   dès la première inscription — vous n'avez rien à préparer manuellement.

## Étape 2 — Ouvrir l'éditeur Apps Script

1. Dans votre feuille, allez dans le menu **Extensions → Apps Script**.
2. Supprimez le contenu par défaut du fichier `Code.gs`.
3. Copiez-collez tout le contenu du fichier `Code.gs` fourni dans ce dossier.

## Étape 3 — Configurer le secret administrateur

Dans le fichier `Code.gs`, modifiez cette ligne :

```js
const ADMIN_TOKEN = 'CHANGE_THIS_TO_A_LONG_RANDOM_SECRET';
```

Remplacez la valeur par une longue chaîne aléatoire et secrète (par exemple générée
avec un gestionnaire de mots de passe). **Ne partagez ce jeton qu'avec le personnel
autorisé** — c'est ce qui protège l'accès au tableau de bord administrateur.

## Étape 4 — Déployer en tant qu'application Web

1. Cliquez sur **Déployer → Nouveau déploiement**.
2. Cliquez sur l'icône ⚙️ à côté de "Sélectionner le type" → choisissez **Application Web**.
3. Configurez :
   - **Exécuter en tant que** : Moi (votre compte Google)
   - **Qui a accès** : **Tout le monde** (nécessaire pour que le formulaire public
     et le tableau de bord puissent communiquer avec le script)
4. Cliquez sur **Déployer**.
5. Google vous demandera d'autoriser le script (accès à Sheets/Drive) — acceptez.
6. Copiez l'**URL de l'application Web** fournie (elle se termine par `/exec`).

## Étape 5 — Brancher le frontend

Ouvrez les deux fichiers suivants et remplacez la constante `API_URL` en haut du
`<script>` par l'URL copiée à l'étape précédente :

- `inscription.html`
- `admin-dashboard.html`

```js
const API_URL = "https://script.google.com/macros/s/XXXXXXXXXXXXXXXX/exec";
```

## Étape 6 — Mettre à jour le script après modification

Si vous modifiez `Code.gs` plus tard (par exemple pour changer le jeton admin),
vous devez créer une **nouvelle version** du déploiement :

1. **Déployer → Gérer les déploiements**
2. Cliquez sur l'icône ✏️ à côté de votre déploiement actif
3. Dans "Version", choisissez **Nouvelle version** → **Déployer**

(L'URL `/exec` reste la même — inutile de la remplacer dans le frontend à chaque fois.)

---

## Ce que fait le script

- **`doPost`** : reçoit les données du formulaire public (`inscription.html`),
  enregistre les 3 fichiers (photo, acte de naissance, CIN des parents) dans un
  sous-dossier Google Drive dédié à chaque élève, puis ajoute une ligne à la
  feuille `Inscriptions` avec un **ID séquentiel automatique**.
- **`doGet`** : utilisé par `admin-dashboard.html`. Exige le paramètre
  `?token=VOTRE_JETON_ADMIN` — sans le bon jeton, aucune donnée n'est renvoyée.
  Retourne toutes les inscriptions en JSON, les plus récentes en premier.

## Sécurité — à savoir

- Ce système utilise un **jeton partagé simple** plutôt qu'un vrai système
  d'authentification (comptes utilisateurs, mots de passe individuels). C'est
  adapté à une petite équipe administrative, mais gardez le jeton confidentiel
  et changez-le si vous soupçonnez une fuite.
- Les fichiers uploadés sont partagés en mode **"Toute personne disposant du lien
  peut consulter"** — cela permet au tableau de bord d'afficher les aperçus, mais
  signifie que quiconque possède un lien de fichier individuel peut le consulter.
  Pour un usage à plus grande échelle, envisagez une vraie authentification
  Google Workspace (OAuth) et des permissions Drive restreintes au domaine de
  l'école.
- Les tailles de fichiers sont limitées côté formulaire (voir `inscription.html`)
  pour éviter les dépassements de quota Apps Script/Drive.
