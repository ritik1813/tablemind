interface Props {
  name: string
  contact: string
  notes: string
  onChange: (field: "name" | "contact" | "notes", value: string) => void
}

export default function StepGuestDetails({ name, contact, notes, onChange }: Props) {
  const inputClass = "w-full bg-[#111] border border-border rounded-xl px-4 py-3 text-[#F0E8E0] text-sm placeholder-[#444] focus:outline-none focus:border-brand transition-colors"
  const labelClass = "block text-xs text-[#888880] mb-1.5"

  return (
    <div className="space-y-4">
      <div>
        <label className={labelClass}>Your name *</label>
        <input
          value={name}
          onChange={e => onChange("name", e.target.value)}
          placeholder="Your name"
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Phone or email *</label>
        <input
          value={contact}
          onChange={e => onChange("contact", e.target.value)}
          placeholder="Phone or email"
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Special requests (optional)</label>
        <textarea
          value={notes}
          onChange={e => onChange("notes", e.target.value)}
          placeholder="Allergies, special requests..."
          rows={3}
          className={`${inputClass} resize-none`}
        />
      </div>
    </div>
  )
}
