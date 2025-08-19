import './App.css'
import { HashRouter, Routes, Route } from "react-router-dom"
import Simulator from './pages/Simulator'
import Test from './pages/Test'

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
        <Route path="/test" element={<Test/>} />
      </Routes>
    </HashRouter>
  )
}

export default App
