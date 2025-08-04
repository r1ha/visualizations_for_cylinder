import './App.css'
import { HashRouter, Routes, Route } from "react-router-dom"
import Simulator from './pages/Simulator'

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
      </Routes>
    </HashRouter>
  )
}

export default App
