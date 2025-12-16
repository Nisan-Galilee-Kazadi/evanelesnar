Déploiement / Configuration de l'API

- Cette application lit l'URL du backend via la variable d'environnement Vite suivante :

  - VITE_API_URL (ex: https://evanebackend-3.onrender.com)

- Important : pour que l'application en production pointe correctement vers votre backend hébergé, définissez la variable `VITE_API_URL` dans la configuration d'environnement de votre plateforme (Netlify / Vercel / Render / etc) **avant** de lancer le build (`npm run build`).

- Pour assurer le bon comportement du SPA lors d'un rafraîchissement sur n'importe quelle route, des fichiers de redirection sont fournis :

  - `public/_redirects` — compatible Netlify et Render (contient `/* /index.html 200`)
  - `vercel.json` — configuration de réécriture pour Vercel

- À la construction (build), une vérification simple sera affichée dans la console navigateur (en mode production) indiquant la valeur de `API_BASE` pour faciliter le debug.

Si vous voulez, je peux aussi :

- retirer `.env` du dépôt et ajouter `.env` à `.gitignore`,
- pousser ces commits sur GitHub pour vous,
- ou préparer un commit séparé pour la configuration de déploiement.
