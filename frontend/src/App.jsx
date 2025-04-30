import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import HomePage from './pages/HomePage'
import Reports from './pages/Reports'

function App() {
  return (
    <>
      <Routes>
        <Route index element={<HomePage />} />
        <Route path="reports" element={<Reports />} />
      </Routes>
    </>
  )
}

export default App
