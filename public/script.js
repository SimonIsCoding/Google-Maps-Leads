const button = document.getElementById('submit');
const searchInput = document.getElementById('search');
const rowsInput = document.getElementById('rows');
const progressContainer = document.getElementById('progress-container');
const progressFill = document.getElementById('progress-fill');
const progressText = document.getElementById('progress-text');
const logsContainer = document.getElementById('logs');
const logsContent = document.getElementById('logs-content');
const resultDiv = document.getElementById('result');

const WEBHOOK_URL = 'https://n8n.srv1076432.hstgr.cloud/webhook/search';
const PROGRESS_DURATION = 60000; // 60 secondes

let progressInterval = null;

// Fonction pour ajouter un log
function addLog(message, type = 'info') {
    const logEntry = document.createElement('div');
    logEntry.className = `log-entry ${type}`;
    const timestamp = new Date().toLocaleTimeString('fr-FR');
    logEntry.textContent = `[${timestamp}] ${message}`;
    logsContent.appendChild(logEntry);
    logsContent.scrollTop = logsContent.scrollHeight;
}

// Fonction pour démarrer la barre de progression
function startProgress() {
    let progress = 0;
    const increment = 100 / (PROGRESS_DURATION / 500); // Mise à jour toutes les 500ms

    progressInterval = setInterval(() => {
        progress += increment;
        if (progress >= 100) {
            progress = 100;
            clearInterval(progressInterval);
        }
        progressFill.style.width = `${progress}%`;
        progressText.textContent = `${Math.round(progress)}%`;
    }, 500);
}

// Fonction pour réinitialiser l'interface
function resetUI() {
    progressContainer.classList.add('hidden');
    logsContainer.classList.add('hidden');
    resultDiv.classList.add('hidden');
    logsContent.innerHTML = '';
    progressFill.style.width = '0%';
    progressText.textContent = '0%';
    if (progressInterval) {
        clearInterval(progressInterval);
    }
}

// Événement du bouton de recherche
button.addEventListener('click', async () => {
    const query = searchInput.value.trim();
    const rows = parseInt(rowsInput.value);

    // Validation
    if (!query) {
        alert('Veuillez entrer une recherche Google Maps');
        return;
    }

    if (!rows || rows < 1 || rows > 100) {
        alert('Le nombre de résultats doit être entre 1 et 100');
        return;
    }

    // Réinitialisation de l'interface
    resetUI();

    // Affichage des logs et de la barre de progression
    logsContainer.classList.remove('hidden');
    progressContainer.classList.remove('hidden');

    // Désactiver le bouton pendant le traitement
    button.disabled = true;

    // Logs initiaux
    addLog(`Recherche: "${query}"`, 'info');
    addLog(`Nombre de résultats demandés: ${rows}`, 'info');
    addLog('Connexion au serveur n8n...', 'info');

    // Démarrer la barre de progression
    startProgress();

    try {
        addLog('Envoi de la requête au webhook...', 'info');

        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: query,
                rows: rows
            })
        });

        addLog(`Statut de la réponse: ${response.status}`, response.ok ? 'success' : 'error');

        if (!response.ok) {
            throw new Error(`Erreur serveur: ${response.status} ${response.statusText}`);
        }

        addLog('Réponse reçue, traitement des données...', 'info');

        const data = await response.json();
        addLog('Données JSON parsées avec succès', 'success');

        // Vérifier si le lien du Google Sheet est présent
        if (data.sheetUrl) {
            addLog(`Google Sheet URL reçue: ${data.sheetUrl}`, 'success');
            addLog('Extraction terminée avec succès!', 'success');

            // Afficher le résultat
            resultDiv.innerHTML = `
                <h3>Extraction réussie!</h3>
                <p>Vos données sont prêtes dans le Google Sheet</p>
                <a href="${data.sheetUrl}" target="_blank" rel="noopener noreferrer">
                    Ouvrir le Google Sheet
                </a>
            `;
            resultDiv.classList.remove('hidden');
        } else {
            addLog('Aucune URL de Google Sheet reçue', 'error');
            throw new Error('Réponse invalide: aucune URL de Google Sheet');
        }

    } catch (error) {
        addLog(`Erreur: ${error.message}`, 'error');
        console.error('Erreur détaillée:', error);

        // Afficher le message d'erreur
        resultDiv.innerHTML = `
            <div style="background: #fee2e2; border-color: #ef4444; color: #991b1b;">
                <h3 style="color: #991b1b;">Erreur lors de l'extraction</h3>
                <p style="color: #991b1b;">${error.message}</p>
            </div>
        `;
        resultDiv.classList.remove('hidden');
    } finally {
        // Réactiver le bouton
        button.disabled = false;

        // S'assurer que la barre de progression atteint 100%
        if (progressInterval) {
            clearInterval(progressInterval);
        }
        progressFill.style.width = '100%';
        progressText.textContent = '100%';

        addLog('Processus terminé', 'info');
    }
});

// Permettre de soumettre avec la touche Entrée
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        button.click();
    }
});

rowsInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        button.click();
    }
});
