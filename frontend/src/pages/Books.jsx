import { useEffect, useState } from 'react'
import { booksApi } from '../api'
import { Plus, X, Check, BookOpen, Clock, Pause, Ban, Quote, ChevronLeft, Trash2 } from 'lucide-react'

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
  to_read:   { label: 'À lire',    icon: BookOpen, color: 'var(--muted)',   bg: 'var(--bg3)' },
  reading:   { label: 'En cours',  icon: Clock,    color: 'var(--accent)',  bg: 'var(--accent-bg)' },
  done:      { label: 'Terminé',   icon: Check,    color: 'var(--done)',    bg: 'var(--done-bg)' },
  paused:    { label: 'Pausé',     icon: Pause,    color: 'var(--partial)', bg: 'var(--partial-bg)' },
  abandoned: { label: 'Abandonné', icon: Ban,      color: 'var(--skip)',    bg: 'var(--skip-bg)' },
}

const STATUS_ORDER = ['reading', 'to_read', 'paused', 'done', 'abandoned']

// ── Helpers ────────────────────────────────────────────────────────────────────

function Label({ children }) {
  return <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--accent)', marginBottom: '8px' }}>{children}</p>
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

// ── BookDetail — plein écran avec citations ────────────────────────────────────

function BookDetail({ book, onClose, onStatusChange }) {
  const [quotes,   setQuotes]   = useState([])
  const [loading,  setLoading]  = useState(true)
  const [newQuote, setNewQuote] = useState('')
  const [saving,   setSaving]   = useState(false)
  const [tab,      setTab]      = useState('status')

  useEffect(() => {
    booksApi.quotes.list(book.id)
      .then(setQuotes)
      .catch(() => setQuotes([]))
      .finally(() => setLoading(false))
  }, [book.id])

  const handleAddQuote = async () => {
    if (!newQuote.trim()) return
    setSaving(true)
    try {
      const q = await booksApi.quotes.create(book.id, { content: newQuote.trim() })
      setQuotes(p => [...p, q])
      setNewQuote('')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteQuote = async (id) => {
    setQuotes(p => p.filter(q => q.id !== id))
    await booksApi.quotes.delete(id)
  }

  const phase = PHASES.find(p => p.id === Number(book.phase))

  return (
    <div className="fixed inset-0 z-50 flex flex-col"
      style={{ background: 'var(--bg)' }}>

      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-8 pb-4"
        style={{ borderBottom: '1px solid rgba(123,111,208,0.08)' }}>
        <button onClick={onClose} className="p-2 rounded-2xl" style={{ background: 'var(--bg3)' }}>
          <ChevronLeft size={18} style={{ color: 'var(--muted)' }} />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-base font-bold truncate" style={{ color: 'var(--text)' }}>{book.title}</p>
          <p className="text-xs truncate" style={{ color: 'var(--muted)' }}>{book.author}</p>
        </div>
        {phase && (
          <span className="text-[10px] font-bold px-2 py-1 rounded-full flex-shrink-0"
            style={{ background: phase.color + '20', color: phase.color }}>
            Phase {phase.id}
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 px-4 py-3">
        {[{ id: 'status', label: 'Statut' }, { id: 'quotes', label: `Citations (${quotes.length})` }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="px-4 py-1.5 rounded-full text-sm font-semibold transition"
            style={{
              background: tab === t.id ? 'var(--accent)' : 'var(--bg2)',
              color:      tab === t.id ? 'white' : 'var(--muted)',
              boxShadow:  tab === t.id ? '0 4px 12px rgba(123,111,208,0.25)' : 'none',
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Contenu scrollable */}
      <div className="flex-1 overflow-y-auto px-4 pb-8">

        {tab === 'status' && (
          <div className="space-y-2 mt-2">
            <p className="text-xs mb-3" style={{ color: 'var(--muted)' }}>Changer le statut de lecture</p>
            {STATUS_ORDER.map(s => {
              const cfg = STATUS_CFG[s]
              const Icon = cfg.icon
              const active = book.status === s
              return (
                <button key={s}
                  onClick={() => { onStatusChange(book.id, s); onClose() }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition"
                  style={{
                    background: active ? cfg.bg : 'var(--bg2)',
                    border: active ? `1px solid ${cfg.color}30` : '1px solid transparent',
                  }}>
                  <Icon size={16} style={{ color: active ? cfg.color : 'var(--muted)' }} />
                  <span className="text-sm font-semibold"
                    style={{ color: active ? cfg.color : 'var(--text)' }}>{cfg.label}</span>
                  {active && <Check size={14} style={{ color: cfg.color, marginLeft: 'auto' }} />}
                </button>
              )
            })}
          </div>
        )}

        {tab === 'quotes' && (
          <div className="mt-2 space-y-4">
            {/* Ajouter une citation */}
            <div className="glass rounded-3xl p-4">
              <Label>Nouvelle citation</Label>
              <textarea
                value={newQuote}
                onChange={e => setNewQuote(e.target.value)}
                placeholder="Colle ou écris la citation ici…"
                rows={4}
                className="w-full text-sm leading-relaxed resize-none outline-none rounded-2xl p-3 mb-3"
                style={{ background: 'var(--bg3)', color: 'var(--text)', border: 'var(--glass-border)' }}
              />
              <button onClick={handleAddQuote} disabled={saving || !newQuote.trim()}
                className="w-full py-2.5 rounded-2xl text-sm font-semibold transition"
                style={{
                  background: 'var(--accent)', color: 'white',
                  opacity: saving || !newQuote.trim() ? 0.5 : 1,
                  boxShadow: '0 4px 12px rgba(123,111,208,0.25)',
                }}>
                {saving ? 'Ajout…' : 'Ajouter la citation'}
              </button>
            </div>

            {/* Liste des citations */}
            {loading ? (
              <div className="h-20 rounded-3xl animate-pulse" style={{ background: 'var(--bg2)' }} />
            ) : quotes.length === 0 ? (
              <div className="text-center py-8">
                <Quote size={28} style={{ color: 'var(--muted)', margin: '0 auto 8px' }} />
                <p className="text-sm" style={{ color: 'var(--muted)' }}>Aucune citation pour l'instant</p>
              </div>
            ) : (
              <div className="space-y-3">
                {quotes.map(q => (
                  <div key={q.id} className="glass rounded-3xl p-4 group">
                    <p className="text-sm leading-relaxed italic mb-2" style={{ color: 'var(--text2)' }}>
                      "{q.content}"
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-[10px]" style={{ color: 'var(--muted)' }}>
                        {new Date(q.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                      <button onClick={() => handleDeleteQuote(q.id)}
                        className="opacity-0 group-hover:opacity-100 transition"
                        style={{ color: 'var(--skip)' }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ── BookRow ────────────────────────────────────────────────────────────────────

function BookRow({ book, onStatusChange, onOpen }) {
  return (
    <div className="rounded-lg overflow-hidden transition-all"
      style={{ background: 'var(--bg3)', border: 'var(--glass-border)', marginBottom: '6px' }}>
      <button className="w-full flex items-start gap-3 p-3 text-left"
        onClick={() => onOpen(book)}>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold leading-snug truncate"
            style={{ color: 'var(--text)', textDecoration: book.status === 'abandoned' ? 'line-through' : 'none' }}>
            {book.title}
          </p>
          <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--muted)' }}>{book.author}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {book.quotes_count > 0 && (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
              style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>
              {book.quotes_count} ✦
            </span>
          )}
          <StatusBadge status={book.status} />
        </div>
      </button>
    </div>
  )
}

// ── PhaseCard ──────────────────────────────────────────────────────────────────

function PhaseCard({ phase, books, onStatusChange, onOpen }) {
  const total   = books.length
  const done    = books.filter(b => b.status === 'done').length
  const reading = books.filter(b => b.status === 'reading').length
  const pct     = total > 0 ? Math.round((done / total) * 100) : 0
  const [collapsed, setCollapsed] = useState(phase.id > 2)

  return (
    <div className="glass rounded-xl overflow-hidden" style={{ padding: '8px', marginTop: '12px' }}>
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
        <span style={{ color: 'var(--muted)', transform: collapsed ? 'none' : 'rotate(180deg)', display: 'inline-block', transition: 'transform 0.2s', fontSize: '12px' }}>▾</span>
      </button>

      {!collapsed && (
        <div className="px-3 pb-3">
          {books
            .sort((a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status))
            .map(book => (
              <BookRow key={book.id} book={book} onStatusChange={onStatusChange} onOpen={onOpen} />
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
    try { const book = await booksApi.create(form); onAdd(book); onClose() }
    finally { setSaving(false) }
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
          style={{ background: 'var(--accent)', color: 'white', opacity: saving || !form.title.trim() ? 0.6 : 1 }}>
          {saving ? 'Ajout…' : 'Ajouter'}
        </button>
      </div>
    </div>
  )
}

// ── Books ──────────────────────────────────────────────────────────────────────

export default function Books() {
  const [books,      setBooks]      = useState([])
  const [loading,    setLoading]    = useState(true)
  const [showAdd,    setShowAdd]    = useState(false)
  const [filter,     setFilter]     = useState('all')
  const [activeBook, setActiveBook] = useState(null)

  useEffect(() => {
    booksApi.list().then(setBooks).catch(console.error).finally(() => setLoading(false))
  }, [])

  const handleStatusChange = async (id, status) => {
    setBooks(p => p.map(b => b.id === id ? { ...b, status } : b))
    await booksApi.update(id, { status })
  }

  const handleAdd = (book) => setBooks(p => [...p, book])

  const total   = books.length
  const done    = books.filter(b => b.status === 'done').length
  const reading = books.filter(b => b.status === 'reading').length
  const filtered = filter === 'all' ? books : books.filter(b => b.status === filter)
  const byPhase  = PHASES.map(p => ({ phase: p, books: filtered.filter(b => Number(b.phase) === p.id) }))
                         .filter(g => g.books.length > 0)
  const unphased = filtered.filter(b => !b.phase)

  return (
    <>
      <div className="px-4 w-full max-w-lg mx-auto" style={{ padding: '16px', paddingBottom: '120px' }}>
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
        <div className="flex gap-2 overflow-x-auto pb-1">
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
                marginTop:  '8px',
              }}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Contenu */}
        {loading ? (
          <div className="space-y-3 mt-4">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="h-20 rounded-3xl animate-pulse" style={{ background: 'var(--bg2)' }} />
            ))}
          </div>
        ) : books.length === 0 ? (
          <div className="glass rounded-3xl p-8 text-center mt-6">
            <p className="text-3xl mb-3">📚</p>
            <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text)' }}>Aucun livre</p>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>Ajoute ton premier livre</p>
          </div>
        ) : (
          <div>
            {byPhase.map(({ phase, books: phaseBooks }) => (
              <PhaseCard key={phase.id} phase={phase} books={phaseBooks}
                onStatusChange={handleStatusChange} onOpen={setActiveBook} />
            ))}
            {unphased.length > 0 && (
              <div className="glass rounded-3xl p-4 mt-3">
                <Label>Sans phase</Label>
                {unphased.map(b => <BookRow key={b.id} book={b} onStatusChange={handleStatusChange} onOpen={setActiveBook} />)}
              </div>
            )}
          </div>
        )}
      </div>

      {showAdd && <AddBookModal onClose={() => setShowAdd(false)} onAdd={handleAdd} />}

      {activeBook && (
        <BookDetail
          book={activeBook}
          onClose={() => setActiveBook(null)}
          onStatusChange={(id, status) => {
            handleStatusChange(id, status)
            setActiveBook(b => ({ ...b, status }))
          }}
        />
      )}
    </>
  )
}