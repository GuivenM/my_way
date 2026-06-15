import { useEffect, useState } from 'react'
import { getVision, saveVision, getGoals, saveGoal, updateGoal, deleteGoal } from '../api'
import { useDebounce } from '../hooks/useDebounce'
import { Plus, Trash2, Check } from 'lucide-react'

const HORIZONS = [
  { id: '3months', label: '3 mois' },
  { id: '1year',   label: '1 an' },
  { id: '3years',  label: '3 ans' },
  { id: '5years',  label: '5 ans' },
]

function Label({ children }) {
  return <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--accent)' }}>{children}</p>
}

export default function Vision() {
  const [vision, setVision]   = useState('')
  const [goals, setGoals]     = useState([])
  const [horizon, setHorizon] = useState('3months')
  const [newGoal, setNewGoal] = useState('')
  const [saved, setSaved]     = useState(true)
  const [tab, setTab]         = useState('vision')

  useEffect(() => {
    getVision().then(d => setVision(d.vision || ''))
    getGoals().then(d => setGoals(d.goals || []))
  }, [])

  const doSave = useDebounce(async (text) => { await saveVision(text); setSaved(true) }, 1500)
  const handleVisionChange = (val) => { setVision(val); setSaved(false); doSave(val) }

  const handleAdd = async () => {
    if (!newGoal.trim()) return
    const data = await saveGoal({ title: newGoal.trim(), horizon, status: 'active' })
    setGoals(p => [...p, data.goal]); setNewGoal('')
  }

  const handleToggle = async (goal) => {
    const next = { ...goal, status: goal.status === 'done' ? 'active' : 'done' }
    setGoals(p => p.map(g => g.id === goal.id ? next : g))
    await updateGoal(next)
  }

  const handleDelete = async (id) => {
    setGoals(p => p.filter(g => g.id !== id))
    await deleteGoal(id)
  }

  const filtered = goals.filter(g => g.horizon === horizon)

  return (
    <div className="px-4 pt-8 pb-32 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>Vision & Objectifs</h1>
        {tab === 'vision' && (
          <span className="text-xs font-medium" style={{ color: saved ? 'var(--done)' : 'var(--partial)' }}>
            {saved ? '✓' : '●'}
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {[{ id: 'vision', label: 'Ma vision' }, { id: 'goals', label: 'Objectifs' }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="px-4 py-1.5 rounded-full text-sm font-semibold transition"
            style={{
              background: tab === t.id ? 'var(--accent)' : 'var(--bg2)',
              color: tab === t.id ? 'white' : 'var(--muted)',
              boxShadow: tab === t.id ? '0 4px 12px rgba(123,111,208,0.25)' : 'none',
              border: 'var(--glass-border)',
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'vision' ? (
        <div className="space-y-4">
          <p className="text-xs" style={{ color: 'var(--muted)' }}>
            Ce texte s'affiche sur ton dashboard chaque jour.
          </p>
          <div className="glass rounded-3xl p-1">
            <textarea value={vision} onChange={e => handleVisionChange(e.target.value)}
              placeholder="Je construis…"
              className="w-full min-h-44 p-4 text-sm leading-relaxed resize-none outline-none rounded-3xl"
              style={{ background: 'transparent', color: 'var(--text)' }} />
          </div>
          {vision && (
            <div className="glass rounded-3xl p-4">
              <Label>Aperçu dashboard</Label>
              <p className="text-sm leading-relaxed italic" style={{ color: 'var(--text2)' }}>"{vision}"</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Horizon pills */}
          <div className="flex gap-2 flex-wrap">
            {HORIZONS.map(h => (
              <button key={h.id} onClick={() => setHorizon(h.id)}
                className="px-3 py-1.5 rounded-full text-xs font-semibold transition"
                style={{
                  background: horizon === h.id ? 'var(--accent)' : 'var(--bg2)',
                  color: horizon === h.id ? 'white' : 'var(--muted)',
                  boxShadow: horizon === h.id ? '0 4px 12px rgba(123,111,208,0.25)' : 'none',
                  border: 'var(--glass-border)',
                }}>
                {h.label}
              </button>
            ))}
          </div>

          {/* Ajouter */}
          <div className="flex gap-2">
            <input value={newGoal} onChange={e => setNewGoal(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              placeholder={`Objectif à ${HORIZONS.find(h=>h.id===horizon)?.label}…`}
              className="flex-1 px-4 py-2.5 rounded-2xl text-sm outline-none glass"
              style={{ color: 'var(--text)' }} />
            <button onClick={handleAdd}
              className="px-4 py-2.5 rounded-2xl"
              style={{ background: 'var(--accent)', color: 'white', boxShadow: '0 4px 12px rgba(123,111,208,0.3)' }}>
              <Plus size={16} />
            </button>
          </div>

          {/* Liste */}
          <div className="space-y-2">
            {filtered.length === 0
              ? <p className="text-sm text-center py-8" style={{ color: 'var(--muted)' }}>
                  Aucun objectif à {HORIZONS.find(h=>h.id===horizon)?.label}
                </p>
              : filtered.map(g => (
                  <div key={g.id} className="glass-inner flex items-start gap-3 px-4 py-3 rounded-2xl group">
                    <button onClick={() => handleToggle(g)}
                      className="mt-0.5 w-5 h-5 rounded-lg border-2 flex-shrink-0 flex items-center justify-center transition"
                      style={{
                        borderColor: g.status === 'done' ? 'var(--done)' : 'rgba(123,111,208,0.3)',
                        background:  g.status === 'done' ? 'var(--done)' : 'transparent',
                      }}>
                      {g.status === 'done' && <Check size={11} color="white" strokeWidth={3} />}
                    </button>
                    <p className="flex-1 text-sm leading-relaxed"
                      style={{ color: g.status === 'done' ? 'var(--muted)' : 'var(--text)',
                               textDecoration: g.status === 'done' ? 'line-through' : 'none' }}>
                      {g.title}
                    </p>
                    <button onClick={() => handleDelete(g.id)}
                      className="opacity-0 group-hover:opacity-100 transition flex-shrink-0"
                      style={{ color: 'var(--skip)' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
            }
          </div>

          {filtered.length > 0 && (
            <p className="text-xs text-center" style={{ color: 'var(--muted)' }}>
              {filtered.filter(g=>g.status==='done').length} / {filtered.length} atteints
            </p>
          )}
        </div>
      )}
    </div>
  )
}
