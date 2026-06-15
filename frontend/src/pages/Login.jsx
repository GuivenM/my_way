import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const [form, setForm]   = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try { await login(form.username, form.password) }
    catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6"
      style={{ background: 'var(--bg)' }}>

      {/* Orbe décorative en arrière-plan */}
      <div style={{
        position: 'fixed', top: '-120px', right: '-80px',
        width: '320px', height: '320px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(123,111,208,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
            style={{ background: 'var(--accent)', boxShadow: '0 8px 24px rgba(123,111,208,0.35)' }}>
            <span className="text-white text-xl font-bold tracking-tight">OS</span>
          </div>
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--text)' }}>Personal OS</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>Ton espace privé</p>
        </div>

        {/* Card */}
        <div className="glass rounded-3xl p-6 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-2 uppercase tracking-wide"
                style={{ color: 'var(--muted)' }}>Identifiant</label>
              <input type="text" value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                className="w-full px-4 py-3 rounded-2xl text-sm outline-none transition"
                style={{
                  background: 'rgba(255,255,255,0.8)',
                  border: '1px solid rgba(123,111,208,0.15)',
                  color: 'var(--text)',
                }}
                placeholder="ton_identifiant" required />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-2 uppercase tracking-wide"
                style={{ color: 'var(--muted)' }}>Mot de passe</label>
              <input type="password" value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                className="w-full px-4 py-3 rounded-2xl text-sm outline-none"
                style={{
                  background: 'rgba(255,255,255,0.8)',
                  border: '1px solid rgba(123,111,208,0.15)',
                  color: 'var(--text)',
                }}
                placeholder="••••••••" required />
            </div>

            {error && (
              <p className="text-xs px-3 py-2 rounded-xl"
                style={{ background: 'var(--skip-bg)', color: 'var(--skip)' }}>{error}</p>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-2xl text-sm font-semibold transition-all"
              style={{
                background: 'var(--accent)',
                color: 'white',
                opacity: loading ? 0.7 : 1,
                boxShadow: '0 4px 16px rgba(123,111,208,0.30)',
              }}>
              {loading ? 'Connexion…' : 'Entrer'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
