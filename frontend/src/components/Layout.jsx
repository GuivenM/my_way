import BottomNav from './BottomNav'

export default function Layout({ children }) {
  return (
    <div className="min-h-dvh flex flex-col" style={{ background: 'var(--bg)' }}>
      <main className="flex-1 pb-24 safe-top">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
