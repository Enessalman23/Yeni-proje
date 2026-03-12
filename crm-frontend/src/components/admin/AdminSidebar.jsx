import { ChevronLeft, LayoutDashboard, Megaphone, Menu, Package, Tags, Users } from 'lucide-react'
import { useMemo } from 'react'
import { NavLink } from 'react-router-dom'
import SolvelineLogo from '../ui/SolvelineLogo'



const AdminSidebar = ({ isCollapsed, isMobileOpen, onToggleCollapse, onCloseMobile, user }) => {
  const navItems = useMemo(
    () => [
      { label: 'Dashboard', icon: LayoutDashboard, to: '/admin' },
      { label: 'Ürünler', icon: Package, to: '/admin/products' },
      { label: 'Fiyat Yönetimi', icon: Tags, to: '/admin/pricing' },
      { label: 'Duyurular', icon: Megaphone, to: '/admin/announcements' },
      { label: 'Kullanıcılar', icon: Users, to: '/admin/users' },
    ],
    [],
  )

  const baseClass = `fixed inset-y-0 left-0 z-50 flex h-screen flex-col border-r border-white/10 bg-slate-950 text-slate-100 transition-all duration-300 ${isCollapsed ? 'w-[88px]' : 'w-[280px]'
    } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`

  return (
    <>
      {isMobileOpen && (
        <button
          type="button"
          aria-label="Sidebar kapat"
          className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside className={baseClass}>
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden rounded-lg border border-slate-700 p-2 text-slate-200 transition hover:bg-slate-800 lg:inline-flex"
          >
            <ChevronLeft size={16} className={isCollapsed ? 'rotate-180 transition' : 'transition'} />
          </button>

          <button
            type="button"
            onClick={onCloseMobile}
            className="rounded-lg border border-slate-700 p-2 text-slate-200 lg:hidden"
          >
            <Menu size={16} />
          </button>

          <div className="ml-auto">
            {/* <SolvelineLogo compact={isCollapsed} /> */}
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {navItems.map((item) => {
            const Icon = item.icon

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/admin'}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${isActive ? 'bg-primary text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <Icon size={18} />
                {!isCollapsed && <span>{item.label}</span>}
              </NavLink>
            )
          })}
        </nav>

        <div className="border-t border-white/10 p-3">
          <div className="rounded-xl bg-slate-900 p-3">
            <p className="text-xs text-slate-400">Oturum</p>
            {!isCollapsed && (
              <>
                <p className="mt-1 text-sm font-semibold">{user?.name}</p>
                <p className="text-xs uppercase tracking-wide text-slate-400">{user?.role}</p>
              </>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}

export default AdminSidebar
