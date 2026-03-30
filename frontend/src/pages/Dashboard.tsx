import { useEffect, useState } from "react"
import { fetchDashboard } from "../api/client"
import { format } from "date-fns"

interface Reservation {
  id: string
  start_dt: string
  end_dt: string
  party_size: number
  name: string
  contact: string
  table_ids: string[]
  needs_setup: boolean
  status: string
  notes?: string
}

interface Session {
  session_id: string
  message_count: number
  last_message: string
  last_timestamp: string
  messages: any[]
}

interface DashboardData {
  reservations: Reservation[]
  reservations_today: Reservation[]
  sessions: Session[]
  total_reservations: number
  today_count: number
  needs_setup_count: number
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [lastRefresh, setLastRefresh] = useState(new Date())
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set())

  const load = async () => {
    try {
      const d = await fetchDashboard()
      setData(d)
      setLastRefresh(new Date())
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    load()
    const interval = setInterval(load, 30000)
    return () => clearInterval(interval)
  }, [])

  const formatDt = (dt: string) => {
    try {
      return format(new Date(dt), "MMM d, h:mm a")
    } catch { return dt }
  }

  const statusBadge = (status: string) => {
    if (status === "confirmed") return "bg-[#1a2e1a] text-[#4CAF50] border border-[#2a4a2a]"
    if (status === "cancelled") return "bg-[#2e1a1a] text-[#E24B4A] border border-[#4a2a2a]"
    return "bg-surface text-[#888880] border border-border"
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-[#888880]">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg text-[#F0E8E0] p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-serif">El Pancho</h1>
          <p className="text-[#888880] text-sm mt-1">Owner Dashboard</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-[#888880]">
            Last refresh: {format(lastRefresh, "HH:mm:ss")}
          </span>
          <button
            onClick={load}
            className="px-4 py-2 rounded-xl border border-border text-sm hover:border-brand transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Reservations", value: data.total_reservations, amber: false },
          { label: "Today's Reservations", value: data.today_count, amber: false },
          { label: "Tables Need Setup", value: data.needs_setup_count, amber: data.needs_setup_count > 0 }
        ].map(stat => (
          <div key={stat.label} className={`bg-surface border rounded-2xl p-5 ${stat.amber ? "border-brand" : "border-border"}`}>
            <p className="text-[#888880] text-sm">{stat.label}</p>
            <p className={`text-4xl font-semibold mt-2 ${stat.amber ? "text-brand" : "text-[#F0E8E0]"}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Today's reservations */}
      {data.reservations_today.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Today's Schedule</h2>
          <div className="space-y-3">
            {[...data.reservations_today]
              .sort((a, b) => new Date(a.start_dt).getTime() - new Date(b.start_dt).getTime())
              .map(res => (
                <div key={res.id} className="bg-surface border border-border rounded-2xl p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-brand">
                          {format(new Date(res.start_dt), "h:mm a")}
                        </span>
                        <span className="text-[#888880] text-sm">
                          — {format(new Date(res.end_dt), "h:mm a")}
                        </span>
                      </div>
                      <p className="text-[#F0E8E0]">{res.name} · {res.party_size} guests</p>
                      <p className="text-[#888880] text-sm mt-0.5">{res.contact}</p>
                      <p className="text-xs text-[#666] mt-0.5">Tables: {(res.table_ids ?? []).join(", ")}</p>
                      {res.notes && <p className="text-xs text-[#888880] mt-1 italic">{res.notes}</p>}
                    </div>
                    {res.needs_setup && (
                      <span className="px-3 py-1 rounded-full bg-[#1e1400] border border-brand text-brand text-xs flex-shrink-0">
                        Setup required
                      </span>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* All reservations */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">All Reservations</h2>
        <div className="bg-surface border border-border rounded-2xl overflow-hidden">
          {data.reservations.length === 0 ? (
            <p className="text-[#888880] text-sm p-5">No reservations yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-[#888880] text-xs">
                  <th className="text-left px-4 py-3">Date & Time</th>
                  <th className="text-left px-4 py-3">Name</th>
                  <th className="text-left px-4 py-3">Party</th>
                  <th className="text-left px-4 py-3">Tables</th>
                  <th className="text-left px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.reservations.map(res => (
                  <tr key={res.id} className="border-b border-border last:border-0 hover:bg-[#111] transition-colors">
                    <td className="px-4 py-3 text-[#F0E8E0]">{formatDt(res.start_dt)}</td>
                    <td className="px-4 py-3">
                      <div>{res.name}</div>
                      <div className="text-[#888880] text-xs">{res.contact}</div>
                    </td>
                    <td className="px-4 py-3 text-[#F0E8E0]">{res.party_size}</td>
                    <td className="px-4 py-3 text-[#F0E8E0]">{(res.table_ids ?? []).join(", ")}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${statusBadge(res.status)}`}>
                        {res.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Conversations */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Chat Sessions</h2>
        <div className="space-y-2">
          {data.sessions.map(session => (
            <div key={session.session_id} className="bg-surface border border-border rounded-2xl overflow-hidden">
              <button
                onClick={() => {
                  setExpandedSessions(prev => {
                    const next = new Set(prev)
                    if (next.has(session.session_id)) next.delete(session.session_id)
                    else next.add(session.session_id)
                    return next
                  })
                }}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#111] transition-colors text-left"
              >
                <div>
                  <span className="text-sm text-[#F0E8E0]">
                    Session {session.session_id.slice(0, 8)}
                  </span>
                  <span className="text-xs text-[#888880] ml-3">{session.message_count} messages</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[#888880] hidden sm:block">{session.last_message.slice(0, 50)}</span>
                  <span className="text-[#888880]">
                    {expandedSessions.has(session.session_id) ? "▲" : "▼"}
                  </span>
                </div>
              </button>
              {expandedSessions.has(session.session_id) && (
                <div className="border-t border-border px-4 py-3 space-y-2 max-h-64 overflow-y-auto">
                  {session.messages.map((msg: any, i: number) => (
                    <div key={i} className={`text-xs ${msg.role === "user" ? "text-[#F0E8E0]" : "text-[#888880]"}`}>
                      <span className="font-medium uppercase text-[10px] mr-2">
                        {msg.role === "user" ? "Guest" : "Pancho"}
                      </span>
                      {msg.message?.slice(0, 120)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
