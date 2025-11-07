#!/bin/bash

# Script pour tester si l'endpoint webhook-return existe sur Vercel
# Usage: ./test-vercel-endpoint.sh https://votre-app.vercel.app

if [ -z "$1" ]; then
  echo "Usage: $0 <votre-url-vercel>"
  echo "Exemple: $0 https://mapscraperhub.vercel.app"
  exit 1
fi

VERCEL_URL=$1
ENDPOINT="${VERCEL_URL}/api/webhook-return"

echo "🧪 Test de l'endpoint: $ENDPOINT"
echo ""

# Test avec un requestId bidon
curl -X POST "$ENDPOINT" \
  -H "Content-Type: application/json" \
  -d '{
    "requestId": "00000000-0000-0000-0000-000000000000",
    "status": "success",
    "rowsReturned": 5,
    "sheetUrl": "https://docs.google.com/spreadsheets/d/test/edit"
  }' \
  -w "\n\nHTTP Status: %{http_code}\n" \
  -v

echo ""
echo "✅ Si vous voyez un code 404 avec 'Search not found' = ENDPOINT EXISTE"
echo "❌ Si vous voyez 'deployment could not be found' = MAUVAISE URL"
