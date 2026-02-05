import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { ArrowLeft, BarChart2, Share2, Activity, Zap, Clock, AlertTriangle, CheckCircle, Download, FileText, FileJson } from 'lucide-react'
import api from '../services/api'
import MonitoringDashboard from '../components/MonitoringDashboard'
import CrashingAnalysis from '../components/CrashingAnalysis'
import NetworkDiagram from '../components/NetworkDiagram'
import { useAuth } from '../context/AuthContext'
import { getGuestActivities, getGuestProject } from '../utils/guestStorage'

interface ActivityAnalysis {
  id: string
  activityId: string
  name: string
  es: number
  ef: number
  ls: number
  lf: number
  slack: number
  isCritical: boolean
}

interface ProjectAnalysis {
  projectDuration: number
  criticalPath: string[]
  activities: ActivityAnalysis[]
  projectVariance?: number
}

export default function AnalysisView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [analysis, setAnalysis] = useState<ProjectAnalysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deadline, setDeadline] = useState('')
  const [probability, setProbability] = useState<any>(null)
  const [calculating, setCalculating] = useState(false)
  const [activeTab, setActiveTab] = useState('analysis')
  const [projectMethod, setProjectMethod] = useState('')
  const [exporting, setExporting] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)

  useEffect(() => {
    performAnalysis()
  }, [id, isAuthenticated])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (showExportMenu && !target.closest('.export-menu-container')) {
        setShowExportMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showExportMenu])

  const performAnalysis = async () => {
    try {
      setLoading(true)
      if (!isAuthenticated) {
        const guestProject = id ? getGuestProject(id) : null
        const guestActivities = id ? getGuestActivities(id) : []
        if (!guestProject) {
          setError('Project not found')
          setAnalysis(null)
          return
        }
        if (!guestActivities || guestActivities.length === 0) {
          setError('Project has no activities')
          setAnalysis(null)
          return
        }

        const response = await api.post('/projects/analyze-adhoc', {
          method: guestProject.method,
          timeUnit: guestProject.timeUnit,
          activities: guestActivities
        })
        setAnalysis(response.data)
        setProjectMethod(guestProject.method)
        setError('')
      } else {
        const response = await api.get(`/projects/${id}/analyze`)
        setAnalysis(response.data)
        setError('')

        // Get project method
        const projectResponse = await api.get(`/projects/${id}`)
        setProjectMethod(projectResponse.data.method)
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to perform analysis')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const calculateProbability = async () => {
    if (!deadline) {
      setError('Please enter a deadline')
      return
    }

    setCalculating(true)
    try {
      if (!isAuthenticated) {
        const guestProject = id ? getGuestProject(id) : null
        const guestActivities = id ? getGuestActivities(id) : []
        if (!guestProject) {
          setError('Project not found')
          return
        }
        const response = await api.post('/projects/analyze-adhoc/probability', {
          method: guestProject.method,
          timeUnit: guestProject.timeUnit,
          deadline: parseFloat(deadline),
          activities: guestActivities
        })
        setProbability(response.data)
        setError('')
      } else {
        const response = await api.post(`/projects/${id}/probability`, {
          deadline: parseFloat(deadline)
        })
        setProbability(response.data)
        setError('')
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to calculate probability')
    } finally {
      setCalculating(false)
    }
  }

  const exportAnalysis = async (format: 'json' | 'pdf') => {
    setExporting(true)
    setShowExportMenu(false)
    try {
      if (!isAuthenticated) {
        // For guests, use adhoc export endpoint
        const guestProject = id ? getGuestProject(id) : null
        const guestActivities = id ? getGuestActivities(id) : []
        if (!guestProject) {
          setError('Project not found')
          setExporting(false)
          return
        }

        console.log('Exporting guest project:', { format, activities: guestActivities.length })

        const response = await api.post(`/projects/export-adhoc?format=${format}`, {
          method: guestProject.method,
          timeUnit: guestProject.timeUnit,
          activities: guestActivities
        }, {
          responseType: 'blob'
        })
        
        const blob = response.data
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
        const extension = format === 'pdf' ? 'pdf' : 'json'
        link.download = `guest_project_analysis_${timestamp}.${extension}`
        
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        console.log('Export successful')
      } else {
        // For authenticated users, use regular endpoint
        const response = await api.get(`/projects/${id}/export?format=${format}`, {
          responseType: 'blob'
        })
        
        const blob = response.data
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
        const extension = format === 'pdf' ? 'pdf' : 'json'
        link.download = `project_analysis_${timestamp}.${extension}`
        
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      }
      
      setError('')
    } catch (err: any) {
      console.error('Export error:', err)
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to export analysis'
      setError(errorMsg)
    } finally {
      setExporting(false)
    }
  }

  if (loading) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
        <p className="text-secondary-500 font-medium tracking-tight">Processing analysis algorithms...</p>
      </div>
    </div>
  )

  if (!analysis) return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-warning-50 border border-warning-200 text-warning-800 p-8 rounded-2xl flex flex-col items-center text-center shadow-sm">
        <AlertTriangle className="w-12 h-12 text-warning-500 mb-4" />
        <h3 className="text-lg font-bold mb-2">{error || 'Analysis Unavailable'}</h3>
        <p className="text-warning-700 mb-6 max-w-md">We couldn't generate the analysis. Please ensure your project graph is connected and valid (no cycles, single start/end).</p>
        <button
          onClick={() => navigate(`/project/${id}`)}
          className="btn-secondary"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Return to Editor
        </button>
      </div>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <button
          onClick={() => navigate(`/project/${id}`)}
          className="mb-4 text-secondary-500 hover:text-primary-600 text-sm font-medium flex items-center transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Project Editor
        </button>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-secondary-900 tracking-tight">Project Analysis Results</h1>
          <div className="flex items-center gap-3">
            <div className="relative export-menu-container">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                disabled={exporting}
                className="btn-secondary flex items-center gap-2 shadow-sm"
              >
                <Download className="w-4 h-4" />
                {exporting ? 'Exporting...' : 'Export Analysis'}
              </button>
              
              {showExportMenu && !exporting && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-secondary-200 z-50">
                  <div className="py-1">
                    <button
                      onClick={() => exportAnalysis('pdf')}
                      className="w-full px-4 py-2 text-left text-sm text-secondary-700 hover:bg-primary-50 hover:text-primary-700 flex items-center gap-2 transition-colors"
                    >
                      <FileText className="w-4 h-4" />
                      Export as PDF
                    </button>
                    <button
                      onClick={() => exportAnalysis('json')}
                      className="w-full px-4 py-2 text-left text-sm text-secondary-700 hover:bg-primary-50 hover:text-primary-700 flex items-center gap-2 transition-colors"
                    >
                      <FileJson className="w-4 h-4" />
                      Export as JSON
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="text-sm text-secondary-500 bg-secondary-50 px-3 py-1.5 rounded-lg border border-secondary-200">
              Method: <span className="font-semibold text-secondary-900">{projectMethod}</span>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-danger-500 text-danger-700 rounded-r shadow-sm flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="mb-8 border-b border-secondary-200">
        <nav className="flex -mb-px space-x-8 overflow-x-auto" aria-label="Tabs">
          {[
            { id: 'analysis', name: 'Overview', icon: BarChart2 },
            { id: 'network', name: 'Network Diagram', icon: Share2 },
            { id: 'monitoring', name: 'Monitoring', icon: Activity },
            { id: 'crashing', name: 'Crashing', icon: Zap },
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-all duration-200
                  ${activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'}
                `}
              >
                <Icon className={`w-4 h-4 mr-2 ${activeTab === tab.id ? 'stroke-2' : 'stroke-[1.5]'}`} />
                {tab.name}
              </button>
            )
          })}
        </nav>
      </div>

      {activeTab === 'analysis' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl shadow-card p-5 border border-secondary-200 flex flex-col justify-between hover:border-primary-200 transition-colors">
                <div className="text-xs text-secondary-500 font-semibold uppercase tracking-wide flex items-center">
                  <Clock className="w-3.5 h-3.5 mr-1.5" /> Duration
                </div>
                <div className="text-3xl font-bold text-primary-600 mt-2 tracking-tight">{analysis?.projectDuration.toFixed(2)}</div>
              </div>

              <div className="bg-white rounded-xl shadow-card p-5 border border-secondary-200 flex flex-col justify-between hover:border-danger-200 transition-colors">
                <div className="text-xs text-secondary-500 font-semibold uppercase tracking-wide flex items-center">
                  <AlertTriangle className="w-3.5 h-3.5 mr-1.5" /> Critical Tasks
                </div>
                <div className="text-3xl font-bold text-danger-500 mt-2 tracking-tight">{analysis?.activities.filter(a => a.isCritical).length}</div>
              </div>

              <div className="bg-white rounded-xl shadow-card p-5 border border-secondary-200 flex flex-col justify-between hover:border-primary-200 transition-colors">
                <div className="text-xs text-secondary-500 font-semibold uppercase tracking-wide flex items-center">
                  <Activity className="w-3.5 h-3.5 mr-1.5" /> Total Tasks
                </div>
                <div className="text-3xl font-bold text-secondary-700 mt-2 tracking-tight">{analysis?.activities.length}</div>
              </div>

              <div className="bg-white rounded-xl shadow-card p-5 border border-secondary-200 flex flex-col justify-between hover:border-warning-200 transition-colors">
                <div className="text-xs text-secondary-500 font-semibold uppercase tracking-wide flex items-center">
                  <Share2 className="w-3.5 h-3.5 mr-1.5" /> Path Nodes
                </div>
                <div className="text-3xl font-bold text-warning-500 mt-2 tracking-tight">{analysis?.criticalPath.length}</div>
              </div>
            </div>

            {/* Critical Path */}
            <div className="card p-6">
              <h2 className="text-lg font-bold mb-4 text-secondary-900 border-b border-secondary-100 pb-2 flex items-center">
                <Zap className="w-5 h-5 mr-2 text-warning-500" />
                Critical Path Sequence
              </h2>
              <div className="bg-gradient-to-r from-red-50 to-white border border-red-100 p-6 rounded-xl overflow-x-auto shadow-inner">
                <div className="flex items-center space-x-3 text-secondary-700 font-medium whitespace-nowrap">
                  {analysis?.criticalPath.length ? (
                    analysis.criticalPath.map((node, i) => (
                      <span key={i} className="flex items-center group">
                        <span className="bg-white px-3 py-1.5 rounded-lg shadow-sm border border-red-100 font-bold text-danger-700 group-hover:scale-105 transition-transform">{node}</span>
                        {i < analysis.criticalPath.length - 1 && <ArrowLeft className="w-4 h-4 mx-3 text-danger-300 rotate-180" />}
                      </span>
                    ))
                  ) : 'No critical path found'}
                </div>
              </div>
            </div>

            {/* Activity Schedule Table */}
            <div className="card overflow-hidden">
              <div className="p-6 border-b border-secondary-100 bg-secondary-50/30">
                <h2 className="text-lg font-bold text-secondary-900">Activity Schedule</h2>
                <p className="text-sm text-secondary-500 mt-1">Detailed calculation of Earliest/Latest Start & Finish Times</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-secondary-50 text-secondary-500 font-semibold border-b border-secondary-200">
                    <tr>
                      <th className="px-6 py-4 font-semibold uppercase text-xs tracking-wider">ID</th>
                      <th className="px-6 py-4 font-semibold text-center uppercase text-xs tracking-wider">ES</th>
                      <th className="px-6 py-4 font-semibold text-center uppercase text-xs tracking-wider">EF</th>
                      <th className="px-6 py-4 font-semibold text-center uppercase text-xs tracking-wider">LS</th>
                      <th className="px-6 py-4 font-semibold text-center uppercase text-xs tracking-wider">LF</th>
                      <th className="px-6 py-4 font-semibold text-center uppercase text-xs tracking-wider">Slack</th>
                      <th className="px-6 py-4 font-semibold text-center uppercase text-xs tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-secondary-100">
                    {(analysis?.activities || []).sort((a, b) => a.es - b.es).map(activity => (
                      <tr
                        key={activity.id}
                        className={`border-b border-secondary-100 hover:bg-secondary-50/80 transition-colors ${activity.isCritical ? 'bg-red-50/30' : ''
                          }`}
                      >
                        <td className="px-6 py-4 font-bold text-secondary-900">{activity.activityId}</td>
                        <td className="px-6 py-4 text-center text-secondary-600 font-mono text-xs">{activity.es.toFixed(2)}</td>
                        <td className="px-6 py-4 text-center text-secondary-600 font-mono text-xs">{activity.ef.toFixed(2)}</td>
                        <td className="px-6 py-4 text-center text-secondary-600 font-mono text-xs">{activity.ls.toFixed(2)}</td>
                        <td className="px-6 py-4 text-center text-secondary-600 font-mono text-xs">{activity.lf.toFixed(2)}</td>
                        <td className="px-6 py-4 text-center font-medium text-secondary-800">{activity.slack.toFixed(2)}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${activity.isCritical
                            ? 'bg-danger-50 text-danger-700 border-danger-100'
                            : 'bg-success-50 text-success-700 border-success-100'
                            }`}>
                            {activity.isCritical ? 'Critical' : 'Normal'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Probability Calculator */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-8 border-primary-100 shadow-lg shadow-primary-500/5">
              <div className="flex items-center gap-2 mb-4 text-primary-700">
                <BarChart2 className="w-5 h-5" />
                <h2 className="text-lg font-bold">Analysis Tools</h2>
              </div>

              <div className="space-y-6">
                <div className="bg-primary-50/50 p-4 rounded-xl border border-primary-100">
                  <h3 className="font-semibold text-secondary-900 text-sm mb-3">Probability Calculator</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-secondary-600 mb-1.5 uppercase tracking-wide">
                        Target Completion Time
                      </label>
                      <div className="relative rounded-md shadow-sm">
                        <input
                          type="number"
                          step="0.1"
                          value={deadline}
                          onChange={(e) => setDeadline(e.target.value)}
                          className="input-field pl-10 py-2.5 text-base"
                          placeholder="e.g. 45.0"
                        />
                        <Clock className="w-5 h-5 text-secondary-400 absolute left-3 top-3" />
                      </div>
                    </div>

                    <button
                      onClick={calculateProbability}
                      disabled={calculating}
                      className="w-full btn-primary justify-center shadow-md shadow-primary-500/20 py-2.5 text-sm"
                    >
                      {calculating ? 'Processing...' : 'Calculate Probability'}
                    </button>
                  </div>
                </div>

                {probability && (
                  <div className="animate-fade-in-up">
                    <div className="p-5 bg-gradient-to-br from-secondary-900 to-secondary-800 rounded-xl text-center text-white shadow-xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-2 opacity-5">
                        <Activity className="w-24 h-24" />
                      </div>
                      <p className="text-xs text-secondary-300 font-medium mb-1 uppercase tracking-wider relative z-10">Success Probability</p>
                      <p className="text-4xl font-extrabold text-white mb-3 relative z-10">{(probability.probability * 100).toFixed(1)}%</p>
                      <div className="h-1.5 w-full bg-secondary-700 rounded-full overflow-hidden relative z-10">
                        <div className="h-full bg-success text-xs leading-none py-1 text-center text-white transition-all duration-500" style={{ width: `${probability.probability * 100}%` }}></div>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-4 text-xs text-secondary-500">
                      <div className="bg-white border border-secondary-200 p-3 rounded-lg text-center shadow-sm">
                        <span className="block font-medium text-secondary-900 mb-1">Z-Score</span>
                        <span className="font-mono text-primary-600">{probability.zscore.toFixed(2)}</span>
                      </div>
                      <div className="bg-white border border-secondary-200 p-3 rounded-lg text-center shadow-sm">
                        <span className="block font-medium text-secondary-900 mb-1">Std Dev</span>
                        <span className="font-mono text-primary-600">{probability.stdDeviation.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'network' && id && analysis && (
        <NetworkDiagram projectId={id} criticalPath={analysis.criticalPath} analysisData={analysis} />
      )}

      {activeTab === 'monitoring' && id && (
        <MonitoringDashboard projectId={id} projectMethod={projectMethod} isGuest={!isAuthenticated} analysis={analysis} />
      )}

      {activeTab === 'crashing' && id && (
        <div className="card p-6">
          <CrashingAnalysis projectId={id} isGuest={!isAuthenticated} />
        </div>
      )}
    </div>
  )
}
