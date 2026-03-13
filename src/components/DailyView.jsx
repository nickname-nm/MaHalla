// DailyView.jsx — member dashboard
// Default screen after login. Shows daily log list and monthly summary.
// Tab toggle switches between TAG (daily) and MONAT (monthly) views.
// A red FAB opens the log entry form as a fullscreen overlay.

import React, { useState, useEffect } from 'react'
import LogEntry from './LogEntry'
import MonthlyView from './MonthlyView'
import { todayString, shiftDate, formatDayLabel } from '../helpers'

export default function DailyView({ user, onLogout }) {
  const [tab, setTab] = useState('daily')       // 'daily' | 'monthly'
  const [date, setDate] = useState(todayString())
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)

  // Fetch logs for the selected date whenever date or tab changes
  useEffect(() => {
    if (tab === 'daily') fetchLogs()
  }, [date, tab])

  // Fetches logs from the API for the currently selected date
  async function fetchLogs() {
    setLoading(true)
    try {
      const res = await fetch(`/api/logs?userId=${user.id}&startDate=${date}&endDate=${date}`)
      if (!res.ok) return
      setLogs(await res.json())
    } catch {
      // silently fail — empty list will show
    } finally {
      setLoading(false)
    }
  }

  // Sum all hours for the day, rounded to 1 decimal
  const totalHours = Math.round(
    logs.reduce((sum, log) => sum + (log.hours || 0), 0) * 10
  ) / 10

  return (
    <div className="min-h-screen bg-black pb-24">

      {/* Header */}
      <header className="px-6 py-4 border-b border-white/10 flex justify-between items-center">
        <span className="text-white font-bold uppercase tracking-[0.2em] text-sm">MaHalla Stunden</span>
        <button onClick={onLogout} className="text-white/40 text-xs uppercase tracking-widest">
          Logout
        </button>
      </header>

      {/* Tab toggle */}
      <div className="flex border-b border-white/10">
        {['daily', 'monthly'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={[
              'flex-1 py-3 text-xs font-bold uppercase tracking-[0.2em]',
              tab === t ? 'text-white border-b-2 border-[#FB0007]' : 'text-white/30'
            ].join(' ')}
          >
            {t === 'daily' ? 'Tag' : 'Monat'}
          </button>
        ))}
      </div>

      {/* Daily view */}
      {tab === 'daily' && (
        <div className="px-6 pt-6">

          {/* Date navigation */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setDate(shiftDate(date, -1))}
              className="text-white/60 text-2xl w-10 text-left"
            >
              ←
            </button>
            <span className="text-white text-xs uppercase tracking-[0.2em] font-bold">
              {formatDayLabel(date)}
            </span>
            <button
              onClick={() => setDate(shiftDate(date, 1))}
              className="text-white/60 text-2xl w-10 text-right"
            >
              →
            </button>
          </div>

          {/* Log list */}
          {loading ? (
            <p className="text-white/30 text-xs uppercase tracking-widest text-center py-16">Laden...</p>
          ) : logs.length === 0 ? (
            <p className="text-white/30 text-xs uppercase tracking-widest text-center py-16">Keine Einträge</p>
          ) : (
            <>
              {logs.map(log => <LogCard key={log.id} log={log} />)}
              <div className="flex justify-between items-center pt-4 mt-2 border-t border-white/10">
                <span className="text-white/40 text-xs uppercase tracking-[0.2em]">Total</span>
                <span className="text-white font-bold text-xl">{totalHours}h</span>
              </div>
            </>
          )}

        </div>
      )}

      {/* Monthly view — renders MonthlyView component */}
      {tab === 'monthly' && <MonthlyView user={user} />}

      {/* FAB — floating button to open log entry form */}
      <button
        onClick={() => setShowForm(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#FB0007] text-black font-bold text-3xl flex items-center justify-center"
      >
        +
      </button>

      {/* Log entry fullscreen overlay */}
      {showForm && (
        <div className="fixed inset-0 bg-black z-50 overflow-y-auto">
          <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center">
            <span className="text-white text-xs uppercase tracking-[0.2em] font-bold">Stunden eintragen</span>
            <button
              onClick={() => setShowForm(false)}
              className="text-white/40 text-xs uppercase tracking-widest"
            >
              ✕ Schließen
            </button>
          </div>
          <LogEntry
            user={user}
            onSaved={() => {
              setShowForm(false)
              // Refresh daily list if user is on the daily tab
              if (tab === 'daily') fetchLogs()
            }}
          />
        </div>
      )}

    </div>
  )
}

// A single log entry row
function LogCard({ log }) {
  return (
    <div className="py-4 border-b border-white/10">
      <div className="flex justify-between items-baseline mb-1">
        <span className="text-white font-bold text-base">{log.projectName || '—'}</span>
        <span className="text-white font-bold text-base">{log.hours ?? '—'}h</span>
      </div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-white/40 text-sm">{log.startTime} – {log.endTime}</span>
        <StatusBadge status={log.status} />
      </div>
      {log.description && (
        <p className="text-white/50 text-sm leading-snug">{log.description}</p>
      )}
    </div>
  )
}

// Status badge — style differs per status value
function StatusBadge({ status }) {
  if (status === 'approved') {
    return <span className="text-[#FB0007] text-[10px] uppercase tracking-widest">Genehmigt</span>
  }
  if (status === 'rejected') {
    return <span className="text-white/30 text-[10px] uppercase tracking-widest line-through">Abgelehnt</span>
  }
  return <span className="text-white/60 text-[10px] uppercase tracking-widest">Ausstehend</span>
}
