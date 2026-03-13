// MonthlyView.jsx — monthly hours summary
// Shows total hours per project for the selected month.
// Grand total displayed large at the bottom.
// Fetches from GET /api/logs filtered by userId and the month's date range.

import React, { useState, useEffect } from 'react'
import { currentMonth, monthBounds, formatMonthLabel, shiftMonth } from '../helpers'

export default function MonthlyView({ user }) {
  const [yearMonth, setYearMonth] = useState(currentMonth())
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(false)

  // Fetch logs whenever the selected month changes
  useEffect(() => {
    fetchLogs()
  }, [yearMonth])

  // Fetches all logs for the user within the selected month's date range
  async function fetchLogs() {
    setLoading(true)
    const { start, end } = monthBounds(yearMonth)
    try {
      const res = await fetch(`/api/logs?startDate=${start}&endDate=${end}`)
      if (!res.ok) return
      const all = await res.json()
      setLogs(all.filter(log => log.userName === user.name))
    } catch {
      // silently fail — empty state will show
    } finally {
      setLoading(false)
    }
  }

  // Group logs by project name and sum hours per project
  const byProject = logs.reduce((acc, log) => {
    const name = log.projectName || 'Unknown'
    acc[name] = Math.round(((acc[name] || 0) + (log.hours || 0)) * 10) / 10
    return acc
  }, {})

  // Grand total across all projects, rounded to 1 decimal
  const totalHours = Math.round(
    Object.values(byProject).reduce((sum, h) => sum + h, 0) * 10
  ) / 10

  return (
    <div className="px-6 pt-6">

      {/* Month navigation */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => setYearMonth(shiftMonth(yearMonth, -1))}
          className="text-white/60 text-2xl w-10 text-left"
        >
          ←
        </button>
        <span className="text-white text-xs uppercase tracking-[0.2em] font-bold">
          {formatMonthLabel(yearMonth)}
        </span>
        <button
          onClick={() => setYearMonth(shiftMonth(yearMonth, 1))}
          className="text-white/60 text-2xl w-10 text-right"
        >
          →
        </button>
      </div>

      {loading ? (
        <p className="text-white/30 text-xs uppercase tracking-widest text-center py-16">Loading...</p>
      ) : Object.keys(byProject).length === 0 ? (
        <p className="text-white/30 text-xs uppercase tracking-widest text-center py-16">No entries</p>
      ) : (
        <>
          {/* Per-project rows */}
          {Object.entries(byProject).map(([name, hours]) => (
            <div key={name} className="flex justify-between items-center py-4 border-b border-white/10">
              <span className="text-white text-base">{name}</span>
              <span className="text-white font-bold text-base">{hours}h</span>
            </div>
          ))}

          {/* Grand total */}
          <div className="flex justify-between items-end pt-8">
            <span className="text-white/40 text-xs uppercase tracking-[0.2em]">Total</span>
            <span className="text-white font-bold text-5xl leading-none">{totalHours}h</span>
          </div>
        </>
      )}

    </div>
  )
}
