from datetime import datetime, timedelta
from database import get_all_tables, get_booking_settings, get_reservations_in_window

def get_duration_mins(party_size: int, settings: dict) -> int:
    rules = settings.get("duration_rules", [
        {"max_party": 2,  "duration_mins": 90},
        {"max_party": 4,  "duration_mins": 120},
        {"max_party": 99, "duration_mins": 150}
    ])
    for rule in sorted(rules, key=lambda r: r["max_party"]):
        if party_size <= rule["max_party"]:
            return rule["duration_mins"]
    return 120

def get_day_schedule(date_obj, settings: dict) -> dict | None:
    date_str = date_obj.strftime("%Y-%m-%d")
    special = settings.get("special_dates", {})
    if date_str in special:
        return special[date_str]

    day_name = date_obj.strftime("%A").lower()
    weekly = settings.get("weekly_schedule", {})
    return weekly.get(day_name)

def generate_slots(date_obj, party_size: int, settings: dict) -> list[dict]:
    schedule = get_day_schedule(date_obj, settings)
    if schedule is None:
        return []

    interval    = settings.get("slot_interval_mins", 30)
    buffer_mins = settings.get("buffer_mins", 15)
    duration    = get_duration_mins(party_size, settings)
    min_advance = settings.get("min_advance_mins", 120)
    now         = datetime.utcnow()

    open_h,  open_m  = map(int, schedule["open"].split(":"))
    close_h, close_m = map(int, schedule["close"].split(":"))

    open_dt  = datetime(date_obj.year, date_obj.month, date_obj.day, open_h,  open_m)
    close_dt = datetime(date_obj.year, date_obj.month, date_obj.day, close_h, close_m)
    last_start = close_dt - timedelta(minutes=duration + buffer_mins)

    slots = []
    current = open_dt
    while current <= last_start:
        effective_end = current + timedelta(minutes=duration + buffer_mins)
        time_str = current.strftime("%H:%M")

        if current < now + timedelta(minutes=min_advance):
            slots.append({"time": time_str, "datetime": current, "available": False, "reason": "too_soon"})
            current += timedelta(minutes=interval)
            continue

        result = find_table(party_size, current, effective_end, settings)
        slots.append({
            "time": time_str,
            "datetime": current,
            "available": result["found"],
            "reason": "" if result["found"] else "full"
        })
        current += timedelta(minutes=interval)

    return slots

def find_table(party_size: int, start_dt: datetime, effective_end_dt: datetime, settings: dict) -> dict:
    tables   = get_all_tables()
    bookings = get_reservations_in_window(start_dt, effective_end_dt)
    booked_table_ids = set()
    for b in bookings:
        for tid in b.get("table_ids", []):
            booked_table_ids.add(tid)

    free_tables = [t for t in tables if t["table_id"] not in booked_table_ids]

    suitable_single = sorted(
        [t for t in free_tables if t["capacity"] >= party_size],
        key=lambda t: t["capacity"]
    )
    if suitable_single:
        t = suitable_single[0]
        return {
            "found": True,
            "table_ids": [t["table_id"]],
            "combined": False,
            "needs_setup": False,
            "capacity": t["capacity"]
        }

    free_ids = {t["table_id"]: t for t in free_tables}
    for table in free_tables:
        for partner_id in table.get("combinable_with", []):
            if partner_id in free_ids:
                partner = free_ids[partner_id]
                combined_cap = table["capacity"] + partner["capacity"]
                if combined_cap >= party_size:
                    return {
                        "found": True,
                        "table_ids": sorted([table["table_id"], partner_id]),
                        "combined": True,
                        "needs_setup": True,
                        "capacity": combined_cap
                    }

    return {"found": False, "table_ids": [], "combined": False, "needs_setup": False, "capacity": 0}

def find_next_available_slot(date_obj, party_size: int, after_time: str, settings: dict) -> str | None:
    slots = generate_slots(date_obj, party_size, settings)
    past_target = False
    for slot in slots:
        if slot["time"] == after_time:
            past_target = True
            continue
        if past_target and slot["available"]:
            return slot["time"]
    return None

def create_booking(
    party_size: int,
    date_str: str,
    time_str: str,
    name: str,
    contact: str,
    notes: str = None,
    session_id: str = None
) -> dict:
    from database import save_reservation
    settings = get_booking_settings()

    try:
        year, month, day = map(int, date_str.split("-"))
        hour, minute     = map(int, time_str.split(":"))
        start_dt         = datetime(year, month, day, hour, minute, 0)
    except Exception:
        return {"success": False, "reason": "invalid_datetime", "next_slot": None}

    min_advance = settings.get("min_advance_mins", 120)
    if start_dt < datetime.utcnow() + timedelta(minutes=min_advance):
        return {"success": False, "reason": "too_soon", "next_slot": None}

    max_online = settings.get("max_party_online", 8)
    if party_size > max_online:
        return {"success": False, "reason": "party_too_large", "next_slot": None}

    from datetime import date as date_type
    date_obj  = date_type(year, month, day)
    schedule  = get_day_schedule(date_obj, settings)
    if schedule is None:
        return {"success": False, "reason": "restaurant_closed", "next_slot": None}

    duration_mins  = get_duration_mins(party_size, settings)
    buffer_mins    = settings.get("buffer_mins", 15)
    end_dt         = start_dt + timedelta(minutes=duration_mins)
    effective_end  = start_dt + timedelta(minutes=duration_mins + buffer_mins)

    result = find_table(party_size, start_dt, effective_end, settings)
    if not result["found"]:
        next_slot = find_next_available_slot(date_obj, party_size, time_str, settings)
        return {"success": False, "reason": "no_table_available", "next_slot": next_slot}

    phone = contact if "@" not in contact else None
    email = contact if "@" in contact else None

    doc = {
        "table_ids":        result["table_ids"],
        "start_dt":         start_dt,
        "end_dt":           end_dt,
        "effective_end_dt": effective_end,
        "duration_mins":    duration_mins,
        "party_size":       party_size,
        "name":             name.strip(),
        "contact":          contact.strip(),
        "phone":            phone,
        "email":            email,
        "notes":            notes,
        "combined":         result["combined"],
        "needs_setup":      result["needs_setup"],
        "status":           "confirmed",
        "session_id":       session_id,
        "created_at":       datetime.utcnow(),
        "cancelled_at":     None
    }
    reservation_id = save_reservation(doc)

    return {
        "success":        True,
        "reservation_id": reservation_id,
        "table_ids":      result["table_ids"],
        "combined":       result["combined"],
        "needs_setup":    result["needs_setup"],
        "start_dt":       start_dt.isoformat(),
        "end_dt":         end_dt.isoformat(),
        "duration_mins":  duration_mins,
        "party_size":     party_size,
        "name":           name.strip(),
        "contact":        contact.strip()
    }
