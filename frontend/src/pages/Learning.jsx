import { useEffect, useState } from 'react'
import { learningApi } from '../api'
import { Plus, X, Clock, Brain, Wifi, Cpu, BookOpen } from 'lucide-react'

// ── Constants ──────────────────────────────────────────────────────────────────

const DOMAINS = [
  { id: 'Programmation', icon: Cpu,      color: '#7B6FD0' },
  { id: 'Réseau',        icon: Wifi,     color: '#2dd4bf' },
  { id: 'IA',            icon: Brain,    color: '#fb923c' },
  { id: 'Autre',         icon: BookOpen, color: '#a78bfa' },
]

const LEVELS = [
  { value: 1, label: '😵 Confus' },
  { value: 2, label: '🤔 Flou' },
  { value: 3, label: '🙂 Ok' },
  { value: 4, label: '😎 Bien' },
  { value: 5, label: '🔥 Maîtrisé' },
]

// ── Helpers ────────────────────────────────────────────────────────────────────

function Label({ children }) {
  return <p className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--accent)' }}>{children}</p>
}

function DomainDot({ domain }) {
  const cfg = DOMAINS.find(d => d.id === domain) || DOMAINS[3]
  return <span className="w-2 h-2 rounded-full flex-shrink-0 inline-block" style={{ background: cfg.color }} />
}

function formatMin(min) {
  const m = Number(min)
  if (m < 60) return `${m}min`
  return `${Math.floor(m / 60)}h${m % 60 > 0 ? `${m % 60}` : ''}`
}

// ── AddSessionModal ────────────────────────────────────────────────────────────

