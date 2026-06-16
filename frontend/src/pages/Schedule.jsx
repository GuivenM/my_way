// ── Composant à ajouter dans Schedule.jsx ─────────────────────────────────────
// Remplace la section "export default function Schedule()" par celle-ci

import { useEffect, useState } from 'react'
import { blocksApi, scheduleApi } from '../api'
import { Check, Minus, X, Pencil, Save } from 'lucide-react'

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
    <div className="glass rounded-xl p-4 transition-all"
      style={{ border: block.is_current ? '1px solid rgba(123,111,208,0.35)' : undefined, marginBottom: '12px' }}>
      <div className="flex items-start justify-between mb-3">
        <div>
          {block.is_current && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg mr-2"
              style={{ background: 'var(--accent)', color: 'white' }}>MAINTENANT</span>
          )}
          <p className="text-base font-semibold mt-0.5" style={{ color: 'var(--text)' }}>{block.name}</p>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>
            {block.time_start?.slice(0,5)} – {block.time_end?.slice(0,5)}
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-lg"
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

// ── Éditeur de blocs ───────────────────────────────────────────────────────────

function BlockEditor({ blocks, onSaved }) {
  const [draft,   setDraft]   = useState(blocks.map(b => ({
    id:          b.id ?? b.block_id,
    name:        b.name,
    description: b.description ?? '',
    time_start:  b.time_start?.slice(0, 5),
    time_end:    b.time_end?.slice(0, 5),
    order_index: b.order_index,
  })))
  const [saving,  setSaving]  = useState(false)
  const [saved,   setSaved]   = useState(false)

  const update = (index, field, value) => {
    setDraft(d => d.map((b, i) => i === index ? { ...b, [field]: value } : b))
    setSaved(false)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // Sauvegarder chaque bloc modifié individuellement
      await Promise.all(draft.map(b =>
        scheduleApi.update(b.id, {
          name:        b.name,
          description: b.description,
          time_start:  b.time_start + ':00',
          time_end:    b.time_end   + ':00',
        })
      ))
      setSaved(true)
      onSaved()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-xs" style={{ color: 'var(--muted)' }}>
        Modifie les noms et horaires de tes blocs.
      </p>

      {draft.map((b, i) => (
        <div key={b.id} className="glass rounded-xl p-4" style={{ marginBottom: '8px' }}>
          {/* Numéro + nom */}
          <div className="flex items-center gap-2 mb-3">
            <span className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>
              {b.order_index}
            </span>
            <input
              value={b.name}
              onChange={e => update(i, 'name', e.target.value)}
              className="flex-1 px-3 py-1.5 rounded-xl text-sm font-semibold outline-none"
              style={{ background: 'var(--bg3)', color: 'var(--text)', border: 'var(--glass-border)' }}
            />
          </div>

          {/* Description */}
          <input
            value={b.description}
            onChange={e => update(i, 'description', e.target.value)}
            placeholder="Description (optionnel)"
            className="w-full px-3 py-1.5 rounded-xl text-xs outline-none mb-3"
            style={{ background: 'var(--bg3)', color: 'var(--text2)', border: 'var(--glass-border)' }}
          />

          {/* Horaires */}
          <div className="flex gap-2 items-center">
            <input
              type="time"
              value={b.time_start}
              onChange={e => update(i, 'time_start', e.target.value)}
              className="flex-1 px-3 py-1.5 rounded-xl text-sm outline-none text-center"
              style={{ background: 'var(--bg3)', color: 'var(--text)', border: 'var(--glass-border)' }}
            />
            <span className="text-xs" style={{ color: 'var(--muted)' }}>→</span>
            <input
              type="time"
              value={b.time_end}
              onChange={e => update(i, 'time_end', e.target.value)}
              className="flex-1 px-3 py-1.5 rounded-xl text-sm outline-none text-center"
              style={{ background: 'var(--bg3)', color: 'var(--text)', border: 'var(--glass-border)' }}
            />
          </div>
        </div>
      ))}

      <button onClick={handleSave} disabled={saving}
        className="w-full py-3 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 transition"
        style={{
          background: saved ? 'var(--done-bg)' : 'var(--accent)',
          color:      saved ? 'var(--done)'    : 'white',
          opacity:    saving ? 0.7 : 1,
          boxShadow:  saved ? 'none' : '0 4px 16px rgba(123,111,208,0.3)',
        }}>
        {saving ? 'Sauvegarde…' : saved ? <><Check size={14} /> Sauvegardé</> : <><Save size={14} /> Sauvegarder</>}
      </button>
    </div>
  )
}

// ── Page principale ────────────────────────────────────────────────────────────

export default function Schedule() {
  const [blocks,  setBlocks]  = useState([])
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab,     setTab]     = useState('today')

  const load = () => {
    Promise.all([blocksApi.today(), blocksApi.history()])
      .then(([t, h]) => { setBlocks(t.blocks || []); setHistory(h.days || []) })
      .catch(console.error).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleUpdate = async (blockId, status) => {
    setBlocks(p => p.map(b => b.block_id === blockId ? { ...b, status } : b))
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
  const TABS = [
    { id: 'today',   label: "Aujourd'hui" },
    { id: 'history', label: 'Historique'  },
    { id: 'config',  label: 'Modifier'    },
  ]

  return (
    <div className="px-4 w-full max-w-lg mx-auto" style={{ paddingTop: '24px', paddingBottom: '120px' }}>
      <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text)' }}>Emploi du temps</h1>
      <p className="text-sm mb-4" style={{ color: 'var(--muted)' }}>
        {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
      </p>

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {TABS.map(t => (
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

      {tab === 'today' && (
        <>
          <div className="glass rounded-xl p-4 mb-4 flex items-center gap-4">
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

          <div>
            {loading
              ? Array(7).fill(0).map((_, i) => (
                  <div key={i} className="h-24 rounded-3xl animate-pulse mb-3" style={{ background: 'var(--bg2)' }} />
                ))
              : blocks.map(b => <BlockCard key={b.block_id} block={b} onUpdate={handleUpdate} />)
            }
          </div>
        </>
      )}

      {tab === 'history' && (
        <div className="glass rounded-xl p-4">
          <Label>30 derniers jours</Label>
          {history.length === 0
            ? <p className="text-sm text-center py-6" style={{ color: 'var(--muted)' }}>Pas encore d'historique</p>
            : history.map(e => <HistoryBar key={e.log_date} entry={e} />)
          }
        </div>
      )}

      {tab === 'config' && blocks.length > 0 && (
        <BlockEditor blocks={blocks} onSaved={() => { load(); setTab('today') }} />
      )}
    </div>
  )
}