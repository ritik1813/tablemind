import { format } from "date-fns"
import { ja as jaLocale } from "date-fns/locale"

type Lang = "en" | "ja"

const T = {
  en: {
    labels: { Date: "Date", Time: "Time", Party: "Party", Name: "Name", Contact: "Contact", Note: "Note" },
    guest: (n: number) => `${n} guest${n !== 1 ? "s" : ""}`,
    confirm: "Confirm Booking",
    confirming: "Confirming...",
    back: "← Go back"
  },
  ja: {
    labels: { Date: "日付", Time: "時間", Party: "人数", Name: "お名前", Contact: "連絡先", Note: "備考" },
    guest: (n: number) => `${n}名`,
    confirm: "予約を確定する",
    confirming: "確定中...",
    back: "← 戻る"
  }
}

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
  lang?: Lang
}

export default function StepConfirmation({ partySize, date, time, name, contact, notes, onConfirm, onBack, loading, error, lang = "en" }: Props) {
  const t = T[lang]
  const [year, month, day] = date.split("-").map(Number)
  const dateObj = new Date(year, month - 1, day)
  const formattedDate = lang === "ja"
    ? format(dateObj, "yyyy年M月d日(E)", { locale: jaLocale })
    : format(dateObj, "EEEE, MMMM d")

  const [h, m] = time.split(":").map(Number)
  const formattedTime = lang === "ja"
    ? `${h}:${m.toString().padStart(2, "0")}`
    : (() => { const ampm = h >= 12 ? "PM" : "AM"; const h12 = h % 12 || 12; return `${h12}:${m.toString().padStart(2, "0")} ${ampm}` })()

  const rows = [
    { key: "Date", value: formattedDate },
    { key: "Time", value: formattedTime },
    { key: "Party", value: t.guest(partySize) },
    { key: "Name", value: name },
    { key: "Contact", value: contact },
    ...(notes ? [{ key: "Note", value: notes }] : [])
  ] as { key: keyof typeof t.labels, value: string }[]

  return (
    <div className="space-y-4">
      <div className="bg-[#111] rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-border">
          <span className="text-xl">🌮</span>
          <span className="font-semibold text-[#F0E8E0]">El Pancho</span>
        </div>
        {rows.map(r => (
          <div key={r.key} className="flex gap-3">
            <span className="text-xs text-[#888880] w-16 flex-shrink-0 pt-0.5">{t.labels[r.key]}</span>
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
        {loading ? t.confirming : t.confirm}
      </button>
      <button
        onClick={onBack}
        className="w-full py-2 text-sm text-[#888880] hover:text-[#F0E8E0] transition-colors"
      >
        {t.back}
      </button>
    </div>
  )
}
