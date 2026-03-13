// AdminUsers.jsx — admin user management section
// Lists all users with name, code, role, and active status.
// Admins can create new users and deactivate/reactivate existing ones.

import React, { useState } from 'react'

export default function AdminUsers({ users, onRefresh, adminUser }) {
  const [newName, setNewName] = useState('')
  const [newCode, setNewCode] = useState('')
  const [newRole, setNewRole] = useState('member')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const [togglingId, setTogglingId] = useState(null) // tracks which user is being toggled

  // Creates a new user via POST /api/users
  async function handleCreate(e) {
    e.preventDefault()
    if (!/^\d{6}$/.test(newCode)) {
      setError('Code muss genau 6 Ziffern haben')
      return
    }
    setCreating(true)
    setError('')
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, code: newCode, role: newRole, adminRole: adminUser.role })
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Fehler beim Erstellen')
        return
      }
      setNewName('')
      setNewCode('')
      setNewRole('member')
      onRefresh()
    } catch {
      setError('Verbindungsfehler')
    } finally {
      setCreating(false)
    }
  }

  // Toggles a user's active state — deactivate if active, reactivate if inactive
  async function toggleActive(user) {
    setTogglingId(user.id)
    try {
      await fetch(`/api/users?id=${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !user.active, adminRole: adminUser.role })
      })
      onRefresh()
    } catch {} finally {
      setTogglingId(null)
    }
  }

  const canCreate = newName.trim() && newCode.length === 6

  return (
    <div className="px-6 pt-6">

      {/* User list */}
      <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-4">
        Benutzer ({users.length})
      </p>

      {users.length === 0 ? (
        <p className="text-white/30 text-xs uppercase tracking-widest text-center py-8">Keine Benutzer</p>
      ) : (
        users.map(u => (
          <div key={u.id} className={`flex justify-between items-center py-4 border-b border-white/10 ${!u.active ? 'opacity-40' : ''}`}>
            <div>
              <p className="text-white font-bold text-sm">{u.name}</p>
              <p className="text-white/40 text-xs mt-0.5 uppercase tracking-widest">
                {u.code} · {u.role}
              </p>
            </div>
            <button
              onClick={() => toggleActive(u)}
              disabled={togglingId === u.id}
              className={[
                'text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 border',
                u.active
                  ? 'border-white/20 text-white/40'
                  : 'border-[#FB0007] text-[#FB0007]'
              ].join(' ')}
            >
              {togglingId === u.id ? '...' : u.active ? 'Deaktivieren' : 'Aktivieren'}
            </button>
          </div>
        ))
      )}

      {/* Create new user form */}
      <div className="mt-10 pt-6 border-t border-white/10">
        <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-6">Neuer Benutzer</p>

        <form onSubmit={handleCreate} className="flex flex-col gap-6">
          <div>
            <p className="text-[10px] uppercase tracking-[0.15em] text-white/30 mb-1">Name</p>
            <input type="text" value={newName} onChange={e => { setNewName(e.target.value); setError('') }}
              placeholder="Vollständiger Name"
              className="w-full bg-black text-white text-base border-b border-[#FB0007] pb-1 outline-none placeholder-white/20" />
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-[0.15em] text-white/30 mb-1">Code (6 Ziffern)</p>
            <input
              type="text" inputMode="numeric" value={newCode}
              onChange={e => { setNewCode(e.target.value.replace(/\D/g, '').slice(0, 6)); setError('') }}
              placeholder="000000"
              className="w-full bg-black text-white text-base tracking-[0.3em] border-b border-[#FB0007] pb-1 outline-none placeholder-white/20" />
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-[0.15em] text-white/30 mb-1">Rolle</p>
            <select value={newRole} onChange={e => setNewRole(e.target.value)}
              className="w-full bg-black text-white text-base border-b border-[#FB0007] pb-1 outline-none appearance-none">
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {error && <p className="text-white/60 text-xs uppercase tracking-widest -mt-2">{error}</p>}

          <button type="submit" disabled={!canCreate || creating}
            className={[
              'w-full py-4 text-sm font-bold uppercase tracking-[0.2em]',
              canCreate && !creating ? 'bg-[#FB0007] text-black' : 'bg-[#FB0007] text-black opacity-30 cursor-not-allowed'
            ].join(' ')}>
            {creating ? '...' : 'Benutzer erstellen'}
          </button>
        </form>
      </div>

    </div>
  )
}
