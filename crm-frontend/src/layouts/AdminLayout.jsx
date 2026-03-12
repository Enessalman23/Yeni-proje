import { Menu, LogOut } from 'lucide-react'
import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import AdminSidebar from '../components/admin/AdminSidebar'
import SolvelineLogo from '../components/ui/SolvelineLogo'
import { useAuth } from '../context/AuthContext'
import { useAppData } from '../context/AppDataContext'

const AdminLayout = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const adminData = useAppData()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const onLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <AdminSidebar
        isCollapsed={isCollapsed}
        isMobileOpen={isMobileOpen}
        onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
        onCloseMobile={() => setIsMobileOpen(false)}
        user={user}
      />

      <div className={`transition-all duration-300 ${isCollapsed ? 'lg:pl-22' : 'lg:pl-70'}`}>
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileOpen(true)}
              className="inline-flex rounded-lg border border-slate-300 p-2 text-slate-700 lg:hidden"
            >
              <Menu size={18} />
            </button>
            <SolvelineLogo className="hidden sm:flex" />
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold  cursor-pointer uppercase tracking-wider text-white"
          >
            <LogOut size={14} /> Çıkış
          </button>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet context={adminData} />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
