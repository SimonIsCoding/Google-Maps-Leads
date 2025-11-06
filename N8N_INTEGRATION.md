# n8n Integration Guide for MapScraperHub

## Overview

This guide shows you how to connect your n8n workflow to MapScraperHub so that Google Sheets links appear automatically in the user's dashboard.

## How It Works

```
User creates search → MapScraperHub sends webhook to n8n → n8n scrapes data
→ n8n creates Google Sheet → n8n sends callback with sheet URL
→ MapScraperHub displays link in Dashboard
```

---

## Step 1: Receive the Webhook from MapScraperHub

When a user creates a search, MapScraperHub sends this to your n8n webhook:

### Incoming Webhook Structure

```json
{
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "query": "bakery Paris 11",
  "maxRows": 50,
  "callbackUrl": "https://your-app.vercel.app/api/webhook-return"
}
```

### n8n Configuration

1. **Add "Webhook" node** (Trigger)
   - HTTP Method: `POST`
   - Path: `/scrape` (or your custom path)
   - Response Mode: `Immediately`
   - Response Code: `200`
   - Response Data: `First Entry JSON`

2. **Response Body:**
```json
{
  "success": true,
  "requestId": "{{ $json.requestId }}",
  "message": "Scraping started"
}
```

---

## Step 2: Process the Scraping

Add your scraping nodes here (Google Maps scraper, data processing, etc.)

**Important:** Store these values from the webhook:
- `requestId` - You'll need this for the callback
- `callbackUrl` - The URL to send results back to
- `query` - The search query
- `maxRows` - Number of rows requested

---

## Step 3: Create Google Spreadsheet

### Add "Google Sheets" node

1. **Operation:** `Create`
2. **Spreadsheet Title:**
   ```
   MapScraperHub - {{ $node["Webhook"].json["query"] }} - {{ new Date().toISOString().split('T')[0] }}
   ```

3. **Sheet Properties:**
   - Add your scraped data
   - Format as needed

4. **Important:** Save the `spreadsheetId` from the output

---

## Step 4: Send Callback to MapScraperHub ⭐ CRITICAL

This is where you tell MapScraperHub the Google Sheet is ready!

### Add "HTTP Request" node

**Configuration:**

- **Method:** `POST`
- **URL:** `{{ $node["Webhook"].json["callbackUrl"] }}`
- **Authentication:** None
- **Body Content Type:** `JSON`

### Request Body (Success Case):

```json
{
  "requestId": "{{ $node["Webhook"].json["requestId"] }}",
  "status": "success",
  "rowsReturned": {{ $node["YourScraperNode"].json.length }},
  "sheetUrl": "https://docs.google.com/spreadsheets/d/{{ $node["Create Spreadsheet"].json["spreadsheetId"] }}/edit"
}
```

### Request Body (Failure Case):

```json
{
  "requestId": "{{ $node["Webhook"].json["requestId"] }}",
  "status": "failed",
  "errorMessage": "{{ $json.error.message }}"
}
```

---

## Complete n8n Workflow Example

```
┌─────────────┐
│   Webhook   │ ← Receives request from MapScraperHub
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Scraper   │ ← Your Google Maps scraper
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Process   │ ← Clean and format data
│    Data     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Create    │ ← Create Google Spreadsheet
│ Spreadsheet │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Send Callback│ ← Send result to MapScraperHub
│  to MapSH   │
└─────────────┘
```

---

## Field Mapping

### Required Fields in Callback

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `requestId` | string (UUID) | ✅ Yes | Same as received | `"550e8400-..."` |
| `status` | string | ✅ Yes | `"success"` or `"failed"` | `"success"` |
| `rowsReturned` | number | If success | Number of rows scraped | `47` |
| `sheetUrl` | string (URL) | If success | Full Google Sheets URL | `"https://docs.google.com/spreadsheets/d/abc123/edit"` |
| `errorMessage` | string | If failed | Error description | `"Rate limit exceeded"` |

---

## Testing Your Integration

### 1. Test the Webhook Endpoint

From your MapScraperHub app:

```bash
curl -X POST https://your-n8n.com/webhook/scrape \
  -H "Content-Type: application/json" \
  -d '{
    "requestId": "test-123",
    "query": "test bakery",
    "maxRows": 10,
    "callbackUrl": "https://your-app.vercel.app/api/webhook-return"
  }'
```

Expected response:
```json
{
  "success": true,
  "requestId": "test-123",
  "message": "Scraping started"
}
```

### 2. Check n8n Execution Log

- Go to n8n
- Check "Executions"
- Verify all nodes ran successfully
- Check the "Send Callback" node output

### 3. Verify in MapScraperHub Dashboard

1. Go to your Dashboard
2. Find the search by query
3. Status should be "SUCCESS"
4. Click "View Sheet" - should open the Google Sheet

---

## Common Issues & Solutions

### ❌ "Search not found" error

**Cause:** `requestId` in callback doesn't match original request

**Solution:** Make sure you're using the exact same `requestId` from the webhook:
```
{{ $node["Webhook"].json["requestId"] }}
```

### ❌ Link doesn't appear in Dashboard

**Cause:** `sheetUrl` not sent or in wrong format

**Solution:** Use this exact format:
```
https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
```

