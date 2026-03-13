// App.jsx — root component
// Manages auth state (localStorage) and top-level navigation.
// No routing library — view is controlled with React state.
// Bottom nav switches between STUNDEN, ÜBERSICHT, and (for admins) ADMIN.

import React, { useState } from 'react'
import Login from './components/Login'
import LogEntry from './components/LogEntry'
import DailyView from './components/DailyView'
import AdminPanel from './components/AdminPanel'

export default function App() {
  // Restore user from localStorage on page load
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('mahalla_user')
      return stored ? JSON.parse(stored) : null
    } catch { return null }
  })

  const [view, setView] = useState('stunden') // 'stunden' | 'uebersicht' | 'admin'

  // refreshKey forces DailyView to remount and re-fetch after a log is saved
  const [refreshKey, setRefreshKey] = useState(0)

  // Called by Login on successful auth
  function handleLogin(userData) {
    localStorage.setItem('mahalla_user', JSON.stringify(userData))
    setUser(userData)
    setView('stunden')
  }

  // Clears auth state and returns to login screen
  function handleLogout() {
    localStorage.removeItem('mahalla_user')
    setUser(null)
    setView('stunden')
  }

  // Called when a log is saved — navigates to dashboard and refreshes it
  function handleLogSaved() {
    setRefreshKey(k => k + 1)
    setView('uebersicht')
  }

  // Not logged in — show login screen only
  if (!user) return <Login onLogin={handleLogin} />

  // Build nav items based on role
  const navItems = [
    { key: 'stunden',   label: 'Hours' },
    { key: 'uebersicht', label: 'Overview' },
    ...(user.role === 'admin' ? [{ key: 'admin', label: 'Admin' }] : [])
  ]

  return (
    <div className="min-h-screen bg-black">

      {/* Global header */}
      <header className="px-6 py-4 border-b border-white/10 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <span className="text-white font-bold uppercase tracking-[0.2em] text-sm">
            MaHalla Stunden
          </span>
          {user.role === 'admin' && (
            <span className="text-[#FB0007] text-[10px] uppercase tracking-widest">Admin</span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <span className="text-white/30 text-xs hidden sm:block">{user.name}</span>
          <button
            onClick={handleLogout}
            className="text-white/40 text-xs uppercase tracking-widest"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main content — pb-16 clears the fixed bottom nav */}
      <main className="pb-16">
        {view === 'stunden' && (
          <LogEntry user={user} onSaved={handleLogSaved} />
        )}
        {view === 'uebersicht' && (
          <DailyView key={refreshKey} user={user} />
        )}
        {view === 'admin' && user.role === 'admin' && (
          <AdminPanel user={user} />
        )}
      </main>

      {/* Fixed bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-black border-t border-white/10 flex z-40">
        {navItems.map(item => (
          <button
            key={item.key}
            onClick={() => setView(item.key)}
            className={[
              'flex-1 py-4 text-xs font-bold uppercase tracking-[0.2em]',
              view === item.key ? 'text-[#FB0007]' : 'text-white/30'
            ].join(' ')}
          >
            {item.label}
          </button>
        ))}
      </nav>

    </div>
  )
}
