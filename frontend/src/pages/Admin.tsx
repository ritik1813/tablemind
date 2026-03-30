import { useEffect, useState } from "react"
import { Plus, Trash2, Save, RefreshCw, Lock } from "lucide-react"

const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000"

const ADMIN_PIN = "1234"

// ── API helpers ────────────────────────────────────────────────────────────────

async function apiFetch(path: string) {
  const res = await fetch(`${BASE}${path}`)
  if (!res.ok) throw new Error(`Failed: ${path}`)
  return res.json()
}

async function apiPut(path: string, body: unknown) {
  const res = await fetch(`${BASE}${path}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  })
  if (!res.ok) throw new Error(`Failed PUT: ${path}`)
  return res.json()
}

// ── Shared UI ──────────────────────────────────────────────────────────────────

const inputCls = "w-full bg-[#111] border border-border rounded-xl px-3 py-2.5 text-sm text-[#F0E8E0] placeholder-[#444] focus:outline-none focus:border-brand transition-colors"
const labelCls = "block text-xs text-[#888880] mb-1.5"
const cardCls  = "bg-surface border border-border rounded-2xl p-5"

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      {children}
    </div>
  )
}

function SaveBar({ onSave, saving, saved }: { onSave: () => void; saving: boolean; saved: boolean }) {
  return (
    <div className="flex justify-end pt-2">
      <button
        onClick={onSave}
        disabled={saving}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        <Save size={15} />
        {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
      </button>
    </div>
  )
}

// ── Tab: Booking Settings ──────────────────────────────────────────────────────

function BookingSettingsTab() {
  const [s, setS] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => { apiFetch("/admin/settings").then(setS) }, [])

  const save = async () => {
    setSaving(true)
    await apiPut("/admin/settings", s)
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const updateRule = (i: number, field: string, val: number) => {
    const rules = [...s.duration_rules]
    rules[i] = { ...rules[i], [field]: val }
    setS({ ...s, duration_rules: rules })
  }

  const addRule = () => setS({ ...s, duration_rules: [...s.duration_rules, { max_party: 0, duration_mins: 120 }] })
  const removeRule = (i: number) => setS({ ...s, duration_rules: s.duration_rules.filter((_: any, idx: number) => idx !== i) })

  const updateDay = (day: string, field: "open" | "close", val: string) =>
    setS({ ...s, weekly_schedule: { ...s.weekly_schedule, [day]: { ...s.weekly_schedule[day], [field]: val } } })

  if (!s) return <p className="text-[#888880] text-sm">Loading...</p>

  const days = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"]

  return (
    <div className="space-y-6">
      {/* General */}
      <div className={cardCls}>
        <h3 className="font-semibold text-[#F0E8E0] mb-4">General Rules</h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Field label="Slot interval (mins)">
            <select value={s.slot_interval_mins} onChange={e => setS({ ...s, slot_interval_mins: +e.target.value })} className={inputCls}>
              {[15,30,45,60].map(v => <option key={v} value={v}>{v} min</option>)}
            </select>
          </Field>
          <Field label="Buffer between bookings (mins)">
            <input type="number" min={0} value={s.buffer_mins} onChange={e => setS({ ...s, buffer_mins: +e.target.value })} className={inputCls} />
          </Field>
          <Field label="Min advance notice (mins)">
            <input type="number" min={0} value={s.min_advance_mins} onChange={e => setS({ ...s, min_advance_mins: +e.target.value })} className={inputCls} />
          </Field>
          <Field label="Max advance days">
            <input type="number" min={1} value={s.max_advance_days} onChange={e => setS({ ...s, max_advance_days: +e.target.value })} className={inputCls} />
          </Field>
          <Field label="Max party (online)">
            <input type="number" min={1} value={s.max_party_online} onChange={e => setS({ ...s, max_party_online: +e.target.value })} className={inputCls} />
          </Field>
          <Field label="Cancel deadline (hrs before)">
            <input type="number" min={0} value={s.cancel_deadline_hrs} onChange={e => setS({ ...s, cancel_deadline_hrs: +e.target.value })} className={inputCls} />
          </Field>
        </div>
      </div>

      {/* Duration rules */}
      <div className={cardCls}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-[#F0E8E0]">Duration Rules</h3>
          <button onClick={addRule} className="flex items-center gap-1.5 text-xs text-brand hover:opacity-80">
            <Plus size={13} /> Add rule
          </button>
        </div>
        <div className="space-y-2">
          <div className="grid grid-cols-3 gap-3 text-xs text-[#888880] px-1 mb-1">
            <span>Max party size</span><span>Duration (mins)</span><span />
          </div>
          {s.duration_rules.map((r: any, i: number) => (
            <div key={i} className="grid grid-cols-3 gap-3 items-center">
              <input type="number" min={1} value={r.max_party} onChange={e => updateRule(i, "max_party", +e.target.value)} className={inputCls} />
              <input type="number" min={30} step={15} value={r.duration_mins} onChange={e => updateRule(i, "duration_mins", +e.target.value)} className={inputCls} />
              <button onClick={() => removeRule(i)} className="text-[#E24B4A] hover:opacity-80 flex justify-center">
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly schedule */}
      <div className={cardCls}>
        <h3 className="font-semibold text-[#F0E8E0] mb-4">Weekly Schedule</h3>
        <div className="space-y-2">
          <div className="grid grid-cols-3 gap-3 text-xs text-[#888880] px-1 mb-1">
            <span>Day</span><span>Open</span><span>Close</span>
          </div>
          {days.map(day => (
            <div key={day} className="grid grid-cols-3 gap-3 items-center">
              <span className="text-sm text-[#F0E8E0] capitalize">{day}</span>
              <input type="time" value={s.weekly_schedule[day]?.open || ""} onChange={e => updateDay(day, "open", e.target.value)} className={inputCls} />
              <input type="time" value={s.weekly_schedule[day]?.close || ""} onChange={e => updateDay(day, "close", e.target.value)} className={inputCls} />
            </div>
          ))}
        </div>
      </div>

      <SaveBar onSave={save} saving={saving} saved={saved} />
    </div>
  )
}

// ── Tab: Tables ────────────────────────────────────────────────────────────────

function TablesTab() {
  const [tables, setTables] = useState<any[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => { apiFetch("/admin/tables").then(setTables) }, [])

  const save = async () => {
    setSaving(true)
    await apiPut("/admin/tables", tables)
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const update = (i: number, field: string, val: any) => {
    const next = [...tables]
    next[i] = { ...next[i], [field]: val }
    setTables(next)
  }

  const addTable = () => {
    const id = `T${tables.length + 1}`
    setTables([...tables, { table_id: id, capacity: 2, label: "New", combinable_with: [] }])
  }

  const removeTable = (i: number) => setTables(tables.filter((_, idx) => idx !== i))

  const toggleCombinable = (i: number, otherId: string) => {
    const current: string[] = tables[i].combinable_with || []
    const next = current.includes(otherId) ? current.filter(x => x !== otherId) : [...current, otherId]
    update(i, "combinable_with", next)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={addTable} className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border text-sm hover:border-brand transition-colors">
          <Plus size={14} /> Add Table
        </button>
      </div>

      {tables.map((t, i) => (
        <div key={t.table_id} className={cardCls}>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 items-end">
            <Field label="Table ID">
              <input value={t.table_id} onChange={e => update(i, "table_id", e.target.value)} className={inputCls} />
            </Field>
            <Field label="Capacity">
              <input type="number" min={1} max={20} value={t.capacity} onChange={e => update(i, "capacity", +e.target.value)} className={inputCls} />
            </Field>
            <Field label="Label">
              <input value={t.label} onChange={e => update(i, "label", e.target.value)} className={inputCls} />
            </Field>
            <button onClick={() => removeTable(i)} className="flex items-center gap-1.5 text-[#E24B4A] hover:opacity-80 text-sm pb-1">
              <Trash2 size={14} /> Remove
            </button>
          </div>
          {tables.length > 1 && (
            <div className="mt-3">
              <p className={labelCls}>Combinable with</p>
              <div className="flex flex-wrap gap-2">
                {tables.filter((_, j) => j !== i).map(other => (
                  <button
                    key={other.table_id}
                    onClick={() => toggleCombinable(i, other.table_id)}
                    className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                      (t.combinable_with || []).includes(other.table_id)
                        ? "bg-brand border-brand text-white"
                        : "border-border text-[#888880] hover:border-brand"
                    }`}
                  >
                    {other.table_id} ({other.label}, {other.capacity} seats)
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}

      <SaveBar onSave={save} saving={saving} saved={saved} />
    </div>
  )
}

