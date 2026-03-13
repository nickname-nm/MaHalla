// AdminProjects.jsx — admin project management section
// Lists all active projects and allows admins to add new ones.

import React, { useState, useEffect } from 'react'

export default function AdminProjects({ adminUser }) {
  const [projects, setProjects] = useState([])
  const [loading, setLoading]   = useState(false)
  const [newName, setNewName]   = useState('')
  const [newType, setNewType]   = useState('event')
  const [creating, setCreating] = useState(false)
  const [error, setError]       = useState('')

  // Fetch active projects on mount
  useEffect(() => { fetchProjects() }, [])

  async function fetchProjects() {
    setLoading(true)
    try {
      const res = await fetch('/api/projects')
      if (!res.ok) return
      setProjects(await res.json())
    } catch {} finally { setLoading(false) }
  }

  // Creates a new project via POST /api/projects
  async function handleCreate(e) {
    e.preventDefault()
    if (!newName.trim()) return
    setCreating(true)
    setError('')
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim(), type: newType, role: adminUser.role })
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Error creating project')
        return
      }
      setNewName('')
      setNewType('event')
      fetchProjects()
    } catch {
      setError('Connection error')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="px-6 pt-6">

      {/* Project list */}
      <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-4">
        Active Projects {!loading && `(${projects.length})`}
      </p>

      {loading ? (
        <p className="text-white/30 text-xs uppercase tracking-widest text-center py-8">Loading...</p>
      ) : projects.length === 0 ? (
        <p className="text-white/30 text-xs uppercase tracking-widest text-center py-8">No projects</p>
      ) : (
        projects.map(p => (
          <div key={p.id} className="flex justify-between items-center py-4 border-b border-white/10">
            <span className="text-white text-sm">{p.name}</span>
            <span className="text-white/30 text-[10px] uppercase tracking-widest">{p.type}</span>
          </div>
        ))
      )}

      {/* Add new project form */}
      <div className="mt-10 pt-6 border-t border-white/10">
        <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-6">New Project</p>

        <form onSubmit={handleCreate} className="flex flex-col gap-6">
          <div>
            <p className="text-[10px] uppercase tracking-[0.15em] text-white/30 mb-1">Name</p>
            <input type="text" value={newName} onChange={e => { setNewName(e.target.value); setError('') }}
              placeholder="Project name"
              className="w-full bg-black text-white text-base border-b border-[#FB0007] pb-1 outline-none placeholder-white/20" />
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-[0.15em] text-white/30 mb-1">Type</p>
            <select value={newType} onChange={e => setNewType(e.target.value)}
              className="w-full bg-black text-white text-base border-b border-[#FB0007] pb-1 outline-none appearance-none">
              <option value="event">Event</option>
              <option value="ongoing">Ongoing</option>
            </select>
          </div>

          {error && <p className="text-white/60 text-xs uppercase tracking-widest -mt-2">{error}</p>}

          <button type="submit" disabled={!newName.trim() || creating}
            className={[
              'w-full py-4 text-sm font-bold uppercase tracking-[0.2em]',
              newName.trim() && !creating ? 'bg-[#FB0007] text-black' : 'bg-[#FB0007] text-black opacity-30 cursor-not-allowed'
            ].join(' ')}>
            {creating ? '...' : 'Create project'}
          </button>
        </form>
      </div>

    </div>
  )
}