Example:
```json
{
  "sheetUrl": "https://docs.google.com/spreadsheets/d/{{ $node["Create Spreadsheet"].json["spreadsheetId"] }}/edit"
}
```

### ❌ "Invalid webhook payload" error

**Cause:** Missing required fields or wrong data types

**Solution:** Ensure your callback has:
- `requestId` (string, UUID)
- `status` (string: "success" or "failed")
- `rowsReturned` (number, if success)
- `sheetUrl` (string, full URL, if success)

### ❌ Webhook times out

**Cause:** n8n processing takes too long

**Solution:**
1. Return immediate response in webhook node
2. Process scraping asynchronously
3. Send callback when done

---

## n8n Workflow Template

### Webhook Node (Trigger)
```json
{
  "httpMethod": "POST",
  "path": "scrape",
  "responseMode": "onReceived",
  "responseCode": 200,
  "responseData": "firstEntryJson"
}
```

### Set Variables Node
```json
{
  "values": {
    "requestId": "={{ $json.requestId }}",
    "query": "={{ $json.query }}",
    "maxRows": "={{ $json.maxRows }}",
    "callbackUrl": "={{ $json.callbackUrl }}"
  }
}
```

### HTTP Request Node (Callback)
```json
{
  "method": "POST",
  "url": "={{ $node[\"Webhook\"].json[\"callbackUrl\"] }}",
  "jsonParameters": true,
  "bodyParametersJson": {
    "requestId": "={{ $node[\"Webhook\"].json[\"requestId\"] }}",
    "status": "success",
    "rowsReturned": "={{ $node[\"YourScraper\"].json.length }}",
    "sheetUrl": "=https://docs.google.com/spreadsheets/d/{{ $node[\"Create Spreadsheet\"].json[\"spreadsheetId\"] }}/edit"
  }
}
```

---

## Error Handling

### Add Error Handling Node

If any node fails, send failure callback:

```json
{
  "requestId": "={{ $node[\"Webhook\"].json[\"requestId\"] }}",
  "status": "failed",
  "errorMessage": "={{ $json.error.message || 'Scraping failed' }}"
}
```

### Retry Logic

If callback fails, add retry logic:
- Max 3 attempts
- 2 second delay between attempts
- Log failures for manual review

---

## Security Best Practices

### 1. Validate Webhook Signature (Optional)

Add a secret token to verify requests come from MapScraperHub:

```javascript
// In n8n Function node
const SECRET = 'your-secret-token';
const signature = $node["Webhook"].headers['x-webhook-signature'];

if (signature !== SECRET) {
  throw new Error('Invalid signature');
}

return items;
```

Then in MapScraperHub, add signature to outgoing webhook.

### 2. Rate Limiting

Add rate limiting to prevent abuse:
- Max 10 requests per minute per user
- Use n8n's built-in rate limiter

### 3. Error Logging

Log all webhook calls for debugging:
- Save to database
- Monitor for suspicious patterns

---

## Monitoring & Debugging

### Check n8n Logs

```
Executions → Select execution → View details
```

Look for:
- ✅ Webhook received
- ✅ Scraping completed
- ✅ Spreadsheet created
- ✅ Callback sent

### Check MapScraperHub Logs

In Vercel:
```bash
vercel logs --follow
```

Look for:
```
INFO: Webhook callback received
INFO: Search completed successfully
```

### Check Database

```bash
npx prisma studio
```

Find the search by `requestId` and verify:
- `status` = "SUCCESS"
- `sheetUrl` is populated
- `rowsReturned` is correct

---

## Example: Complete Success Flow

### 1. MapScraperHub sends webhook:
```json
{
  "requestId": "abc-123",
  "query": "bakery Paris",
  "maxRows": 25,
  "callbackUrl": "https://app.vercel.app/api/webhook-return"
}
```

### 2. n8n processes and creates sheet

### 3. n8n sends callback:
```json
{
  "requestId": "abc-123",
  "status": "success",
  "rowsReturned": 25,
  "sheetUrl": "https://docs.google.com/spreadsheets/d/xyz789/edit"
}
```

### 4. MapScraperHub updates database:
- Status → SUCCESS
- sheetUrl → `https://docs.google.com/spreadsheets/d/xyz789/edit`

### 5. User sees in Dashboard:
```
Query: bakery Paris
Status: SUCCESS
Results: 25/25
[View Sheet] ← Clickable link to Google Sheet
```

---

## Need Help?

### Common Questions

**Q: Can I send multiple sheets?**
A: Currently only one `sheetUrl` is supported. Combine data into one sheet.

**Q: What if scraping fails?**
A: Send callback with `status: "failed"` and `errorMessage`.

**Q: How do I test without scraping?**
A: Use the mock-scraper endpoint: `http://localhost:3000/api/mock-scraper`

**Q: Can I update the sheet URL later?**
A: Yes, send another callback with the same `requestId` (it's idempotent).

---

## Next Steps

1. ✅ Configure n8n webhook endpoint
2. ✅ Add scraping logic
3. ✅ Add Google Sheets creation
4. ✅ Add callback with proper format
5. ✅ Test end-to-end
6. ✅ Monitor executions

**That's it!** Your users will see the Google Sheets link automatically in their dashboard! 🎉
