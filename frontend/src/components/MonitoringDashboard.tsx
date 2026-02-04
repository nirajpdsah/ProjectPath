import { useState, useEffect } from 'react'
import api from '../services/api'

interface MonitoringProps {
  projectId: string
  projectMethod: string
}

export default function MonitoringDashboard({ projectId, projectMethod }: MonitoringProps) {
  const [analysis, setAnalysis] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchAnalysis()
  }, [projectId])

  const fetchAnalysis = async () => {
    try {
      const response = await api.get(`/projects/${projectId}/analyze`)
      setAnalysis(response.data)
    } catch (err) {
      setError('Failed to load monitoring data')
      console.error(err)
    } finally {
      setLoading(false)
    }
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

  const criticalActivities = analysis?.activities?.filter((a: any) => a.isCritical) || []
  const nonCriticalActivities = analysis?.activities?.filter((a: any) => !a.isCritical) || []

  return (
    <div className="space-y-8">
      {/* Project Overview */}
      <div className="bg-white rounded-xl shadow-card border border-secondary-100 p-6">
        <h2 className="text-lg font-bold text-secondary-900 mb-6 flex items-center">
          <svg className="w-5 h-5 mr-2 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Project Health Overview
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-primary-50 p-5 rounded-xl border border-primary-100">
            <p className="text-sm font-medium text-primary-600 uppercase tracking-wide">Duration</p>
            <p className="text-3xl font-bold text-primary-700 mt-1">{analysis?.projectDuration?.toFixed(2)}</p>
            <p className="text-xs text-primary-500 mt-1">Total estimated time</p>
          </div>

          <div className="bg-danger-50 p-5 rounded-xl border border-danger-100">
            <p className="text-sm font-medium text-danger-600 uppercase tracking-wide">Critical Tasks</p>
            <p className="text-3xl font-bold text-danger-700 mt-1">{criticalActivities.length}</p>
            <p className="text-xs text-danger-500 mt-1">Activities with 0 slack</p>
          </div>

          <div className="bg-success-50 p-5 rounded-xl border border-success-100">
            <p className="text-sm font-medium text-success-600 uppercase tracking-wide">Non-Critical</p>
            <p className="text-3xl font-bold text-success-700 mt-1">{nonCriticalActivities.length}</p>
            <p className="text-xs text-success-500 mt-1">Activities with slack</p>
          </div>
        </div>
      </div>

      {/* Critical Path */}
      <div className="bg-white rounded-xl shadow-card border border-secondary-100 p-6">
        <h3 className="text-lg font-bold text-secondary-900 mb-4">Critical Path Flow</h3>
        <div className="bg-gradient-to-r from-red-50 to-white p-4 rounded-lg border-l-4 border-danger-500">
          <p className="text-sm font-semibold text-danger-700 mb-2 uppercase tracking-wide text-xs">Sequence</p>
          <div className="flex flex-wrap items-center text-secondary-800 font-mono text-sm leading-relaxed">
            {analysis?.criticalPath?.length ? (
              analysis.criticalPath.map((node: string, idx: number) => (
                <span key={idx} className="flex items-center">
                  <span className="font-bold text-danger-700">{node}</span>
                  {idx < analysis.criticalPath.length - 1 && (
                    <svg className="w-4 h-4 mx-2 text-secondary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  )}
                </span>
              ))
            ) : 'No critical path identified'}
          </div>
        </div>
      </div>

      {/* Control Questions */}
      <div className="card p-6">
        <h3 className="text-lg font-bold text-secondary-900 mb-6">Execution Guidelines</h3>

        <div className="space-y-4">
          <div className="relative pl-6 border-l-2 border-primary-500">
            <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-primary-100 border-2 border-primary-500"></div>
            <p className="font-semibold text-secondary-900 text-sm">Critical Attention Required</p>
            <p className="text-secondary-600 text-sm mt-1">
              Focus resources on: <span className="font-medium text-danger-600">
                {criticalActivities.length > 0
                  ? `${criticalActivities.map((a: any) => a.activityId).join(', ')}`
                  : 'None'}
              </span> to prevent project delays.
            </p>
          </div>

          <div className="relative pl-6 border-l-2 border-success-500">
            <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-success-100 border-2 border-success-500"></div>
            <p className="font-semibold text-secondary-900 text-sm">Flexible Activities (Slack Available)</p>
            <p className="text-secondary-600 text-sm mt-1">
              {nonCriticalActivities.length > 0
                ? `Resources can be borrowed from: ${nonCriticalActivities.map((a: any) => a.activityId).join(', ')}`
                : 'No flexibility available'}
            </p>
          </div>

          <div className="relative pl-6 border-l-2 border-warning-500">
            <p className="font-semibold text-secondary-900 text-sm">Max Delay Allowance</p>
            <div className="mt-2 text-sm">
              {nonCriticalActivities.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                  {nonCriticalActivities.map((a: any) => (
                    <div key={a.id} className="bg-secondary-50 text-secondary-700 px-3 py-1.5 rounded flex justify-between">
                      <span className="font-medium">{a.activityId}</span>
                      <span className="font-mono text-secondary-500">{a.slack?.toFixed(1)}d</span>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-secondary-500 italic">No tasks can be delayed.</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Activity Details Table */}
      <div className="card overflow-hidden">
        <div className="p-6 border-b border-secondary-100">
          <h3 className="text-lg font-bold text-secondary-900">Detailed Metrics</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-secondary-50/80 border-b border-secondary-200 text-secondary-500 font-medium">
              <tr>
                <th className="px-6 py-3 font-semibold">Activity</th>
                <th className="px-6 py-3 font-semibold text-center">ES</th>
                <th className="px-6 py-3 font-semibold text-center">EF</th>
                <th className="px-6 py-3 font-semibold text-center">LS</th>
                <th className="px-6 py-3 font-semibold text-center">LF</th>
                <th className="px-6 py-3 font-semibold text-center">Slack</th>
                <th className="px-6 py-3 font-semibold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-100">
              {analysis?.activities?.map((activity: any) => (
                <tr key={activity.id} className={`hover:bg-secondary-50/50 transition-colors ${activity.isCritical ? 'bg-red-50/30' : ''}`}>
                  <td className="px-6 py-3 font-medium text-secondary-900">{activity.activityId}</td>
                  <td className="px-6 py-3 text-center font-mono text-secondary-600">{activity.es?.toFixed(2)}</td>
                  <td className="px-6 py-3 text-center font-mono text-secondary-600">{activity.ef?.toFixed(2)}</td>
                  <td className="px-6 py-3 text-center font-mono text-secondary-600">{activity.ls?.toFixed(2)}</td>
                  <td className="px-6 py-3 text-center font-mono text-secondary-600">{activity.lf?.toFixed(2)}</td>
                  <td className="px-6 py-3 text-center font-mono text-secondary-800 font-medium">{activity.slack?.toFixed(2)}</td>
                  <td className="px-6 py-3 text-center">
                    {activity.isCritical ? (
                      <span className="bg-danger-100 text-danger-800 px-2 py-0.5 rounded text-xs font-semibold">Critical</span>
                    ) : (
                      <span className="bg-success-100 text-success-800 px-2 py-0.5 rounded text-xs font-semibold">OK</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
