import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import NetworkDiagram from '../components/NetworkDiagram'
import { ArrowLeft, BarChart2, Share2, Activity, TrendingDown } from 'lucide-react'
import { addGuestActivity, deleteGuestActivity, getGuestActivities, getGuestProject, saveGuestActivities, addGuestProject, GuestProject } from '../utils/guestStorage'

interface CrashingActivity {
  activityId: string
  name: string
  predecessorActivity: string
  normalTime: number
  crashTime: number
  normalCost: number
  crashCost: number
}

// Helper function to convert API error responses to readable strings
const getErrorMessage = (err: any): string => {
  if (typeof err === 'string') return err
  
  // Handle Pydantic validation errors (array of {type, loc, msg, input})
  if (Array.isArray(err)) {
    return err
      .map((e: any) => {
        if (typeof e === 'string') return e
        if (e?.msg) return e.msg
        return JSON.stringify(e)
      })
      .join('; ')
  }
  
  // Handle nested error structures
  if (err?.response?.data) {
    const data = err.response.data
    
    // If it's an array of errors
    if (Array.isArray(data)) {
      return data
        .map((e: any) => (typeof e === 'string' ? e : e?.msg || JSON.stringify(e)))
        .join('; ')
    }
    
    // If it has a detail field (Pydantic error format)
    if (data.detail) {
      if (typeof data.detail === 'string') return data.detail
      if (Array.isArray(data.detail)) {
        return data.detail
          .map((e: any) => (typeof e === 'string' ? e : e?.msg || JSON.stringify(e)))
          .join('; ')
      }
      return JSON.stringify(data.detail)
    }
    
    // If it has a message field
    if (data.message) return data.message
  }
  
  // Handle error message field
  if (err?.message) return err.message
  
  // Fallback
  return 'An unexpected error occurred'
}

