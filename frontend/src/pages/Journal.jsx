import { useEffect, useState, useCallback } from 'react'
import { journalApi } from '../api'
import { useDebounce } from '../hooks/useDebounce'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const PROMPTS = [
  "Qu'est-ce qui s'est passé aujourd'hui ?",
  "Qu'as-tu observé ou appris ?",
  "Qu'est-ce que tu veux pour demain ?",
]

function Label({ children }) {
  return <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--accent)' }}>{children}</p>
}

export default function Journal() {
  const today = new Date().toISOString().split('T')[0]
  const [date, setDate]       = useState(today)
  const [content, setContent] = useState('')
  const [saved, setSaved]     = useState(true)
  const [saving, setSaving]   = useState(false)
  const [entries, setEntries] = useState([])
  const [tab, setTab]         = useState('write')

  useEffect(() => {
    setSaved(true)
    journalApi.get(date).then(d => setContent(d.content || '')).catch(() => setContent(''))
  }, [date])

  useEffect(() => {
    if (tab === 'list') journalApi.history(30).then(d => setEntries(d.entries || []))
  }, [tab])

  const doSave = useCallback(async (text) => {
    setSaving(true)
    try { await journalApi.save(date, text); setSaved(true) } finally { setSaving(false) }
  }, [date])

  const debouncedSave = useDebounce(doSave, 1500)

  const handleChange = (val) => {
    setContent(val); setSaved(false); debouncedSave(val)
  }

  const isToday = date === today
  const d = new Date(date)
  const prev = () => { const p = new Date(d); p.setDate(p.getDate()-1); setDate(p.toISOString().split('T')[0]) }
  const next = () => { const n = new Date(d); n.setDate(n.getDate()+1); setDate(n.toISOString().split('T')[0]) }

  return (
    <div className="px-4 w-full max-w-lg mx-auto" style={{ padding: '16px' }}>
      <div className="flex items-center justify-between mb-1" style={{ marginBottom: '8px' }}>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>Journal</h1>
        <span className="text-xs font-medium"
          style={{ color: saving ? 'var(--muted)' : saved ? 'var(--done)' : 'var(--partial)' }}>
          {saving ? 'Sauvegarde…' : saved ? '✓ Sauvegardé' : '●'}
        </span>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5 mt-4">
        {[{ id: 'write', label: 'Écrire' }, { id: 'list', label: 'Entrées' }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="px-4 py-1.5 rounded-lg text-sm font-semibold transition"
            style={{
              background: tab === t.id ? 'var(--accent)' : 'var(--bg2)',
              color: tab === t.id ? 'white' : 'var(--muted)',
              boxShadow: tab === t.id ? '0 4px 12px rgba(123,111,208,0.25)' : 'none',
              border: 'var(--glass-border)',
              marginBottom: '8px',
              padding: '1.5px 3px',
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'write' ? (
        <>
          {/* Nav date */}
          <div className="glass rounded-3xl p-3 flex items-center justify-between mb-4">
            <button onClick={prev} className="p-2 rounded-2xl" style={{ background: 'var(--bg3)', padding: '16px'}}>
              <ChevronLeft size={16} style={{ color: 'var(--muted)' }} />
            </button>
            <div className="text-center" style={{ color: 'var(--text)' }}>
              <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                {d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
              {isToday && <p className="text-xs" style={{ color: 'var(--accent)' }}>Aujourd'hui</p>}
            </div>
            <button onClick={next} disabled={isToday} className="p-2 rounded-2xl"
              style={{ background: 'var(--bg3)', opacity: isToday ? 0.3 : 1 }}>
              <ChevronRight size={16} style={{ color: 'var(--muted)' }} />
            </button>
          </div>

          {/* Prompts */}
          <div className="glass rounded-2xl" style={{ padding: '16px', marginTop: '12px' }}>
            <Label>Prompts</Label>
            {PROMPTS.map((p, i) => (
              <p key={i} className="text-xs mb-1" style={{ color: 'var(--text2)' }}>· {p}</p>
            ))}
          </div>

          {/* Textarea */}
          <div className="glass rounded-xl p-1" style={{ padding: '8px', marginTop: '12px' }}>
            <textarea value={content} onChange={e => handleChange(e.target.value)}
              placeholder="Commence à écrire…"
              className="w-full min-h-56 p-4 text-sm leading-relaxed resize-none outline-none rounded-3xl"
              style={{ background: 'transparent', color: 'var(--text)' }} />
          </div>
          <p className="text-xs mt-2 text-right" style={{ color: 'var(--muted)' }}>{content.length} car.</p>
        </>
      ) : (
        <div className="space-y-2">
          {entries.length === 0
            ? <p className="text-sm text-center py-10" style={{ color: 'var(--muted)' }}>Aucune entrée pour l'instant</p>
            : entries.map(e => (
                <button key={e.date} onClick={() => { setDate(e.date); setTab('write') }}
                  className="glass w-full text-left rounded-3xl p-4 transition">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                      {new Date(e.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </p>
                    <span className="text-xs" style={{ color: 'var(--muted)' }}>{e.char_count} car.</span>
                  </div>
                  {e.preview && <p className="text-xs line-clamp-2" style={{ color: 'var(--text2)' }}>{e.preview}</p>}
                </button>
              ))
          }
        </div>
      )}
    </div>
  )
}
