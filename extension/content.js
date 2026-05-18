const DEFAULT_BACKEND_URL = 'https://720a-2406-7400-63-665f-c872-31cd-caa9-9ea0.ngrok-free.app';

let BASE_URL = DEFAULT_BACKEND_URL;
let CLIENT_ID = 'default_client';

// Load values from chrome.storage.local on startup
chrome.storage.local.get(['backend_url', 'client_id'], (result) => {
    if (result.backend_url) {
        BASE_URL = result.backend_url;
    }
    if (result.client_id) {
        CLIENT_ID = result.client_id;
    } else {
        CLIENT_ID = 'client_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        chrome.storage.local.set({ client_id: CLIENT_ID });
    }
    console.log("🚀 [ROCKET] Content Script Loaded. Client Identity:", CLIENT_ID, "| Backend:", BASE_URL);
});

// React live to settings changes in storage
chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'local') {
        if (changes.backend_url) {
            BASE_URL = changes.backend_url.newValue || DEFAULT_BACKEND_URL;
            console.log("⚡ [ROCKET] Backend URL updated dynamically:", BASE_URL);
        }
        if (changes.client_id) {
            CLIENT_ID = changes.client_id.newValue || 'default_client';
            console.log("⚡ [ROCKET] Client Identity updated dynamically:", CLIENT_ID);
        }
    }
});

// 1. Inject the Interceptor into the Main World
const script = document.createElement('script');
script.src = chrome.runtime.getURL('inject.js');
script.onload = function () { this.remove(); };
(document.head || document.documentElement).appendChild(script);

// 2. Listen for captured data from the injected script
window.addEventListener("message", async (event) => {
    if (event.source !== window) return;
    if (event.data.type && (event.data.type === "ROCKET_CHAT_CAPTURE" || event.data.type === "V2_ROCKET_INTERCEPTED")) {
        const chatData = event.data.payload;
        console.log("🔔 [ROCKET] Intercepted Chat! Sending to Backend...", chatData.title);

        try {
            const response = await fetch(`${BASE_URL}/api/capture`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "ngrok-skip-browser-warning": "true", // Bypass ngrok warning page
                    "x-client-id": CLIENT_ID // Inject Device ID for multi-user isolation
                },
                body: JSON.stringify(chatData)
            });

            if (response.ok) {
                console.log("✅ [ROCKET] Data synchronized with backend.");
            } else {
                console.warn("⚠️ [ROCKET] Backend reachability issue:", response.status);
            }
        } catch (err) {
            console.error("❌ [ROCKET] Could not reach backend at:", BASE_URL);
        }
    }
});
