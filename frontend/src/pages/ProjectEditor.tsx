import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { ArrowLeft, Plus, Play, Trash2, Tag, Clock, Upload, List } from 'lucide-react'
import api from '../services/api'
import BulkImportActivities from '../components/BulkImportActivities'

export default function ProjectEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState<any>(null)
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showBulkImport, setShowBulkImport] = useState(false)
  const [newActivity, setNewActivity] = useState({
    activityId: '',
    name: '',
    predecessors: '',
    duration: '',
    optimistic: '',
    mostLikely: '',
    pessimistic: '',
    cost: ''
  })

  useEffect(() => {
    fetchProjectData()
  }, [id])

  const fetchProjectData = async () => {
    try {
      setLoading(true)
      const projRes = await api.get(`/projects/${id}`)
      setProject(projRes.data)

      try {
        const actRes = await api.get(`/projects/${id}/activities`)
        setActivities(Array.isArray(actRes.data) ? actRes.data : [])
      } catch (err) {
        console.error('Failed to fetch activities:', err)
        setActivities([])
      }
      setError('')
    } catch (err: any) {
      console.error('Error fetching project:', err)
      setError(err.response?.data?.detail || 'Failed to fetch project')
    } finally {
      setLoading(false)
    }
  }

  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newActivity.activityId.trim()) {
      setError('Activity ID is required')
      return
    }

    if (!newActivity.name.trim()) {
      setError('Activity Name is required')
      return
    }

    if (project.method === 'CPM' && !newActivity.duration) {
      setError('Duration is required for CPM projects')
      return
    }

    if (project.method === 'PERT' && (!newActivity.optimistic || !newActivity.mostLikely || !newActivity.pessimistic)) {
      setError('Optimistic, Most Likely, and Pessimistic values are required for PERT projects')
      return
    }

    try {
      const activityData: any = {
        activityId: newActivity.activityId,
        name: newActivity.name,
        predecessors: newActivity.predecessors || null,
        cost: newActivity.cost ? parseFloat(newActivity.cost) : null
      }

      if (project.method === 'CPM') {
        activityData.duration = parseFloat(newActivity.duration)
      } else {
        activityData.optimistic = parseFloat(newActivity.optimistic)
        activityData.mostLikely = parseFloat(newActivity.mostLikely)
        activityData.pessimistic = parseFloat(newActivity.pessimistic)
      }

      await api.post(`/projects/${id}/activities`, activityData)
      setNewActivity({
        activityId: '',
        name: '',
        predecessors: '',
        duration: '',
        optimistic: '',
        mostLikely: '',
        pessimistic: '',
        cost: ''
      })
      setError('')
      await fetchProjectData()
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to add activity'
      setError(errorMsg)
      console.error('Error adding activity:', err)
    }
  }

  const handleDeleteActivity = async (activityId: string) => {
    if (!confirm('Are you sure you want to delete this activity?')) return

    try {
      await api.delete(`/projects/${id}/activities/${activityId}`)
      await fetchProjectData()
    } catch (err) {
      setError('Failed to delete activity')
    }
  }

  const handleAnalyze = async () => {
    try {
      setError('')
      navigate(`/project/${id}/analysis`)
    } catch (err) {
      setError('Failed to navigate to analysis')
    }
  }

  if (loading) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
        <p className="text-secondary-500 font-medium tracking-tight">Loading project details...</p>
      </div>
    </div>
  )

  if (!project) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center p-12 bg-red-50 rounded-2xl border border-red-100 shadow-sm animate-fade-in-up">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <Trash2 className="h-8 w-8 text-red-500" />
          </div>
          <h3 className="text-xl font-bold text-red-900 mb-2">{error || 'Project not found'}</h3>
          <p className="text-red-700 mb-6">The project you are looking for does not exist or has been deleted.</p>
          <button onClick={() => navigate('/dashboard')} className="btn-secondary">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Return to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-secondary-500 hover:text-primary-600 text-sm font-medium flex items-center transition-colors mb-3"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Dashboard
          </button>

          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-secondary-900 tracking-tight">{project?.name}</h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary-50 text-primary-700 border border-primary-100 uppercase tracking-wide">
              {project?.method}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-sm text-secondary-500">
            <span className="flex items-center">
              <Clock className="w-4 h-4 mr-1.5 text-secondary-400" />
              Unit: <span className="font-medium ml-1 text-secondary-700 capitalize">{project?.timeUnit}</span>
            </span>
            <span className="flex items-center">
              <List className="w-4 h-4 mr-1.5 text-secondary-400" />
              Activities: <span className="font-medium ml-1 text-secondary-700">{activities.length}</span>
            </span>
          </div>
        </div>

        <button
          onClick={handleAnalyze}
          disabled={!activities || activities.length === 0}
          className="btn-primary shadow-lg shadow-primary-500/20 px-6 py-3"
        >
          <Play className="w-5 h-5 mr-2 fill-current" />
          Run Analysis
        </button>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-50 border-l-4 border-danger-500 text-danger-700 rounded-r-lg shadow-sm animate-shake">
          <div className="flex items-center">
            <p className="text-sm font-medium">{error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content - Activity List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-card border border-secondary-200 overflow-hidden">
            <div className="border-b border-secondary-200 bg-secondary-50/50 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-secondary-900 flex items-center">
                <List className="w-5 h-5 mr-2 text-primary-500" />
                Project Activities
              </h3>
              <span className="text-xs font-medium text-secondary-500 bg-white px-3 py-1 rounded-full border border-secondary-200 shadow-sm">
                {activities?.length || 0} Total
              </span>
            </div>

            <div className="p-0">
              {!activities || activities.length === 0 ? (
                <div className="text-center py-16 px-6">
                  <div className="mx-auto w-20 h-20 bg-secondary-50 rounded-full flex items-center justify-center mb-4 border border-secondary-100">
                    <List className="w-10 h-10 text-secondary-300" />
                  </div>
                  <h3 className="text-base font-semibold text-secondary-900">No activities yet</h3>
                  <p className="mt-2 text-sm text-secondary-500 max-w-sm mx-auto">
                    Start building your project timeline by adding individual tasks or importing them in bulk.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-secondary-50/80 text-secondary-500 font-semibold border-b border-secondary-200 uppercase text-xs tracking-wider">
                      <tr>
                        <th className="px-6 py-4">ID</th>
                        <th className="px-6 py-4">Name</th>
                        <th className="px-6 py-4">Predecessors</th>
                        <th className="px-6 py-4">Duration ({project.timeUnit})</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-secondary-100">
                      {activities.map((activity: any) => (
                        <tr key={activity?.id || activity?.activityId} className="hover:bg-secondary-50/60 transition-colors group">
                          <td className="px-6 py-4 font-bold text-secondary-900">{activity?.activityId}</td>
                          <td className="px-6 py-4 text-secondary-700">{activity?.name}</td>
                          <td className="px-6 py-4">
                            {activity?.predecessors ? (
                              <div className="flex flex-wrap gap-1">
                                {activity.predecessors.split(',').map((pred: string, i: number) => (
                                  <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-secondary-100 text-secondary-700 border border-secondary-200">
                                    {pred.trim()}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-secondary-400 text-xs italic">Start Node</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-secondary-700 font-mono text-xs">
                            {activity?.duration || (
                              <div className="flex gap-2">
                                <span title="Optimistic" className="px-1.5 py-0.5 bg-green-50 text-green-700 rounded border border-green-100">a:{activity?.optimistic}</span>
                                <span title="Most Likely" className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-100">m:{activity?.mostLikely}</span>
                                <span title="Pessimistic" className="px-1.5 py-0.5 bg-red-50 text-red-700 rounded border border-red-100">b:{activity?.pessimistic}</span>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => activity?.id && handleDeleteActivity(activity.id)}
                              className="p-1 text-secondary-400 hover:text-danger-600 hover:bg-red-50 rounded-md transition-all opacity-0 group-hover:opacity-100"
                              title="Delete Activity"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar - Add Activity */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-card border border-secondary-200 p-6 sticky top-24">
            <div className="flex justify-between items-center mb-6 border-b border-secondary-100 pb-4">
              <h2 className="text-lg font-bold text-secondary-900 flex items-center">
                <Plus className="w-5 h-5 mr-2 text-primary-500" />
                Add Activity
              </h2>
              <button
                onClick={() => setShowBulkImport(!showBulkImport)}
                className="text-xs px-3 py-1.5 bg-secondary-50 hover:bg-secondary-100 text-primary-600 hover:text-primary-700 rounded-lg font-medium transition-colors border border-secondary-200 flex items-center"
              >
                {showBulkImport ? (
                  <>Back to Single</>
                ) : (
                  <><Upload className="w-3 h-3 mr-1.5" /> Bulk Import</>
                )}
              </button>
            </div>

            {showBulkImport ? (
              <BulkImportActivities
                projectId={id || ''}
                projectMethod={project?.method || 'CPM'}
                onImportComplete={() => {
                  setShowBulkImport(false)
                  fetchProjectData()
                }}
                onCancel={() => setShowBulkImport(false)}
              />
            ) : (
              <form onSubmit={handleAddActivity} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-1">
                    <label className="block text-xs font-semibold text-secondary-600 uppercase tracking-wider mb-1.5">ID <span className="text-danger-500">*</span></label>
                    <input
                      type="text"
                      value={newActivity.activityId}
                      onChange={(e) => setNewActivity({ ...newActivity, activityId: e.target.value })}
                      className="input-field"
                      placeholder="e.g. A"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-xs font-semibold text-secondary-600 uppercase tracking-wider mb-1.5">Predecessors</label>
                    <input
                      type="text"
                      value={newActivity.predecessors}
                      onChange={(e) => setNewActivity({ ...newActivity, predecessors: e.target.value })}
                      className="input-field"
                      placeholder="e.g. A, B"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-secondary-600 uppercase tracking-wider mb-1.5">Activity Name <span className="text-danger-500">*</span></label>
                  <input
                    type="text"
                    value={newActivity.name}
                    onChange={(e) => setNewActivity({ ...newActivity, name: e.target.value })}
                    className="input-field"
                    placeholder="Brief description of the task"
                  />
                </div>

                {project?.method === 'CPM' ? (
                  <div>
                    <label className="block text-xs font-semibold text-secondary-600 uppercase tracking-wider mb-1.5">Duration <span className="text-danger-500">*</span></label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={newActivity.duration}
                        onChange={(e) => setNewActivity({ ...newActivity, duration: e.target.value })}
                        className="input-field pl-9"
                        placeholder="0.0"
                      />
                      <Clock className="w-4 h-4 text-secondary-400 absolute left-3 top-2.5" />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-secondary-600 uppercase tracking-wider mb-1.5" title="Optimistic Time">Opt (a)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={newActivity.optimistic}
                        onChange={(e) => setNewActivity({ ...newActivity, optimistic: e.target.value })}
                        className="input-field text-center px-1"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-secondary-600 uppercase tracking-wider mb-1.5" title="Most Likely Time">Likely (m)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={newActivity.mostLikely}
                        onChange={(e) => setNewActivity({ ...newActivity, mostLikely: e.target.value })}
                        className="input-field text-center px-1 border-primary-300"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-secondary-600 uppercase tracking-wider mb-1.5" title="Pessimistic Time">Pest (b)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={newActivity.pessimistic}
                        onChange={(e) => setNewActivity({ ...newActivity, pessimistic: e.target.value })}
                        className="input-field text-center px-1"
                        placeholder="0"
                      />
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-secondary-100 mt-4">
                  <button
                    type="submit"
                    className="w-full btn-primary justify-center shadow-lg shadow-primary-500/20 py-2.5"
                  >
                    Add Activity
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
