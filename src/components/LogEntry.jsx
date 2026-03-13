// LogEntry.jsx — log entry form
// Allows a member to log working hours against a project.
// Fields: date, start time (30-min steps), end time (30-min steps),
// project selector (with search + recent projects), description.
// On submit, calls POST /api/logs.

import React from 'react'

export default function LogEntry({ user, onSaved }) {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Log Hours</h2>
      <p className="text-gray-400">Log entry form — coming soon</p>
    </div>
  )
}
