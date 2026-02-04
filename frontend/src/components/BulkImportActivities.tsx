import { useState } from 'react'
import api from '../services/api'

interface ParsedActivity {
  activityId: string
  name: string
  optimistic?: string
  mostLikely?: string
  pessimistic?: string
  duration?: string
  predecessors: string
  a?: number
  m?: number
  b?: number
  t?: number
}

interface BulkImportProps {
  projectId: string
  projectMethod: 'CPM' | 'PERT'
  onImportComplete: () => void
  onCancel: () => void
}

export default function BulkImportActivities({
  projectId,
  projectMethod,
  onImportComplete,
  onCancel
}: BulkImportProps) {
  const [step, setStep] = useState<'input' | 'preview' | 'importing'>('input')
  const [rawText, setRawText] = useState('')
  const [parsedActivities, setParsedActivities] = useState<ParsedActivity[]>([])
  const [error, setError] = useState('')
  const [importProgress, setImportProgress] = useState(0)

  const parseActivityData = (text: string): ParsedActivity[] => {
    const activities: ParsedActivity[] = []
    const lines = text.split('\n').filter(line => line.trim())

    // Skip header rows (rows with "ACTIVITY", "a", "m", "b", etc.)
    const headerIndicators = ['activity', 'predecessor', 'duration', 'immediate']
    const dataLines = lines.filter(line => {
      const lower = line.toLowerCase()
      return !headerIndicators.some(indicator => lower.includes(indicator))
    })

    for (const line of dataLines) {
      const parts = line.split(/\s+/).filter(p => p.trim())

      if (parts.length < 2) continue

      const activity: ParsedActivity = {
        activityId: parts[0],
        name: parts[0],
        predecessors: ''
      }

      if (projectMethod === 'PERT') {
        // Format: ACTIVITY a m b PREDECESSORS
        // Example: A 1 2 3 —
        if (parts.length >= 4) {
          activity.optimistic = parts[1]
          activity.mostLikely = parts[2]
          activity.pessimistic = parts[3]

          // Predecessors are the rest (could be "—", "-", or activity IDs)
          if (parts.length > 4) {
            const predParts = parts.slice(4)
            activity.predecessors = predParts
              .filter(p => p !== '—' && p !== '-')
              .join(',')
          }
        }
      } else {
        // Format: ACTIVITY duration PREDECESSORS
        // Example: A 5 —
        if (parts.length >= 2) {
          activity.duration = parts[1]

          if (parts.length > 2) {
            const predParts = parts.slice(2)
            activity.predecessors = predParts
              .filter(p => p !== '—' && p !== '-')
              .join(',')
          }
        }
      }

      activities.push(activity)
    }

    return activities
  }

  const handleParse = () => {
    try {
      setError('')
      const parsed = parseActivityData(rawText)

      if (parsed.length === 0) {
        setError('No activities could be parsed from the input. Please check the format.')
        return
      }

      setParsedActivities(parsed)
      setStep('preview')
    } catch (err: any) {
      setError(`Parsing error: ${err.message}`)
    }
  }

  const handleActivityChange = (index: number, field: string, value: string) => {
    const updated = [...parsedActivities]
    updated[index] = { ...updated[index], [field]: value }
    setParsedActivities(updated)
  }

  const handleImport = async () => {
    try {
      setStep('importing')
      setError('')

      for (let i = 0; i < parsedActivities.length; i++) {
        const activity = parsedActivities[i]

        const data: any = {
          activityId: activity.activityId,
          name: activity.name || activity.activityId,
          predecessors: activity.predecessors || null
        }

        if (projectMethod === 'PERT') {
          data.optimistic = activity.optimistic ? parseFloat(activity.optimistic) : null
          data.mostLikely = activity.mostLikely ? parseFloat(activity.mostLikely) : null
          data.pessimistic = activity.pessimistic ? parseFloat(activity.pessimistic) : null
        } else {
          data.duration = activity.duration ? parseFloat(activity.duration) : null
        }

        await api.post(`/projects/${projectId}/activities`, data)
        setImportProgress(((i + 1) / parsedActivities.length) * 100)
      }

      onImportComplete()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Import failed')
      setStep('preview')
    }
  }

  if (step === 'input') {
    return (
      <div className="fixed inset-0 bg-secondary-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-secondary-200">
          <div className="flex justify-between items-center border-b border-secondary-200 p-6 bg-secondary-50/50 rounded-t-xl">
            <div>
              <h2 className="text-2xl font-bold text-secondary-900">Bulk Import Activities</h2>
              <p className="text-sm text-secondary-500 mt-1">Paste your data to quickly add multiple tasks</p>
            </div>
            <button
              onClick={onCancel}
              className="text-secondary-400 hover:text-secondary-700 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-auto p-6">
            <div className="mb-6 p-4 bg-primary-50 border border-primary-200 rounded-lg">
              <p className="text-sm text-primary-800 leading-relaxed">
                <strong>Instructions:</strong> Paste your activity data below. The system supports:
                <br /> • Table format with rows like: <code className="bg-white px-1.5 py-0.5 rounded border border-primary-200 text-primary-700 mx-1">A  1  2  3  —</code> (Activity ID, a, m, b, predecessors)
                <br /> • Or: <code className="bg-white px-1.5 py-0.5 rounded border border-primary-200 text-primary-700 mx-1">A  5  —</code> (for CPM: Activity ID, duration, predecessors)
                <br /> • Use commas to separate multiple predecessors: <code className="bg-white px-1.5 py-0.5 rounded border border-primary-200 text-primary-700 mx-1">A,B</code>
                <br /> • Use — or - for no predecessors
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-danger-50 border-l-4 border-danger-500 text-danger-700 rounded-r shadow-sm">
                <p className="font-medium">Error Parsing Data</p>
                <p className="text-sm">{error}</p>
              </div>
            )}

            <div className="mb-4 h-full flex flex-col">
              <label className="block text-sm font-semibold text-secondary-700 mb-2">
                Paste Activity Data <span className="text-secondary-400 font-normal">({projectMethod} format)</span>
              </label>
              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder={projectMethod === 'PERT'
                  ? "ACTIVITY a m b IMMEDIATE PREDECESSORS\nA 1 2 3 —\nB 2 3 4 —\nC 4 5 6 A"
                  : "ACTIVITY DURATION PREDECESSORS\nA 5 —\nB 6 —\nC 7 A"}
                className="flex-1 w-full min-h-[300px] px-4 py-3 border border-secondary-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-y bg-secondary-50 focus:bg-white transition-colors"
                autoFocus
              />
            </div>
          </div>

          <div className="border-t border-secondary-200 p-6 flex gap-3 justify-end bg-secondary-50/50 rounded-b-xl">
            <button
              onClick={onCancel}
              className="px-5 py-2.5 bg-white border border-secondary-300 text-secondary-700 rounded-lg hover:bg-secondary-50 font-medium transition-colors shadow-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleParse}
              disabled={!rawText.trim()}
              className="btn-primary"
            >
              Parse & Preview →
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (step === 'preview') {
    return (
      <div className="fixed inset-0 bg-secondary-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col border border-secondary-200">
          <div className="flex justify-between items-center border-b border-secondary-200 p-6 bg-secondary-50/50 rounded-t-xl">
            <div>
              <h2 className="text-2xl font-bold text-secondary-900">Verify Parsed Data</h2>
              <p className="text-secondary-500 text-sm mt-1">Review and edit your data before importing</p>
            </div>
            <button
              onClick={() => setStep('input')}
              className="text-secondary-400 hover:text-secondary-700 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-auto p-6 bg-secondary-50/30">
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            <div className="overflow-hidden border border-secondary-200 rounded-xl shadow-sm bg-white">
              <table className="w-full text-sm text-left">
                <thead className="bg-secondary-50 border-b border-secondary-200 text-secondary-500 font-medium">
                  <tr>
                    <th className="px-6 py-3 font-semibold">ID</th>
                    <th className="px-6 py-3 font-semibold">Name</th>
                    {projectMethod === 'PERT' && (
                      <>
                        <th className="px-4 py-3 text-center font-semibold">a</th>
                        <th className="px-4 py-3 text-center font-semibold">m</th>
                        <th className="px-4 py-3 text-center font-semibold">b</th>
                      </>
                    )}
                    {projectMethod === 'CPM' && (
                      <th className="px-6 py-3 text-center font-semibold">Duration</th>
                    )}
                    <th className="px-6 py-3 font-semibold">Predecessors</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary-100">
                  {parsedActivities.map((activity, idx) => (
                    <tr key={idx} className="hover:bg-primary-50/20 transition-colors">
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          value={activity.activityId}
                          onChange={(e) => handleActivityChange(idx, 'activityId', e.target.value)}
                          className="w-full px-2 py-1.5 bg-transparent border border-transparent hover:border-secondary-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 rounded text-sm font-medium text-secondary-900 transition-all"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          value={activity.name}
                          onChange={(e) => handleActivityChange(idx, 'name', e.target.value)}
                          className="w-full px-2 py-1.5 bg-transparent border border-transparent hover:border-secondary-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 rounded text-sm transition-all"
                        />
                      </td>
                      {projectMethod === 'PERT' && (
                        <>
                          <td className="px-2 py-2">
                            <input
                              type="number"
                              step="0.1"
                              value={activity.optimistic || ''}
                              onChange={(e) => handleActivityChange(idx, 'optimistic', e.target.value)}
                              className="w-full px-2 py-1.5 bg-transparent border border-transparent hover:border-secondary-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 rounded text-sm text-center font-mono transition-all"
                            />
                          </td>
                          <td className="px-2 py-2">
                            <input
                              type="number"
                              step="0.1"
                              value={activity.mostLikely || ''}
                              onChange={(e) => handleActivityChange(idx, 'mostLikely', e.target.value)}
                              className="w-full px-2 py-1.5 bg-transparent border border-transparent hover:border-secondary-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 rounded text-sm text-center font-mono transition-all"
                            />
                          </td>
                          <td className="px-2 py-2">
                            <input
                              type="number"
                              step="0.1"
                              value={activity.pessimistic || ''}
                              onChange={(e) => handleActivityChange(idx, 'pessimistic', e.target.value)}
                              className="w-full px-2 py-1.5 bg-transparent border border-transparent hover:border-secondary-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 rounded text-sm text-center font-mono transition-all"
                            />
                          </td>
                        </>
                      )}
                      {projectMethod === 'CPM' && (
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            step="0.1"
                            value={activity.duration || ''}
                            onChange={(e) => handleActivityChange(idx, 'duration', e.target.value)}
                            className="w-full px-2 py-1.5 bg-transparent border border-transparent hover:border-secondary-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 rounded text-sm text-center font-mono transition-all"
                          />
                        </td>
                      )}
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          value={activity.predecessors}
                          onChange={(e) => handleActivityChange(idx, 'predecessors', e.target.value)}
                          className="w-full px-2 py-1.5 bg-transparent border border-transparent hover:border-secondary-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 rounded text-sm transition-all"
                          placeholder="e.g., A,B"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="border-t border-secondary-200 p-6 flex gap-3 justify-between bg-secondary-50/50 rounded-b-xl">
            <button
              onClick={() => setStep('input')}
              className="px-5 py-2.5 bg-white border border-secondary-300 text-secondary-700 rounded-lg hover:bg-secondary-50 font-medium transition-colors shadow-sm flex items-center"
            >
              ← Back to Input
            </button>
            <button
              onClick={handleImport}
              className="btn-primary shadow-lg shadow-primary-500/30"
            >
              ✅ Import {parsedActivities.length} Activities
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-secondary-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm flex flex-col items-center justify-center p-8 border border-secondary-200 animate-fade-in-up">
        <div className="mb-6 relative w-20 h-20">
          <svg className="w-full h-full text-secondary-200" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" />
          </svg>
          <svg className="absolute top-0 left-0 w-full h-full text-primary-500 rotate-[-90deg]" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" strokeDasharray="283" strokeDashoffset={283 - (283 * importProgress / 100)} className="transition-all duration-300 ease-out" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl font-bold text-secondary-900">{Math.round(importProgress)}%</span>
          </div>
        </div>

        <h3 className="text-xl font-bold text-secondary-900 mb-2">Importing Activities...</h3>
        <p className="text-secondary-500 text-center text-sm">
          Processing {parsedActivities.length} items. Please wait.
        </p>
      </div>
    </div>
  )
}
