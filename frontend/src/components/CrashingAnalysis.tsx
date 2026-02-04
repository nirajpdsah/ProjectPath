import { useState, useEffect } from 'react'
import api from '../services/api'

interface CrashingProps {
  projectId: string
}

export default function CrashingAnalysis({ projectId }: CrashingProps) {
  const [crashing, setCrashing] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedActivities, setSelectedActivities] = useState<string[]>([])

  useEffect(() => {
    fetchCrashingData()
  }, [projectId])

  const fetchCrashingData = async () => {
    try {
      const response = await api.get(`/projects/${projectId}/crashing`)
      setCrashing(response.data)
    } catch (err) {
      setError('Failed to load crashing analysis')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleActivitySelect = (activityId: string) => {
    setSelectedActivities(prev =>
      prev.includes(activityId)
        ? prev.filter(id => id !== activityId)
        : [...prev, activityId]
    )
  }

  const calculateCrashingCost = () => {
    if (!crashing?.crashingOptions) return 0

    return crashing.crashingOptions
      .filter((opt: any) => selectedActivities.includes(opt.activityId))
      .reduce((sum: number, opt: any) => sum + (opt.crashSlope * opt.maxCrashable), 0)
  }

  const calculateNewDuration = () => {
    if (!crashing?.crashingOptions) return crashing?.projectDuration || 0

    let reduction = 0
    crashing.crashingOptions
      .filter((opt: any) => selectedActivities.includes(opt.activityId))
      .forEach((opt: any) => {
        reduction += opt.maxCrashable
      })

    return Math.max(0, (crashing?.projectDuration || 0) - reduction)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error) {
    return <div className="text-danger-600 p-4 bg-red-50 rounded-lg">{error}</div>
  }

  const crashingOptions = crashing?.crashingOptions || []
  const additionalCost = calculateCrashingCost()
  const newDuration = calculateNewDuration()
  const costPerDayReduced = crashingOptions.length > 0
    ? (additionalCost / ((crashing?.projectDuration || 0) - newDuration))
    : 0

  return (
    <div className="space-y-6">
      {/* Overview */}
      <div className="bg-white rounded-xl shadow-card border border-secondary-100 p-6">
        <h2 className="text-xl font-bold text-secondary-900 mb-2">Project Duration Optimization</h2>
        <p className="text-secondary-500 mb-6 text-sm">
          Analyze cost-time tradeoffs by selecting critical activities to crash (shorten).
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-secondary-50 p-5 rounded-xl border border-secondary-200">
            <p className="text-xs font-semibold text-secondary-500 uppercase tracking-wider">Current Duration</p>
            <p className="text-3xl font-bold text-secondary-900 mt-2">{crashing?.projectDuration?.toFixed(2)}</p>
          </div>

          <div className="bg-warning-50 p-5 rounded-xl border border-warning-200">
            <p className="text-xs font-semibold text-warning-600 uppercase tracking-wider">Additional Cost</p>
            <p className="text-3xl font-bold text-warning-700 mt-2">${additionalCost?.toFixed(2)}</p>
          </div>

          <div className="bg-success-50 p-5 rounded-xl border border-success-200">
            <p className="text-xs font-semibold text-success-600 uppercase tracking-wider">New Duration</p>
            <p className="text-3xl font-bold text-success-700 mt-2">{newDuration?.toFixed(2)}</p>
          </div>
        </div>

        {((crashing?.projectDuration || 0) - newDuration) > 0 && (
          <div className="bg-primary-50 p-4 rounded-lg flex justify-between items-center border border-primary-100">
            <div>
              <p className="text-sm text-primary-800 font-medium">Efficiency Metric</p>
              <p className="text-xs text-primary-600">Cost per day reduced</p>
            </div>
            <p className="text-2xl font-bold text-primary-700">${costPerDayReduced?.toFixed(2)}<span className="text-sm font-normal text-primary-500">/day</span></p>
          </div>
        )}
      </div>

      {/* Crashing Options */}
      <div className="bg-white rounded-xl shadow-card border border-secondary-100 p-6">
        <h3 className="text-lg font-bold text-secondary-900 mb-4">Optimization Opportunities</h3>

        {crashingOptions.length === 0 ? (
          <div className="text-center py-8 bg-secondary-50 rounded-lg border border-dashed border-secondary-300">
            <p className="text-secondary-500">No crashing options available for critical activities</p>
          </div>
        ) : (
          <div className="space-y-4">
            {crashingOptions.map((option: any) => (
              <div
                key={option.activityId}
                className={`relative border-2 p-5 rounded-xl cursor-pointer transition-all duration-200 ${selectedActivities.includes(option.activityId)
                    ? 'border-primary-500 bg-primary-50/50 shadow-md'
                    : 'border-secondary-100 hover:border-primary-300 hover:shadow-sm'
                  }`}
                onClick={() => handleActivitySelect(option.activityId)}
              >
                <div className="flex items-start gap-4">
                  <div className={`mt-1 h-5 w-5 rounded border flex items-center justify-center transition-colors ${selectedActivities.includes(option.activityId) ? 'bg-primary-500 border-primary-500' : 'bg-white border-secondary-300'}`}>
                    {selectedActivities.includes(option.activityId) && (
                      <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-bold text-secondary-900 text-lg flex items-center">
                          <span className="bg-white border border-secondary-200 text-xs px-2 py-0.5 rounded mr-2 font-mono text-secondary-500">{option.activityId}</span>
                          {option.activityName}
                        </h4>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary-600 text-lg">${option.crashSlope?.toFixed(2)}</p>
                        <p className="text-xs text-secondary-500 font-medium uppercase tracking-wide">Cost / Day</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm bg-white/50 p-3 rounded-lg">
                      <div>
                        <p className="text-secondary-500 text-xs uppercase tracking-wide">Normal Time</p>
                        <p className="font-mono font-medium text-secondary-900">{option.normalTime?.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-secondary-500 text-xs uppercase tracking-wide">Crash Time</p>
                        <p className="font-mono font-medium text-secondary-900">{option.crashTime?.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-secondary-500 text-xs uppercase tracking-wide">Max Reduction</p>
                        <p className="font-mono font-bold text-warning-600">{option.maxCrashable?.toFixed(1)} days</p>
                      </div>
                      <div>
                        <p className="text-secondary-500 text-xs uppercase tracking-wide">Potential Cost</p>
                        <p className="font-mono font-medium text-secondary-900">${(option.crashSlope * option.maxCrashable)?.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary */}
      {selectedActivities.length > 0 && (
        <div className="fixed bottom-6 right-6 max-w-sm w-full bg-white shadow-xl rounded-xl border-t-4 border-success-500 p-6 z-50 animate-fade-in-up">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-bold text-secondary-900">Optimization Summary</h3>
            <button onClick={() => setSelectedActivities([])} className="text-secondary-400 hover:text-secondary-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-secondary-600">Selected Activities:</span>
              <span className="font-mono font-medium text-secondary-900">{selectedActivities.length}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-secondary-600">Total Time Reduction:</span>
              <span className="font-bold text-success-600">{((crashing?.projectDuration || 0) - newDuration).toFixed(2)} days</span>
            </div>
            <div className="flex justify-between items-center text-sm pt-2 border-t border-secondary-100">
              <span className="text-secondary-600">Total Additional Cost:</span>
              <span className="font-bold text-warning-600">${additionalCost.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
