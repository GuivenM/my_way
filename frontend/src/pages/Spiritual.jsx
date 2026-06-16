import { useEffect, useState } from 'react'
import { spiritualApi } from '../api'
import { Plus, X, Check, Settings } from 'lucide-react'

// ── Helpers ────────────────────────────────────────────────────────────────────

function Label({ children }) {
  return <p className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--accent)' }}>{children}</p>
}

// ── PracticeToggle ─────────────────────────────────────────────────────────────

function PracticeToggle({ practice, onToggle }) {
  const [saving, setSaving] = useState(false)

  const handle = async () => {
    setSaving(true)
    try { await onToggle(practice.practice_id, !practice.done, practice.notes) }
    finally { setSaving(false) }
  }

  return (
    <div className="glass rounded-2xl p-4 flex items-center gap-4">
      <button onClick={handle} disabled={saving}
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition"
        style={{
          background: practice.done ? 'var(--accent)' : 'var(--bg3)',
          border:     practice.done ? 'none' : '2px solid rgba(123,111,208,0.2)',
          boxShadow:  practice.done ? '0 4px 12px rgba(123,111,208,0.3)' : 'none',
        }}>
        {practice.done
          ? <Check size={18} color="white" strokeWidth={2.5} />
          : <span className="w-2 h-2 rounded-full" style={{ background: 'var(--muted)' }} />
        }
      </button>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold" style={{
          color: practice.done ? 'var(--text)' : 'var(--text2)',
        }}>
          {practice.name}
        </p>
        {practice.done && (
          <p className="text-[10px]" style={{ color: 'var(--accent)' }}>Accompli aujourd'hui</p>
        )}
      </div>
    </div>
  )
}

// ── AddPracticeModal ───────────────────────────────────────────────────────────

function AddPracticeModal({ onClose, onAdd }) {
  const [name,   setName]   = useState('')
  const [saving, setSaving] = useState(false)

  const handle = async () => {
    if (!name.trim()) return
    setSaving(true)
    try {
      const p = await spiritualApi.practices.create({ name: name.trim() })
      onAdd(p)
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-lg rounded-t-3xl p-5"
        style={{ background: 'var(--bg)', borderTop: 'var(--glass-border)' }}>

        <div className="flex items-center justify-between mb-4">
          <p className="text-base font-bold" style={{ color: 'var(--text)' }}>Nouvelle pratique</p>
          <button onClick={onClose}><X size={18} style={{ color: 'var(--muted)' }} /></button>
        </div>

        <p className="text-xs mb-4" style={{ color: 'var(--muted)' }}>
          Définis toi-même ce que tu pratiques — liturgie, méditation, lecture sacrée, travail hermétique, etc.
        </p>

        <input value={name} onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handle()}
          placeholder="Nom de la pratique…" autoFocus
          className="w-full px-4 py-2.5 rounded-2xl text-sm outline-none mb-4"
          style={{ background: 'var(--bg3)', color: 'var(--text)', border: 'var(--glass-border)' }} />

        <button onClick={handle} disabled={saving || !name.trim()}
          className="w-full py-3 rounded-2xl text-sm font-semibold transition"
          style={{
            background: 'var(--accent)', color: 'white',
            opacity: saving || !name.trim() ? 0.6 : 1,
            boxShadow: '0 4px 16px rgba(123,111,208,0.3)',
          }}>
          {saving ? 'Ajout…' : 'Ajouter'}
        </button>
      </div>
    </div>
  )
}

// ── ManagePracticesModal ───────────────────────────────────────────────────────

