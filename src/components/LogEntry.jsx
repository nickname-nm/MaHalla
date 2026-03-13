// LogEntry.jsx — log entry form
// Members use this to log working hours against a project.
// Fetches active projects from GET /api/projects on mount.
// Submits to POST /api/logs. Shows success message and resets on save.

import React, { useState, useEffect } from 'react'
import ProjectSearch from './ProjectSearch'
import { getTimeOptions, todayString } from '../helpers'

const TIME_OPTIONS = getTimeOptions()

// Label component — uppercase, wide tracking, small white text
function Label({ children }) {
  return (
    <p className="text-[10px] uppercase tracking-[0.2em] text-white/50 mb-2">
      {children}
    </p>
  )
}

// Styled select dropdown — bottom border only, no box
function TimeSelect({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full bg-black text-white text-base border-0 border-b-2 border-[#FB0007] pb-2 outline-none appearance-none cursor-pointer"
    >
      <option value="" disabled>--:--</option>
      {options.map(t => (
        <option key={t} value={t}>{t}</option>
      ))}
    </select>
  )
}

export default function LogEntry({ user, onSaved }) {
  const [date, setDate] = useState(todayString())
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [project, setProject] = useState(null)   // { id, name, type }
  const [description, setDescription] = useState('')
  const [projects, setProjects] = useState([])   // full active project list
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  // Fetch all active projects once on mount
  useEffect(() => {
    async function loadProjects() {
      try {
        const res = await fetch('/api/projects')
        if (!res.ok) return
        const data = await res.json()
        setProjects(data)
      } catch {
        // silently fail — project list will be empty
      }
    }
    loadProjects()
  }, [])

  // End time options — only show times strictly after the selected start time
  const endTimeOptions = startTime
    ? TIME_OPTIONS.filter(t => t > startTime)
    : TIME_OPTIONS

  // All fields must be filled to enable submit
  const canSubmit = date && startTime && endTime && project && description.trim()

  async function handleSubmit(e) {
    e.preventDefault()
    if (!canSubmit || submitting) return

    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          date,
          startTime,
          endTime,
          projectId: project.id,
          description: description.trim()
        })
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Fehler beim Speichern')
        return
      }

      // Success — show confirmation, reset form (keep today's date)
      setSuccess(true)
      setDate(todayString())
      setStartTime('')
      setEndTime('')
      setProject(null)
      setDescription('')

      // Hide the success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000)

      if (onSaved) onSaved()
    } catch {
      setError('Verbindungsfehler — bitte erneut versuchen')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8 px-6 py-8">

      {/* Date */}
      <div>
        <Label>Datum</Label>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="w-full bg-black text-white text-base border-0 border-b-2 border-[#FB0007] pb-2 outline-none"
        />
      </div>

      {/* Start time + End time side by side */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <Label>Von</Label>
          <TimeSelect
            value={startTime}
            onChange={val => {
              setStartTime(val)
              // Reset end time if it's no longer valid
              if (endTime && endTime <= val) setEndTime('')
            }}
            options={TIME_OPTIONS}
          />
        </div>
        <div>
          <Label>Bis</Label>
          <TimeSelect
            value={endTime}
            onChange={setEndTime}
            options={endTimeOptions}
          />
        </div>
      </div>

      {/* Project selector */}
      <div>
        <Label>Projekt</Label>
        <ProjectSearch
          projects={projects}
          selectedName={project?.name}
          onSelect={setProject}
        />
      </div>

      {/* Description */}
      <div>
        <Label>Beschreibung</Label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Was wurde gemacht?"
          rows={3}
          className="w-full bg-black text-white text-base border-0 border-b-2 border-[#FB0007] pb-2 outline-none resize-none placeholder-white/30"
        />
      </div>

      {/* Error message */}
      {error && (
        <p className="text-white/70 text-xs uppercase tracking-widest -mt-4">{error}</p>
      )}

      {/* Success message */}
      {success && (
        <p className="text-white text-xs uppercase tracking-widest -mt-4">
          Stunden gespeichert ✓
        </p>
      )}

      {/* Submit button */}
      <button
        type="submit"
        disabled={!canSubmit || submitting}
        className={[
          'w-full py-4 text-sm font-bold uppercase tracking-[0.2em]',
          canSubmit && !submitting
            ? 'bg-[#FB0007] text-black cursor-pointer'
            : 'bg-[#FB0007] text-black opacity-30 cursor-not-allowed'
        ].join(' ')}
      >
        {submitting ? '...' : 'Stunden eintragen'}
      </button>

    </form>
  )
}
