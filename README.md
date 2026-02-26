# MapScraper Pro — Google Maps Lead Extraction

> Full automation pipeline: scrape Google Maps businesses → filter by website presence → export to Google Sheets. Built with n8n and OutScraper.

---

## Demo

<!-- Replace the placeholder below with your GIF or video link -->
> **Add a GIF or video here to showcase the workflow in action.**
>
> - **GIF:** `![Demo](assets/demo.gif)`
> - **YouTube / Loom:** paste the URL or use an embed link
> - **Screenshot:** `![Screenshot](assets/screenshot.png)`

---

## Problem

Finding local businesses that don't have a website is entirely manual by default. You search on Google Maps, scroll through results, check each listing one by one, and note down the name, category, and contact info — business by business.

**That process is slow, repetitive, and doesn't scale.**

The goal: type a search like _"Italian restaurants Paris 11th"_ and instantly get a structured list of businesses with no real website, ready for outreach.

---

## Solution

### User Interface

A lightweight web interface built in **HTML / CSS / JavaScript** — 3 files, nothing more.

The user:
1. Types a Google Maps search query (e.g. `Plumbers Lyon`, `Italian restaurants Paris 11`)
2. Sets the number of results to extract (1–500)
3. Clicks **"Start extraction"**
4. Gets a direct link to a Google Sheet with all the data

An animated progress bar runs during extraction, and the link appears automatically once the job is done.

---

### n8n Workflow Architecture

The workflow is triggered by a **webhook** called by the interface. Two **parallel branches** then run simultaneously:

- **Branch 1** — Creates the destination Google Sheet with the correct headers, ready to receive data
- **Branch 2** — Starts the scraping job via the **OutScraper API**

Running both in parallel saves time: the spreadsheet is already set up while the scraping is still running.

---

### Async Polling — The Core Technical Challenge

The OutScraper API doesn't return data immediately. It works with a **task ID**: you have to poll the API in a loop until the job is complete.

A naive fixed `wait` of 30 seconds creates two problems:
- Too long → bad user experience
- Too short → the workflow fails

**The solution:** the entire polling logic is extracted into a **dedicated sub-workflow**. The main workflow calls it via an `Execute Workflow` node and stays blocked until a result comes back.

The sub-workflow handles all the complexity:
- Polls the API **every second**
- Increments an attempt counter
- Checks two exit conditions:
  - ✅ Status is `success` → returns data to the main workflow
  - ⏱️ Exceeds **60 attempts** → returns a clean `timeout` status instead of an unhandled error

**Key benefit:** this polling sub-workflow is **fully reusable** across any project that uses an async API — OutScraper, Apify, or others.

---

### Filtering & Output

Once the data is retrieved, a filter is applied on the `website` field:

> Businesses whose only web presence is a **Facebook**, **Instagram**, or **Tripadvisor** link are flagged as priority leads — they have no real website.

The filtered data is then:
- Injected into the Google Sheet created earlier
- The sheet is automatically shared with **public read access**
- The URL is sent back to the interface so the user can access the list immediately

---

## Outcome

| Before | After |
|--------|-------|
| ~10h/week of manual research | A few seconds per extraction |
| One city at a time | Multiple cities in parallel |
| Data written down by hand | Structured Google Sheet, ready to use |
| Non-reproducible process | Automated, reusable workflow |

> What used to take half a day now runs **in seconds**.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | HTML, CSS, JavaScript (vanilla) |
| Orchestration | n8n (self-hosted) |
| Scraping | OutScraper API |
| Storage | Google Sheets API |
| Trigger | HTTP Webhook |

---

## Project Structure

```
.
├── index.html     # User interface
├── style.css      # Design system (dark theme, glassmorphism)
└── script.js      # Frontend logic (webhook call, progress bar, UI states)
```

---

## Configuration

In `script.js`, set your n8n webhook URL:

```js
const WEBHOOK_URL = "https://your-n8n-instance.com/webhook/search";
```

The n8n workflow must return a JSON response in this format:

```json
{ "sheetUrl": "https://docs.google.com/spreadsheets/d/..." }
```

---

*Built by [Simon](https://github.com/SimonIsCoding) — Freelance developer, specialized in code and n8n automation.*