function ManagePracticesModal({ practices, onClose, onToggleActive }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-lg rounded-t-3xl p-5"
        style={{ background: 'var(--bg)', borderTop: 'var(--glass-border)', maxHeight: '80vh', overflowY: 'auto' }}>

        <div className="flex items-center justify-between mb-4">
          <p className="text-base font-bold" style={{ color: 'var(--text)' }}>Gérer les pratiques</p>
          <button onClick={onClose}><X size={18} style={{ color: 'var(--muted)' }} /></button>
        </div>

        <div className="space-y-2">
          {practices.map(p => (
            <div key={p.id} className="flex items-center justify-between px-4 py-3 rounded-2xl"
              style={{ background: 'var(--bg3)' }}>
              <p className="text-sm font-medium" style={{ color: p.active ? 'var(--text)' : 'var(--muted)' }}>
                {p.name}
              </p>
              <button onClick={() => onToggleActive(p.id, !p.active)}
                className="text-xs font-semibold px-3 py-1 rounded-full transition"
                style={{
                  background: p.active ? 'var(--done-bg)' : 'var(--bg4)',
                  color:      p.active ? 'var(--done)'    : 'var(--muted)',
                }}>
                {p.active ? 'Active' : 'Inactive'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Spiritual ──────────────────────────────────────────────────────────────────

export default function Spiritual() {
  const [todayData,  setTodayData]  = useState(null)
  const [allPractices, setAllPractices] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [showAdd,    setShowAdd]    = useState(false)
  const [showManage, setShowManage] = useState(false)
  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    Promise.all([
      spiritualApi.logs.today(),
      spiritualApi.practices.list(),
    ]).then(([td, pr]) => {
      setTodayData(td)
      setAllPractices(pr)
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  const handleToggle = async (practiceId, done) => {
    await spiritualApi.logs.toggle({ practice_id: practiceId, done, date: today })
    // Refresh
    const fresh = await spiritualApi.logs.today()
    setTodayData(fresh)
  }

  const handleAddPractice = (p) => {
    setAllPractices(prev => [...prev, p])
    // Refresh today
    spiritualApi.logs.today().then(setTodayData)
  }

  const handleToggleActive = async (id, active) => {
    await spiritualApi.practices.update(id, { active })
    setAllPractices(p => p.map(pr => pr.id === id ? { ...pr, active } : pr))
    spiritualApi.logs.today().then(setTodayData)
  }

  const practices = todayData?.practices ?? []
  const done      = practices.filter(p => p.done).length
  const total     = practices.length

  const dateStr = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long'
  })

  return (
    <div className="px-4 w-full max-w-lg mx-auto" style={{ paddingTop: '24px', paddingBottom: '120px' }}>

      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>Spiritualité</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>{dateStr}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowManage(true)}
            className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ background: 'var(--bg2)', border: 'var(--glass-border)' }}>
            <Settings size={16} style={{ color: 'var(--muted)' }} />
          </button>
          <button onClick={() => setShowAdd(true)}
            className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ background: 'var(--accent)', boxShadow: '0 4px 12px rgba(123,111,208,0.3)' }}>
            <Plus size={18} color="white" />
          </button>
        </div>
      </div>

      {/* Progression du jour */}
      {!loading && total > 0 && (
        <div className="glass rounded-3xl p-4 mb-5 mt-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
              {done}/{total} accomplis
            </p>
            <span className="text-xs font-bold" style={{ color: done === total ? 'var(--done)' : 'var(--accent)' }}>
              {done === total ? '✦ Complet' : `${Math.round((done / total) * 100)}%`}
            </span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg4)' }}>
            <div className="h-full rounded-full transition-all"
              style={{
                width: `${total > 0 ? (done / total) * 100 : 0}%`,
                background: done === total ? 'var(--done)' : 'var(--accent)',
              }} />
          </div>
        </div>
      )}

      {/* Pratiques du jour */}
      {loading ? (
        <div className="space-y-3">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="h-16 rounded-2xl animate-pulse" style={{ background: 'var(--bg2)' }} />
          ))}
        </div>
      ) : practices.length === 0 ? (
        <div className="glass rounded-3xl p-8 text-center mt-4">
          <p className="text-3xl mb-3">✦</p>
          <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text)' }}>Aucune pratique définie</p>
          <p className="text-xs mb-4" style={{ color: 'var(--muted)' }}>
            Définis tes propres pratiques — liturgie, méditation, étude de textes…
          </p>
          <button onClick={() => setShowAdd(true)}
            className="px-4 py-2 rounded-2xl text-sm font-semibold"
            style={{ background: 'var(--accent)', color: 'white' }}>
            Ajouter une pratique
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <Label>Aujourd'hui</Label>
          {practices.map(p => (
            <PracticeToggle key={p.practice_id} practice={p} onToggle={handleToggle} />
          ))}
        </div>
      )}

      {showAdd    && <AddPracticeModal    onClose={() => setShowAdd(false)}    onAdd={handleAddPractice} />}
      {showManage && <ManagePracticesModal practices={allPractices} onClose={() => setShowManage(false)} onToggleActive={handleToggleActive} />}
    </div>
  )
}