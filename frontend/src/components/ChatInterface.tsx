import { useState, useRef, useEffect } from "react"
import { v4 as uuidv4 } from "uuid"
import { streamChat } from "../api/client"
import Message from "./Message"
import TypingIndicator from "./TypingIndicator"
import BookingWidget from "./booking/BookingWidget"

interface Msg {
  role: "user" | "assistant"
  content: string
  timestamp: Date
  showBookingWidget?: boolean
}

const T = {
  en: {
    greeting:    "Hello! I'm Pancho, your AI concierge for El Pancho Osaka. How can I help you today? 🌮",
    online:      "Pancho is online",
    bookBtn:     "Book a Table",
    placeholder: "Ask about menu, hours, or book a table...",
    quickReplies: ["See the menu", "Book a table", "Hours & access", "Happy hour?", "Vegetarian options"],
    booked:      (name: string, party: number, date: string, time: string) =>
      `You're all booked — ${name}, party of ${party} on ${date} at ${time}. See you soon! 🎉`,
    error:       "Sorry, something went wrong. Please try again."
  },
  ja: {
    greeting:    "こんにちは！大阪のエルパンチョへようこそ。AIコンシェルジュのパンチョです。今日はどのようなご用件でしょうか？🌮",
    online:      "パンチョはオンラインです",
    bookBtn:     "テーブルを予約",
    placeholder: "メニュー、営業時間、ご予約についてお気軽にどうぞ...",
    quickReplies: ["メニューを見る", "テーブルを予約", "営業時間・アクセス", "ハッピーアワー？", "ベジタリアンメニュー"],
    booked:      (name: string, party: number, date: string, time: string) =>
      `ご予約が確定しました — ${name}様、${party}名、${date} ${time}。ご来店をお待ちしております！🎉`,
    error:       "申し訳ありません。エラーが発生しました。もう一度お試しください。"
  }
}

function getSessionId() {
  const key = "tm_session"
  let id = localStorage.getItem(key)
  if (!id) { id = uuidv4(); localStorage.setItem(key, id) }
  return id
}

