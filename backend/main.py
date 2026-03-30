import os
import re
from datetime import datetime, date, timedelta
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from dotenv import load_dotenv
import google.generativeai as genai

from database import (
    init_db, seed_defaults,
    get_restaurant_config, save_restaurant_config,
    get_booking_settings, save_booking_settings,
    get_all_tables, save_tables,
    save_message, get_all_conversations,
    get_all_reservations, cancel_reservation,
    get_reservation_by_id
)
from booking_engine import generate_slots, create_booking, get_duration_mins
from prompt import build_system_prompt
from restaurant_data import RESTAURANT, DEFAULT_BOOKING_SETTINGS, DEFAULT_TABLES

load_dotenv()

app = FastAPI(title="TableMind API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db()
seed_defaults(RESTAURANT, DEFAULT_BOOKING_SETTINGS, DEFAULT_TABLES)
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

session_histories: dict[str, list] = {}

def current_config():   return get_restaurant_config() or RESTAURANT
def current_settings(): return get_booking_settings()  or DEFAULT_BOOKING_SETTINGS

class ChatRequest(BaseModel):
    session_id: str
    message: str
    language: str = "en"

class AvailabilityRequest(BaseModel):
    date: str
    party_size: int

class CreateReservationRequest(BaseModel):
    session_id: str
    party_size: int
    date: str
    time: str
    name: str
    contact: str
    notes: str = None

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/chat")
async def chat(req: ChatRequest):
    if not os.getenv("GEMINI_API_KEY"):
        raise HTTPException(500, "GEMINI_API_KEY not set")

    if req.session_id not in session_histories:
        session_histories[req.session_id] = []

    history = session_histories[req.session_id]
    history.append({"role": "user", "content": req.message})
    save_message(req.session_id, "user", req.message)

    def generate():
        config        = current_config()
        system_prompt = build_system_prompt(config, req.language)

        gemini_history = [
            {
                "role":  "model" if m["role"] == "assistant" else "user",
                "parts": [{"text": m["content"]}]
            }
            for m in history
        ]

        model    = genai.GenerativeModel("gemini-2.5-flash", system_instruction=system_prompt)
        response = model.generate_content(gemini_history, stream=True)

        full = ""
        for chunk in response:
            text  = chunk.text or ""
            full += text
            yield text

        history.append({"role": "assistant", "content": full})
        save_message(req.session_id, "assistant", full)

    return StreamingResponse(generate(), media_type="text/plain; charset=utf-8")

@app.get("/availability")
def availability(date: str, party_size: int):
    try:
        year, month, day = map(int, date.split("-"))
        date_obj = datetime(year, month, day).date()
    except Exception:
        raise HTTPException(400, "Invalid date format. Use YYYY-MM-DD")

    settings = current_settings()
    max_advance = settings.get("max_advance_days", 30)
    today = datetime.utcnow().date()

    if date_obj < today:
        raise HTTPException(400, "Cannot book in the past")
    if (date_obj - today).days > max_advance:
        raise HTTPException(400, f"Cannot book more than {max_advance} days in advance")

    from datetime import date as date_type
    slots = generate_slots(date_type(year, month, day), party_size, settings)

    return {
        "date":       date,
        "party_size": party_size,
        "slots": [
            {"time": s["time"], "available": s["available"], "reason": s["reason"]}
            for s in slots
        ]
    }

@app.post("/reservations")
def create_reservation_endpoint(req: CreateReservationRequest):
    result = create_booking(
        party_size=req.party_size,
        date_str=req.date,
        time_str=req.time,
        name=req.name,
        contact=req.contact,
        notes=req.notes,
        session_id=req.session_id
    )
    if not result["success"]:
        raise HTTPException(409, detail=result)
    return result

@app.delete("/reservations/{reservation_id}")
def cancel_reservation_endpoint(reservation_id: str):
    res = get_reservation_by_id(reservation_id)
    if not res:
        raise HTTPException(404, "Reservation not found")

    settings     = current_settings()
    deadline_hrs = settings.get("cancel_deadline_hrs", 2)
    start_dt     = datetime.fromisoformat(res["start_dt"]) if isinstance(res["start_dt"], str) else res["start_dt"]
    if datetime.utcnow() > start_dt - timedelta(hours=deadline_hrs):
        raise HTTPException(400, f"Cannot cancel within {deadline_hrs} hours of booking. Please call the restaurant.")

    ok = cancel_reservation(reservation_id)
    if not ok:
        raise HTTPException(400, "Could not cancel — already cancelled or not found")
    return {"status": "cancelled"}

@app.get("/dashboard")
def dashboard():
    reservations  = get_all_reservations()
    conversations = get_all_conversations()

    sessions: dict = {}
    for msg in conversations:
        sid = msg["session_id"]
        if sid not in sessions:
            sessions[sid] = []
        sessions[sid].append(msg)

    summaries = []
    for sid, msgs in sessions.items():
        last = msgs[0] if msgs else {}
        summaries.append({
            "session_id":    sid,
            "message_count": len(msgs),
            "last_message":  last.get("message", "")[:100],
            "last_timestamp":last.get("timestamp", ""),
            "messages":      list(reversed(msgs))
        })

    today_str = datetime.utcnow().strftime("%Y-%m-%d")
    today_res = [r for r in reservations if r.get("start_dt","").startswith(today_str)]

    return {
        "reservations":       reservations,
        "reservations_today": today_res,
        "sessions":           summaries,
        "total_reservations": len(reservations),
        "today_count":        len(today_res),
        "needs_setup_count":  sum(1 for r in today_res if r.get("needs_setup"))
    }

@app.get("/admin/settings")
def get_settings(): return current_settings()

@app.put("/admin/settings")
def update_settings(data: dict): save_booking_settings(data); return {"status": "updated"}

@app.get("/admin/tables")
def get_tables(): return get_all_tables()

@app.put("/admin/tables")
def update_tables(tables: list): save_tables(tables); return {"status": "updated"}

@app.get("/admin/config")
def get_config(): return current_config()

@app.put("/admin/config")
def update_config(data: dict): save_restaurant_config(data); return {"status": "updated"}