function AddSessionModal({ onClose, onAdd }) {
  const [form, setForm] = useState({
    domain:       'Programmation',
    subdomain:    '',
    duration_min: '',
    content:      '',
    resource:     '',
    level:        3,
    session_date: new Date().toISOString().split('T')[0],
  })
  const [saving, setSaving] = useState(false)

  const handle = async () => {
    if (!form.duration_min) return
    setSaving(true)
    try {
      const s = await learningApi.create({ ...form, duration_min: Number(form.duration_min) })
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

        {/* Domaine */}
        <Label>Domaine</Label>
        <div className="flex gap-2 mb-4 flex-wrap">
          {DOMAINS.map(d => (
            <button key={d.id} onClick={() => setForm(f => ({ ...f, domain: d.id }))}
              className="px-3 py-1.5 rounded-full text-xs font-semibold transition"
              style={{
                background: form.domain === d.id ? d.color + '20' : 'var(--bg3)',
                color:      form.domain === d.id ? d.color : 'var(--muted)',
                border:     form.domain === d.id ? `1px solid ${d.color}40` : '1px solid transparent',
              }}>
              {d.id}
            </button>
          ))}
        </div>

        {/* Sous-domaine */}
        <Label>Sous-domaine</Label>
        <input value={form.subdomain} onChange={e => setForm(f => ({ ...f, subdomain: e.target.value }))}
          placeholder="ex: React hooks, VLAN, LLM fine-tuning…"
          className="w-full px-4 py-2.5 rounded-2xl text-sm outline-none mb-4"
          style={{ background: 'var(--bg3)', color: 'var(--text)', border: 'var(--glass-border)' }} />

        {/* Durée + date */}
        <div className="flex gap-3 mb-4">
          <div className="flex-1">
            <Label>Durée (min)</Label>
            <input type="number" value={form.duration_min}
              onChange={e => setForm(f => ({ ...f, duration_min: e.target.value }))}
              placeholder="60"
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

        {/* Ce qui a été fait */}
        <Label>Ce que j'ai fait / compris</Label>
        <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
          placeholder="Décris ce que tu as travaillé…"
          rows={3}
          className="w-full px-4 py-3 rounded-2xl text-sm outline-none resize-none mb-4"
          style={{ background: 'var(--bg3)', color: 'var(--text)', border: 'var(--glass-border)' }} />

        {/* Ressource */}
        <Label>Ressource utilisée</Label>
        <input value={form.resource} onChange={e => setForm(f => ({ ...f, resource: e.target.value }))}
          placeholder="Udemy, YouTube, doc officielle…"
          className="w-full px-4 py-2.5 rounded-2xl text-sm outline-none mb-4"
          style={{ background: 'var(--bg3)', color: 'var(--text)', border: 'var(--glass-border)' }} />

        {/* Niveau de compréhension */}
        <Label>Niveau de compréhension</Label>
        <div className="flex gap-2 mb-5 flex-wrap">
          {LEVELS.map(l => (
            <button key={l.value} onClick={() => setForm(f => ({ ...f, level: l.value }))}
              className="px-3 py-1.5 rounded-full text-xs font-semibold transition"
              style={{
                background: form.level === l.value ? 'var(--accent-bg)' : 'var(--bg3)',
                color:      form.level === l.value ? 'var(--accent)' : 'var(--muted)',
                border:     form.level === l.value ? '1px solid rgba(123,111,208,0.3)' : '1px solid transparent',
              }}>
              {l.label}
            </button>
          ))}
        </div>

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
  const cfg   = DOMAINS.find(d => d.id === session.domain) || DOMAINS[3]
  const Icon  = cfg.icon
  const level = LEVELS.find(l => l.value === Number(session.level))

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
              {session.subdomain || session.domain}
            </p>
            <span className="text-xs font-bold" style={{ color: cfg.color }}>
              {formatMin(session.duration_min)}
            </span>
          </div>
          {session.subdomain && (
            <p className="text-[10px] mb-1" style={{ color: cfg.color }}>{session.domain}</p>
          )}
          {session.content && (
            <p className="text-xs leading-relaxed line-clamp-2 mb-1" style={{ color: 'var(--text2)' }}>
              {session.content}
            </p>
          )}
          <div className="flex items-center justify-between mt-1">
            <p className="text-[10px]" style={{ color: 'var(--muted)' }}>
              {new Date(session.session_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
              {session.resource && ` · ${session.resource}`}
            </p>
            {level && <span className="text-[10px]">{level.label}</span>}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Learning ───────────────────────────────────────────────────────────────────

export default function Learning() {
  const [sessions, setSessions] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [showAdd,  setShowAdd]  = useState(false)
  const [filter,   setFilter]   = useState('all')

  useEffect(() => {
    learningApi.list().then(setSessions).catch(console.error).finally(() => setLoading(false))
  }, [])

  const handleAdd = (s) => setSessions(p => [s, ...p])

  // Stats
  const totalMin = sessions.reduce((a, s) => a + Number(s.duration_min), 0)
  const domains  = {}
  sessions.forEach(s => { domains[s.domain] = (domains[s.domain] || 0) + Number(s.duration_min) })
  const topDomain = Object.entries(domains).sort((a, b) => b[1] - a[1])[0]

  // Filtre
  const filtered = filter === 'all' ? sessions : sessions.filter(s => s.domain === filter)

  return (
    <div className="px-4 w-full max-w-lg mx-auto" style={{ paddingTop: '24px', paddingBottom: '120px' }}>

      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>Apprentissage</h1>
          {!loading && (
            <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>
              {formatMin(totalMin)} au total
              {topDomain && <span style={{ color: 'var(--accent)' }}> · {topDomain[0]} en tête</span>}
            </p>
          )}
        </div>
        <button onClick={() => setShowAdd(true)}
          className="w-10 h-10 rounded-2xl flex items-center justify-center"
          style={{ background: 'var(--accent)', boxShadow: '0 4px 12px rgba(123,111,208,0.3)' }}>
          <Plus size={18} color="white" />
        </button>
      </div>

      {/* Stats par domaine */}
      {!loading && Object.keys(domains).length > 0 && (
        <div className="glass rounded-3xl p-4 mb-4 space-y-2">
          <Label>Par domaine</Label>
          {Object.entries(domains).sort((a, b) => b[1] - a[1]).map(([domain, min]) => {
            const cfg = DOMAINS.find(d => d.id === domain) || DOMAINS[3]
            const pct = Math.round((min / totalMin) * 100)
            return (
              <div key={domain}>
                <div className="flex justify-between text-xs mb-1">
                  <span style={{ color: 'var(--text)' }}>{domain}</span>
                  <span style={{ color: 'var(--muted)' }}>{formatMin(min)}</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg4)' }}>
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: cfg.color }} />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Filtres */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {[{ id: 'all', label: 'Toutes' }, ...DOMAINS.map(d => ({ id: d.id, label: d.id }))].map(f => (
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
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ background: 'var(--bg2)' }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass rounded-3xl p-8 text-center">
          <p className="text-3xl mb-3">🧠</p>
          <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text)' }}>Aucune session</p>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>Enregistre ta première session</p>
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