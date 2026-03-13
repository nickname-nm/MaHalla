// DailyView.jsx — member dashboard (ÜBERSICHT view)
// Shows daily log list with date navigation and a monthly summary.
// Tab toggle between TAG (daily) and MONAT (monthly).
// Header and navigation are handled by App.jsx.

import React, { useState, useEffect } from 'react'
import MonthlyView from './MonthlyView'
import { todayString, shiftDate, formatDayLabel } from '../helpers'

export default function DailyView({ user }) {
  const [tab, setTab] = useState('daily')
  const [date, setDate] = useState(todayString())
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(false)

  // Fetch logs for the selected date whenever date or tab changes
  useEffect(() => {
    if (tab === 'daily') fetchLogs()
  }, [date, tab])

  // Fetches logs from the API for the currently selected date
  async function fetchLogs() {
    setLoading(true)
    try {
      const res = await fetch(`/api/logs?userName=${encodeURIComponent(user.name)}&startDate=${date}&endDate=${date}`)
      if (!res.ok) return
      setLogs(await res.json())
    } catch {
      // silently fail — empty state will show
    } finally {
      setLoading(false)
    }
  }

  // Sum all hours for the day, rounded to 1 decimal
  const totalHours = Math.round(
    logs.reduce((sum, log) => sum + (log.hours || 0), 0) * 10
  ) / 10

  return (
    <div className="bg-black">

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
            {t === 'daily' ? 'Day' : 'Month'}
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
            <p className="text-white/30 text-xs uppercase tracking-widest text-center py-16">Loading...</p>
          ) : logs.length === 0 ? (
            <p className="text-white/30 text-xs uppercase tracking-widest text-center py-16">No entries</p>
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

      {/* Monthly view */}
      {tab === 'monthly' && <MonthlyView user={user} />}

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
  if (status === 'approved') return <span className="text-[#FB0007] text-[10px] uppercase tracking-widest">Approved</span>
  if (status === 'rejected') return <span className="text-white/30 text-[10px] uppercase tracking-widest line-through">Rejected</span>
  return <span className="text-white/60 text-[10px] uppercase tracking-widest">Pending</span>
}
