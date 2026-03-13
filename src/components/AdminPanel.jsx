// AdminPanel.jsx — admin dashboard shell
// Fetches the full user list once (used by both the logs filter and user management).
// Renders one of three sections based on the active tab: LOGS, BENUTZER, PROJEKTE.

import React, { useState, useEffect } from 'react'
import AdminLogs from './AdminLogs'
import AdminUsers from './AdminUsers'
import AdminProjects from './AdminProjects'

const TABS = [
  { key: 'logs',     label: 'Logs' },
  { key: 'users',    label: 'Benutzer' },
  { key: 'projects', label: 'Projekte' }
]

export default function AdminPanel({ user }) {
  const [tab, setTab] = useState('logs')
  const [users, setUsers] = useState([])

  // Fetch all users once — needed by log filter dropdown and user management section
  useEffect(() => {
    fetch(`/api/users?role=admin`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setUsers(data) })
      .catch(() => {})
  }, [])

  // Reloads the user list — called after creating or updating a user
  async function refreshUsers() {
    try {
      const res = await fetch(`/api/users?role=admin`)
      const data = await res.json()
      if (Array.isArray(data)) setUsers(data)
    } catch {}
  }

  return (
    <div className="bg-black">

      {/* Tab navigation */}
      <div className="flex border-b border-white/10">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={[
              'flex-1 py-3 text-xs font-bold uppercase tracking-[0.2em]',
              tab === t.key ? 'text-white border-b-2 border-[#FB0007]' : 'text-white/30'
            ].join(' ')}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Section content */}
      <div className="max-w-4xl mx-auto">
        {tab === 'logs'     && <AdminLogs users={users} adminUser={user} />}
        {tab === 'users'    && <AdminUsers users={users} onRefresh={refreshUsers} adminUser={user} />}
        {tab === 'projects' && <AdminProjects adminUser={user} />}
      </div>

    </div>
  )
}
