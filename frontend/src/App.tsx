import { useEffect } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import ChatInterface from "./components/ChatInterface"
import Dashboard     from "./pages/Dashboard"
import Admin         from "./pages/Admin"
import { warmup } from "./api/client"

export default function App() {
  useEffect(() => { warmup() }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"          element={<ChatInterface />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin"     element={<Admin />} />
      </Routes>
    </BrowserRouter>
  )
}
