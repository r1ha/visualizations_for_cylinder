import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Simulator from './pages/Simulator'
import Notes from './pages/Notes'

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Simulator
            />
          }
        />
        <Route path="/notes" element={<Notes />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
