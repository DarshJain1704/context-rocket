document.addEventListener('DOMContentLoaded', async () => {
    const DEFAULT_BACKEND_URL = 'https://720a-2406-7400-63-665f-c872-31cd-caa9-9ea0.ngrok-free.app';
    
    // UI Elements
    const summaryTitle = document.getElementById('summary-title');
    const statusText = document.getElementById('status-text');
    const statusDot = document.getElementById('status-dot');
    
    const generateArea = document.getElementById('generate-area');
    const processingArea = document.getElementById('processing-area');
    const copyArea = document.getElementById('copy-area');
    const idleMessage = document.getElementById('idle-message');
    
    const generateBtn = document.getElementById('generate-btn');
    const copyBtn = document.getElementById('copy-btn');
    const copyBtnText = document.getElementById('copy-btn-text');

    // Settings Drawer UI Elements
    const settingsToggleBtn = document.getElementById('settings-toggle-btn');
    const settingsDrawer = document.getElementById('settings-drawer');
    const backendUrlInput = document.getElementById('backend-url-input');
    const clientIdDisplay = document.getElementById('client-id-display');
    const saveSettingsBtn = document.getElementById('save-settings-btn');

    // Load configurations and initialize Client ID
    chrome.storage.local.get(['backend_url', 'client_id'], (result) => {
        let clientId = result.client_id;
        if (!clientId) {
            clientId = 'client_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            chrome.storage.local.set({ client_id: clientId });
        }
        clientIdDisplay.innerText = clientId;

        const currentUrl = result.backend_url || DEFAULT_BACKEND_URL;
        backendUrlInput.value = currentUrl;
    });

    // Toggle Settings Drawer
    settingsToggleBtn.addEventListener('click', () => {
        if (settingsDrawer.style.display === 'none') {
            settingsDrawer.style.display = 'flex';
            settingsToggleBtn.style.color = 'var(--primary)';
        } else {
            settingsDrawer.style.display = 'none';
            settingsToggleBtn.style.color = 'var(--text-muted)';
        }
    });

    // Save Settings Button
    saveSettingsBtn.addEventListener('click', () => {
        let enteredUrl = backendUrlInput.value.trim();
        // Remove trailing slash if present for standard URL appending
        if (enteredUrl.endsWith('/')) {
            enteredUrl = enteredUrl.slice(0, -1);
        }
        
        chrome.storage.local.set({ backend_url: enteredUrl }, () => {
            const originalText = saveSettingsBtn.innerText;
            saveSettingsBtn.innerText = "Configuration Saved! ✅";
            saveSettingsBtn.style.background = "var(--success)";
            
            setTimeout(() => {
                saveSettingsBtn.innerText = originalText;
                saveSettingsBtn.style.background = "";
                settingsDrawer.style.display = 'none';
                settingsToggleBtn.style.color = 'var(--text-muted)';
            }, 1500);
            
            updateUI(); // Immediately force-update connections
        });
    });

    // Helper for fetch with dynamic URL and client ID
    async function apiFetch(endpoint, options = {}) {
        return new Promise((resolve, reject) => {
            chrome.storage.local.get(['backend_url', 'client_id'], async (result) => {
                const baseUrl = result.backend_url || DEFAULT_BACKEND_URL;
                const clientId = result.client_id || 'default_client';
                
                const url = `${baseUrl}${endpoint}`;
                const defaultOptions = {
                    headers: {
                        'ngrok-skip-browser-warning': 'true', // Bypass ngrok warning page
                        'Content-Type': 'application/json',
                        'x-client-id': clientId // Dynamic header for device isolation
                    }
                };
                
                try {
                    const res = await fetch(url, { 
                        ...defaultOptions, 
                        ...options, 
                        headers: { 
                            ...defaultOptions.headers, 
                            ...options.headers 
                        } 
                    });
                    resolve(res);
                } catch (err) {
                    reject(err);
                }
            });
        });
    }

    async function updateUI() {
        try {
            const response = await apiFetch('/api/status');
            const data = await response.json();
            
            summaryTitle.innerText = data.title;
            
            generateArea.style.display = 'none';
            processingArea.style.display = 'none';
            copyArea.style.display = 'none';
            idleMessage.style.display = 'none';
            statusDot.className = 'dot';

            if (data.status === 'captured') {
                generateArea.style.display = 'flex';
                statusText.innerText = "Context Captured";
                statusDot.classList.add('green');
            } 
            else if (data.status === 'processing') {
                processingArea.style.display = 'block';
                statusText.innerText = "Gemini is Thinking...";
                statusDot.classList.add('pulse');
            }
            else if (data.status === 'ready') {
                copyArea.style.display = 'flex';
                statusText.innerText = "Summary Ready!";
                statusDot.classList.add('green');
                summaryTitle.innerText = data.title + " summary";
            }
            else {
                idleMessage.style.display = 'block';
                statusText.innerText = "Listening...";
                statusDot.classList.add('grey');
            }
        } catch (err) {
            statusText.innerText = "Backend Offline";
            statusDot.className = 'dot grey';
        }
    }

    // GENERATE Click
    generateBtn.addEventListener('click', async () => {
        generateArea.style.display = 'none';
        processingArea.style.display = 'block';
        statusText.innerText = "Starting AI...";

        try {
            const res = await apiFetch('/api/generate', { method: 'POST' });
            const result = await res.json();
            
            if (result.success) {
                await updateUI();
            } else {
                alert("AI Error: " + (result.error || "Unknown"));
                updateUI();
            }
        } catch (err) {
            console.error("Fetch Error:", err);
            updateUI();
        }
    });

    // COPY Click
    copyBtn.addEventListener('click', async () => {
        try {
            const res = await apiFetch('/api/latest_summary');
            const data = await res.json();
            
            if (data.summary) {
                const text = JSON.stringify(data.summary, null, 2);
                await navigator.clipboard.writeText(text);
                
                const originalText = copyBtnText.innerText;
                copyBtnText.innerText = "Copied to Clipboard!";
                copyArea.style.opacity = "0.7";
                
                setTimeout(() => { 
                    copyBtnText.innerText = originalText; 
                    copyArea.style.opacity = "1";
                }, 2000);
            }
        } catch (err) {
            alert("Copy failed. Please try again.");
        }
    });

    setInterval(updateUI, 2000);
    updateUI();
});
