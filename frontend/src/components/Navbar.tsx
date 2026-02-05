import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Plus, LogOut, User as UserIcon } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout, isAuthenticated } = useAuth()
  const isHome = location.pathname === '/'

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className={`border-b ${isHome ? 'bg-secondary-900 border-secondary-800' : 'bg-white border-secondary-200'} transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <span className={`font-bold text-xl tracking-tight ${isHome ? 'text-white' : 'text-secondary-900'}`}>
                ProjectPath
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/dashboard"
              className={`inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md transition-colors
                ${isHome
                  ? 'text-secondary-300 hover:text-white hover:bg-secondary-800'
                  : 'text-secondary-500 hover:text-secondary-900 hover:bg-secondary-50'
                } ${location.pathname === '/dashboard' ? 'bg-secondary-100 text-secondary-900' : ''}`}
            >
              <LayoutDashboard className="w-4 h-4 mr-2" />
              Dashboard
            </Link>

            <button
              onClick={() => navigate('/dashboard')}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all
                ${isHome
                  ? 'bg-white text-secondary-900 hover:bg-secondary-100'
                  : 'bg-primary-600 text-white hover:bg-primary-700'
                }`}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </button>

            {isAuthenticated ? (
              <div className={`flex items-center gap-3 pl-4 border-l ${isHome ? 'border-secondary-700' : 'border-secondary-200'}`}>
                <div className={`flex items-center gap-2 ${isHome ? 'text-white' : 'text-secondary-700'}`}>
                  <UserIcon className="w-4 h-4" />
                  <span className="text-sm font-medium">{user?.username}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                    ${isHome
                      ? 'text-secondary-300 hover:text-white hover:bg-secondary-800'
                      : 'text-secondary-500 hover:text-red-600 hover:bg-red-50'
                    }`}
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className={`flex items-center gap-2 pl-4 border-l ${isHome ? 'border-secondary-700' : 'border-secondary-200'}`}>
                <Link
                  to="/login"
                  className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                    ${isHome
                      ? 'text-secondary-300 hover:text-white hover:bg-secondary-800'
                      : 'text-secondary-500 hover:text-secondary-900 hover:bg-secondary-50'
                    }`}
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md bg-primary-600 text-white hover:bg-primary-700 transition-colors"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
