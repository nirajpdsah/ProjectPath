import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import ProjectEditor from './pages/ProjectEditor'
import AnalysisView from './pages/AnalysisView'
import Navbar from './components/Navbar'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-secondary-50 flex flex-col font-sans">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/project/:id" element={<ProjectEditor />} />
            <Route path="/project/:id/analysis" element={<AnalysisView />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
