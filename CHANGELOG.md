# Changelog

All notable changes to the Context Rocket project will be documented in this file.

## [2.0.0] - 2026-05-14

### Added
- **AI Engine:** Integrated Google Gemini AI (via `google-genai` SDK) for intelligent chat summarization.
- **On-Demand Generation:** New logic to trigger AI analysis only when requested by the user.
- **Structured Output:** High-density JSON "Save Files" containing tech stacks, decisions, and tasks.
- **Status Indicators:** Real-time visual feedback in the popup (Captured, Processing, Ready).
- **Auto-Model Discovery:** Backend now automatically identifies and uses the best available Gemini model.

### Changed
- **Redesigned UI:** Modern Dark Mode interface with improved typography and animations.
- **Backend Refactor:** Split data capture and AI processing into separate endpoints to optimize performance.
- **Interception Logic:** More robust Main World fetch interception to handle page refreshes.

---

## [1.0.0] - Initial Release
- Basic ChatGPT fetch interception.
- Raw JSON data cleaning.
- Local FastAPI storage.
