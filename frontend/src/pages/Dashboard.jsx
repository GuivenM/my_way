import { useEffect, useState } from 'react'
import { dashboardApi } from '../api'
import { useAuth } from '../context/AuthContext'
import { Moon, Dumbbell, Salad } from 'lucide-react'

/* ── Helpers ── */
function Label({ children }) {
  return (
    <p className="text-[11px] font-bold uppercase tracking-widest mb-3"
      style={{ color: 'var(--accent)' }}>{children}</p>
  )
}

/* ── Stat pill streak/projets/livres ── */
function StatCard({ icon, value, label }) {
  return (
    <div className="glass-inner flex-1 flex flex-col items-center py-3 rounded-2xl gap-0.5">
      <span className="text-lg">{icon}</span>
      <span className="text-lg font-bold" style={{ color: 'var(--text)' }}>{value}</span>
      <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>{label}</span>
    </div>
  )
}

/* ── Bloc actif ── */
function ActiveBlock({ block }) {
  if (!block) return null
  return (
    <div className="glass rounded-3xl p-4">
      <Label>Bloc actif</Label>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
          style={{ background: 'var(--accent-bg)' }}>
          <span className="text-lg">🎵</span>
        </div>
        <div className="flex-1">
          <p className="text-base font-semibold" style={{ color: 'var(--text)' }}>{block.name}</p>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>{block.time_start?.slice(0,5)} – {block.time_end?.slice(0,5)}</p>
        </div>
        <span className="text-xs font-semibold px-3 py-1 rounded-full"
          style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>En cours</span>
      </div>
    </div>
  )
}

/* ── Blocs du jour (mini carrés) ── */
function BlocksTimeline({ blocks }) {
  const statusColor = {
    done:    'var(--accent)',
    skipped: 'rgba(161,161,170,0.3)',
    partial: 'var(--partial)',
    pending: 'rgba(161,161,170,0.15)',
  }
  return (
    <div className="glass rounded-3xl p-4">
      <Label>Blocs du jour</Label>
      <div className="flex gap-2 items-end">
        {blocks.map(b => (
          <div key={b.id} className="flex-1 flex flex-col items-center gap-1.5">
            <div className="w-full rounded-xl relative"
              style={{
                height: '48px',
                background: b.is_current ? 'var(--accent)' : statusColor[b.status],
                boxShadow: b.is_current ? '0 4px 12px rgba(123,111,208,0.4)' : 'none',
              }}>
              {(b.status === 'done' || b.is_current) && (
                <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white opacity-80" />
              )}
            </div>
            <span className="text-[9px]" style={{ color: 'var(--muted)' }}>
              {b.time_start?.slice(0,2)}h
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Projets ── */
const DOMAIN_COLORS = {
  'web-novel': 'var(--dot-purple)',
  'dev':       'var(--dot-teal)',
  'music':     'var(--dot-orange)',
}
function ProjectRow({ project }) {
  const color = DOMAIN_COLORS[project.domain] || 'var(--accent)'
  const pct   = project.progress ?? 40
  const statusLabel = { active: 'Actif', paused: 'En pause', idea: 'Idée', done: 'Terminé' }

  return (
    <div className="flex items-center gap-3">
      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
      <span className="flex-1 text-sm font-medium truncate" style={{ color: 'var(--text)' }}>
        {project.name}
      </span>
      <div className="w-20 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(123,111,208,0.12)' }}>
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full ml-1"
        style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>
        {statusLabel[project.status] ?? project.status}
      </span>
    </div>
  )
}

/* ── Santé ── */
function HealthBtn({ icon: Icon, label, active, color }) {
  return (
    <div className="flex-1 flex flex-col items-center gap-1.5 py-3 rounded-2xl transition"
      style={{
        background: active ? `${color}18` : 'var(--bg3)',
        border: `1px solid ${active ? color + '30' : 'transparent'}`,
      }}>
      <Icon size={20} strokeWidth={1.8} style={{ color: active ? color : 'var(--muted)' }} />
      <span className="text-[10px] font-bold uppercase tracking-wide"
        style={{ color: active ? color : 'var(--muted)' }}>{label}</span>
    </div>
  )
}

/* ── Dashboard ── */
export default function Dashboard() {
  const { user } = useAuth()
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    dashboardApi().then(setData).catch(console.error).finally(() => setLoading(false))
  }, [])

  const now  = new Date()
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir'
  const dateStr  = now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
    .toUpperCase()

  const activeBlock = data?.blocks?.find(b => b.is_current)
  const blocksDone  = data?.blocks_done ?? 0
  const blocksTotal = data?.blocks_total ?? 7

  return (
    <div className="px-4 pt-8 pb-32 space-y-4 max-w-lg mx-auto">

      {/* Orbe déco */}
      <div style={{
        position: 'fixed', top: '-100px', right: '-60px', pointerEvents: 'none',
        width: '280px', height: '280px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(123,111,208,0.10) 0%, transparent 70%)',
      }} />

      {/* Header */}
      <div className="mb-2">
        <p className="text-[11px] font-bold tracking-widest" style={{ color: 'var(--muted)' }}>{dateStr}</p>
        <h1 className="text-3xl font-bold mt-0.5" style={{ color: 'var(--text)' }}>
          {greeting}, {user?.username ?? 'toi'}.
        </h1>
        {!loading && (
          <p className="text-sm mt-1" style={{ color: 'var(--accent)' }}>
            {blocksDone} blocs complétés · {blocksTotal - blocksDone} restant{blocksTotal - blocksDone > 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Vision */}
      {data?.vision && (
        <div className="glass rounded-3xl p-4">
          <Label>Ta vision</Label>
          <p className="text-sm leading-relaxed italic" style={{ color: 'var(--text2)' }}>
            "{data.vision}"
          </p>
        </div>
      )}

      {/* Stats streak / projets / livres */}
      <div className="flex gap-3">
        <StatCard icon="🔥" value={data?.streak ?? '–'} label="Streak" />
        <StatCard icon="📁" value={data?.projects_count ?? '–'} label="Projets" />
        <StatCard icon="📚" value={data?.books_count ?? '–'} label="Livres" />
      </div>

      {/* Bloc actif */}
      {activeBlock && <ActiveBlock block={activeBlock} />}

      {/* Blocs du jour */}
      {data?.blocks?.length > 0 && <BlocksTimeline blocks={data.blocks} />}

      {/* Projets */}
      {data?.projects?.length > 0 && (
        <div className="glass rounded-3xl p-4">
          <Label>Projets</Label>
          <div className="space-y-3">
            {data.projects.map(p => <ProjectRow key={p.id} project={p} />)}
          </div>
        </div>
      )}

      {/* Santé */}
      <div className="glass rounded-3xl p-4">
        <Label>Santé aujourd'hui</Label>
        <div className="flex gap-2">
          <HealthBtn icon={Moon}     label="Sommeil" active={data?.health?.sleep_ok}    color="#7B6FD0" />
          <HealthBtn icon={Dumbbell} label="Sport"   active={data?.health?.exercise_ok} color="var(--partial)" />
          <HealthBtn icon={Salad}    label="Alim."   active={data?.health?.food_ok}     color="var(--done)" />
        </div>
      </div>

      {/* Citation */}
      {data?.quote && (
        <div className="glass rounded-3xl p-5 text-center">
          <p className="text-sm italic leading-relaxed" style={{ color: 'var(--text2)' }}>
            "{data.quote.text}"
          </p>
          {data.quote.source && (
            <p className="text-xs mt-2 font-medium" style={{ color: 'var(--accent)' }}>— {data.quote.source}</p>
          )}
        </div>
      )}
    </div>
  )
}
