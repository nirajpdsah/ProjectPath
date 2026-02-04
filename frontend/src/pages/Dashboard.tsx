import { useState } from 'react'
import { FolderKanban, PlusCircle } from 'lucide-react'
import CreateProjectForm from '../components/CreateProjectForm'
import ProjectList from '../components/ProjectList'

export default function Dashboard() {
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [showNewProject, setShowNewProject] = useState(false)

  const handleProjectCreated = () => {
    setRefreshTrigger(prev => prev + 1)
    setShowNewProject(false)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="md:flex md:items-center md:justify-between mb-10 pb-6 border-b border-secondary-200">
        <div className="min-w-0 flex-1">
          <h1 className="text-3xl font-bold leading-7 text-secondary-900 sm:truncate sm:text-4xl sm:tracking-tight flex items-center gap-3">
            <FolderKanban className="h-8 w-8 text-primary-600" />
            Dashboard
          </h1>
          <p className="mt-2 text-lg text-secondary-500 max-w-2xl">
            Overview of your active CPM/PERT analyses and project timelines.
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          {!showNewProject && (
            <button
              onClick={() => setShowNewProject(true)}
              className="btn-primary"
            >
              <PlusCircle className="w-5 h-5 mr-2" />
              New Project
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className={`space-y-6 transition-all duration-300 ${showNewProject ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
          <div className="bg-white rounded-xl border border-secondary-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-secondary-200 bg-secondary-50/50 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-secondary-900">Your Projects</h2>
              <span className="text-xs font-medium text-secondary-500 bg-white px-2.5 py-1 rounded-full border border-secondary-200 shadow-sm">
                Active
              </span>
            </div>
            <div className="p-6">
              <ProjectList key={refreshTrigger} />
            </div>
          </div>
        </div>

        {showNewProject && (
          <div className="lg:col-span-1 animate-fade-in-up">
            <div className="bg-white rounded-xl border border-secondary-200 shadow-lg overflow-hidden sticky top-6">
              <div className="p-4 border-b border-secondary-200 bg-primary-50 flex justify-between items-center">
                <h3 className="font-semibold text-primary-900">Create New Project</h3>
                <button onClick={() => setShowNewProject(false)} className="text-secondary-400 hover:text-secondary-600 p-1">
                  <span className="sr-only">Close</span>
                  <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              <div className="p-6">
                <CreateProjectForm onProjectCreated={handleProjectCreated} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
