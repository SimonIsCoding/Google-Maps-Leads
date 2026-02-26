# MapScraper Pro — Extraction de leads Google Maps

> Automatisation complète du scraping Google Maps vers Google Sheets via n8n et OutScraper.

---

## Besoin client

Mon client est une **agence web spécialisée dans la création de sites pour des commerces locaux**.

Son problème : trouver des prospects qualifiés était entièrement manuel. Il passait des heures sur Google Maps à chercher des commerces sans site web, en notant à la main le nom, le type d'établissement et les coordonnées, un par un.

**Ce processus était chronophage, répétitif et pas scalable.**

Son besoin se résumait à ceci : taper une recherche du type _"Restaurants Lyon 3ème arrondissement"_ et obtenir automatiquement une liste d'établissements sans site web, prête à l'emploi pour la prospection commerciale.

---

## Solution proposée

### Interface utilisateur

Une interface web simple développée en **HTML / CSS / JavaScript** (3 fichiers, rien de superflu).

L'utilisateur :
1. Entre sa recherche Google Maps (ex : `Plombiers Bordeaux`, `Restaurants italien Paris 11`)
2. Choisit le nombre de résultats souhaités (1 à 500)
3. Clique sur **"Lancer l'extraction"**
4. Reçoit en retour un lien direct vers un Google Sheet avec toutes les données

Une barre de progression animée accompagne l'attente, et le lien s'affiche automatiquement dès que l'extraction est terminée.

---

### Architecture du workflow n8n

Le workflow se déclenche via un **webhook** appelé par l'interface. À partir de là, **deux branches parallèles** se lancent simultanément :

- **Branche 1** : Création du Google Sheet de destination avec les bons headers, prêt à recevoir les données
- **Branche 2** : Lancement du scraping via l'**API OutScraper**

Ce parallélisme optimise le temps d'exécution : pendant que le scraping tourne, le spreadsheet est déjà configuré.

---

### Gestion de l'asynchronisme — Le point technique clé

L'API OutScraper ne retourne pas les données immédiatement. Elle fonctionne avec un **ID de tâche** : il faut interroger l'API en boucle pour savoir quand le scraping est terminé. C'est du **polling classique**.

La solution naïve (un simple `wait` de 30 secondes) posait deux problèmes :
- Trop long → mauvaise expérience utilisateur
- Trop court → le workflow échoue

**La solution mise en place :** toute la logique de polling a été extraite dans un **sub-workflow dédié**. Le workflow principal appelle ce sub-workflow via un nœud `Execute Workflow` et reste bloqué jusqu'à ce qu'il reçoive une réponse.

Le sub-workflow, lui, gère toute la complexité :
- Interroge l'API **toutes les secondes**
- Incrémente un compteur de tentatives
- Vérifie deux conditions de sortie :
  - ✅ Statut `success` → renvoie les données au workflow principal
  - ⏱️ Dépassement des **60 tentatives** → renvoie un statut `timeout` propre plutôt qu'une erreur non gérée

**Avantage clé de cette architecture :** ce sub-workflow de polling est **100% réutilisable** pour n'importe quel projet utilisant une API asynchrone (OutScraper, Apify, etc.).

---

### Filtrage et output

Une fois les données récupérées, un filtre est appliqué sur le champ `site web` :

> Les établissements dont le site web est uniquement un lien **Facebook**, **Instagram** ou **Tripadvisor** sont conservés comme prospects prioritaires — ce sont des commerces sans vrai site web, donc des cibles directes pour l'agence.

Les données filtrées sont ensuite :
- Injectées dans le **Google Sheet** créé en amont
- Le sheet est partagé en **lecture publique** automatiquement
- L'URL est renvoyée à l'interface, et l'utilisateur peut y accéder directement

---

## Résultat concret

| Avant | Après |
|-------|-------|
| ~10h/semaine de recherche manuelle | Quelques secondes par extraction |
| 1 ville prospectée à la fois | Plusieurs villes en parallèle |
| Données notées à la main | Google Sheet structuré, prêt à l'emploi |
| Processus non reproductible | Workflow automatisé, réutilisable à l'infini |

> Ce workflow a fait **gagner environ 10 heures par semaine** au client. Ce qui prenait une demi-journée se fait désormais en quelques secondes.

---

## Stack technique

| Composant | Technologie |
|-----------|-------------|
| Interface | HTML, CSS, JavaScript (vanilla) |
| Orchestration | n8n (self-hosted) |
| Scraping | API OutScraper |
| Stockage | Google Sheets (API) |
| Déclencheur | Webhook HTTP |

---

## Structure du projet

```
.
├── index.html     # Interface utilisateur
├── style.css      # Design system (dark theme, glassmorphism)
└── script.js      # Logique front (appel webhook, progress bar, gestion états)
```

---

## Configuration

Dans `script.js`, renseignez votre URL de webhook n8n :

```js
const WEBHOOK_URL = "https://votre-instance-n8n.com/webhook/search";
```

Le workflow n8n doit retourner une réponse JSON au format suivant :

```json
{ "sheetUrl": "https://docs.google.com/spreadsheets/d/..." }
```

---

## Gestion de projet

Avant de construire quoi que ce soit, une **carte mentale Miro** a été créée pour cadrer les besoins du client et valider la direction technique avant de coder.

Durant le projet, des **Looms de 2 à 5 minutes** étaient envoyés au client à chaque avancée majeure pour maintenir la transparence — essentiel sur des projets techniques où le client ne voit pas ce qui se passe en coulisse.

---

*Réalisé par [Simon](https://github.com/SimonIsCoding) — Freelance tech, spécialisé en code et automatisation N8N.*
