type Lang = "en" | "ja"

const T = {
  en: {
    nameLabel: "Your name *",
    namePlaceholder: "Your name",
    contactLabel: "Phone or email *",
    contactPlaceholder: "Phone or email",
    notesLabel: "Special requests (optional)",
    notesPlaceholder: "Allergies, special requests..."
  },
  ja: {
    nameLabel: "お名前 *",
    namePlaceholder: "お名前",
    contactLabel: "電話番号またはメール *",
    contactPlaceholder: "電話番号またはメールアドレス",
    notesLabel: "特別なリクエスト（任意）",
    notesPlaceholder: "アレルギー、特別なご要望など..."
  }
}

interface Props {
  name: string
  contact: string
  notes: string
  onChange: (field: "name" | "contact" | "notes", value: string) => void
  lang?: Lang
}

export default function StepGuestDetails({ name, contact, notes, onChange, lang = "en" }: Props) {
  const t = T[lang]
  const inputClass = "w-full bg-[#111] border border-border rounded-xl px-4 py-3 text-[#F0E8E0] text-sm placeholder-[#444] focus:outline-none focus:border-brand transition-colors"
  const labelClass = "block text-xs text-[#888880] mb-1.5"

  return (
    <div className="space-y-4">
      <div>
        <label className={labelClass}>{t.nameLabel}</label>
        <input
          value={name}
          onChange={e => onChange("name", e.target.value)}
          placeholder={t.namePlaceholder}
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>{t.contactLabel}</label>
        <input
          value={contact}
          onChange={e => onChange("contact", e.target.value)}
          placeholder={t.contactPlaceholder}
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>{t.notesLabel}</label>
        <textarea
          value={notes}
          onChange={e => onChange("notes", e.target.value)}
          placeholder={t.notesPlaceholder}
          rows={3}
          className={`${inputClass} resize-none`}
        />
      </div>
    </div>
  )
}
