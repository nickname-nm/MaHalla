// Login.jsx — login screen
// Single 6-digit code input. Calls POST /api/auth on submit.
// On success, passes user data up to App.jsx via props.onLogin().

import React, { useState } from 'react'

export default function Login({ onLogin }) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  // Only allow digits, max 6 characters
  function handleChange(e) {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6)
    setCode(val)
    setError(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (code.length !== 6) return

    setLoading(true)
    setError(false)

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      })

      if (!res.ok) {
        setError(true)
        return
      }

      const user = await res.json()
      onLogin(user)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6">

      {/* Logo */}
      <img
        src="/mahalla-logo.png"
        alt="Mahalla"
        className="w-20 h-20 mb-6 object-contain"
      />

      {/* App name */}
      <h1
        className="text-white font-bold uppercase mb-12 tracking-[0.25em] text-sm"
      >
        MaHalla Stunden
      </h1>

      <form onSubmit={handleSubmit} className="w-full max-w-xs flex flex-col gap-10">

        {/* Code input — bottom border only, no box */}
        <input
          type="text"
          inputMode="numeric"
          pattern="\d{6}"
          value={code}
          onChange={handleChange}
          placeholder="000000"
          autoFocus
          className={[
            'bg-transparent text-white text-center text-4xl font-bold tracking-[0.3em]',
            'border-0 border-b-2 outline-none w-full pb-2',
            'placeholder-white/20',
            error ? 'border-white' : 'border-[#FB0007]'
          ].join(' ')}
        />

        {/* Error message */}
        <p
          className={[
            'text-white/60 text-xs uppercase tracking-widest text-center -mt-6 transition-opacity duration-150',
            error ? 'opacity-100' : 'opacity-0'
          ].join(' ')}
        >
          Code nicht gefunden
        </p>

        {/* Submit button */}
        <button
          type="submit"
          disabled={code.length !== 6 || loading}
          className={[
            'w-full py-4 text-sm font-bold uppercase tracking-[0.2em]',
            'transition-opacity duration-150',
            code.length === 6 && !loading
              ? 'bg-[#FB0007] text-black opacity-100 cursor-pointer'
              : 'bg-[#FB0007] text-black opacity-30 cursor-not-allowed'
          ].join(' ')}
        >
          {loading ? '...' : 'Anmelden'}
        </button>

      </form>
    </div>
  )
}
