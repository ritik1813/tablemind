import os
from datetime import datetime
from pymongo import MongoClient, ASCENDING, DESCENDING

_client = None
_db = None

def get_db():
    global _client, _db
    if _db is None:
        _client = MongoClient(os.getenv("MONGODB_URI"))
        _db = _client[os.getenv("MONGODB_DB_NAME", "tablemind")]
    return _db

def init_db():
    db = get_db()
    db.conversations.create_index("session_id")
    db.reservations.create_index([("start_dt", ASCENDING)])
    db.reservations.create_index([("table_ids", ASCENDING)])
    db.reservations.create_index("status")

def seed_defaults(restaurant: dict, booking_settings: dict, tables: list):
    db = get_db()
    if not db.restaurant_config.find_one({"_id": "main"}):
        db.restaurant_config.insert_one({"_id": "main", **restaurant})
    if not db.booking_settings.find_one({"_id": "main"}):
        db.booking_settings.insert_one({"_id": "main", **booking_settings})
    if db.tables.count_documents({}) == 0:
        db.tables.insert_many([{"_id": t["table_id"], **t} for t in tables])

def get_restaurant_config() -> dict:
    db = get_db()
    doc = db.restaurant_config.find_one({"_id": "main"}, {"_id": 0})
    return doc or {}

def save_restaurant_config(config: dict):
    db = get_db()
    db.restaurant_config.replace_one({"_id": "main"}, {"_id": "main", **config}, upsert=True)

def get_booking_settings() -> dict:
    db = get_db()
    doc = db.booking_settings.find_one({"_id": "main"}, {"_id": 0})
    return doc or {}

def save_booking_settings(settings: dict):
    db = get_db()
    db.booking_settings.replace_one({"_id": "main"}, {"_id": "main", **settings}, upsert=True)

def get_all_tables() -> list:
    db = get_db()
    return list(db.tables.find({}, {"_id": 0}).sort("capacity", ASCENDING))

def save_tables(tables: list):
    db = get_db()
    db.tables.drop()
    if tables:
        db.tables.insert_many([{"_id": t["table_id"], **t} for t in tables])

def get_reservations_in_window(start_dt: datetime, effective_end_dt: datetime) -> list:
    db = get_db()
    return list(db.reservations.find({
        "status": "confirmed",
        "start_dt":          {"$lt": effective_end_dt},
        "effective_end_dt":  {"$gt": start_dt}
    }, {"_id": 0}))

def save_reservation(data: dict) -> str:
    db = get_db()
    result = db.reservations.insert_one(data)
    return str(result.inserted_id)

def get_reservation_by_id(reservation_id: str) -> dict | None:
    from bson import ObjectId
    db = get_db()
    doc = db.reservations.find_one({"_id": ObjectId(reservation_id)}, {"_id": 0})
    return doc

def cancel_reservation(reservation_id: str) -> bool:
    from bson import ObjectId
    db = get_db()
    result = db.reservations.update_one(
        {"_id": ObjectId(reservation_id), "status": "confirmed"},
        {"$set": {"status": "cancelled", "cancelled_at": datetime.utcnow()}}
    )
    return result.modified_count > 0

def get_all_reservations() -> list:
    db = get_db()
    docs = list(db.reservations.find({}, {"_id": 1}).sort("start_dt", DESCENDING))
    results = []
    for doc in docs:
        full = db.reservations.find_one({"_id": doc["_id"]})
        full["id"] = str(full.pop("_id"))
        for key in ["start_dt", "end_dt", "effective_end_dt", "created_at", "cancelled_at"]:
            if isinstance(full.get(key), datetime):
                full[key] = full[key].isoformat()
        results.append(full)
    return results

def save_message(session_id: str, role: str, message: str):
    db = get_db()
    db.conversations.insert_one({
        "session_id": session_id,
        "role": role,
        "message": message,
        "timestamp": datetime.utcnow()
    })

def get_all_conversations() -> list:
    db = get_db()
    docs = list(db.conversations.find({}, {"_id": 0}).sort("timestamp", DESCENDING))
    for d in docs:
        if isinstance(d.get("timestamp"), datetime):
            d["timestamp"] = d["timestamp"].isoformat()
    return docs
