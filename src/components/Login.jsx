// Login.jsx — login screen
// Name field + 4-digit PIN input with dot masking.
// Calls POST /api/auth with { name, code } on submit.

import React, { useState, useRef } from 'react'

const CODE_LENGTH = 4

export default function Login({ onLogin }) {
  const [name, setName]     = useState('')
  const [code, setCode]     = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState(false)
  const inputRef = useRef(null)

  function handleNameChange(e) {
    setName(e.target.value)
    setError(false)
  }

  // Only allow digits, max CODE_LENGTH characters
  function handleCodeChange(e) {
    const val = e.target.value.replace(/\D/g, '').slice(0, CODE_LENGTH)
    setCode(val)
    setError(false)
  }

  const canSubmit = name.trim().length > 0 && code.length === CODE_LENGTH

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
      if (!res.ok) { setError(true); return }
      onLogin(await res.json())
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6">

      {/* Logo */}
      <img src="/mahalla-logo.png" alt="Mahalla" className="w-20 h-20 mb-6 object-contain" />

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

        {/* PIN input — 4 dot boxes, hidden real input underneath */}
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-4">Code</p>

          {/* Tapping the dot boxes focuses the hidden input */}
          <div
            className="flex justify-between gap-3 cursor-text"
            onClick={() => inputRef.current?.focus()}
          >
            {Array.from({ length: CODE_LENGTH }).map((_, i) => {
              const filled = i < code.length
              const active = i === code.length
              return (
                <div
                  key={i}
                  className={[
                    'flex-1 h-14 flex items-center justify-center border-b-2',
                    active ? 'border-[#FB0007]' : filled ? 'border-white/20' : 'border-white/10'
                  ].join(' ')}
                >
                  {filled && <span className="text-white text-2xl">●</span>}
                  {active && <span className="text-[#FB0007] text-2xl font-bold">|</span>}
                </div>
              )
            })}
          </div>

          {/* Hidden input captures the actual digits */}
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            value={code}
            onChange={handleCodeChange}
            autoComplete="off"
            className="opacity-0 absolute w-0 h-0"
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