export default function ChatInterface() {
  const successHandled = useRef(false)
  const [language, setLanguage] = useState<"en" | "ja">("en")
  const [prefill, setPrefill] = useState<{ partySize?: number; time?: string }>({})
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: T.en.greeting, timestamp: new Date() }
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [showWidget, setShowWidget] = useState(false)
  const sessionId = useRef(getSessionId())
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading, showWidget])

  const switchLanguage = (lang: "en" | "ja") => {
    setLanguage(lang)
    // Update the greeting message if it's still the only message
    setMessages(prev => {
      if (prev.length === 1 && prev[0].role === "assistant") {
        return [{ ...prev[0], content: T[lang].greeting }]
      }
      return prev
    })
  }

  const send = async (text: string) => {
    if (!text.trim() || loading) return
    const userMsg: Msg = { role: "user", content: text.trim(), timestamp: new Date() }
    setMessages(prev => [...prev, userMsg])
    setInput("")
    setLoading(true)

    const assistantMsg: Msg = { role: "assistant", content: "", timestamp: new Date() }
    setMessages(prev => [...prev, assistantMsg])

    try {
      await streamChat(
        sessionId.current,
        text.trim(),
        token => {
          setMessages(prev => {
            const updated = [...prev]
            const last = updated[updated.length - 1]
            if (last.role === "assistant") {
              updated[updated.length - 1] = { ...last, content: last.content + token }
            }
            return updated
          })
        },
        () => {
          setLoading(false)
          setMessages(prev => {
            const updated = [...prev]
            const last = updated[updated.length - 1]
            if (last.role === "assistant" && last.content.includes("<SHOW_BOOKING_WIDGET")) {
              updated[updated.length - 1] = { ...last, showBookingWidget: true }
              successHandled.current = false
              const match = last.content.match(/<SHOW_BOOKING_WIDGET([^/]*)\/>/)
              const attrs = match?.[1] ?? ""
              const ps = attrs.match(/party_size="(\d+)"/)
              const tm = attrs.match(/time="(\d{2}:\d{2})"/)
              setPrefill({
                partySize: ps ? parseInt(ps[1]) : undefined,
                time: tm ? tm[1] : undefined
              })
              setShowWidget(true)
            }
            return updated
          })
        },
        language
      )
    } catch {
      setMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = { ...updated[updated.length - 1], content: T[language].error }
        return updated
      })
      setLoading(false)
    }
  }

  const handleSuccess = (booking: any) => {
    if (successHandled.current) return
    successHandled.current = true
    setShowWidget(false)
    const d = new Date(booking.start_dt)
    const h = d.getHours()
    const ampm = h >= 12 ? "PM" : "AM"
    const h12 = h % 12 || 12
    const m = d.getMinutes().toString().padStart(2, "0")
    const months = language === "ja"
      ? ["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"]
      : ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
    const dateStr = language === "ja"
      ? `${d.getFullYear()}年${months[d.getMonth()]}${d.getDate()}日`
      : `${months[d.getMonth()]} ${d.getDate()}`
    const timeStr = language === "ja"
      ? `${String(d.getHours()).padStart(2,"0")}:${m}`
      : `${h12}:${m} ${ampm}`
    setMessages(prev => [...prev, {
      role: "assistant",
      content: T[language].booked(booking.name, booking.party_size, dateStr, timeStr),
      timestamp: new Date()
    }])
  }

  const t = T[language]
  const showQuickReplies = messages.length <= 1

  return (
    <div className="flex flex-col h-[100dvh] bg-bg">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-surface">
        <div>
          <h1 className="font-serif text-xl text-[#F0E8E0]">El Pancho</h1>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-2 h-2 rounded-full bg-[#4CAF50]" />
            <span className="text-xs text-[#888880]">{t.online}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[#111] border border-border rounded-lg p-0.5">
            <button
              onClick={() => switchLanguage("en")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${language === "en" ? "bg-brand text-white" : "text-[#888880] hover:text-[#F0E8E0]"}`}
            >
              EN
            </button>
            <button
              onClick={() => switchLanguage("ja")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${language === "ja" ? "bg-brand text-white" : "text-[#888880] hover:text-[#F0E8E0]"}`}
            >
              日本語
            </button>
          </div>
          <button
            onClick={() => { successHandled.current = false; setPrefill({}); setShowWidget(true) }}
            className="px-4 py-2 rounded-xl bg-brand text-white text-sm font-medium hover:opacity-90 transition-opacity"
          >
            {t.bookBtn}
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-5">
        {messages.map((msg, i) => (
          <div key={i}>
            <Message role={msg.role} content={msg.content} timestamp={msg.timestamp} />
          </div>
        ))}
        {loading && <TypingIndicator />}
        {showWidget && (
          <div className="my-4">
            <BookingWidget
              sessionId={sessionId.current}
              onClose={() => { setShowWidget(false); setPrefill({}) }}
              onSuccess={handleSuccess}
              initialPartySize={prefill.partySize}
              initialTime={prefill.time}
              language={language}
            />
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick replies */}
      {showQuickReplies && !showWidget && (
        <div className="px-4 pb-3 flex gap-2 flex-wrap">
          {t.quickReplies.map(q => (
            <button
              key={q}
              onClick={() => send(q)}
              className="px-3 py-1.5 rounded-full border border-border text-xs text-[#888880] hover:text-[#F0E8E0] hover:border-brand transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="px-4 pb-4 pt-2 border-t border-border bg-surface">
        <div className="flex gap-3 items-center">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && send(input)}
            placeholder={t.placeholder}
            className="flex-1 bg-[#111] border border-border rounded-xl px-4 py-3 text-sm text-[#F0E8E0] placeholder-[#444] focus:outline-none focus:border-brand transition-colors"
          />
          <button
            onClick={() => send(input)}
            disabled={!input.trim() || loading}
            className="w-11 h-11 rounded-xl bg-brand text-white flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
