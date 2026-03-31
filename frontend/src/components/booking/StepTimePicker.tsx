import { useEffect, useState } from "react"
import { fetchAvailability } from "../../api/client"

type Lang = "en" | "ja"

const T = {
  en: {
    error: "Failed to load slots",
    noAvail: "No availability on this date.",
    chooseAnother: "Please choose another day.",
    diningTime: (label: string) => `Dining time ~${label} for your party`,
    full: "Full"
  },
  ja: {
    error: "空き時間の取得に失敗しました",
    noAvail: "この日は空きがありません。",
    chooseAnother: "別の日をお選びください。",
    diningTime: (label: string) => `お食事時間の目安：約${label}`,
    full: "満席"
  }
}

interface Props {
  date: string
  partySize: number
  value: string
  onChange: (t: string) => void
  durationMins?: number
  prefetchedSlots?: Promise<any> | null
  lang?: Lang
}

export default function StepTimePicker({ date, partySize, value, onChange, durationMins, prefetchedSlots, lang = "en" }: Props) {
  const [slots, setSlots] = useState<{ time: string; available: boolean; reason: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const t = T[lang]

  useEffect(() => {
    setLoading(true)
    setError(null)
    const request = prefetchedSlots ?? fetchAvailability(date, partySize)
    request
      .then(data => setSlots(data.slots))
      .catch(() => setError(t.error))
      .finally(() => setLoading(false))
  }, [date, partySize])

  const availableCount = slots.filter(s => s.available).length

  const formatTime = (time: string) => {
    const [h, m] = time.split(":").map(Number)
    if (lang === "ja") return `${h}:${m.toString().padStart(2, "0")}`
    const ampm = h >= 12 ? "PM" : "AM"
    const h12 = h % 12 || 12
    return `${h12}:${m.toString().padStart(2, "0")} ${ampm}`
  }

  const hrs = durationMins ? Math.floor(durationMins / 60) : null
  const mins = durationMins ? durationMins % 60 : null
  const durationLabel = lang === "ja"
    ? (hrs ? (mins ? `${hrs}時間${mins}分` : `${hrs}時間`) : durationMins ? `${durationMins}分` : null)
    : (hrs ? (mins ? `${hrs}h ${mins}m` : `${hrs}h`) : durationMins ? `${durationMins}m` : null)

  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="h-10 rounded-xl bg-surface animate-pulse" />
        ))}
      </div>
    )
  }

  if (error) return <p className="text-[#E24B4A] text-sm text-center">{error}</p>

  if (availableCount === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-[#888880]">{t.noAvail}</p>
        <p className="text-sm text-[#888880] mt-1">{t.chooseAnother}</p>
      </div>
    )
  }

  return (
    <div>
      {durationLabel && (
        <p className="text-xs text-[#888880] text-center mb-3">
          {t.diningTime(durationLabel)}
        </p>
      )}
      <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto pr-1">
        {slots.map(slot => (
          <button
            key={slot.time}
            disabled={!slot.available}
            onClick={() => onChange(slot.time)}
            className={`
              px-2 py-2.5 rounded-xl text-sm font-medium transition-all
              ${value === slot.time ? "bg-brand text-white" : ""}
              ${slot.available && value !== slot.time ? "bg-surface border border-border hover:border-brand text-[#F0E8E0]" : ""}
              ${!slot.available ? "bg-[#111] text-[#444] cursor-not-allowed" : ""}
            `}
          >
            {formatTime(slot.time)}
            {!slot.available && <span className="block text-xs text-[#555] mt-0.5">{t.full}</span>}
          </button>
        ))}
      </div>
    </div>
  )
}
