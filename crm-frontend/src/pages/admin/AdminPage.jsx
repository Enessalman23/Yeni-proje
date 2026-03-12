import { LayoutDashboard, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const AdminPage = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const onLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-8">
      <div className="mx-auto max-w-6xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
              <LayoutDashboard size={14} /> Admin Panel
            </p>
            <h1 className="mt-3 font-display text-3xl font-bold text-slate-900">Hos geldin, {user?.name}</h1>
            <p className="mt-1 text-sm text-slate-500">Rol: {user?.role}</p>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white cursor-pointer"
          >
            <LogOut size={16} /> Cikis
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminPage
