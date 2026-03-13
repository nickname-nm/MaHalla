// Login.jsx — login screen
// Two fields: name (text) and 6-digit code (numeric).
// On submit, calls POST /api/auth with { name, code }.
// On success, passes user data up to App.jsx via props.onLogin().

import React, { useState } from 'react'

export default function Login({ onLogin }) {
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  // Only allow digits, max 6 characters
  function handleCodeChange(e) {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6)
    setCode(val)
    setError(false)
  }

  function handleNameChange(e) {
    setName(e.target.value)
    setError(false)
  }

  const canSubmit = name.trim().length > 0 && code.length === 6

  async function handleSubmit(e) {
    e.preventDefault()
    if (!canSubmit) return

    setLoading(true)
    setError(false)

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), code })
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
      <h1 className="text-white font-bold uppercase mb-12 tracking-[0.25em] text-sm">
        MaHalla Stunden
      </h1>

      <form onSubmit={handleSubmit} className="w-full max-w-xs flex flex-col gap-8">

        {/* Name input */}
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-2">Name</p>
          <input
            type="text"
            value={name}
            onChange={handleNameChange}
            placeholder="Dein Name"
            autoFocus
            autoComplete="off"
            className="bg-transparent text-white text-xl font-bold w-full border-0 border-b-2 border-[#FB0007] pb-2 outline-none placeholder-white/20"
          />
        </div>

        {/* Code input */}
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-2">Code</p>
          <input
            type="text"
            inputMode="numeric"
            pattern="\d{6}"
            value={code}
            onChange={handleCodeChange}
            placeholder="000000"
            autoComplete="off"
            className="bg-transparent text-white text-xl font-bold tracking-[0.3em] w-full border-0 border-b-2 border-[#FB0007] pb-2 outline-none placeholder-white/20"
          />
        </div>

        {/* Error message */}
        <p className={[
          'text-white/60 text-xs uppercase tracking-widest text-center -mt-4',
          error ? 'opacity-100' : 'opacity-0'
        ].join(' ')}>
          Name oder Code nicht gefunden
        </p>

        {/* Submit button */}
        <button
          type="submit"
          disabled={!canSubmit || loading}
          className={[
            'w-full py-4 text-sm font-bold uppercase tracking-[0.2em]',
            canSubmit && !loading
              ? 'bg-[#FB0007] text-black cursor-pointer'
              : 'bg-[#FB0007] text-black opacity-30 cursor-not-allowed'
          ].join(' ')}
        >
          {loading ? '...' : 'Anmelden'}
        </button>

      </form>
    </div>
  )
}
