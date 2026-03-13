// AdminPanel.jsx — admin dashboard
// Allows admins to:
//   - View all logs filtered by date range and user
//   - Approve or reject individual logs (with optional note)
//   - Add new projects (name + type)
//   - Manage users: view list, create new user, deactivate user
// All data is fetched from /api/logs, /api/projects, /api/users.

import React from 'react'

export default function AdminPanel({ user, onLogout }) {
  return (
    <div className="min-h-screen bg-white">
      <header className="bg-mahalla-red text-white p-4 flex justify-between items-center">
        <span className="font-bold">MaHalla Stunden — Admin</span>
        <button onClick={onLogout} className="text-sm underline">Logout</button>
      </header>
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Admin Panel</h2>
        <p className="text-gray-400">Admin panel — coming soon</p>
      </div>
    </div>
  )
}
