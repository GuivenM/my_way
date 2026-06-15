import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
// import Schedule from './pages/Schedule'
// import Journal from './pages/Journal'
// import Vision from './pages/Vision'
// import Projects from './pages/Projects'
// import Books from './pages/Books'
// import Stats from './pages/Stats'
// import More from './pages/More'

function PrivateRoutes() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="w-6 h-6 rounded-full border-2 animate-spin"
          style={{ borderColor: 'rgba(123,111,208,0.3)', borderTopColor: 'var(--accent)' }} />
      </div>
    )
  }

  if (!user) return <Login />

  return (
    <Layout>
      <Routes>
        <Route path="/"         element={<Dashboard />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/journal"  element={<Journal />} />
        <Route path="/vision"   element={<Vision />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/books"    element={<Books />} />
        <Route path="/stats"    element={<Stats />} />
        <Route path="/more"     element={<More />} />
        <Route path="*"         element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <PrivateRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}
