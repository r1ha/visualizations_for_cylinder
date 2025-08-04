import './App.css'
import { HashRouter, Routes, Route } from "react-router-dom"
import Simulator from './pages/Simulator'
import Notes from './pages/Notes'

function App() {

  return (
    <HashRouter>
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
    </HashRouter>
  )
}

export default App
