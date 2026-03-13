// DailyView.jsx — member dashboard (daily view)
// Shows all logs for a selected date and the total hours that day.
// Includes day navigation (prev/next) and a link to monthly view.
// Each log shows project, time range, hours, description, and status badge.
// Pending logs can be edited; approved/rejected logs are read-only.

import React from 'react'
import MonthlyView from './MonthlyView'

export default function DailyView({ user, onLogout }) {
  return (
    <div className="min-h-screen bg-white">
      <header className="bg-mahalla-black text-white p-4 flex justify-between items-center">
        <span className="font-bold">MaHalla Stunden</span>
        <button onClick={onLogout} className="text-sm underline">Logout</button>
      </header>
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">My Hours</h2>
        <p className="text-gray-400">Daily view — coming soon</p>
      </div>
    </div>
  )
}
