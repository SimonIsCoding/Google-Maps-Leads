# 🚀 Quick n8n Setup Guide

## TL;DR - What You Need to Do

Your n8n workflow must send this **exact format** back to MapScraperHub:

```json
{
  "requestId": "{{ THE SAME UUID YOU RECEIVED }}",
  "status": "success",
  "rowsReturned": 47,
  "sheetUrl": "https://docs.google.com/spreadsheets/d/YOUR_SPREADSHEET_ID/edit"
}
```

Send this to: The `callbackUrl` from the original webhook

---

## 📋 Quick Checklist

- [ ] n8n webhook receives request from MapScraperHub
- [ ] n8n scrapes Google Maps data
- [ ] n8n creates Google Spreadsheet
- [ ] n8n gets the `spreadsheetId` from Google Sheets node
- [ ] n8n sends callback with sheet URL
- [ ] User sees "View Sheet" link in Dashboard

---

## 🎯 The Critical Part: Callback Format

### ✅ CORRECT Format:

```json
{
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "success",
  "rowsReturned": 47,
  "sheetUrl": "https://docs.google.com/spreadsheets/d/1abc123xyz/edit"
}
```

### ❌ WRONG Formats:

```json
// Missing /edit
{
  "sheetUrl": "https://docs.google.com/spreadsheets/d/1abc123xyz"
}

// Wrong field name
{
  "url": "https://docs.google.com/spreadsheets/d/1abc123xyz/edit"
}

// Missing required fields
{
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "success"
  // Missing rowsReturned and sheetUrl
}
```

---

## 🔧 n8n Node Configuration

### Step 1: HTTP Request Node (Send Callback)

**Basic Settings:**
- Method: `POST`
- URL: `{{ $node["Webhook"].json["callbackUrl"] }}`

**Body:**
- Content Type: `JSON`
- Specify Body: `Using Fields Below`

**Fields to Add:**

| Name | Value |
|------|-------|
| `requestId` | `{{ $node["Webhook"].json["requestId"] }}` |
| `status` | `success` |
| `rowsReturned` | `{{ $node["YourScraper"].json.length }}` |
| `sheetUrl` | `https://docs.google.com/spreadsheets/d/{{ $node["Create Spreadsheet"].json["spreadsheetId"] }}/edit` |

---

## 🧪 Test It!

### 1. Get Your Callback URL

Your MapScraperHub URL + `/api/webhook-return`

Example:
```
https://your-app.vercel.app/api/webhook-return
```

### 2. Test with curl

```bash
curl -X POST https://your-app.vercel.app/api/webhook-return \
  -H "Content-Type: application/json" \
  -d '{
    "requestId": "YOUR_REQUEST_ID_FROM_DATABASE",
    "status": "success",
    "rowsReturned": 10,
    "sheetUrl": "https://docs.google.com/spreadsheets/d/test123/edit"
  }'
```

### 3. Check Dashboard

1. Go to Dashboard
2. Find your search
3. Should show "SUCCESS" status
4. Should have "View Sheet" link

---

## 📊 What Happens After Callback?

```
n8n sends callback
       ↓
MapScraperHub receives it
       ↓
Updates database:
  - status = "SUCCESS"
  - sheetUrl = "https://..."
  - rowsReturned = 47
       ↓
Dashboard refreshes (auto every 10s)
       ↓
User sees "View Sheet" link
       ↓
User clicks → Opens Google Sheet
```

---

## 🎨 Dashboard Display

When it works, user sees:

```
╔══════════════════════════════════════════════════════╗
║ Search History                                       ║
╠════════════╦═══════════╦════════╦═════════╦═════════╣
║ Date       ║ Query     ║ Status ║ Results ║ Actions ║
╠════════════╬═══════════╬════════╬═════════╬═════════╣
║ 2025-01-05 ║ bakery    ║ ✅ SUCCESS ║ 47/50 ║ [View   ║
║            ║ Paris 11  ║        ║         ║  Sheet] ║ ← Clickable!
╚════════════╩═══════════╩════════╩═════════╩═════════╝
```

---

## ⚠️ Common Errors

### "Search not found"

**Cause:** `requestId` doesn't match

**Fix:** Copy the exact `requestId` from the webhook:
```javascript
{{ $node["Webhook"].json["requestId"] }}
```

### "Invalid webhook payload"

**Cause:** Missing fields or wrong types

**Fix:** Include all required fields:
- `requestId` (string)
- `status` (string: "success" or "failed")
- `rowsReturned` (number)
- `sheetUrl` (string, full URL)

### Link not showing in Dashboard

**Cause:** Wrong URL format

**Fix:** Must be exactly:
```
https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
```

---

## 💡 Pro Tips

### 1. Save the spreadsheetId

In n8n, the Google Sheets node returns:
```json
{
  "spreadsheetId": "1abc123xyz",
  "spreadsheetUrl": "https://..."
}
```

Use `spreadsheetId` to build the edit URL:
```
https://docs.google.com/spreadsheets/d/{{ $json.spreadsheetId }}/edit
```

### 2. Test with mock data first

Before scraping, test with a hardcoded URL:
```json
{
  "requestId": "test-123",
  "status": "success",
  "rowsReturned": 5,
  "sheetUrl": "https://docs.google.com/spreadsheets/d/1test/edit"
}
```

### 3. Handle errors gracefully

If scraping fails:
```json
{
  "requestId": "{{ $node["Webhook"].json["requestId"] }}",
  "status": "failed",
  "errorMessage": "Rate limit exceeded"
}
```

User will see "FAILED" status with error message.

---

## 🚨 Critical Points

1. ✅ **Always use the same `requestId`** from the webhook
2. ✅ **Always include `/edit`** at the end of the URL
3. ✅ **Send to `callbackUrl`** from the webhook, not a hardcoded URL
4. ✅ **Use exact field names**: `requestId`, `status`, `rowsReturned`, `sheetUrl`
5. ✅ **Set status to "success"** (lowercase)

---

## ✅ Success Checklist

When everything works:

- [ ] n8n receives webhook from MapScraperHub
- [ ] n8n creates Google Sheet successfully
- [ ] n8n sends callback with correct format
- [ ] MapScraperHub logs show "Webhook callback received"
- [ ] MapScraperHub logs show "Search completed successfully"
- [ ] Database shows status = "SUCCESS"
- [ ] Database shows sheetUrl populated
- [ ] Dashboard shows "View Sheet" link
- [ ] Clicking link opens Google Sheet
- [ ] User receives email notification (optional)

---

## 📞 Need Help?

Check:
1. `N8N_INTEGRATION.md` - Full detailed guide
2. Vercel logs: `vercel logs --follow`
3. n8n execution logs
4. Database: `npx prisma studio`

---

**That's it!** Just send the callback with the Google Sheet URL and it will appear automatically in the user's dashboard! 🎉
