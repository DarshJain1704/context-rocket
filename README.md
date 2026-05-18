# 🚀 Context Rocket V2: AI-Powered Session Persistence

**Context Rocket** is a specialized browser extension designed to eliminate "Context Amnesia" in AI development. It intercepts ChatGPT conversations and uses **Google Gemini AI** to transform noisy chat logs into high-density technical "Save Files" (JSON).

> **Why Context Rocket?** Stop starting from scratch. Capture your architectural decisions, tech stacks, and progress in one click, and jumpstart your next AI session with full project awareness.

---

## ✨ New in V2.0: The AI Engine
The V2 release transforms Context Rocket from a simple data interceptor into an intelligent context engine.

*   **🧠 Gemini AI Integration:** Powered by the new `google-genai` SDK, leveraging Gemini 1.5/2.5 Flash for rapid, intelligent summarization.
*   **⚡ On-Demand Generation:** A new UI flow that captures data silently and only triggers AI generation when you click, saving tokens and processing power.
*   **📋 High-Density Save Files:** Generates structured JSON snapshots including `project_summary`, `tech_stack`, `key_decisions`, and `pending_tasks`.
*   **💎 Premium UI:** A completely redesigned Dark Mode popup with real-time status indicators and a one-click "Copy to Clipboard" feature.

---

## 🛠️ Architecture

1.  **Browser Extension:** Intercepts `backend-api/conversation` requests directly from the ChatGPT Main World.
2.  **FastAPI Backend:** A Python service that cleans raw JSON, manages session state, and orchestrates the Gemini AI pipeline.
3.  **Context Bridge:** Seamlessly transfers high-fidelity project state between different AI models and sessions.

---

## 🚀 Getting Started

### 1. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Mac/Linux
pip install -r requirements.txt
```

### 2. Configure AI
Create a `.env` file in the `/backend` folder:
```env
GEMINI_API_KEY=YOUR_FREE_API_KEY_HERE
```

### 3. Install Extension
1.  Open Chrome and go to `chrome://extensions`.
2.  Enable **Developer Mode** (top right).
3.  Click **Load Unpacked** and select the root `context_rocket` folder.

---

## 📖 Usage Flow
1.  **Capture:** Open any chat on ChatGPT. The extension will silently capture the history.
2.  **Analyze:** Open the Context Rocket popup and click **"Generate AI Summary"**.
3.  **Transfer:** Click **"Copy Project Context"** and paste it as the first prompt in your next AI session.

---

## 🛡️ Privacy & Security
*   **Local Processing:** Your chat data is processed on your local machine and only sent to Google Gemini for summarization.
*   **No Cloud Storage:** Context Rocket does not store your chats on any external servers (besides the Gemini API call).

---

## 🤝 Contributing
Context Rocket is an open-source project. We welcome contributions to support more AI platforms (Claude, Gemini Web, etc.) and more output formats.

**Developed by Darsh Jain**  
[GitHub Profile](https://github.com/DarshJain1704)
