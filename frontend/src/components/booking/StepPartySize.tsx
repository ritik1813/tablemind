type Lang = "en" | "ja"

const T = {
  en: { question: "How many guests?", guests: "guests", tooLarge: (n: number) => `For groups larger than ${n}, please call us:` },
  ja: { question: "何名様ですか？", guests: "名", tooLarge: (n: number) => `${n}名以上のグループはお電話ください：` }
}

interface Props {
  value: number
  onChange: (n: number) => void
  maxOnline?: number
  phone?: string
  lang?: Lang
}

export default function StepPartySize({ value, onChange, maxOnline = 8, phone = "06-6241-0588", lang = "en" }: Props) {
  const t = T[lang]
  const tooLarge = value > maxOnline

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      <p className="text-[#888880] text-sm">{t.question}</p>
      <div className="flex items-center gap-8">
        <button
          onClick={() => onChange(Math.max(1, value - 1))}
          className="w-14 h-14 rounded-full border-2 border-border text-2xl text-[#F0E8E0] hover:border-brand hover:text-brand transition-colors flex items-center justify-center"
        >
          −
        </button>
        <div className="text-center">
          <span className="text-6xl font-semibold text-[#F0E8E0]">{value}</span>
          <p className="text-[#888880] text-sm mt-1">{t.guests}</p>
        </div>
        <button
          onClick={() => onChange(Math.min(maxOnline + 2, value + 1))}
          className="w-14 h-14 rounded-full border-2 border-border text-2xl text-[#F0E8E0] hover:border-brand hover:text-brand transition-colors flex items-center justify-center"
        >
          +
        </button>
      </div>
      {tooLarge && (
        <div className="bg-[#1A1010] border border-[#E24B4A] rounded-xl p-3 text-center text-sm max-w-xs">
          <p className="text-[#E24B4A]">{t.tooLarge(maxOnline)}</p>
          <p className="text-[#F0E8E0] font-semibold mt-1">{phone}</p>
        </div>
      )}
    </div>
  )
}
