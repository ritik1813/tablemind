const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000"

export function warmup() {
  fetch(`${BASE}/ping`).catch(() => {})
}

export async function streamChat(
  sessionId: string,
  message: string,
  onToken: (t: string) => void,
  onDone: () => void,
  language: string = "en"
): Promise<void> {
  const res = await fetch(`${BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id: sessionId, message, language })
  })
  if (!res.ok) throw new Error(`Chat error: ${res.status}`)
  const reader = res.body!.getReader()
  const dec    = new TextDecoder()
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    onToken(dec.decode(value, { stream: true }))
  }
  onDone()
}

export async function fetchAvailability(date: string, partySize: number) {
  const res = await fetch(`${BASE}/availability?date=${date}&party_size=${partySize}`)
  if (!res.ok) throw new Error("Failed to fetch availability")
  return res.json() as Promise<{
    date: string
    party_size: number
    slots: { time: string; available: boolean; reason: string }[]
  }>
}

export async function createReservation(payload: {
  session_id: string
  party_size: number
  date: string
  time: string
  name: string
  contact: string
  notes?: string
}) {
  const res = await fetch(`${BASE}/reservations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail?.reason || "Booking failed")
  return data
}

export async function fetchDashboard() {
  const res = await fetch(`${BASE}/dashboard`)
  if (!res.ok) throw new Error("Dashboard fetch failed")
  return res.json()
}
