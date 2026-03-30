# TableMind — El Pancho AI Concierge

## Prerequisites
- Python 3.11+
- Node.js 18+
- MongoDB (local or Atlas)
- Google Gemini API key

---

## 1. Backend Setup

```bash
cd tablemind/backend

# Copy and fill in your credentials
cp .env.example .env
# Edit .env — set GEMINI_API_KEY and MONGODB_URI

# Create and activate virtual environment
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the API server
uvicorn main:app --reload --port 8000
```

Backend runs at: http://localhost:8000
API docs at: http://localhost:8000/docs

---

## 2. Frontend Setup

```bash
cd tablemind/frontend

# Install dependencies (already done)
npm install

# Start the dev server
npm run dev
```

Frontend runs at: http://localhost:5173

- Guest chat UI: http://localhost:5173/
- Owner dashboard: http://localhost:5173/dashboard

---

## 3. Environment Variables

### `tablemind/backend/.env`
```
GEMINI_API_KEY=your_gemini_api_key_here
MONGODB_URI=mongodb://localhost:27017   # or your Atlas URI
MONGODB_DB_NAME=tablemind
```

### Optional frontend env (create `tablemind/frontend/.env`)
```
VITE_API_URL=http://localhost:8000
```

---

## Architecture

```
tablemind/
  backend/
    main.py              — FastAPI app, all routes
    database.py          — MongoDB helpers
    booking_engine.py    — Availability & reservation logic
    prompt.py            — Gemini system prompt builder
    restaurant_data.py   — El Pancho data & defaults
    requirements.txt
    .env.example

  frontend/
    src/
      api/client.ts                    — API calls + streaming
      components/
        ChatInterface.tsx              — Main chat UI
        Message.tsx                    — Chat bubble
        TypingIndicator.tsx            — Animated dots
        booking/
          BookingWidget.tsx            — Multi-step booking flow
          StepPartySize.tsx
          StepDatePicker.tsx
          StepTimePicker.tsx
          StepGuestDetails.tsx
          StepConfirmation.tsx
          BookingSuccess.tsx
      pages/
        Dashboard.tsx                  — Owner dashboard
      App.tsx
      main.tsx
      index.css
```

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /health | Health check |
| POST | /chat | Streaming AI chat |
| GET | /availability?date=&party_size= | Available time slots |
| POST | /reservations | Create reservation |
| DELETE | /reservations/{id} | Cancel reservation |
| GET | /dashboard | All reservations + chat sessions |
| GET/PUT | /admin/settings | Booking settings |
| GET/PUT | /admin/tables | Table configuration |
| GET/PUT | /admin/config | Restaurant config |

---

## Notes

- The AI (Pancho) responds in English or Japanese based on user input
- When a booking intent is detected, the AI triggers `<SHOW_BOOKING_WIDGET/>` which shows the in-chat booking flow
- Reservations require at least 2 hours advance booking
- Groups larger than 8 must call the restaurant
- Tables can be combined automatically for larger parties
- The dashboard auto-refreshes every 30 seconds
