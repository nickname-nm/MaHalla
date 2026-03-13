// App.jsx — root component
// Handles routing between Login, Member Dashboard, and Admin Panel
// Auth state is stored in localStorage (persists across browser sessions)

import React, { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/Login'
import DailyView from './components/DailyView'
import AdminPanel from './components/AdminPanel'

export default function App() {
  // user is null when logged out, or { name, id, role } when logged in
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('mahalla_user')
    return stored ? JSON.parse(stored) : null
  })

  // Called by Login component on successful auth
  function handleLogin(userData) {
    localStorage.setItem('mahalla_user', JSON.stringify(userData))
    setUser(userData)
  }

  // Called when user logs out
  function handleLogout() {
    localStorage.removeItem('mahalla_user')
    setUser(null)
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public route — show login if not authenticated */}
        <Route
          path="/"
          element={
            !user
              ? <Login onLogin={handleLogin} />
              : <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />
          }
        />

        {/* Member dashboard — redirect to login if not authenticated */}
        <Route
          path="/dashboard"
          element={
            user
              ? <DailyView user={user} onLogout={handleLogout} />
              : <Navigate to="/" replace />
          }
        />

        {/* Admin panel — redirect to login if not authenticated or not admin */}
        <Route
          path="/admin"
          element={
            user && user.role === 'admin'
              ? <AdminPanel user={user} onLogout={handleLogout} />
              : <Navigate to="/" replace />
          }
        />

        {/* Catch-all — redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
