// ═══════════════════════════════════════════════════════════════
// CONFIGURATION - COLLEZ VOTRE WEBHOOK N8N CI-DESSOUS
// ═══════════════════════════════════════════════════════════════

const WEBHOOK_URL = "https://n8n.srv1076432.hstgr.cloud/webhook/search";

// ═══════════════════════════════════════════════════════════════


// ─────────────────────────────────────────────────────────────
// DOM References
// ─────────────────────────────────────────────────────────────
const form            = document.getElementById('scraper-form');
const searchInput     = document.getElementById('search-input');
const btnSubmit       = document.getElementById('btn-submit');
const btnText         = btnSubmit.querySelector('.btn-text');
const feedbackSuccess = document.getElementById('feedback-success');
const feedbackError   = document.getElementById('feedback-error');
const errorMessage    = document.getElementById('error-message');
const retryBtn        = document.getElementById('retry-btn');
const segmentBtns     = document.querySelectorAll('.segment-btn');
const segmentHighlight = document.getElementById('segment-highlight');
const header          = document.getElementById('header');

let selectedLimit = 25;
let resetTimeout  = null;


// ─────────────────────────────────────────────────────────────
// Header — Scroll effect (transparent → blurred)
// ─────────────────────────────────────────────────────────────
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 10);
}, { passive: true });


// ─────────────────────────────────────────────────────────────
// Segment Control — Sliding highlight
// ─────────────────────────────────────────────────────────────
function updateHighlight(btn) {
  if (!btn || window.innerWidth <= 640) return;
  segmentHighlight.style.left  = btn.offsetLeft + 'px';
  segmentHighlight.style.width = btn.offsetWidth + 'px';
}

segmentBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    segmentBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedLimit = parseInt(btn.dataset.value);
    updateHighlight(btn);
  });
});

// Position highlight on initial load
requestAnimationFrame(() => {
  const activeBtn = document.querySelector('.segment-btn.active');
  if (activeBtn) updateHighlight(activeBtn);
});

// Reposition on window resize
window.addEventListener('resize', () => {
  const activeBtn = document.querySelector('.segment-btn.active');
  if (activeBtn) updateHighlight(activeBtn);
});


// ─────────────────────────────────────────────────────────────
// UI State Helpers
// ─────────────────────────────────────────────────────────────
function hideFeedback() {
  feedbackSuccess.classList.remove('visible');
  feedbackError.classList.remove('visible');
}

function setLoadingState(loading) {
  btnSubmit.disabled = loading;
  btnSubmit.classList.toggle('loading', loading);
  btnText.textContent = loading ? 'Extraction en cours...' : "Lancer l'extraction";
}

function showSuccess() {
  hideFeedback();
  // Re-trigger SVG draw animations by cloning the node
  const svg    = feedbackSuccess.querySelector('svg');
  const newSvg = svg.cloneNode(true);
  svg.parentNode.replaceChild(newSvg, svg);
  feedbackSuccess.classList.add('visible');
  searchInput.value = '';

  if (resetTimeout) clearTimeout(resetTimeout);
  resetTimeout = setTimeout(() => {
    feedbackSuccess.classList.remove('visible');
  }, 5000);
}

function showError(message) {
  hideFeedback();
  errorMessage.textContent = message || "Une erreur est survenue. Veuillez r\u00e9essayer.";
  feedbackError.classList.add('visible');
}


// ─────────────────────────────────────────────────────────────
// Form Submission — POST to webhook
// ─────────────────────────────────────────────────────────────
async function submitForm(e) {
  e.preventDefault();
  hideFeedback();

  const query = searchInput.value.trim();
  if (!query) {
    showError("Veuillez entrer une recherche.");
    searchInput.focus();
    return;
  }

  setLoadingState(true);

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query:     query,
        limit:     selectedLimit,
        timestamp: new Date().toISOString()
      })
    });

    if (!response.ok) throw new Error('Erreur r\u00e9seau');
    showSuccess();
  } catch (error) {
    showError("Une erreur est survenue. Veuillez r\u00e9essayer.");
  } finally {
    setLoadingState(false);
  }
}

form.addEventListener('submit', submitForm);

retryBtn.addEventListener('click', () => {
  hideFeedback();
  searchInput.focus();
});
