import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Music2, Code2, Heart, Sparkles, ScrollText, TrendingUp, Users, ChevronRight } from 'lucide-react'

const modules = [
  { icon: ScrollText, label: 'Journal',           sub: 'Écriture quotidienne',  to: '/journal',  phase: 2, active: true },
  { icon: TrendingUp, label: 'Vision & Objectifs', sub: '3 mois → 5 ans',       to: '/vision',   phase: 2, active: true },
  { icon: Code2,      label: 'Apprentissage',      sub: 'Code, IA, réseau',      to: '/learning', phase: 5 },
  { icon: Music2,     label: 'Musique / Zixe',     sub: 'Sessions & projets',    to: '/music',    phase: 5 },
  { icon: Heart,      label: 'Santé',              sub: 'Sommeil, sport, alim.', to: '/health',   phase: 6 },
  { icon: Sparkles,   label: 'Spiritualité',       sub: 'Pratiques & journal',   to: '/spiritual',phase: 6 },
  { icon: Users,      label: 'Réseau',             sub: 'Contacts à entretenir', to: '/network',  phase: 7 },
]

function Label({ children }) {
  return <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--accent)' }}>{children}</p>
}

export default function More() {
  const { logout } = useAuth()
  const navigate   = useNavigate()

  const active   = modules.filter(m => m.active)
  const upcoming = modules.filter(m => !m.active)

  return (
    <div className="px-4 pt-8 pb-32 max-w-lg mx-auto" style={{padding: '16px'}}>
      <h1 className="text-2xl font-bold" style={{ color: 'var(--text)', marginBottom: '12px' }}>Configuration</h1>

      {active.length > 0 && (
        <div className="glass rounded-3xl p-4 mb-4" style={{ padding: '16px', marginBottom: '12px' }}>
          <Label>Disponible</Label>
          <div className="space-y-1" s>
            {active.map(m => (
              <button key={m.to} onClick={() => navigate(m.to)}
                className="w-full flex items-center gap-3 py-3 px-2 rounded-2xl text-left transition"
                style={{ background: 'transparent', marginTop: '8px', padding: '4px 6px', border: 'var(--glass-border)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'var(--accent-bg)' }}>
                  <m.icon size={17} style={{ color: 'var(--accent)' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{m.label}</p>
                  <p className="text-xs" style={{ color: 'var(--muted)' }}>{m.sub}</p>
                </div>
                <ChevronRight size={14} style={{ color: 'var(--muted)' }} />
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="glass rounded-3xl p-4 mb-4" style={{ padding: '16px' }}>
        <Label>Prochaines phases</Label>
        <div className="space-y-1" >
          {upcoming.map(m => (
            <div key={m.to} className="flex items-center gap-3 py-3 px-2 opacity-50">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ marginTop: '8px', padding: '4px 6px', background: 'var(--bg4)' }}>
                <m.icon size={17} style={{ color: 'var(--muted)' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{m.label}</p>
                <p className="text-xs" style={{ color: 'var(--muted)' }}>{m.sub}</p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: 'var(--bg4)', color: 'var(--muted)' }}>Phase {m.phase}</span>
            </div>
          ))}
        </div>
      </div>

      <button onClick={logout}
        className="w-full py-3 rounded-2xl text-sm font-semibold"
        style={{ background: 'var(--skip-bg)', color: 'var(--skip)', border: '1px solid rgba(248,113,113,0.2)', marginTop: '16px', padding: '4px 8px' }}>
        Déconnexion
      </button>
    </div>
  )
}
