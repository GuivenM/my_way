import { useEffect, useState } from 'react'
import { blocksApi } from '../api'
import { Check, Minus, X } from 'lucide-react'

function Label({ children }) {
  return <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--accent)' }}>{children}</p>
}

const STATUS = {
  done:    { label: 'Fait',    color: 'var(--done)',    bg: 'var(--done-bg)' },
  partial: { label: 'Partiel', color: 'var(--partial)', bg: 'var(--partial-bg)' },
  skipped: { label: 'Sauté',   color: 'var(--skip)',    bg: 'var(--skip-bg)' },
  pending: { label: 'À faire', color: 'var(--muted)',   bg: 'transparent' },
}

function BlockCard({ block, onUpdate }) {
  const [saving, setSaving] = useState(false)
  const cfg = STATUS[block.status] || STATUS.pending

  const handle = async (status) => {
    setSaving(true)
    try { await onUpdate(block.block_id, status) } finally { setSaving(false) }
  }

  return (
    <div className="glass rounded-3xl p-4 transition-all"
      style={{ border: block.is_current ? '1px solid rgba(123,111,208,0.35)' : undefined }}>
      <div className="flex items-start justify-between mb-3">
        <div>
          {block.is_current && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full mr-2"
              style={{ background: 'var(--accent)', color: 'white' }}>MAINTENANT</span>
          )}
          <p className="text-base font-semibold mt-0.5" style={{ color: 'var(--text)' }}>{block.name}</p>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>
            {block.time_start?.slice(0,5)} – {block.time_end?.slice(0,5)}
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
          style={{ background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
      </div>

      <div className="flex gap-2">
        {[
          { s: 'done',    icon: Check, label: 'Fait' },
          { s: 'partial', icon: Minus, label: 'Partiel' },
          { s: 'skipped', icon: X,     label: 'Sauté' },
        ].map(({ s, icon: Icon, label }) => (
          <button key={s} onClick={() => handle(s)} disabled={saving}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-2xl text-xs font-medium transition"
            style={{
              background: block.status === s ? STATUS[s].bg : 'var(--bg3)',
              color:      block.status === s ? STATUS[s].color : 'var(--muted)',
              border:     block.status === s ? `1px solid ${STATUS[s].color}30` : '1px solid transparent',
            }}>
            <Icon size={12} />{label}
          </button>
        ))}
      </div>
    </div>
  )
}

function HistoryBar({ entry }) {
  const done  = Number(entry.done)
  const total = Number(entry.total)
  const pct   = Math.round((done / total) * 100)
  const color = pct >= 70 ? 'var(--done)' : pct >= 40 ? 'var(--partial)' : 'var(--skip)'

  return (
    <div className="flex items-center gap-3 py-1.5">
      <span className="text-xs w-24 flex-shrink-0" style={{ color: 'var(--muted)' }}>
        {new Date(entry.log_date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
      </span>
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg4)' }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-xs w-8 text-right" style={{ color: 'var(--muted)' }}>{done}/{total}</span>
    </div>
  )
}

export default function Schedule() {
  const [blocks, setBlocks]   = useState([])
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab]         = useState('today')

  useEffect(() => {
    Promise.all([blocksApi.today(), blocksApi.history(14)])
      .then(([t, h]) => { setBlocks(t.blocks || []); setHistory(h.days || []) })
      .catch(console.error).finally(() => setLoading(false))
  }, [])

const handleUpdate = async (blockId, status) => {
  // Optimistic update
  setBlocks(p => p.map(b => b.block_id === blockId ? { ...b, status } : b))

  // Initialiser le jour si pas encore fait
  const block = blocks.find(b => b.block_id === blockId)
  if (!block.log_id) {
    const fresh = await blocksApi.initDay()
    setBlocks(fresh.blocks)
    const log = fresh.blocks.find(b => b.block_id === blockId)
    if (log?.log_id) await blocksApi.setStatus(log.log_id, status)
  } else {
    await blocksApi.setStatus(block.log_id, status)
  }
}

  const done = blocks.filter(b => b.status === 'done').length

  return (
    <div className="px-4 w-full max-w-lg mx-auto" style={{ paddingTop: '24px' }}>
      <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text)' }}>Emploi du temps</h1>
      <p className="text-sm mb-5" style={{ color: 'var(--muted)' }}>
        {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
      </p>

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {[{ id: 'today', label: "Aujourd'hui" }, { id: 'history', label: 'Historique' }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="px-4 py-1.5 rounded-full text-sm font-semibold transition"
            style={{
              background: tab === t.id ? 'var(--accent)' : 'var(--bg2)',
              color:      tab === t.id ? 'white' : 'var(--muted)',
              boxShadow:  tab === t.id ? '0 4px 12px rgba(123,111,208,0.25)' : 'none',
              border:     'var(--glass-border)',
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'today' ? (
        <>
          {/* Barre de progression globale */}
          <div className="glass rounded-3xl p-4 mb-4 flex items-center gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>{done}</p>
              <p className="text-[10px] uppercase tracking-wide" style={{ color: 'var(--muted)' }}>Faits</p>
            </div>
            <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg4)' }}>
              <div className="h-full rounded-full transition-all"
                style={{ width: `${(done / Math.max(blocks.length, 1)) * 100}%`, background: 'var(--accent)',
                         boxShadow: '0 0 8px rgba(123,111,208,0.5)' }} />
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{blocks.length}</p>
              <p className="text-[10px] uppercase tracking-wide" style={{ color: 'var(--muted)' }}>Total</p>
            </div>
          </div>

          <div className="space-y-3">
            {loading
              ? Array(7).fill(0).map((_, i) => (
                  <div key={i} className="h-24 rounded-3xl animate-pulse" style={{ background: 'var(--bg2)' }} />
                ))
              : blocks.map(b => <BlockCard key={b.block_id} block={b} onUpdate={handleUpdate} />)
            }
          </div>
        </>
      ) : (
        <div className="glass rounded-3xl p-4">
          <Label>14 derniers jours</Label>
          {history.length === 0
            ? <p className="text-sm text-center py-6" style={{ color: 'var(--muted)' }}>Pas encore d'historique</p>
            : history.map(e => <HistoryBar key={e.log_date} entry={e} />)
          }
        </div>
      )}
    </div>
  )
}
