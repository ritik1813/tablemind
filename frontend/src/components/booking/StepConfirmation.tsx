import { format } from "date-fns"

interface Props {
  partySize: number
  date: string
  time: string
  name: string
  contact: string
  notes: string
  onConfirm: () => void
  onBack: () => void
  loading: boolean
  error: string | null
}

export default function StepConfirmation({ partySize, date, time, name, contact, notes, onConfirm, onBack, loading, error }: Props) {
  const [year, month, day] = date.split("-").map(Number)
  const dateObj = new Date(year, month - 1, day)
  const formattedDate = format(dateObj, "EEEE, MMMM d")

  const [h, m] = time.split(":").map(Number)
  const ampm = h >= 12 ? "PM" : "AM"
  const h12 = h % 12 || 12
  const formattedTime = `${h12}:${m.toString().padStart(2, "0")} ${ampm}`

  const rows = [
    { label: "Date", value: formattedDate },
    { label: "Time", value: formattedTime },
    { label: "Party", value: `${partySize} guest${partySize !== 1 ? "s" : ""}` },
    { label: "Name", value: name },
    { label: "Contact", value: contact },
    ...(notes ? [{ label: "Note", value: notes }] : [])
  ]

  return (
    <div className="space-y-4">
      <div className="bg-[#111] rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-border">
          <span className="text-xl">🌮</span>
          <span className="font-semibold text-[#F0E8E0]">El Pancho</span>
        </div>
        {rows.map(r => (
          <div key={r.label} className="flex gap-3">
            <span className="text-xs text-[#888880] w-16 flex-shrink-0 pt-0.5">{r.label}</span>
            <span className="text-sm text-[#F0E8E0]">{r.value}</span>
          </div>
        ))}
      </div>
      {error && (
        <p className="text-[#E24B4A] text-sm text-center">{error}</p>
      )}
      <button
        onClick={onConfirm}
        disabled={loading}
        className="w-full py-3.5 rounded-xl bg-brand text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {loading ? "Confirming..." : "Confirm Booking"}
      </button>
      <button
        onClick={onBack}
        className="w-full py-2 text-sm text-[#888880] hover:text-[#F0E8E0] transition-colors"
      >
        ← Go back
      </button>
    </div>
  )
}
