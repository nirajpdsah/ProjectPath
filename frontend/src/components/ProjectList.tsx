import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import { deleteGuestProject, getGuestProjects } from '../utils/guestStorage'

interface Project {
  id: string
  name: string
  method: 'CPM' | 'PERT'
  timeUnit: string
  createdAt: string
}

export default function ProjectList() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    if (isAuthenticated) {
      fetchProjects()
    } else {
      setProjects(getGuestProjects() as any)
      setLoading(false)
    }
  }, [isAuthenticated])

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects')
      setProjects(response.data)
    } catch (error) {
      console.error('Failed to fetch projects:', error)
      setProjects([])
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (projectId: string) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return

    try {
      if (isAuthenticated) {
        await api.delete(`/projects/${projectId}`)
      } else {
        deleteGuestProject(projectId)
      }
      setProjects(projects.filter(p => p.id !== projectId))
    } catch (error) {
      console.error('Failed to delete project:', error)
      alert('Failed to delete project')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-dashed border-secondary-300">
        <h3 className="mt-2 text-sm font-semibold text-secondary-900">No projects</h3>
        <p className="mt-1 text-sm text-secondary-500">Get started by creating a new project.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      {projects.map(project => (
        <div key={project.id} className="card p-6 hover:shadow-lg transition-shadow duration-200 flex flex-col h-full">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-secondary-900 group-hover:text-primary-600 transition-colors">
              {project.name}
            </h3>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-50 text-primary-700">
                {project.method}
              </span>
              {!isAuthenticated && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary-100 text-secondary-700">
                  Guest
                </span>
              )}
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary-100 text-secondary-700">
                {project.timeUnit}
              </span>
            </div>
            <p className="text-xs text-secondary-400 mt-4">
              Created {new Date(project.createdAt).toLocaleDateString()}
            </p>
          </div>

          <div className="mt-6 flex gap-3 pt-4 border-t border-secondary-100">
            <Link
              to={`/project/${project.id}`}
              className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-secondary-300 shadow-sm text-sm leading-4 font-medium rounded-md text-secondary-700 bg-white hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Edit
            </Link>
            <Link
              to={`/project/${project.id}/analysis`}
              className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Analyze
            </Link>
            <button
              onClick={() => handleDelete(project.id)}
              className="inline-flex justify-center items-center p-2 border border-transparent text-sm font-medium rounded-md text-danger-700 bg-danger-50 hover:bg-danger-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-danger-500"
              title="Delete Project"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
