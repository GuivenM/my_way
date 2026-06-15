import { useEffect, useState } from 'react'
import { booksApi } from '../api'
import { Plus, X, Check, BookOpen, Clock, Pause, Ban } from 'lucide-react'

// ── Constants ──────────────────────────────────────────────────────────────────

const PHASES = [
  { id: 1, label: 'Déciller',                color: '#7B6FD0' },
  { id: 2, label: 'Comprendre les humains',  color: '#2dd4bf' },
  { id: 3, label: 'Se construire',           color: '#fb923c' },
  { id: 4, label: 'Comprendre les systèmes', color: '#f472b6' },
  { id: 5, label: 'Théorie politique',       color: '#a78bfa' },
  { id: 6, label: 'Stratégie avancée',       color: '#34d399' },
  { id: 7, label: 'Biographies',             color: '#fbbf24' },
]

const STATUS_CFG = {
  to_read:   { label: 'À lire',   icon: BookOpen, color: 'var(--muted)',   bg: 'var(--bg3)' },
  reading:   { label: 'En cours', icon: Clock,    color: 'var(--accent)',  bg: 'var(--accent-bg)' },
  done:      { label: 'Terminé',  icon: Check,    color: 'var(--done)',    bg: 'var(--done-bg)' },
  paused:    { label: 'Pausé',    icon: Pause,    color: 'var(--partial)', bg: 'var(--partial-bg)' },
  abandoned: { label: 'Abandonné',icon: Ban,      color: 'var(--skip)',    bg: 'var(--skip-bg)' },
}

const STATUS_ORDER = ['reading', 'to_read', 'paused', 'done', 'abandoned']

// ── Helpers ────────────────────────────────────────────────────────────────────

function Label({ children }) {
  return <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--accent)' }}>{children}</p>
}

function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status] || STATUS_CFG.to_read
  const Icon = cfg.icon
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
      style={{ background: cfg.bg, color: cfg.color }}>
      <Icon size={9} strokeWidth={2.5} />{cfg.label}
    </span>
  )
}

// ── BookRow ────────────────────────────────────────────────────────────────────

