import { useState } from 'react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import { addGuestProject } from '../utils/guestStorage'

interface CreateProjectProps {
  onProjectCreated: () => void
}

export default function CreateProjectForm({ onProjectCreated }: CreateProjectProps) {
  const [formData, setFormData] = useState({
    name: '',
    method: 'CPM' as 'CPM' | 'PERT',
    timeUnit: 'days'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { isAuthenticated } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (!isAuthenticated) {
        const now = new Date().toISOString()
        const id = `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        addGuestProject({
          id,
          name: formData.name,
          method: formData.method,
          timeUnit: formData.timeUnit,
          createdAt: now,
          updatedAt: now
        })
      } else {
        await api.post('/projects', formData)
      }
      onProjectCreated()
      setFormData({ name: '', method: 'CPM', timeUnit: 'days' })
    } catch (err) {
      setError('Failed to create project')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-card border border-secondary-100 p-6">
      <h2 className="text-xl font-bold text-secondary-900 mb-6 flex items-center">
        <svg className="w-5 h-5 mr-2 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        New Project
      </h2>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-danger-500 text-danger-700 rounded-r text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Project Name
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 bg-white border border-secondary-300 rounded-lg text-secondary-900 placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow sm:text-sm"
            placeholder="e.g. Website Launch"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Method
          </label>
          <select
            value={formData.method}
            onChange={(e) => setFormData({ ...formData, method: e.target.value as 'CPM' | 'PERT' })}
            className="w-full px-4 py-2 bg-white border border-secondary-300 rounded-lg text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow sm:text-sm"
          >
            <option value="CPM">CPM (Deterministic)</option>
            <option value="PERT">PERT (Probabilistic)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Time Unit
          </label>
          <select
            value={formData.timeUnit}
            onChange={(e) => setFormData({ ...formData, timeUnit: e.target.value })}
            className="w-full px-4 py-2 bg-white border border-secondary-300 rounded-lg text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow sm:text-sm"
          >
            <option value="days">Days</option>
            <option value="weeks">Weeks</option>
            <option value="months">Months</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full btn-primary justify-center mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating...' : 'Create Project'}
        </button>
      </div>
    </form>
  )
}
