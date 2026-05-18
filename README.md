# 🚀 Context Rocket: AI-Powered Context Preservation Engine

**Context Rocket** is a premium, open-source browser extension designed to eliminate "Context Amnesia" during AI-assisted development. It intercepts live ChatGPT conversation transcripts directly from the browser context and orchestrates with a local FastAPI backend powered by **Google Gemini AI** to distill massive, noisy chat logs into high-density, structured technical JSON "Save Files" (detailing project state, tech stacks, core decisions, and immediate next steps).

Stop copy-pasting massive chat transcripts or starting from scratch. Capture your architectural decisions in one click, and jumpstart your next AI session with absolute project awareness!

---

## ✨ Core Features (Enterprise & Multi-User Support)

Context Rocket is a fully scalable, production-ready context manager:

*   **⚙️ Collapsible Settings Drawer:** Open the popup, click the ⚙️ gear icon, and configure your active backend/tunnel URL (`ngrok`) on-the-fly. No extension re-zipping or re-loading required!
*   **🔒 Device-Level Session Isolation:** Engineered dynamic device-identifying client headers (`x-client-id`) to automatically isolate concurrent users. You and your friends can share a single backend endpoint with zero state crossover or file overwriting.
*   **🧠 High-Density Technical Snapshots:** Gemini AI intelligently structures raw chat transcripts into high-fidelity JSON arrays: `project_summary`, `tech_stack`, `key_decisions`, and `pending_tasks`.
*   **💎 Premium Dark Slate Interface:** Redesigned Dark Mode UI with subtle glowing transitions, active green/pulsing status indicators, and an enhanced one-click copy-to-clipboard function.

---

## 🛠️ Architecture

1.  **Browser Extension (`/extension`):** Injects a Main World hook into ChatGPT to intercept standard `backend-api/conversation` payloads, forwarding data to the content script using event messaging.
2.  **FastAPI Backend Service (`/backend`):** A robust Python microservice that handles cleaning, compiles client-specific states, and bridges payloads with the Gemini SDK.
3.  **Context Bridge:** Safely packs the parsed state into copy-pasteable prompts to feed context immediately into your next AI window.

---

## 🚀 Easy Installation Guide

### 1. Install the Chrome Extension
1.  Download and extract the **`context_rocket_extension.zip`** deliverable (or clone the repository).
2.  Open Google Chrome and navigate to `chrome://extensions/`.
3.  Toggle the **Developer Mode** switch in the top-right corner.
4.  Click **Load Unpacked** in the top-left, and select the **`extension/`** folder of this project.

### 2. Run the Backend Server
Start the local processing pipeline:
```bash
# Move to backend folder
cd backend

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn main:app --reload --port 8000
```

### 3. Connect and Go!
1.  If you are running your server locally, open the extension popup, click the ⚙️ gear icon, enter `http://127.0.0.1:8000`, and click **Save Configuration**.
2.  If you are sharing the extension with friends, expose your local port via `ngrok` (`ngrok http 8000`), copy the public forwarding address, and save it in the settings panel.

---

## 📖 Usage Flow

1.  **Capture:** Open any chat on ChatGPT. The extension automatically detects and captures the conversation structure in the background.
2.  **Generate:** Open the Context Rocket popup—your status dot will turn green and read **"Context Captured"**. Click **"Generate AI Summary"**.
3.  **Copy:** Once the summary is ready, click **"Copy Project Context"** to immediately copy the structured JSON representation to your clipboard.
4.  **Paste:** Start a new AI thread, paste the clipboard data as your first prompt, and watch the AI resume the project exactly where you left off!

---

## 🔒 Privacy & Local Processing
*   **Complete Privacy:** All raw conversation parsing and extraction happens locally on your computer.
*   **No Cloud Databases:** Your session details are saved in isolated directories on your local drive and are never stored or tracked on any external databases.

---

**Developed by Darsh Jain**  
[GitHub Profile](https://github.com/DarshJain1704)
