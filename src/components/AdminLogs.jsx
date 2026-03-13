// AdminLogs.jsx — admin logs section
// Shows all logs filtered by date range and optional user.
// Admins can approve or reject pending logs.
// On reject, an optional note input appears before confirming.

import React, { useState, useEffect } from 'react'
import { currentMonth, monthBounds } from '../helpers'

// Format YYYY-MM-DD as DD.MM.YY for display
function formatDate(dateStr) {
  if (!dateStr) return '—'
  const [y, m, d] = dateStr.split('-')
  return `${d}.${m}.${y.slice(2)}`
}

export default function AdminLogs({ users, adminUser }) {
  const { start, end } = monthBounds(currentMonth())
  const [startDate, setStartDate] = useState(start)
  const [endDate, setEndDate]     = useState(end)
  const [userId, setUserId]       = useState('')       // '' = all users
  const [logs, setLogs]           = useState([])
  const [loading, setLoading]     = useState(false)
  const [rejectTarget, setRejectTarget] = useState(null) // { id, note }

  // Re-fetch logs whenever filters change
  useEffect(() => { fetchLogs() }, [startDate, endDate, userId])

  async function fetchLogs() {
    setLoading(true)
    const params = new URLSearchParams({ startDate, endDate })
    if (userId) params.set('userId', userId)
    try {
      const res = await fetch(`/api/logs?${params}`)
      if (!res.ok) return
      setLogs(await res.json())
    } catch {} finally { setLoading(false) }
  }

  // Approves a log — sets status to approved
  async function approve(logId) {
    await fetch(`/api/logs?id=${logId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'approved' })
    })
    fetchLogs()
  }

  // Rejects a log with an optional admin note
  async function reject() {
    if (!rejectTarget) return
    await fetch(`/api/logs?id=${rejectTarget.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'rejected', adminNote: rejectTarget.note })
    })
    setRejectTarget(null)
    fetchLogs()
  }

  return (
    <div className="px-6 pt-6">

      {/* Filter bar */}
      <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-4">Filter</p>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.15em] text-white/30 mb-1">Von</p>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
            className="w-full bg-black text-white text-sm border-b border-[#FB0007] pb-1 outline-none" />
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.15em] text-white/30 mb-1">Bis</p>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
            className="w-full bg-black text-white text-sm border-b border-[#FB0007] pb-1 outline-none" />
        </div>
      </div>
      <div className="mb-8">
        <p className="text-[10px] uppercase tracking-[0.15em] text-white/30 mb-1">Benutzer</p>
        <select value={userId} onChange={e => setUserId(e.target.value)}
          className="w-full bg-black text-white text-sm border-b border-[#FB0007] pb-1 outline-none appearance-none">
          <option value="">Alle</option>
          {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
      </div>

      {/* Log list */}
      <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-4">
        Einträge {!loading && `(${logs.length})`}
      </p>

      {loading ? (
        <p className="text-white/30 text-xs uppercase tracking-widest text-center py-12">Laden...</p>
      ) : logs.length === 0 ? (
        <p className="text-white/30 text-xs uppercase tracking-widest text-center py-12">Keine Einträge</p>
      ) : (
        logs.map(log => (
          <div key={log.id} className="border-b border-white/10 py-4">

            {/* Top row: name + date */}
            <div className="flex justify-between items-baseline mb-1">
              <span className="text-white font-bold text-sm">{log.userName || '—'}</span>
              <span className="text-white/40 text-xs">{formatDate(log.date)}</span>
            </div>

            {/* Middle row: project + times + hours */}
            <div className="flex flex-wrap gap-x-4 gap-y-0.5 mb-1">
              <span className="text-white text-sm">{log.projectName || '—'}</span>
              <span className="text-white/40 text-sm">{log.startTime} – {log.endTime}</span>
              <span className="text-white/60 text-sm font-bold">{log.hours ?? '—'}h</span>
            </div>

            {/* Description */}
            {log.description && (
              <p className="text-white/50 text-sm mb-2">{log.description}</p>
            )}

            {/* Status + actions */}
            <div className="flex justify-between items-center mt-2">
              <StatusBadge status={log.status} adminNote={log.adminNote} />
              {log.status === 'pending' && rejectTarget?.id !== log.id && (
                <div className="flex gap-3">
                  <button onClick={() => approve(log.id)}
                    className="bg-[#FB0007] text-black text-[10px] font-bold uppercase tracking-widest px-3 py-1.5">
                    Genehmigen
                  </button>
                  <button onClick={() => setRejectTarget({ id: log.id, note: '' })}
                    className="border border-white/30 text-white/60 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5">
                    Ablehnen
                  </button>
                </div>
              )}
            </div>

            {/* Inline reject note input */}
            {rejectTarget?.id === log.id && (
              <div className="mt-3 pt-3 border-t border-white/10">
                <input
                  type="text"
                  value={rejectTarget.note}
                  onChange={e => setRejectTarget({ ...rejectTarget, note: e.target.value })}
                  placeholder="Anmerkung (optional)"
                  autoFocus
                  className="w-full bg-black text-white text-sm border-b border-[#FB0007] pb-1 outline-none placeholder-white/20 mb-3"
                />
                <div className="flex gap-3">
                  <button onClick={reject}
                    className="bg-[#FB0007] text-black text-[10px] font-bold uppercase tracking-widest px-3 py-1.5">
                    Bestätigen
                  </button>
                  <button onClick={() => setRejectTarget(null)}
                    className="text-white/40 text-[10px] uppercase tracking-widest px-3 py-1.5">
                    Abbrechen
                  </button>
                </div>
              </div>
            )}

          </div>
        ))
      )}
    </div>
  )
}

// Status badge with different styling per status
function StatusBadge({ status, adminNote }) {
  if (status === 'approved') return <span className="text-[#FB0007] text-[10px] uppercase tracking-widest">Genehmigt</span>
  if (status === 'rejected') return (
    <span className="text-white/30 text-[10px] uppercase tracking-widest line-through">
      Abgelehnt{adminNote ? ` — ${adminNote}` : ''}
    </span>
  )
  return <span className="text-white/60 text-[10px] uppercase tracking-widest">Ausstehend</span>
}
