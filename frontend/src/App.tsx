import { BrowserRouter, Routes, Route } from "react-router-dom"
import ChatInterface from "./components/ChatInterface"
import Dashboard     from "./pages/Dashboard"
import Admin         from "./pages/Admin"

export default function App() {
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
