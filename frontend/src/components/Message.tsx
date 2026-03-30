import { motion } from "framer-motion"

interface MessageProps {
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export default function Message({ role, content, timestamp }: MessageProps) {
  const clean = content.replace(/<SHOW_BOOKING_WIDGET[^>]*\/>/g, "").trim()
  if (!clean) return null

  const isUser = role === "user"

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex items-end gap-3 mb-4 group ${isUser ? "flex-row-reverse" : ""}`}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
          P
        </div>
      )}
      <div className="max-w-[75%]">
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
            isUser
              ? "bg-brand text-white rounded-tr-sm"
              : "bg-surface border border-border text-[#F0E8E0] rounded-tl-sm"
          }`}
        >
          {clean}
        </div>
        <p className="text-xs text-[#888880] mt-1 opacity-0 group-hover:opacity-100 transition-opacity px-1">
          {timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </motion.div>
  )
}
