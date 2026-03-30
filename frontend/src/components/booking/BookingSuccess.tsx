import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { format } from "date-fns"

interface Props {
  booking: {
    reservation_id: string
    party_size: number
    start_dt: string
    name: string
    contact: string
    needs_setup?: boolean
  }
  onBack: () => void
}

export default function BookingSuccess({ booking, onBack }: Props) {
  const [countdown, setCountdown] = useState(3)

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { clearInterval(interval); onBack(); return 0 }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [])
  const dt = new Date(booking.start_dt)
  const formattedDate = format(dt, "EEEE, MMMM d")
  const h = dt.getHours()
  const m = dt.getMinutes()
  const ampm = h >= 12 ? "PM" : "AM"
  const h12 = h % 12 || 12
  const formattedTime = `${h12}:${m.toString().padStart(2, "0")} ${ampm}`
  const ref = booking.reservation_id.slice(-8).toUpperCase()
  const isEmail = booking.contact.includes("@")

  return (
    <div className="flex flex-col items-center gap-5 py-2 text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="w-20 h-20 rounded-full bg-[#1a2e1a] border-2 border-[#4CAF50] flex items-center justify-center"
      >
        <motion.svg
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          width="36" height="36" viewBox="0 0 36 36" fill="none"
        >
          <motion.path
            d="M8 18 L15 25 L28 11"
            stroke="#4CAF50"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          />
        </motion.svg>
      </motion.div>

      <div>
        <h3 className="text-xl font-semibold text-[#F0E8E0]">Booking Confirmed!</h3>
        <p className="text-xs text-[#888880] mt-1">Ref: {ref}</p>
      </div>

      <div className="bg-[#111] rounded-2xl p-4 w-full space-y-2 text-left">
        {[
          { label: "Date", value: formattedDate },
          { label: "Time", value: formattedTime },
          { label: "Party", value: `${booking.party_size} guests` },
          { label: "Name", value: booking.name },
        ].map(r => (
          <div key={r.label} className="flex gap-3">
            <span className="text-xs text-[#888880] w-12 flex-shrink-0 pt-0.5">{r.label}</span>
            <span className="text-sm text-[#F0E8E0]">{r.value}</span>
          </div>
        ))}
      </div>

      {booking.needs_setup && (
        <div className="w-full bg-[#1e1400] border border-brand rounded-xl px-4 py-2.5 text-sm text-brand text-left">
          Tables will be arranged for your group — please arrive on time.
        </div>
      )}

      <p className="text-sm text-[#888880]">
        We'll see you soon! Check your {isEmail ? "email" : "phone"} for confirmation.
      </p>

      <button
        onClick={onBack}
        className="w-full py-3 rounded-xl bg-surface border border-border text-sm text-[#F0E8E0] hover:border-brand transition-colors"
      >
        Back to chat {countdown > 0 && <span className="text-[#888880]">({countdown})</span>}
      </button>
    </div>
  )
}
