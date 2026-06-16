import { useEffect, useState } from 'react'
import { musicApi } from '../api'
import { Plus, X, Mic, Headphones, PenLine, Radio, Music as MusicIcon } from 'lucide-react'

// ── Constants ──────────────────────────────────────────────────────────────────

const SESSION_TYPES = [
  { id: 'writing',    label: 'Écriture',    icon: PenLine,    color: '#7B6FD0' },
  { id: 'production', label: 'Production',  icon: MusicIcon,      color: '#2dd4bf' },
  { id: 'listening',  label: 'Écoute',      icon: Headphones, color: '#fb923c' },
  { id: 'recording',  label: 'Enregistrement', icon: Mic,     color: '#f472b6' },
  { id: 'other',      label: 'Autre',       icon: Radio,      color: '#a78bfa' },
]

// ── Helpers ────────────────────────────────────────────────────────────────────

function Label({ children }) {
  return <p className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--accent)' }}>{children}</p>
}

function formatMin(min) {
  const m = Number(min)
  if (m < 60) return `${m}min`
  return `${Math.floor(m / 60)}h${m % 60 > 0 ? `${m % 60}` : ''}`
}

// ── AddSessionModal ────────────────────────────────────────────────────────────

function AddSessionModal({ onClose, onAdd }) {
  const [form, setForm] = useState({
    session_type: 'writing',
    duration_min: '',
    notes:        '',
    project_name: '',
    session_date: new Date().toISOString().split('T')[0],
  })
  const [saving, setSaving] = useState(false)

  const handle = async () => {
    if (!form.duration_min) return
    setSaving(true)
    try {
      const s = await musicApi.create({ ...form, duration_min: Number(form.duration_min) })
      onAdd(s)
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-lg rounded-t-3xl p-5 overflow-y-auto"
        style={{ background: 'var(--bg)', borderTop: 'var(--glass-border)', maxHeight: '90vh' }}>

        <div className="flex items-center justify-between mb-4">
          <p className="text-base font-bold" style={{ color: 'var(--text)' }}>Nouvelle session</p>
          <button onClick={onClose}><X size={18} style={{ color: 'var(--muted)' }} /></button>
        </div>

        {/* Type */}
        <Label>Type de session</Label>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {SESSION_TYPES.map(t => {
            const Icon = t.icon
            const active = form.session_type === t.id
            return (
              <button key={t.id} onClick={() => setForm(f => ({ ...f, session_type: t.id }))}
                className="flex flex-col items-center gap-1.5 py-3 rounded-2xl transition"
                style={{
                  background: active ? t.color + '20' : 'var(--bg3)',
                  border:     active ? `1px solid ${t.color}40` : '1px solid transparent',
                }}>
                <Icon size={18} style={{ color: active ? t.color : 'var(--muted)' }} />
                <span className="text-[10px] font-semibold" style={{ color: active ? t.color : 'var(--muted)' }}>
                  {t.label}
                </span>
              </button>
            )
          })}
        </div>

        {/* Projet */}
        <Label>Projet musical</Label>
        <input value={form.project_name} onChange={e => setForm(f => ({ ...f, project_name: e.target.value }))}
          placeholder="Nom du projet, EP, chanson…"
          className="w-full px-4 py-2.5 rounded-2xl text-sm outline-none mb-4"
          style={{ background: 'var(--bg3)', color: 'var(--text)', border: 'var(--glass-border)' }} />

        {/* Durée + date */}
        <div className="flex gap-3 mb-4">
          <div className="flex-1">
            <Label>Durée (min)</Label>
            <input type="number" value={form.duration_min}
              onChange={e => setForm(f => ({ ...f, duration_min: e.target.value }))}
              placeholder="90"
              className="w-full px-4 py-2.5 rounded-2xl text-sm outline-none"
              style={{ background: 'var(--bg3)', color: 'var(--text)', border: 'var(--glass-border)' }} />
          </div>
          <div className="flex-1">
            <Label>Date</Label>
            <input type="date" value={form.session_date}
              onChange={e => setForm(f => ({ ...f, session_date: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-2xl text-sm outline-none"
              style={{ background: 'var(--bg3)', color: 'var(--text)', border: 'var(--glass-border)' }} />
          </div>
        </div>

        {/* Notes */}
        <Label>Notes libres</Label>
        <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
          placeholder="Ce que tu as travaillé, idées, observations…"
          rows={3}
          className="w-full px-4 py-3 rounded-2xl text-sm outline-none resize-none mb-5"
          style={{ background: 'var(--bg3)', color: 'var(--text)', border: 'var(--glass-border)' }} />

        <button onClick={handle} disabled={saving || !form.duration_min}
          className="w-full py-3 rounded-2xl text-sm font-semibold transition"
          style={{
            background: 'var(--accent)', color: 'white',
            opacity: saving || !form.duration_min ? 0.6 : 1,
            boxShadow: '0 4px 16px rgba(123,111,208,0.3)',
          }}>
          {saving ? 'Ajout…' : 'Enregistrer la session'}
        </button>
      </div>
    </div>
  )
}

// ── SessionCard ────────────────────────────────────────────────────────────────

function SessionCard({ session }) {
  const cfg  = SESSION_TYPES.find(t => t.id === session.session_type) || SESSION_TYPES[4]
  const Icon = cfg.icon

  return (
    <div className="glass rounded-2xl p-4">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: cfg.color + '20' }}>
          <Icon size={16} style={{ color: cfg.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-0.5">
            <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
              {session.project_name || cfg.label}
            </p>
            <span className="text-xs font-bold" style={{ color: cfg.color }}>
              {formatMin(session.duration_min)}
            </span>
          </div>
          {session.project_name && (
            <p className="text-[10px] mb-1" style={{ color: cfg.color }}>{cfg.label}</p>
          )}
          {session.notes && (
            <p className="text-xs leading-relaxed line-clamp-2 mb-1" style={{ color: 'var(--text2)' }}>
              {session.notes}
            </p>
          )}
          <p className="text-[10px]" style={{ color: 'var(--muted)' }}>
            {new Date(session.session_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
          </p>
        </div>
      </div>
    </div>
  )
}

// ── Music ──────────────────────────────────────────────────────────────────────

export default function Music() {
  const [sessions, setSessions] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [showAdd,  setShowAdd]  = useState(false)
  const [filter,   setFilter]   = useState('all')

  useEffect(() => {
    musicApi.list().then(setSessions).catch(console.error).finally(() => setLoading(false))
  }, [])

  const handleAdd = (s) => setSessions(p => [s, ...p])

  // Stats
  const totalMin = sessions.reduce((a, s) => a + Number(s.duration_min), 0)
  const byType   = {}
  sessions.forEach(s => { byType[s.session_type] = (byType[s.session_type] || 0) + Number(s.duration_min) })

  // Projets récents
  const projects = [...new Set(sessions.map(s => s.project_name).filter(Boolean))]

  // Filtre
  const filtered = filter === 'all' ? sessions : sessions.filter(s => s.session_type === filter)

  return (
    <div className="px-4 w-full max-w-lg mx-auto" style={{ paddingTop: '24px', paddingBottom: '120px' }}>

      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>Musique · Zixe</h1>
          {!loading && (
            <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>
              {formatMin(totalMin)} au total · {sessions.length} sessions
            </p>
          )}
        </div>
        <button onClick={() => setShowAdd(true)}
          className="w-10 h-10 rounded-2xl flex items-center justify-center"
          style={{ background: 'var(--accent)', boxShadow: '0 4px 12px rgba(123,111,208,0.3)' }}>
          <Plus size={18} color="white" />
        </button>
      </div>

      {/* Stats par type */}
      {!loading && Object.keys(byType).length > 0 && (
        <div className="glass rounded-3xl p-4 mb-4">
          <Label>Par type</Label>
          <div className="flex gap-2 flex-wrap">
            {Object.entries(byType).sort((a, b) => b[1] - a[1]).map(([type, min]) => {
              const cfg = SESSION_TYPES.find(t => t.id === type) || SESSION_TYPES[4]
              return (
                <span key={type} className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
                  style={{ background: cfg.color + '20', color: cfg.color }}>
                  {cfg.label} · {formatMin(min)}
                </span>
              )
            })}
          </div>

          {/* Projets actifs */}
          {projects.length > 0 && (
            <div className="mt-3">
              <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--muted)' }}>Projets</p>
              <div className="flex gap-2 flex-wrap">
                {projects.map(p => (
                  <span key={p} className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
                    style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>
                    {p}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filtres */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {[{ id: 'all', label: 'Toutes' }, ...SESSION_TYPES].map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)}
            className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition"
            style={{
              background: filter === f.id ? 'var(--accent)' : 'var(--bg2)',
              color:      filter === f.id ? 'white' : 'var(--muted)',
              boxShadow:  filter === f.id ? '0 4px 12px rgba(123,111,208,0.25)' : 'none',
              border:     'var(--glass-border)',
            }}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Sessions */}
      {loading ? (
        <div className="space-y-3">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ background: 'var(--bg2)' }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass rounded-3xl p-8 text-center">
          <p className="text-3xl mb-3">🎵</p>
          <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text)' }}>Aucune session</p>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>Enregistre ta première session Zixe</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(s => <SessionCard key={s.id} session={s} />)}
        </div>
      )}

      {showAdd && <AddSessionModal onClose={() => setShowAdd(false)} onAdd={handleAdd} />}
    </div>
  )
}