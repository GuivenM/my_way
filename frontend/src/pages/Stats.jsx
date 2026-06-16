import { useEffect, useState } from 'react'
import { blocksApi, learningApi, musicApi, booksApi } from '../api'

function Label({ children }) {
  return <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--accent)', margin: '8px 12px 0px 8px' }}>{children}</p>
}

function StatRow({ label, value, sub, color = 'var(--accent)' }) {
  return (
    <div className="flex items-center justify-between py-2.5"
      style={{ borderBottom: '1px solid rgba(123,111,208,0.08)', padding: '4px 8px' }}>
      <div>
        <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{label}</p>
        {sub && <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>{sub}</p>}
      </div>
      <span className="text-base font-bold" style={{ color }}>{value}</span>
    </div>
  )
}

function ProgressBar({ value, max, color = 'var(--accent)' }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg4)', width: '80%', margin: '0 10%' }}>
      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
    </div>
  )
}

export default function Stats() {
  const [blocks,   setBlocks]   = useState(null)
  const [learning, setLearning] = useState([])
  const [music,    setMusic]    = useState([])
  const [books,    setBooks]    = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    Promise.all([
      blocksApi.history(),
      learningApi.list(),
      musicApi.list(),
      booksApi.list(),
    ]).then(([b, l, m, bk]) => {
      setBlocks(b)
      setLearning(l)
      setMusic(m)
      setBooks(bk)
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="px-4 pt-8 pb-32 max-w-lg mx-auto space-y-3">
      {Array(4).fill(0).map((_, i) => (
        <div key={i} className="h-32 rounded-3xl animate-pulse" style={{ background: 'var(--bg2)' }} />
      ))}
    </div>
  )

  // Calculs
  const streak       = blocks?.streak ?? 0
  const activeDays   = blocks?.days?.length ?? 0

  const totalLearnMin = learning.reduce((a, s) => a + Number(s.duration_min), 0)
  const domains = {}
  learning.forEach(s => { domains[s.domain] = (domains[s.domain] || 0) + Number(s.duration_min) })
  const domainList = Object.entries(domains).sort((a, b) => b[1] - a[1])

  const totalMusicMin  = music.reduce((a, s) => a + Number(s.duration_min), 0)
  const musicSessions  = music.length

  const totalBooks   = books.length
  const doneBooks    = books.filter(b => b.status === 'done').length
  const readingBooks = books.filter(b => b.status === 'reading').length

  return (
    <div className="px-4 w-full max-w-lg mx-auto" style={{ padding: '16px' }}>
      <h1 className="text-2xl font-bold mb-5" style={{ color: 'var(--text)' }}>Statistiques</h1>

      {/* Blocs */}
      <div className="glass rounded-3xl" style={{marginTop: '12px'}}>
        <Label styles={{margin: '0'}}>Blocs quotidiens</Label>
        <StatRow label="Streak actuel"  value={`🔥 ${streak}`} />
        <StatRow label="Jours actifs"   value={activeDays} color="var(--done)" />
      </div>

      {/* Apprentissage */}
      <div className="glass rounded-3xl p-4 mb-4" style={{marginTop: '12px'}}>
        <Label>Apprentissage</Label>
        <StatRow label="Temps total"   value={`${Math.round(totalLearnMin / 60)}h`} />
        <StatRow label="Sessions"      value={learning.length} color="var(--dot-teal)" />
        {domainList.length > 0 && (
          <div className="mt-3 space-y-2.5">
            {domainList.map(([domain, min]) => (
              <div key={domain}>
                <div className="flex justify-between text-xs mb-1">
                  <span style={{ color: 'var(--text)' }}>{domain}</span>
                  <span style={{ color: 'var(--muted)' }}>{Math.round(min / 60)}h</span>
                </div>
                <ProgressBar value={min} max={totalLearnMin} color="var(--dot-teal)" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Musique */}
      <div className="glass rounded-3xl p-4 mb-4" style={{marginTop: '12px'}}>
        <Label>Musique · Zixe</Label>
        <StatRow label="Temps total" value={`${Math.round(totalMusicMin / 60)}h`} color="var(--dot-orange)" />
        <StatRow label="Sessions"    value={musicSessions} />
      </div>

      {/* Livres */}
      <div className="glass rounded-3xl p-4 mb-4" style={{marginTop: '12px', paddingBottom: '12px'}}>
        <Label>Bibliothèque</Label>
        <StatRow label="Terminés"  value={doneBooks}    color="var(--done)" />
        <StatRow label="En cours"  value={readingBooks} color="var(--accent)" />
        <StatRow label="Total"     value={totalBooks}   color="var(--muted)" />
        <div className="mt-3">
          <div className="flex justify-between text-xs mb-1.5" style={{padding: '4px'}}>
            <span style={{ color: 'var(--muted)' }}>Progression globale</span>
            <span style={{ color: 'var(--accent)' }}>
              {totalBooks > 0 ? Math.round((doneBooks / totalBooks) * 100) : 0}%
            </span>
          </div>
          <ProgressBar value={doneBooks} max={totalBooks} />
        </div>
      </div>
    </div>
  )
}