function BookRow({ book, onStatusChange }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="rounded-2xl overflow-hidden transition-all"
      style={{ background: 'var(--bg3)', border: 'var(--glass-border)' }}>
      {/* Header */}
      <button className="w-full flex items-start gap-3 p-3 text-left"
        onClick={() => setOpen(o => !o)}>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold leading-snug truncate"
            style={{ color: 'var(--text)', textDecoration: book.status === 'abandoned' ? 'line-through' : 'none' }}>
            {book.title}
          </p>
          <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--muted)' }}>{book.author}</p>
        </div>
        <StatusBadge status={book.status} />
      </button>

      {/* Expanded — changer statut */}
      {open && (
        <div className="px-3 pb-3 flex flex-wrap gap-1.5">
          {STATUS_ORDER.map(s => {
            const cfg = STATUS_CFG[s]
            return (
              <button key={s}
                onClick={() => { onStatusChange(book.id, s); setOpen(false) }}
                className="text-[10px] font-semibold px-2.5 py-1 rounded-full transition"
                style={{
                  background: book.status === s ? cfg.bg : 'var(--bg4)',
                  color:      book.status === s ? cfg.color : 'var(--muted)',
                  border:     book.status === s ? `1px solid ${cfg.color}30` : '1px solid transparent',
                }}>
                {cfg.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── PhaseCard ──────────────────────────────────────────────────────────────────

function PhaseCard({ phase, books, onStatusChange }) {
  const total   = books.length
  const done    = books.filter(b => b.status === 'done').length
  const reading = books.filter(b => b.status === 'reading').length
  const pct     = total > 0 ? Math.round((done / total) * 100) : 0
  const [collapsed, setCollapsed] = useState(phase.id > 2)

  return (
    <div className="glass rounded-3xl overflow-hidden">
      {/* Phase header */}
      <button className="w-full flex items-center gap-3 p-4 text-left"
        onClick={() => setCollapsed(c => !c)}>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold text-white"
          style={{ background: phase.color }}>
          {phase.id}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{phase.label}</p>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'var(--bg4)' }}>
              <div className="h-full rounded-full transition-all"
                style={{ width: `${pct}%`, background: phase.color }} />
            </div>
            <span className="text-[10px] flex-shrink-0" style={{ color: 'var(--muted)' }}>
              {done}/{total}
              {reading > 0 && <span style={{ color: phase.color }}> · {reading} en cours</span>}
            </span>
          </div>
        </div>
        <span className="text-xs" style={{ color: 'var(--muted)', transform: collapsed ? 'none' : 'rotate(180deg)', display: 'inline-block', transition: 'transform 0.2s' }}>▾</span>
      </button>

      {/* Books list */}
      {!collapsed && (
        <div className="px-3 pb-3 space-y-1.5">
          {books
            .sort((a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status))
            .map(book => (
              <BookRow key={book.id} book={book} onStatusChange={onStatusChange} />
            ))
          }
        </div>
      )}
    </div>
  )
}

// ── AddBookModal ───────────────────────────────────────────────────────────────

function AddBookModal({ onClose, onAdd }) {
  const [form, setForm] = useState({ title: '', author: '', phase: 1, status: 'to_read' })
  const [saving, setSaving] = useState(false)

  const handle = async () => {
    if (!form.title.trim()) return
    setSaving(true)
    try {
      const book = await booksApi.create(form)
      onAdd(book)
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-lg rounded-t-3xl p-5 space-y-4"
        style={{ background: 'var(--bg)', borderTop: 'var(--glass-border)' }}>
        <div className="flex items-center justify-between">
          <p className="text-base font-bold" style={{ color: 'var(--text)' }}>Ajouter un livre</p>
          <button onClick={onClose}><X size={18} style={{ color: 'var(--muted)' }} /></button>
        </div>

        <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          placeholder="Titre" autoFocus
          className="w-full px-4 py-2.5 rounded-2xl text-sm outline-none"
          style={{ background: 'var(--bg3)', color: 'var(--text)', border: 'var(--glass-border)' }} />

        <input value={form.author} onChange={e => setForm(f => ({ ...f, author: e.target.value }))}
          placeholder="Auteur"
          className="w-full px-4 py-2.5 rounded-2xl text-sm outline-none"
          style={{ background: 'var(--bg3)', color: 'var(--text)', border: 'var(--glass-border)' }} />

        <div className="flex gap-2">
          <div className="flex-1">
            <p className="text-xs mb-1.5" style={{ color: 'var(--muted)' }}>Phase</p>
            <select value={form.phase} onChange={e => setForm(f => ({ ...f, phase: Number(e.target.value) }))}
              className="w-full px-3 py-2.5 rounded-2xl text-sm outline-none"
              style={{ background: 'var(--bg3)', color: 'var(--text)', border: 'var(--glass-border)' }}>
              {PHASES.map(p => <option key={p.id} value={p.id}>Phase {p.id} — {p.label}</option>)}
            </select>
          </div>
          <div className="flex-1">
            <p className="text-xs mb-1.5" style={{ color: 'var(--muted)' }}>Statut</p>
            <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-2xl text-sm outline-none"
              style={{ background: 'var(--bg3)', color: 'var(--text)', border: 'var(--glass-border)' }}>
              {Object.entries(STATUS_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
        </div>

        <button onClick={handle} disabled={saving || !form.title.trim()}
          className="w-full py-3 rounded-2xl text-sm font-semibold transition"
          style={{
            background: 'var(--accent)', color: 'white',
            opacity: saving || !form.title.trim() ? 0.6 : 1,
            boxShadow: '0 4px 16px rgba(123,111,208,0.3)',
          }}>
          {saving ? 'Ajout…' : 'Ajouter'}
        </button>
      </div>
    </div>
  )
}

// ── Books ──────────────────────────────────────────────────────────────────────

export default function Books() {
  const [books, setBooks]     = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [filter, setFilter]   = useState('all')

  useEffect(() => {
    booksApi.list().then(setBooks).catch(console.error).finally(() => setLoading(false))
  }, [])

  const handleStatusChange = async (id, status) => {
    setBooks(p => p.map(b => b.id === id ? { ...b, status } : b))
    await booksApi.update(id, { status })
  }

  const handleAdd = (book) => setBooks(p => [...p, book])

  // Stats globales
  const total   = books.length
  const done    = books.filter(b => b.status === 'done').length
  const reading = books.filter(b => b.status === 'reading').length

  // Filtrer
  const filtered = filter === 'all' ? books : books.filter(b => b.status === filter)

  // Grouper par phase
  const byPhase = PHASES.map(p => ({
    phase: p,
    books: filtered.filter(b => Number(b.phase) === p.id),
  })).filter(g => g.books.length > 0)

  const unphased = filtered.filter(b => !b.phase)

  return (
    <div className="px-4 w-full max-w-lg mx-auto" style={{ paddingTop: '24px', paddingBottom: '120px' }}>

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>Bibliothèque</h1>
          {!loading && (
            <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>
              {done}/{total} terminés
              {reading > 0 && <span style={{ color: 'var(--accent)' }}> · {reading} en cours</span>}
            </p>
          )}
        </div>
        <button onClick={() => setShowAdd(true)}
          className="w-10 h-10 rounded-2xl flex items-center justify-center"
          style={{ background: 'var(--accent)', boxShadow: '0 4px 12px rgba(123,111,208,0.3)' }}>
          <Plus size={18} color="white" />
        </button>
      </div>

      {/* Filtres */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {[
          { id: 'all',     label: 'Tous' },
          { id: 'reading', label: 'En cours' },
          { id: 'to_read', label: 'À lire' },
          { id: 'done',    label: 'Terminés' },
          { id: 'paused',  label: 'Pausés' },
        ].map(f => (
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

      {/* Contenu */}
      {loading ? (
        <div className="space-y-3">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="h-20 rounded-3xl animate-pulse" style={{ background: 'var(--bg2)' }} />
          ))}
        </div>
      ) : books.length === 0 ? (
        <div className="glass rounded-3xl p-8 text-center">
          <p className="text-3xl mb-3">📚</p>
          <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text)' }}>Aucun livre</p>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>Ajoute ton premier livre</p>
        </div>
      ) : (
        <div className="space-y-3">
          {byPhase.map(({ phase, books: phaseBooks }) => (
            <PhaseCard key={phase.id} phase={phase} books={phaseBooks} onStatusChange={handleStatusChange} />
          ))}
          {unphased.length > 0 && (
            <div className="glass rounded-3xl p-4">
              <Label>Sans phase</Label>
              <div className="space-y-1.5">
                {unphased.map(b => <BookRow key={b.id} book={b} onStatusChange={handleStatusChange} />)}
              </div>
            </div>
          )}
        </div>
      )}

      {showAdd && <AddBookModal onClose={() => setShowAdd(false)} onAdd={handleAdd} />}
    </div>
  )
}