import { useState } from "react"
import { X } from "lucide-react"
import { createReservation } from "../../api/client"
import StepPartySize from "./StepPartySize"
import StepDatePicker from "./StepDatePicker"
import StepTimePicker from "./StepTimePicker"
import StepGuestDetails from "./StepGuestDetails"
import StepConfirmation from "./StepConfirmation"
import BookingSuccess from "./BookingSuccess"

type Step = "party" | "date" | "time" | "details" | "confirm" | "success"

interface Props {
  sessionId: string
  onClose: () => void
  onSuccess: (booking: any) => void
  initialPartySize?: number
  initialTime?: string
}

const STEPS: Step[] = ["party", "date", "time", "details", "confirm"]

export default function BookingWidget({ sessionId, onClose, onSuccess, initialPartySize, initialTime }: Props) {
  const [step, setStep] = useState<Step>(initialPartySize ? "date" : "party")
  const [partySize, setPartySize] = useState(initialPartySize ?? 2)
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState(initialTime ?? "")
  const [name, setName] = useState("")
  const [contact, setContact] = useState("")
  const [notes, setNotes] = useState("")
  const [booking, setBooking] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const MAX_ONLINE = 8
  const stepIdx = STEPS.indexOf(step as any)

  const canNext = () => {
    if (step === "party") return partySize <= MAX_ONLINE
    if (step === "date") return !!selectedDate
    if (step === "time") return !!selectedTime
    if (step === "details") return name.trim().length > 0 && contact.trim().length > 0
    return true
  }

  const next = () => {
    const idx = STEPS.indexOf(step as any)
    if (idx < STEPS.length - 1) setStep(STEPS[idx + 1])
  }

  const back = () => {
    const idx = STEPS.indexOf(step as any)
    if (idx > 0) setStep(STEPS[idx - 1])
  }

  const handleConfirm = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await createReservation({
        session_id: sessionId,
        party_size: partySize,
        date: selectedDate,
        time: selectedTime,
        name,
        contact,
        notes: notes || undefined
      })
      setBooking(result)
      setStep("success")
    } catch (e: any) {
      setError(e.message || "Booking failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const getDurationHint = () => {
    const rules = [
      { max_party: 2, duration_mins: 90 },
      { max_party: 4, duration_mins: 120 },
      { max_party: 6, duration_mins: 150 },
      { max_party: 99, duration_mins: 180 }
    ]
    for (const r of rules) {
      if (partySize <= r.max_party) return r.duration_mins
    }
    return 120
  }

  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden w-full max-w-sm mx-auto">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <span className="text-sm font-semibold text-[#F0E8E0]">Reserve a Table</span>
        <button onClick={onClose} className="text-[#888880] hover:text-[#F0E8E0] transition-colors">
          <X size={18} />
        </button>
      </div>

      {step !== "success" && (
        <div className="flex items-center justify-center gap-2 px-5 py-3 border-b border-border">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full transition-colors ${i === stepIdx ? "bg-brand" : i < stepIdx ? "bg-[#4CAF50]" : "bg-border"}`} />
              {i < STEPS.length - 1 && <div className="w-4 h-px bg-border" />}
            </div>
          ))}
        </div>
      )}

      <div className="px-5 py-5">
        {step === "party" && (
          <StepPartySize value={partySize} onChange={setPartySize} maxOnline={MAX_ONLINE} />
        )}
        {step === "date" && (
          <StepDatePicker
            value={selectedDate}
            onChange={d => { setSelectedDate(d); setSelectedTime(""); next() }}
            maxAdvanceDays={30}
          />
        )}
        {step === "time" && (
          <StepTimePicker
            date={selectedDate}
            partySize={partySize}
            value={selectedTime}
            onChange={t => { setSelectedTime(t); next() }}
            durationMins={getDurationHint()}
          />
        )}
        {step === "details" && (
          <StepGuestDetails
            name={name}
            contact={contact}
            notes={notes}
            onChange={(f, v) => {
              if (f === "name") setName(v)
              else if (f === "contact") setContact(v)
              else setNotes(v)
            }}
          />
        )}
        {step === "confirm" && (
          <StepConfirmation
            partySize={partySize}
            date={selectedDate}
            time={selectedTime}
            name={name}
            contact={contact}
            notes={notes}
            onConfirm={handleConfirm}
            onBack={back}
            loading={loading}
            error={error}
          />
        )}
        {step === "success" && booking && (
          <BookingSuccess booking={booking} onBack={() => onSuccess(booking)} />
        )}
      </div>

      {step !== "confirm" && step !== "success" && step !== "date" && step !== "time" && (
        <div className="flex items-center gap-3 px-5 pb-5">
          {stepIdx > 0 && (
            <button
              onClick={back}
              className="px-4 py-3 rounded-xl border border-border text-sm text-[#888880] hover:text-[#F0E8E0] hover:border-[#444] transition-colors"
            >
              ←
            </button>
          )}
          <button
            onClick={next}
            disabled={!canNext()}
            className="flex-1 py-3 rounded-xl bg-brand text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
      {(step === "time") && stepIdx > 0 && (
        <div className="px-5 pb-5">
          <button
            onClick={back}
            className="px-4 py-2 text-sm text-[#888880] hover:text-[#F0E8E0] transition-colors"
          >
            ← Back
          </button>
        </div>
      )}
    </div>
  )
}
