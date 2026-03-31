import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

type Lang = "en" | "ja"

const T = {
  en: {
    dayNames: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
    monthNames: ["January","February","March","April","May","June","July","August","September","October","November","December"]
  },
  ja: {
    dayNames: ["日", "月", "火", "水", "木", "金", "土"],
    monthNames: ["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"]
  }
}

interface Props {
  value: string
  onChange: (date: string) => void
  minAdvanceDays?: number
  maxAdvanceDays?: number
  closedDays?: string[]
  lang?: Lang
}

export default function StepDatePicker({
  value,
  onChange,
  minAdvanceDays = 0,
  maxAdvanceDays = 30,
  closedDays = [],
  lang = "en"
}: Props) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())

  const t = T[lang]
  const minDate = new Date(today)
  minDate.setDate(today.getDate() + minAdvanceDays)

  const maxDate = new Date(today)
  maxDate.setDate(today.getDate() + maxAdvanceDays)

  const firstDay = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  const isDisabled = (day: number) => {
    const d = new Date(viewYear, viewMonth, day)
    d.setHours(0,0,0,0)
    if (d < minDate || d > maxDate) return true
    const dayName = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"][d.getDay()]
    if (closedDays.includes(dayName)) return true
    return false
  }

  const isToday = (day: number) => {
    const d = new Date(viewYear, viewMonth, day)
    return d.toDateString() === today.toDateString()
  }

  const dateStr = (day: number) => {
    const m = String(viewMonth + 1).padStart(2, "0")
    const d = String(day).padStart(2, "0")
    return `${viewYear}-${m}-${d}`
  }

  const header = lang === "ja"
    ? `${viewYear}年${t.monthNames[viewMonth]}`
    : `${t.monthNames[viewMonth]} ${viewYear}`

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="p-2 hover:text-brand transition-colors">
          <ChevronLeft size={18} />
        </button>
        <span className="font-medium text-[#F0E8E0]">{header}</span>
        <button onClick={nextMonth} className="p-2 hover:text-brand transition-colors">
          <ChevronRight size={18} />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-2">
        {t.dayNames.map(d => (
          <div key={d} className="text-center text-xs text-[#888880] py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
          const ds = dateStr(day)
          const disabled = isDisabled(day)
          const selected = value === ds
          const tod = isToday(day)
          return (
            <button
              key={day}
              disabled={disabled}
              onClick={() => onChange(ds)}
              className={`
                aspect-square rounded-full text-sm flex items-center justify-center transition-all
                ${selected ? "bg-brand text-white" : ""}
                ${!selected && !disabled ? "hover:bg-surface text-[#F0E8E0]" : ""}
                ${disabled ? "text-[#444] cursor-not-allowed" : ""}
                ${tod && !selected ? "underline" : ""}
              `}
            >
              {day}
            </button>
          )
        })}
      </div>
    </div>
  )
}
