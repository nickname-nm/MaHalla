// Login.jsx — login screen
// Shows a single code input field (e.g. MAR42).
// On submit, calls /api/auth to validate the code.
// On success, calls props.onLogin(userData) to set auth state in App.jsx.

import React from 'react'

export default function Login({ onLogin }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6">
      <h1 className="text-3xl font-bold text-mahalla-black mb-8">MaHalla Stunden</h1>
      <p className="text-gray-400">Login placeholder — coming soon</p>
    </div>
  )
}
