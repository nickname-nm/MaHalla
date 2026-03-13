// DailyView.jsx — member dashboard (daily view)
// Shows all logs for a selected date and the total hours that day.
// Includes day navigation (prev/next) and a link to monthly view.
// Each log shows project, time range, hours, description, and status badge.
// Pending logs can be edited; approved/rejected logs are read-only.

import React from 'react'
import LogEntry from './LogEntry'

export default function DailyView({ user, onLogout }) {
  return (
    <div className="min-h-screen bg-black">
      <header className="bg-black border-b border-white/10 px-6 py-4 flex justify-between items-center">
        <span className="text-white font-bold uppercase tracking-[0.2em] text-sm">MaHalla Stunden</span>
        <button onClick={onLogout} className="text-white/40 text-xs uppercase tracking-widest">Logout</button>
      </header>
      <LogEntry user={user} />
    </div>
  )
}
