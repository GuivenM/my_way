import { NavLink } from 'react-router-dom'
import { LayoutDashboard, FolderKanban, BookOpen, BarChart2, Settings } from 'lucide-react'

const tabs = [
  { to: '/',         icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/projects', icon: FolderKanban,    label: 'Projets'   },
  { to: '/books',    icon: BookOpen,        label: 'Lecture'   },
  { to: '/stats',    icon: BarChart2,       label: 'Stats'     },
  { to: '/more',     icon: Settings,        label: 'Config'    },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 safe-bottom z-50"
      style={{
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(123,111,208,0.10)',
        boxShadow: '0 -4px 24px rgba(123,111,208,0.06)',
      }}>
      <div className="flex items-center justify-around px-2 pt-2 pb-1 max-w-lg mx-auto">
        {tabs.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={to === '/'}
            className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all"
            style={({ isActive }) => ({
              color: isActive ? 'var(--accent)' : 'var(--muted)',
            })}>
            <Icon size={21} strokeWidth={1.8} />
            <span className="text-[10px] font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
