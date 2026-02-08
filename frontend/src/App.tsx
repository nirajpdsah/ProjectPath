import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import ProjectEditor from './pages/ProjectEditor'
import AnalysisView from './pages/AnalysisView'
import ProjectCrashing from './pages/ProjectCrashing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Navbar from './components/Navbar'
import { AuthProvider } from './context/AuthContext'

function AppRoutes() {
  return (
    <div className="min-h-screen bg-secondary-50 flex flex-col font-sans">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/project/:id" element={<ProjectEditor />} />
          <Route path="/project/:id/analysis" element={<AnalysisView />} />
          <Route path="/project/:id/crashing" element={<ProjectCrashing />} />
          <Route path="/crashing" element={<ProjectCrashing />} />
        </Routes>
      </main>
    </div>
  )
}

export default function AppWrapper() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  )
}
