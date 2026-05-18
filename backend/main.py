from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import json
import os
from google import genai
from dotenv import load_dotenv

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Dictionary to hold states per client_id: client_id -> session_data
sessions = {}

def get_session(client_id: str):
    if not client_id:
        client_id = "default"
    if client_id not in sessions:
        sessions[client_id] = {
            "title": "No chat captured",
            "messages": [],
            "summary": None,
            "status": "idle"
        }
    return sessions[client_id]

# --- ADVANCED MODEL DISCOVERY ---
client = None
best_model = "gemini-1.5-flash" # Default guess

if GEMINI_API_KEY:
    try:
        client = genai.Client(api_key=GEMINI_API_KEY)
        print("🚀 [GEMINI] New SDK Client Initialized")
        
        # Ask Google what we can actually use
        available_models = [m.name for m in client.models.list()]
        print(f"📋 [GEMINI] Your key has access to: {available_models}")
        
        # Priority order for V2 logic
        priority = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-2.0-flash-exp", "gemini-pro"]
        
        for p in priority:
            if p in available_models:
                best_model = p
                break
        else:
            # If none of our priorities are found, just pick the first one that looks like a model
            best_model = available_models[0] if available_models else "gemini-1.5-flash"
            
        print(f"✨ [GEMINI] Auto-Selected Model: {best_model}")
    except Exception as e:
        print(f"❌ [GEMINI] Model Discovery Failed: {e}")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def clean_chat_data(raw_data):
    mapping = raw_data.get("mapping", {})
    cleaned_messages = []
    for node_id in mapping:
        node = mapping[node_id]
        message = node.get("message")
        if not message: continue
        role = message.get("author", {}).get("role")
        if role not in ["user", "assistant"]: continue
        parts = message.get("content", {}).get("parts", [])
        text_parts = [p if isinstance(p, str) else p.get("text", "") if isinstance(p, dict) else "" for p in parts]
        full_text = " ".join(text_parts).strip()
        if full_text:
            cleaned_messages.append({"role": role.upper(), "text": full_text, "timestamp": message.get("create_time")})
    cleaned_messages.sort(key=lambda x: x["timestamp"] if x["timestamp"] else 0)
    return cleaned_messages

@app.post("/api/capture")
async def capture(request: Request):
    global sessions
    client_id = request.headers.get("x-client-id", "default")
    session_data = get_session(client_id)
    try:
        raw_data = await request.json()
        title = raw_data.get("title", "Active Session")
        session_data["title"] = title
        session_data["messages"] = clean_chat_data(raw_data)
        session_data["status"] = "captured"
        session_data["summary"] = None
        print(f"📥 [BACKEND] Client: {client_id} | Captured: {title} ({len(session_data['messages'])} messages)")
        return {"success": True}
    except Exception as e:
        print(f"❌ [BACKEND] Capture Error for Client {client_id}: {e}")
        return {"success": False}

@app.post("/api/generate")
async def generate(request: Request):
    global sessions
    client_id = request.headers.get("x-client-id", "default")
    session_data = get_session(client_id)
    
    if not client or not session_data["messages"]:
        return {"success": False, "error": "AI not initialized"}
    
    session_data["status"] = "processing"
    print(f"🧠 [BACKEND] Client: {client_id} | AI Generating with {best_model}...")
    
    transcript = "\n\n".join([f"{m['role']}: {m['text']}" for m in session_data["messages"]])
    prompt = f"Create a technical JSON summary of this chat for a new AI session. Include project_summary, tech_stack, and key_decisions. Transcript:\n{transcript}\n\nReturn ONLY raw JSON."
    
    try:
        response = client.models.generate_content(
            model=best_model,
            contents=prompt
        )
        
        text = response.text.strip()
        if "```" in text:
            parts = text.split("```")
            for p in parts:
                if p.strip().startswith("{") or p.strip().startswith("json"):
                    text = p.replace("json", "", 1).strip()
                    break
        
        summary_json = json.loads(text)
        session_data["summary"] = summary_json
        session_data["status"] = "ready"
        
        # Save to client-specific subfolder to avoid collisions
        os.makedirs("sessions", exist_ok=True)
        with open(f"sessions/ai_summary_{client_id}.json", "w") as f:
            json.dump(summary_json, f, indent=4)
            
        print(f"✅ [BACKEND] Client: {client_id} | AI Generation Complete!")
        return {"success": True}
    except Exception as e:
        session_data["status"] = "error"
        print(f"❌ [BACKEND] Client: {client_id} | AI Error Details: {e}")
        return {"success": False, "error": str(e)}

@app.get("/api/status")
async def get_status(request: Request):
    client_id = request.headers.get("x-client-id", "default")
    session_data = get_session(client_id)
    return {"title": session_data["title"], "status": session_data["status"]}

@app.get("/api/latest_summary")
async def get_latest(request: Request):
    client_id = request.headers.get("x-client-id", "default")
    session_data = get_session(client_id)
    return {"title": f"{session_data['title']} summary", "summary": session_data["summary"]}