// ── Tab: Restaurant Config ─────────────────────────────────────────────────────

function RestaurantConfigTab() {
  const [c, setC] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => { apiFetch("/admin/config").then(setC) }, [])

  const save = async () => {
    setSaving(true)
    await apiPut("/admin/config", c)
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const updateHour = (day: string, val: string) => setC({ ...c, hours: { ...c.hours, [day]: val } })
  const updateDeal = (i: number, val: string) => {
    const deals = [...c.happy_hour.deals]
    deals[i] = val
    setC({ ...c, happy_hour: { ...c.happy_hour, deals } })
  }
  const addDeal = () => setC({ ...c, happy_hour: { ...c.happy_hour, deals: [...c.happy_hour.deals, ""] } })
  const removeDeal = (i: number) => setC({ ...c, happy_hour: { ...c.happy_hour, deals: c.happy_hour.deals.filter((_: any, idx: number) => idx !== i) } })

  if (!c) return <p className="text-[#888880] text-sm">Loading...</p>

  return (
    <div className="space-y-6">
      {/* Basic info */}
      <div className={cardCls}>
        <h3 className="font-semibold text-[#F0E8E0] mb-4">Basic Info</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Restaurant name"><input value={c.name} onChange={e => setC({ ...c, name: e.target.value })} className={inputCls} /></Field>
          <Field label="Japanese name"><input value={c.name_jp || ""} onChange={e => setC({ ...c, name_jp: e.target.value })} className={inputCls} /></Field>
          <Field label="Phone"><input value={c.phone} onChange={e => setC({ ...c, phone: e.target.value })} className={inputCls} /></Field>
          <Field label="Last order time"><input value={c.last_order || ""} onChange={e => setC({ ...c, last_order: e.target.value })} className={inputCls} /></Field>
          <Field label="Address">
            <textarea value={c.address} onChange={e => setC({ ...c, address: e.target.value })} rows={2} className={`${inputCls} resize-none`} />
          </Field>
          <Field label="Access directions">
            <textarea value={c.access || ""} onChange={e => setC({ ...c, access: e.target.value })} rows={2} className={`${inputCls} resize-none`} />
          </Field>
        </div>
      </div>

      {/* Opening hours */}
      <div className={cardCls}>
        <h3 className="font-semibold text-[#F0E8E0] mb-4">Opening Hours</h3>
        <div className="space-y-2">
          {Object.entries(c.hours).map(([day, hrs]) => (
            <div key={day} className="grid grid-cols-3 gap-3 items-center">
              <span className="text-sm text-[#F0E8E0]">{day}</span>
              <input value={hrs as string} onChange={e => updateHour(day, e.target.value)} placeholder="11:30 - 23:30" className={`${inputCls} col-span-2`} />
            </div>
          ))}
        </div>
      </div>

      {/* Happy hour */}
      <div className={cardCls}>
        <h3 className="font-semibold text-[#F0E8E0] mb-4">Happy Hour</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-4">
          <Field label="Weekday hours">
            <input value={c.happy_hour?.weekday || ""} onChange={e => setC({ ...c, happy_hour: { ...c.happy_hour, weekday: e.target.value } })} className={inputCls} />
          </Field>
          <Field label="Weekend hours">
            <input value={c.happy_hour?.weekend || ""} onChange={e => setC({ ...c, happy_hour: { ...c.happy_hour, weekend: e.target.value } })} className={inputCls} />
          </Field>
        </div>
        <div className="flex items-center justify-between mb-2">
          <p className={labelCls}>Deals</p>
          <button onClick={addDeal} className="flex items-center gap-1 text-xs text-brand hover:opacity-80"><Plus size={12} /> Add</button>
        </div>
        <div className="space-y-2">
          {(c.happy_hour?.deals || []).map((deal: string, i: number) => (
            <div key={i} className="flex gap-2 items-center">
              <input value={deal} onChange={e => updateDeal(i, e.target.value)} className={`${inputCls} flex-1`} />
              <button onClick={() => removeDeal(i)} className="text-[#E24B4A] hover:opacity-80"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      </div>

      {/* AI persona */}
      <div className={cardCls}>
        <h3 className="font-semibold text-[#F0E8E0] mb-4">AI Persona</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="AI name (shown in chat)">
            <input value={c.ai_name || ""} onChange={e => setC({ ...c, ai_name: e.target.value })} className={inputCls} />
          </Field>
          <Field label="Tagline">
            <input value={c.tagline || ""} onChange={e => setC({ ...c, tagline: e.target.value })} className={inputCls} />
          </Field>
          <Field label="Vibe / personality description">
            <textarea value={c.vibe || ""} onChange={e => setC({ ...c, vibe: e.target.value })} rows={3} className={`${inputCls} resize-none sm:col-span-2`} />
          </Field>
        </div>
      </div>

      <SaveBar onSave={save} saving={saving} saved={saved} />
    </div>
  )
}

// ── Main Admin Page ────────────────────────────────────────────────────────────

type Tab = "booking" | "tables" | "config"

export default function Admin() {
  const [authed, setAuthed] = useState(false)
  const [pin, setPin] = useState("")
  const [pinError, setPinError] = useState(false)
  const [tab, setTab] = useState<Tab>("booking")

  const login = () => {
    if (pin === ADMIN_PIN) { setAuthed(true) }
    else { setPinError(true); setPin("") }
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="bg-surface border border-border rounded-2xl p-8 w-full max-w-sm">
          <div className="flex items-center justify-center mb-6">
            <div className="w-12 h-12 rounded-full bg-[#1e1400] border border-brand flex items-center justify-center">
              <Lock size={20} className="text-brand" />
            </div>
          </div>
          <h2 className="text-center font-semibold text-[#F0E8E0] text-lg mb-1">Admin Access</h2>
          <p className="text-center text-[#888880] text-sm mb-6">Enter your PIN to continue</p>
          <input
            type="password"
            value={pin}
            onChange={e => { setPin(e.target.value); setPinError(false) }}
            onKeyDown={e => e.key === "Enter" && login()}
            placeholder="PIN"
            className={`${inputCls} text-center tracking-widest text-lg mb-3`}
            autoFocus
          />
          {pinError && <p className="text-[#E24B4A] text-xs text-center mb-3">Incorrect PIN</p>}
          <button
            onClick={login}
            className="w-full py-3 rounded-xl bg-brand text-white font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            Unlock
          </button>
        </div>
      </div>
    )
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "booking", label: "Booking Settings" },
    { key: "tables",  label: "Tables" },
    { key: "config",  label: "Restaurant Config" },
  ]

  return (
    <div className="min-h-screen bg-bg text-[#F0E8E0]">
      {/* Header */}
      <div className="border-b border-border bg-surface px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-serif">El Pancho — Admin</h1>
          <p className="text-xs text-[#888880] mt-0.5">Restaurant configuration</p>
        </div>
        <div className="flex items-center gap-3">
          <a href="/dashboard" className="text-sm text-[#888880] hover:text-[#F0E8E0] transition-colors">
            ← Dashboard
          </a>
          <button
            onClick={() => setAuthed(false)}
            className="px-4 py-2 rounded-xl border border-border text-sm hover:border-[#E24B4A] hover:text-[#E24B4A] transition-colors"
          >
            Lock
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border bg-surface px-6">
        <div className="flex gap-1">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                tab === t.key
                  ? "border-brand text-brand"
                  : "border-transparent text-[#888880] hover:text-[#F0E8E0]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {tab === "booking" && <BookingSettingsTab />}
        {tab === "tables"  && <TablesTab />}
        {tab === "config"  && <RestaurantConfigTab />}
      </div>
    </div>
  )
}
