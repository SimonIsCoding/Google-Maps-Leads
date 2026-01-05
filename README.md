# Google Maps Data Extractor

Interface web simple pour extraire des données de Google Maps via n8n.

## Utilisation

1. Ouvrir `public/index.html` dans un navigateur
2. Entrer votre recherche Google Maps (ex: "Restaurant à Paris")
3. Choisir le nombre de résultats (1-100)
4. Cliquer sur "Rechercher"
5. Attendre ~60 secondes
6. Cliquer sur le lien pour ouvrir votre Google Sheet

## Configuration

L'interface se connecte au webhook n8n :
`https://n8n.srv1076432.hstgr.cloud/webhook/search`

Le webhook n8n doit retourner :
```json
{
  "sheetUrl": "https://docs.google.com/spreadsheets/d/..."
}
```

## Fichiers

- `public/index.html` - Interface HTML
- `public/style.css` - Styles CSS
- `public/script.js` - Logique JavaScript
