// ═══════════════════════════════════════════════════════════════
// CONFIGURATION - COLLEZ VOTRE WEBHOOK N8N CI-DESSOUS
// ═══════════════════════════════════════════════════════════════

const WEBHOOK_URL = "VOTRE_WEBHOOK_N8N_ICI";

// Dur\u00e9e de la barre de progression (en secondes)
const PROGRESS_DURATION = 60;

// ═══════════════════════════════════════════════════════════════


// ─────────────────────────────────────────────────────────────
// DOM References
// ─────────────────────────────────────────────────────────────
const form             = document.getElementById('scraper-form');
const searchInput      = document.getElementById('search-input');
const btnSubmit        = document.getElementById('btn-submit');
const btnText          = btnSubmit.querySelector('.btn-text');
const feedbackSuccess  = document.getElementById('feedback-success');
const feedbackError    = document.getElementById('feedback-error');
const errorMessage     = document.getElementById('error-message');
const retryBtn         = document.getElementById('retry-btn');
const maxRowsInput     = document.getElementById('maxrows-input');
const header           = document.getElementById('header');
const progressSection  = document.getElementById('progress-section');
const progressBar      = document.getElementById('progress-bar');
const progressPercent  = document.getElementById('progress-percent');
const progressLabel    = document.getElementById('progress-label');
const resultLink       = document.getElementById('result-link');

let progressTimer   = null;


// ─────────────────────────────────────────────────────────────
// Header — Scroll effect (transparent → blurred)
// ─────────────────────────────────────────────────────────────
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 10);
}, { passive: true });


// ─────────────────────────────────────────────────────────────
// UI State Helpers
// ─────────────────────────────────────────────────────────────
function hideAll() {
  feedbackSuccess.classList.remove('visible');
  feedbackError.classList.remove('visible');
  progressSection.classList.remove('visible');
  resultLink.classList.remove('visible');
}

function setLoadingState(loading) {
  btnSubmit.disabled = loading;
  btnSubmit.classList.toggle('loading', loading);
  btnText.textContent = loading ? 'Extraction en cours...' : "Lancer l'extraction";
}


// ─────────────────────────────────────────────────────────────
// Progress Bar — Animated over PROGRESS_DURATION seconds
// ─────────────────────────────────────────────────────────────
function startProgress() {
  progressSection.classList.add('visible');
  progressLabel.textContent = 'Extraction en cours...';
  progressBar.style.width = '0%';
  progressPercent.textContent = '0%';

  const startTime = Date.now();
  const duration  = PROGRESS_DURATION * 1000;

  // Clear any previous timer
  if (progressTimer) cancelAnimationFrame(progressTimer);

  function tick() {
    const elapsed = Date.now() - startTime;
    // Cap at 95% — the last 5% will jump to 100% when the webhook responds
    const pct = Math.min(95, (elapsed / duration) * 100);

    progressBar.style.width    = pct + '%';
    progressPercent.textContent = Math.round(pct) + '%';

    if (pct < 95) {
      progressTimer = requestAnimationFrame(tick);
    }
  }

  progressTimer = requestAnimationFrame(tick);
}

function completeProgress() {
  if (progressTimer) cancelAnimationFrame(progressTimer);
  progressBar.style.width     = '100%';
  progressPercent.textContent  = '100%';
  progressLabel.textContent    = 'Extraction termin\u00e9e !';
}

function stopProgress() {
  if (progressTimer) cancelAnimationFrame(progressTimer);
}


// ─────────────────────────────────────────────────────────────
// Success — Show checkmark + Google Sheet link
// ─────────────────────────────────────────────────────────────
function showSuccess(sheetUrl) {
  completeProgress();

  // Small delay so the user sees 100% before the result appears
  setTimeout(() => {
    progressSection.classList.remove('visible');

    // Re-trigger SVG draw animations by cloning the node
    const svg    = feedbackSuccess.querySelector('svg');
    const newSvg = svg.cloneNode(true);
    svg.parentNode.replaceChild(newSvg, svg);
    feedbackSuccess.classList.add('visible');

    // Show Google Sheet link
    if (sheetUrl) {
      resultLink.href = sheetUrl;
      resultLink.classList.add('visible');
    }

    searchInput.value = '';
  }, 600);
}

function showError(message) {
  stopProgress();
  progressSection.classList.remove('visible');
  feedbackSuccess.classList.remove('visible');
  resultLink.classList.remove('visible');
  errorMessage.textContent = message || "Une erreur est survenue. Veuillez r\u00e9essayer.";
  feedbackError.classList.add('visible');
}


// ─────────────────────────────────────────────────────────────
// Form Submission — POST to webhook
// ─────────────────────────────────────────────────────────────
async function submitForm(e) {
  e.preventDefault();
  hideAll();

  const query   = searchInput.value.trim();
  const maxRows = parseInt(maxRowsInput.value);

  if (!query) {
    showError("Veuillez entrer une recherche.");
    searchInput.focus();
    return;
  }

  if (!maxRows || maxRows < 1) {
    showError("Veuillez entrer un nombre de r\u00e9sultats valide.");
    maxRowsInput.focus();
    return;
  }

  setLoadingState(true);
  startProgress();

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query:     query,
        maxRows:   maxRows,
        timestamp: new Date().toISOString()
      })
    });

    if (!response.ok) throw new Error('Erreur r\u00e9seau');

    // ───────────────────────────────────────────────────────
    // EXPECTED WEBHOOK RESPONSE FORMAT:
    //   { "sheetUrl": "https://docs.google.com/spreadsheets/d/..." }
    // Adapt the key name below if your n8n webhook uses a different key.
    // ───────────────────────────────────────────────────────
    const data     = await response.json();
    const sheetUrl = data.sheetUrl || data.sheet_url || data.url || null;

    showSuccess(sheetUrl);
  } catch (error) {
    showError("Une erreur est survenue. Veuillez r\u00e9essayer.");
  } finally {
    setLoadingState(false);
  }
}

form.addEventListener('submit', submitForm);

retryBtn.addEventListener('click', () => {
  hideAll();
  searchInput.focus();
});