export default function ProjectCrashing() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const initializedRef = useRef(false)
  
  const [activities, setActivities] = useState<CrashingActivity[]>([])
  const [projectName, setProjectName] = useState('Crashing Project')
  const [timeUnit, setTimeUnit] = useState('Weeks')
  const [costUnit, setCostUnit] = useState('NRs.')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [analysis, setAnalysis] = useState<any>(null)
  const [showAnalysis, setShowAnalysis] = useState(false)
  const [showBulkImport, setShowBulkImport] = useState(false)
  const [bulkText, setBulkText] = useState('')
  const [activeTab, setActiveTab] = useState('overview')
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string>('')
  const [timeReduction, setTimeReduction] = useState<string>('')
  const [optimizing, setOptimizing] = useState(false)
  const [optimizedResult, setOptimizedResult] = useState<any>(null)
  const [currentTargetDuration, setCurrentTargetDuration] = useState<number | null>(null)

  // Load activities from database when authenticated, or from localStorage when guest
  useEffect(() => {
    if (initializedRef.current) return // Prevent multiple initializations
    initializedRef.current = true

    if (isAuthenticated && id) {
      loadProjectData()
    } else if (!isAuthenticated && id && id.startsWith('guest-')) {
      loadGuestProjectData()
    }
  }, [])

  const loadGuestProjectData = () => {
    try {
      const guestProject = getGuestProject(projectId || '')
      if (guestProject) {
        setProjectName(guestProject.name)
        setTimeUnit(guestProject.timeUnit || 'Weeks')
        const guestActivities = getGuestActivities(projectId || '')
        // Convert guest activities to crashing format
        const crashingActivities: CrashingActivity[] = guestActivities.map((a: any) => ({
          activityId: a.activityId,
          name: a.name,
          predecessorActivity: a.predecessors || '',
          normalTime: a.duration || 0,
          crashTime: a.crashTime || 0,
          normalCost: a.cost || 0,
          crashCost: a.crashCost || 0
        }))
        setActivities(crashingActivities)
      }
    } catch (err: any) {
      console.error('Failed to load guest project:', err)
    }
  }

  // Load activities from database when authenticated
  const loadProjectData = async () => {
    try {
      const response = await api.get(`/projects/${id}/activities`)
      const projectResponse = await api.get(`/projects/${id}`)
      
      // Convert DB activities to crashing format
      const crashingActivities: CrashingActivity[] = response.data.map((a: any) => ({
        activityId: a.activityId,
        name: a.name,
        predecessorActivity: a.predecessors,
        normalTime: a.duration,
        crashTime: a.crashTime,
        normalCost: a.cost,
        crashCost: a.crashCost
      }))
      
      setActivities(crashingActivities)
      setProjectName(projectResponse.data.name)
      setTimeUnit(projectResponse.data.timeUnit || 'Weeks')
      setCostUnit(projectResponse.data.costUnit || 'NRs.')
    } catch (err: any) {
      console.error('Failed to load project:', err)
    }
  }

  const saveActivitiesToDatabase = async () => {
    if (!isAuthenticated) {
      setError('Login required to save project')
      return
    }

    if (activities.length === 0) {
      setError('Add activities before saving')
      return
    }

    setIsSaving(true)
    try {
      let projectId = id
      
      // If no project ID, create a new project
      if (!projectId) {
        const createProjectResponse = await api.post('/projects', {
          name: projectName,
          method: 'Crashing',
          timeUnit: timeUnit
        })
        projectId = createProjectResponse.data.id
        console.log('✓ Created new project:', projectId)
      }

      // Save each activity to database
      for (const activity of activities) {
        const activityInDb = await api.get(`/projects/${projectId}/activities`)
          .then(res => res.data.find((a: any) => a.activityId === activity.activityId))
        
        if (activityInDb) {
          // Update existing
          await api.put(`/projects/${projectId}/activities/${activityInDb.id}`, {
            activityId: activity.activityId,
            name: activity.name,
            predecessors: activity.predecessorActivity,
            duration: activity.normalTime,
            cost: activity.normalCost,
            crashTime: activity.crashTime,
            crashCost: activity.crashCost
          })
        } else {
          // Create new
          await api.post(`/projects/${projectId}/activities`, {
            activityId: activity.activityId,
            name: activity.name,
            predecessors: activity.predecessorActivity,
            duration: activity.normalTime,
            cost: activity.normalCost,
            crashTime: activity.crashTime,
            crashCost: activity.crashCost
          })
        }
      }

      // Update project metadata
      await api.put(`/projects/${projectId}`, {
        name: projectName,
        method: 'Crashing',
        timeUnit: timeUnit
      })

      setSaveMessage('✓ Project saved successfully')
      setTimeout(() => setSaveMessage(''), 3000)
      setError('')
      
      // Navigate to the project
      navigate(`/project/${projectId}`)
    } catch (err: any) {
      setError(getErrorMessage(err))
      console.error('Save error:', err)
    } finally {
      setIsSaving(false)
    }
  }

  const exportCrashing = async (format: 'json' | 'pdf' = 'json') => {
    if (!isAuthenticated) {
      setError('Login required to export project')
      return
    }

    if (!id) {
      setError('Save project first before exporting')
      return
    }

    try {
      // Include target_duration if user has applied an optimized result
      let url = `/projects/${id}/export/crashing?format=${format}`
      if (currentTargetDuration !== null) {
        url += `&target_duration=${currentTargetDuration}`
      }
      
      const response = await api.get(url, {
        responseType: format === 'pdf' ? 'blob' : 'json'
      })

      if (format === 'pdf') {
        // Handle PDF download
        const blob = new Blob([response.data], { type: 'application/pdf' })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `crashing_analysis_${projectName.replace(/\s+/g, '_')}.pdf`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } else {
        // Handle JSON download
        const dataStr = JSON.stringify(response.data, null, 2)
        const dataBlob = new Blob([dataStr], { type: 'application/json' })
        const url = window.URL.createObjectURL(dataBlob)
        const link = document.createElement('a')
        link.href = url
        link.download = `crashing_analysis_${projectName.replace(/\s+/g, '_')}.json`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    } catch (err: any) {
      setError(getErrorMessage(err))
      console.error('Export error:', err)
    }
  }

  // Add new activity (in-memory, no auto-save)
  const addActivity = () => {
    const newActivity = {
      activityId: String.fromCharCode(65 + activities.length), // A, B, C...
      name: '',
      predecessorActivity: '',
      normalTime: 0,
      crashTime: 0,
      normalCost: 0,
      crashCost: 0
    }
    
    setActivities([...activities, newActivity])
    setSaveMessage(`✓ Added: ${newActivity.activityId}`)
    setTimeout(() => setSaveMessage(''), 2000)
  }

  // Update activity field (in-memory, no auto-save)
  const updateActivity = (index: number, field: keyof CrashingActivity, value: any) => {
    const updated = [...activities]
    updated[index] = { ...updated[index], [field]: value }
    setActivities(updated)
  }

  // Delete activity (in-memory, no auto-save)
  const deleteActivity = (index: number) => {
    setActivities(activities.filter((_, i) => i !== index))
  }

  // Parse bulk text import
  // Helper function to format time values while preserving full decimal precision
  const formatTime = (num: number | undefined): string => {
    if (num === undefined || num === null) return '0'
    // Return full decimal precision without rounding
    return num.toString()
  }

  // Helper function to format numbers with thousand separators while preserving decimals
  const formatNumber = (num: number | undefined): string => {
    if (num === undefined || num === null) return '0'
    // Convert to string with full precision
    const numStr = num.toString()
    const parts = numStr.split('.')
    const integerPart = parts[0]
    const decimalPart = parts[1] ? '.' + parts[1] : ''
    
    // Add thousand separators to integer part
    const withCommas = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    return withCommas + decimalPart
  }

  // Helper function to parse numbers with potential comma separators (1,000 → 1000)
  const parseNumber = (str: string): number => {
    if (!str || typeof str !== 'string') return 0
    // Remove commas and whitespace, then parse
    const cleaned = str.trim().replace(/,/g, '')
    const num = parseFloat(cleaned)
    return isNaN(num) ? 0 : num
  }

  const parseBulkText = (text: string) => {
    try {
      const lines = text.split('\n').filter(line => line.trim())
      const imported: CrashingActivity[] = []

      // Skip header lines
      const headerIndicators = ['activity', 'predecessor', 'normal', 'crash', 'time', 'cost']
      const dataLines = lines.filter(line => {
        const lower = line.toLowerCase()
        return !headerIndicators.some(indicator => lower.includes(indicator))
      })

      for (const line of dataLines) {
        const parts = line.split(/\s+/).filter(p => p.trim())
        if (parts.length < 6) continue

        const actId = parts[0]
        const pred = parts[1] === '-' || parts[1] === '—' ? '' : parts[1]
        const nTime = parseNumber(parts[2])
        const cTime = parseNumber(parts[3])
        const nCost = parseNumber(parts[4])
        const cCost = parseNumber(parts[5])

        imported.push({
          activityId: actId,
          name: actId,
          predecessorActivity: pred,
          normalTime: nTime,
          crashTime: cTime,
          normalCost: nCost,
          crashCost: cCost
        })
      }

      if (imported.length > 0) {
        setActivities(imported)
        setShowBulkImport(false)
        setError('')
      } else {
        setError('No valid data found. Expected format: Activity Predecessor NormalTime CrashTime NormalCost CrashCost')
      }
    } catch (err) {
      setError('Failed to parse bulk import data')
    }
  }

  // Handle bulk import
  const handleBulkImport = () => {
    if (!bulkText.trim()) {
      setError('Please paste data to import')
      return
    }
    parseBulkText(bulkText)
  }

  // Perform analysis
  const performAnalysis = async () => {
    if (activities.length === 0) {
      setError('Add activities first')
      return
    }

    setLoading(true)
    try {
      let response
      
      if (isAuthenticated && id) {
        // Use authenticated endpoint for saved projects
        response = await api.post(`/projects/${id}/crashing-analysis`)
      } else {
        // Use guest endpoint for ad-hoc analysis
        const analysisData = activities.map(a => ({
          activityId: a.activityId,
          name: a.name,
          predecessors: a.predecessorActivity,
          duration: a.normalTime,
          crashTime: a.crashTime,
          cost: a.normalCost,
          crashCost: a.crashCost
        }))

        response = await api.post(`/projects/analyze-adhoc/crashing-full`, {
          method: 'CPM',
          timeUnit,
          activities: analysisData
        })
      }

      // Ensure activities are arrays
      const data = response.data
      if (data.initialAnalysis && !Array.isArray(data.initialAnalysis.activities)) {
        data.initialAnalysis.activities = data.initialAnalysis.activities ? Object.values(data.initialAnalysis.activities) : []
      }
      if (data.finalAnalysis && !Array.isArray(data.finalAnalysis.activities)) {
        data.finalAnalysis.activities = data.finalAnalysis.activities ? Object.values(data.finalAnalysis.activities) : []
      }

      setAnalysis(data)
      setShowAnalysis(true)
      setError('')
      setOptimizedResult(null) // Reset optimized result when new analysis runs
      setCurrentTargetDuration(null) // Reset target duration
    } catch (err: any) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  // Optimize crashing with specific time reduction target
  const optimizeCrashing = async () => {
    if (!analysis || !timeReduction || parseFloat(timeReduction) <= 0) {
      setError('Please enter a valid time reduction value')
      return
    }

    const initialDuration = analysis.initialAnalysis?.projectDuration || analysis.projectDuration
    const targetDuration = initialDuration - parseFloat(timeReduction)

    if (targetDuration <= 0) {
      setError('Time reduction cannot exceed initial project duration')
      return
    }

    setOptimizing(true)
    setError('')
    try {
      let response
      
      if (isAuthenticated && id) {
        response = await api.post(`/projects/${id}/crashing-analysis?target_duration=${targetDuration}`)
      } else {
        const analysisData = activities.map(a => ({
          activityId: a.activityId,
          name: a.name,
          predecessors: a.predecessorActivity,
          duration: a.normalTime,
          crashTime: a.crashTime,
          cost: a.normalCost,
          crashCost: a.crashCost
        }))

        response = await api.post(`/projects/analyze-adhoc/crashing-full?target_duration=${targetDuration}`, {
          method: 'CPM',
          timeUnit,
          activities: analysisData
        })
      }

      const data = response.data
      if (data.initialAnalysis && !Array.isArray(data.initialAnalysis.activities)) {
        data.initialAnalysis.activities = data.initialAnalysis.activities ? Object.values(data.initialAnalysis.activities) : []
      }
      if (data.finalAnalysis && !Array.isArray(data.finalAnalysis.activities)) {
        data.finalAnalysis.activities = data.finalAnalysis.activities ? Object.values(data.finalAnalysis.activities) : []
      }

      setOptimizedResult(data)
      setError('')
      // Store the target duration used for this optimization
      setCurrentTargetDuration(targetDuration)
    } catch (err: any) {
      setError(getErrorMessage(err))
    } finally {
      setOptimizing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Project Crashing</h1>
          <p className="text-gray-600 mt-2">Time-Cost Tradeoff Analysis</p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {typeof error === 'string' ? error : String(error)}
          </div>
        )}

        {/* Save message */}
        {saveMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 animate-pulse">
            {saveMessage}
          </div>
        )}

        {!showAnalysis ? (
          <>
            {/* Project Settings */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Project Settings</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Project name"
                  value={projectName}
                  onChange={e => setProjectName(e.target.value)}
                  className="border rounded px-3 py-2"
                />
                <select
                  value={timeUnit}
                  onChange={e => setTimeUnit(e.target.value)}
                  className="border rounded px-3 py-2"
                >
                  <option value="Days">Days</option>
                  <option value="Weeks">Weeks</option>
                  <option value="Months">Months</option>
                </select>
                <select
                  value={costUnit}
                  onChange={e => setCostUnit(e.target.value)}
                  className="border rounded px-3 py-2"
                >
                  <option value="NRs.">NRs. (Nepali Rupee)</option>
                  <option value="$">$ (Dollar)</option>
                  <option value="€">€ (Euro)</option>
                </select>
              </div>
            </div>

            {/* Import Section */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Import Data</h2>
              <div className="flex gap-4 items-center">
                <button
                  onClick={() => setShowBulkImport(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition-colors"
                >
                  <span>📥 Bulk Import</span>
                </button>
                <p className="text-sm text-gray-600">
                  Paste activity data in format: Activity Predecessor NormalTime CrashTime NormalCost CrashCost
                </p>
              </div>
            </div>

            {/* Activities Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Activity</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Predecessor</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Normal Time ({timeUnit})</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Crash Time ({timeUnit})</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Normal Cost ({costUnit})</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Crash Cost ({costUnit})</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {activities.map((activity, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={activity.activityId}
                            onChange={e => updateActivity(idx, 'activityId', e.target.value)}
                            className="border rounded px-2 py-1 w-16 text-center font-semibold"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={activity.name}
                            onChange={e => updateActivity(idx, 'name', e.target.value)}
                            placeholder="Activity name"
                            className="border rounded px-2 py-1 w-full"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={activity.predecessorActivity}
                            onChange={e => updateActivity(idx, 'predecessorActivity', e.target.value)}
                            placeholder="-"
                            className="border rounded px-2 py-1 w-20"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            value={activity.normalTime}
                            onChange={e => updateActivity(idx, 'normalTime', parseFloat(e.target.value))}
                            className="border rounded px-2 py-1 w-20"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            value={activity.crashTime}
                            onChange={e => updateActivity(idx, 'crashTime', parseFloat(e.target.value))}
                            className="border rounded px-2 py-1 w-20"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            value={activity.normalCost}
                            onChange={e => updateActivity(idx, 'normalCost', parseFloat(e.target.value))}
                            className="border rounded px-2 py-1 w-24"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            value={activity.crashCost}
                            onChange={e => updateActivity(idx, 'crashCost', parseFloat(e.target.value))}
                            className="border rounded px-2 py-1 w-24"
                          />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => deleteActivity(idx)}
                            className="text-red-600 hover:text-red-800 font-semibold"
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Add Activity Button */}
              <div className="p-4 bg-gray-50 border-t">
                <button
                  onClick={addActivity}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  + Add Activity
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              {isAuthenticated && (
                <button
                  onClick={saveActivitiesToDatabase}
                  disabled={isSaving || activities.length === 0}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                  title={activities.length === 0 ? 'Add activities first' : 'Save to project'}
                >
                  {isSaving ? 'Saving...' : '💾 Save Project'}
                </button>
              )}
              <button
                onClick={performAnalysis}
                disabled={activities.length === 0 || loading}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
              >
                {loading ? 'Analyzing...' : 'Analyze Crashing'}
              </button>
              <button
                onClick={() => navigate(-1)}
                className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Analysis Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingDown className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Crashing Analysis Results</h2>
                  <p className="text-gray-600">Optimal project acceleration scheme</p>
                </div>
              </div>
              <div className="flex gap-2">
                {isAuthenticated && (
                  <>
                    <button
                      onClick={saveActivitiesToDatabase}
                      disabled={isSaving}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                      title="Save to project database"
                    >
                      {isSaving ? 'Saving...' : '💾 Save Project'}
                    </button>
                    <button
                      onClick={() => exportCrashing('json')}
                      disabled={!id}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                      title={!id ? 'Save project first' : 'Export as JSON'}
                    >
                      📄 Export JSON
                    </button>
                    <button
                      onClick={() => exportCrashing('pdf')}
                      disabled={!id}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400"
                      title={!id ? 'Save project first' : 'Export as PDF'}
                    >
                      📕 Export PDF
                    </button>
                  </>
                )}
                <button
                  onClick={() => setShowAnalysis(false)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Edit
                </button>
              </div>
            </div>

            {/* Summary Cards */}
            {analysis && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-5 h-5 text-blue-600" />
                    <p className="text-sm font-medium text-gray-700">Initial Duration</p>
                  </div>
                  <p className="text-3xl font-bold text-blue-900">
                    {analysis.initialAnalysis?.projectDuration || analysis.projectDuration} <span className="text-lg">{timeUnit}</span>
                  </p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingDown className="w-5 h-5 text-green-600" />
                    <p className="text-sm font-medium text-gray-700">Final Duration</p>
                  </div>
                  <p className="text-3xl font-bold text-green-900">
                    {analysis.finalDuration || analysis.projectDuration} <span className="text-lg">{timeUnit}</span>
                  </p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart2 className="w-5 h-5 text-purple-600" />
                    <p className="text-sm font-medium text-gray-700">Time Saved</p>
                  </div>
                  <p className="text-3xl font-bold text-purple-900">
                    {formatTime(analysis.totalTimeSaved || 0)} <span className="text-lg">{timeUnit}</span>
                  </p>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Share2 className="w-5 h-5 text-orange-600" />
                    <p className="text-sm font-medium text-gray-700">Cost Increase</p>
                  </div>
                  <p className="text-3xl font-bold text-orange-900">
                    {costUnit}{formatNumber(analysis.totalCostIncrease)}
                  </p>
                </div>
              </div>
            )}

            {/* Crashing Optimizer Tool */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div className="lg:col-span-2">
                {/* Placeholder for maintaining layout */}
              </div>
              
              {/* Optimizer Sidebar */}
              <div className="lg:col-span-1">
                <div className="card p-6 sticky top-8 border-primary-100 shadow-lg shadow-primary-500/5">
                  <div className="flex items-center gap-2 mb-4 text-primary-700">
                    <TrendingDown className="w-5 h-5" />
                    <h2 className="text-lg font-bold">Optimization Tools</h2>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-primary-50/50 p-4 rounded-xl border border-primary-100">
                      <h3 className="font-semibold text-secondary-900 text-sm mb-3">Crashing Optimizer</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-secondary-600 mb-1.5 uppercase tracking-wide">
                            Time to Reduce ({timeUnit})
                          </label>
                          <div className="relative rounded-md shadow-sm">
                            <input
                              type="number"
                              step="0.1"
                              value={timeReduction}
                              onChange={(e) => setTimeReduction(e.target.value)}
                              className="input-field pl-10 py-2.5 text-base"
                              placeholder="e.g. 5.0"
                            />
                            <TrendingDown className="w-5 h-5 text-secondary-400 absolute left-3 top-3" />
                          </div>
                          <p className="text-xs text-secondary-500 mt-1.5">
                            How much time do you want to save from the project?
                          </p>
                        </div>

                        <button
                          onClick={optimizeCrashing}
                          disabled={optimizing || !timeReduction}
                          className="w-full btn-primary justify-center shadow-md shadow-primary-500/20 py-2.5 text-sm"
                        >
                          {optimizing ? 'Optimizing...' : 'Optimize Crashing'}
                        </button>
                      </div>
                    </div>

                    {optimizedResult && (
                      <div className="animate-fade-in-up">
                        <div className="p-5 bg-gradient-to-br from-secondary-900 to-secondary-800 rounded-xl text-center text-white shadow-xl relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-2 opacity-5">
                            <Activity className="w-24 h-24" />
                          </div>
                          <p className="text-xs text-secondary-300 font-medium mb-1 uppercase tracking-wider relative z-10">Optimized Duration</p>
                          <p className="text-4xl font-extrabold text-white mb-3 relative z-10">
                            {optimizedResult.finalDuration || optimizedResult.projectDuration} {timeUnit}
                          </p>
                          <div className="h-1.5 w-full bg-secondary-700 rounded-full overflow-hidden relative z-10">
                            <div 
                              className="h-full bg-success text-xs leading-none py-1 text-center text-white transition-all duration-500" 
                              style={{ width: `${((optimizedResult.totalTimeSaved || 0) / (analysis.initialAnalysis?.projectDuration || 100)) * 100}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-4 text-xs text-secondary-500">
                          <div className="bg-white border border-secondary-200 p-3 rounded-lg text-center shadow-sm">
                            <span className="block font-medium text-secondary-900 mb-1">Time Saved</span>
                            <span className="font-mono text-primary-600">{formatTime(optimizedResult.totalTimeSaved || 0)} {timeUnit}</span>
                          </div>
                          <div className="bg-white border border-secondary-200 p-3 rounded-lg text-center shadow-sm">
                            <span className="block font-medium text-secondary-900 mb-1">Extra Cost</span>
                            <span className="font-mono text-primary-600">{costUnit}{formatNumber(optimizedResult.totalCostIncrease || 0)}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setAnalysis(optimizedResult)
                            setOptimizedResult(null)
                            setTimeReduction('')
                            // Keep currentTargetDuration so PDF export uses optimized result
                          }}
                          className="w-full mt-4 btn-secondary justify-center py-2.5 text-sm"
                        >
                          Apply Optimized Result
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs Navigation */}
            <div className="bg-white rounded-lg shadow mb-6">
              <div className="border-b">
                <div className="flex">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`px-6 py-3 font-medium border-b-2 transition-colors ${
                      activeTab === 'overview'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    📊 Overview
                  </button>
                  <button
                    onClick={() => setActiveTab('network')}
                    className={`px-6 py-3 font-medium border-b-2 transition-colors ${
                      activeTab === 'network'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    🔗 Network Diagram
                  </button>
                  <button
                    onClick={() => setActiveTab('scheme')}
                    className={`px-6 py-3 font-medium border-b-2 transition-colors ${
                      activeTab === 'scheme'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    ⚡ Crashing Scheme
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'overview' && analysis && (
                  <div className="space-y-6">
                    {/* Critical Path */}
                    {analysis.initialAnalysis?.criticalPath && (
                      <div>
                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                          <Activity className="w-5 h-5 text-red-600" />
                          Initial Critical Path
                        </h3>
                        <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded">
                          <p className="text-lg font-mono font-bold text-red-900">
                            {analysis.initialAnalysis.criticalPath.join(' → ')}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Activities Schedule */}
                    {analysis.initialAnalysis?.activities && Array.isArray(analysis.initialAnalysis.activities) && (
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Activity Schedule</h3>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm border">
                            <thead className="bg-gray-100">
                              <tr>
                                <th className="px-4 py-2 text-left">Activity</th>
                                <th className="px-4 py-2 text-center">Duration</th>
                                <th className="px-4 py-2 text-center">ES</th>
                                <th className="px-4 py-2 text-center">EF</th>
                                <th className="px-4 py-2 text-center">LS</th>
                                <th className="px-4 py-2 text-center">LF</th>
                                <th className="px-4 py-2 text-center">Slack</th>
                                <th className="px-4 py-2 text-center">Critical</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y">
                              {analysis.initialAnalysis.activities.map((act: any, idx: number) => (
                                <tr key={idx} className={act.isCritical ? 'bg-red-50' : 'hover:bg-gray-50'}>
                                  <td className="px-4 py-2 font-semibold">{act.activityId}</td>
                                  <td className="px-4 py-2 text-center">{formatTime(act.duration)}</td>
                                  <td className="px-4 py-2 text-center">{formatTime(act.ES)}</td>
                                  <td className="px-4 py-2 text-center">{formatTime(act.EF)}</td>
                                  <td className="px-4 py-2 text-center">{formatTime(act.LS)}</td>
                                  <td className="px-4 py-2 text-center">{formatTime(act.LF)}</td>
                                  <td className="px-4 py-2 text-center">{formatTime(act.slack)}</td>
                                  <td className="px-4 py-2 text-center">
                                    {act.isCritical ? <span className="text-red-600 font-bold">✓</span> : '-'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                    {!analysis.initialAnalysis?.activities && (
                      <p className="text-gray-600">No activity schedule available</p>
                    )}
                  </div>
                )}

                {activeTab === 'network' && analysis && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Project Network Diagram</h3>
                    {analysis.initialAnalysis?.activities && analysis.initialAnalysis?.criticalPath ? (
                      <NetworkDiagram
                        projectId="guest-crashing"
                        criticalPath={analysis.initialAnalysis.criticalPath}
                        analysisData={analysis.initialAnalysis}
                      />
                    ) : (
                      <p className="text-gray-600">Network diagram data not available</p>
                    )}
                  </div>
                )}

                {activeTab === 'scheme' && analysis && (
                  <div className="space-y-6">
                    {/* Crashing Summary */}
                    {analysis.totalTimeSaved !== undefined && (
                      <div className="bg-gradient-to-r from-green-50 to-blue-50 border-l-4 border-green-600 p-6 rounded-lg">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Crashing Result</h3>
                        <p className="text-lg text-gray-700">
                          <span className="font-bold text-green-600">Total project time reduced by {formatTime(analysis.totalTimeSaved)} {timeUnit}</span>
                          {analysis.totalCostIncrease !== undefined && (
                            <span> at a cost increase of <span className="font-bold text-orange-600">{costUnit}{formatNumber(analysis.totalCostIncrease)}</span></span>
                          )}
                        </p>
                      </div>
                    )}

                    {/* Crashing Steps */}
                    {analysis.crashingSteps && Array.isArray(analysis.crashingSteps) && analysis.crashingSteps.length > 0 ? (
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Step-by-Step Crashing Scheme</h3>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm border">
                            <thead className="bg-gray-100">
                              <tr>
                                <th className="px-4 py-2 text-center">Step</th>
                                <th className="px-4 py-2 text-left">Activity Crashed</th>
                                <th className="px-4 py-2 text-center">Amount Crashed</th>
                                <th className="px-4 py-2 text-right">Crash Slope ({costUnit}/{timeUnit})</th>
                                <th className="px-4 py-2 text-right">Cost Increase ({costUnit})</th>
                                <th className="px-4 py-2 text-center">New Duration ({timeUnit})</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y">
                              {analysis.crashingSteps.map((step: any, idx: number) => (
                                <tr key={idx} className="hover:bg-gray-50">
                                  <td className="px-4 py-2 text-center font-semibold">{step.step}</td>
                                  <td className="px-4 py-2 font-bold text-blue-600">{step.activityCrashed}</td>
                                  <td className="px-4 py-2 text-center">{formatTime(step.amountCrashed)}</td>
                                  <td className="px-4 py-2 text-right">{step.crashSlope?.toFixed(2)}</td>
                                  <td className="px-4 py-2 text-right font-semibold text-orange-600">
                                    {formatNumber(step.costIncrease)}
                                  </td>
                                  <td className="px-4 py-2 text-center font-semibold">{formatTime(step.newDuration)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <p className="text-sm text-gray-600 mt-3">
                          ℹ️ Activities are crashed iteratively, always choosing the activity with the lowest crash slope (most cost-effective).
                        </p>
                      </div>
                    ) : (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-gray-700">
                          No crashing opportunities found. All critical activities may already be at their crash time limits.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Bulk Import Modal */}
      {showBulkImport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center border-b p-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Bulk Import Activities</h2>
                <p className="text-sm text-gray-600 mt-1">Paste your crashing data below</p>
              </div>
              <button
                onClick={() => setShowBulkImport(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <div className="mb-4">
                <h3 className="font-semibold mb-2">Expected Format:</h3>
                <div className="bg-gray-50 p-4 rounded border text-sm font-mono">
                  <div className="text-gray-600 mb-2">Activity Predecessor NormalTime CrashTime NormalCost CrashCost</div>
                  <div>A - 4 3 8000 9000</div>
                  <div>B A 5 3 16000 20000</div>
                  <div>C A 4 3 12000 13000</div>
                  <div>D B 6 5 34000 35000</div>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  • Use "-" for activities with no predecessor<br/>
                  • Separate columns with spaces or tabs<br/>
                  • Each activity on a new line
                </p>
              </div>

              <textarea
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder="Paste your data here..."
                className="w-full h-64 border rounded p-3 font-mono text-sm"
              />

              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                  {error}
                </div>
              )}
            </div>

            <div className="border-t p-6 flex justify-end gap-3">
              <button
                onClick={() => setShowBulkImport(false)}
                className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkImport}
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Import Activities
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
