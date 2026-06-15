import { useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Calendar, BookOpen, BarChart2, MoreHorizontal } from 'lucide-react'

const NAV = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/schedule', icon: Calendar, label: 'Planning' },
  { to: '/books', icon: BookOpen, label: 'Lecture' },
  { to: '/stats', icon: BarChart2, label: 'Stats' },
  { to: '/more', icon: MoreHorizontal, label: 'Plus' },
]

export default function Layout({ children }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  return (
    <div className="min-h-dvh" style={{ background: 'var(--bg)' }}>
      {/* Contenu de la page */}
      <main style={{ paddingBottom: 'calc(var(--nav-h) + env(safe-area-inset-bottom, 8px))' }}>
        {children}
      </main>

      {/* Navbar bottom */}
      <nav className="fixed bottom-0 left-0 right-0"
        style={{
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(123,111,208,0.10)',
          paddingBottom: 'env(safe-area-inset-bottom, 8px)',
        }}>
        <div className="flex items-center justify-around px-2 pt-2 pb-2 max-w-lg mx-auto">
          {NAV.map(({ to, icon: Icon, label }) => {
            const active = pathname === to
            return (
              <button key={to} onClick={() => navigate(to)}
                className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-2xl transition-all"
                style={{ background: active ? 'var(--accent-bg)' : 'transparent' }}>
                <Icon size={20} strokeWidth={active ? 2.2 : 1.8}
                  style={{ color: active ? 'var(--accent)' : 'var(--muted)' }} />
                <span className="text-[10px] font-semibold"
                  style={{ color: active ? 'var(--accent)' : 'var(--muted)' }}>
                  {label}
                </span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
