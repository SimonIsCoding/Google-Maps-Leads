#!/bin/bash

# Test Webhook Callback Script
# This script helps you test if your n8n callback works correctly

echo "🧪 MapScraperHub Webhook Callback Tester"
echo "========================================"
echo ""

# Check if required arguments are provided
if [ $# -lt 2 ]; then
    echo "Usage: ./test-webhook-callback.sh <APP_URL> <REQUEST_ID>"
    echo ""
    echo "Example:"
    echo "  ./test-webhook-callback.sh https://your-app.vercel.app abc-123-456"
    echo ""
    echo "To get a REQUEST_ID:"
    echo "  1. Create a search in your app"
    echo "  2. Go to Dashboard"
    echo "  3. Check the database with: npx prisma studio"
    echo "  4. Find the 'requestId' field"
    echo ""
    exit 1
fi

APP_URL=$1
REQUEST_ID=$2

# Remove trailing slash from APP_URL
APP_URL=${APP_URL%/}

CALLBACK_URL="${APP_URL}/api/webhook-return"

echo "App URL: $APP_URL"
echo "Callback URL: $CALLBACK_URL"
echo "Request ID: $REQUEST_ID"
echo ""

# Test 1: Success with Google Sheet
echo "📝 Test 1: Sending SUCCESS callback with Google Sheet URL..."
echo ""

RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "$CALLBACK_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"requestId\": \"$REQUEST_ID\",
    \"status\": \"success\",
    \"rowsReturned\": 25,
    \"sheetUrl\": \"https://docs.google.com/spreadsheets/d/test-spreadsheet-id/edit\"
  }")

HTTP_BODY=$(echo "$RESPONSE" | sed -e 's/HTTP_STATUS\:.*//g')
HTTP_STATUS=$(echo "$RESPONSE" | tr -d '\n' | sed -e 's/.*HTTP_STATUS://')

echo "Response Status: $HTTP_STATUS"
echo "Response Body: $HTTP_BODY"
echo ""

if [ "$HTTP_STATUS" -eq 200 ]; then
    echo "✅ SUCCESS! Callback was accepted."
    echo ""
    echo "Next steps:"
    echo "  1. Go to your Dashboard: ${APP_URL}/dashboard"
    echo "  2. Find the search with query matching your test"
    echo "  3. Status should show: SUCCESS"
    echo "  4. You should see a 'View Sheet' link"
    echo "  5. Click it to open the Google Sheet"
    echo ""
else
    echo "❌ FAILED! HTTP Status: $HTTP_STATUS"
    echo ""
    echo "Possible issues:"
    echo "  - Request ID doesn't exist in database"
    echo "  - Request ID format is incorrect (should be UUID)"
    echo "  - Search already processed"
    echo "  - API endpoint not accessible"
    echo ""
fi

# Show what was sent
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📤 Data sent to MapScraperHub:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cat <<EOF
{
  "requestId": "$REQUEST_ID",
  "status": "success",
  "rowsReturned": 25,
  "sheetUrl": "https://docs.google.com/spreadsheets/d/test-spreadsheet-id/edit"
}
EOF
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test 2: Failure case (optional)
read -p "Do you want to test a FAILURE callback? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "📝 Test 2: Sending FAILURE callback..."
    echo ""

    RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "$CALLBACK_URL" \
      -H "Content-Type: application/json" \
      -d "{
        \"requestId\": \"$REQUEST_ID\",
        \"status\": \"failed\",
        \"errorMessage\": \"Test error: Rate limit exceeded\"
      }")

    HTTP_BODY=$(echo "$RESPONSE" | sed -e 's/HTTP_STATUS\:.*//g')
    HTTP_STATUS=$(echo "$RESPONSE" | tr -d '\n' | sed -e 's/.*HTTP_STATUS://')

    echo "Response Status: $HTTP_STATUS"
    echo "Response Body: $HTTP_BODY"
    echo ""

    if [ "$HTTP_STATUS" -eq 200 ]; then
        echo "✅ FAILURE callback accepted."
        echo ""
        echo "Check Dashboard:"
        echo "  - Status should show: FAILED"
        echo "  - Error message: 'Test error: Rate limit exceeded'"
        echo ""
    fi
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎯 Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "What this script tested:"
echo "  ✅ Webhook callback endpoint is accessible"
echo "  ✅ Callback accepts correct JSON format"
echo "  ✅ Request ID validation works"
echo "  ✅ Database update works"
echo ""
echo "In n8n, you need to send the exact same format:"
echo ""
cat <<'EOF'
{
  "requestId": "{{ $node["Webhook"].json["requestId"] }}",
  "status": "success",
  "rowsReturned": {{ $node["YourScraper"].json.length }},
  "sheetUrl": "https://docs.google.com/spreadsheets/d/{{ $node["Create Spreadsheet"].json["spreadsheetId"] }}/edit"
}
EOF
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📚 For more help, check:"
echo "  - N8N_INTEGRATION.md (detailed guide)"
echo "  - QUICK_N8N_SETUP.md (quick reference)"
echo ""
