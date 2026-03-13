// ProjectSearch.jsx — searchable project selector
// Shows up to 5 recently used projects at the top (stored in localStorage).
// A search input filters the full active project list as the user types.
// Calls props.onSelect(project) when a project is chosen and saves it to recents.

import React, { useState, useEffect, useRef } from 'react'

// localStorage key for recently used projects
const RECENTS_KEY = 'mahalla_recent_projects'
const MAX_RECENTS = 5

// Reads recent projects from localStorage — returns an array of { id, name, type }
function getRecents() {
  try {
    return JSON.parse(localStorage.getItem(RECENTS_KEY)) || []
  } catch {
    return []
  }
}

// Saves a project to the front of the recents list, capped at MAX_RECENTS
function saveRecent(project) {
  const existing = getRecents().filter(p => p.id !== project.id)
  const updated = [project, ...existing].slice(0, MAX_RECENTS)
  localStorage.setItem(RECENTS_KEY, JSON.stringify(updated))
}

export default function ProjectSearch({ projects, onSelect, selectedName }) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [recents, setRecents] = useState(getRecents)
  const containerRef = useRef(null)

  // Close dropdown when clicking outside the component
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Filter the full project list by the search query (case-insensitive)
  const filtered = query.trim()
    ? projects.filter(p => p.name.toLowerCase().includes(query.toLowerCase()))
    : projects

  // When searching, hide recents — they would just duplicate results
  const showRecents = !query.trim() && recents.length > 0

  // Dedup recents against the full list in case a project was deactivated
  const validRecents = recents.filter(r => projects.some(p => p.id === r.id))

  function handleSelect(project) {
    saveRecent(project)
    setRecents(getRecents())
    setQuery('')
    setOpen(false)
    onSelect(project)
  }

  return (
    <div ref={containerRef} className="relative">

      {/* Trigger field — shows selected project name or search input when open */}
      <div
        className="border-b-2 border-[#FB0007] pb-2 cursor-pointer"
        onClick={() => setOpen(true)}
      >
        {open ? (
          <input
            autoFocus
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search project..."
            className="w-full bg-transparent text-white text-base outline-none placeholder-white/30"
          />
        ) : (
          <p className={`text-base ${selectedName ? 'text-white' : 'text-white/30'}`}>
            {selectedName || 'Select project'}
          </p>
        )}
      </div>

      {/* Dropdown list */}
      {open && (
        <div className="absolute z-10 top-full left-0 right-0 bg-black border border-white/10 max-h-64 overflow-y-auto">

          {/* Recently used projects */}
          {showRecents && (
            <>
              <p className="px-4 pt-3 pb-1 text-[10px] uppercase tracking-[0.2em] text-white/30">
                Recently used
              </p>
              {validRecents.map(project => (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => handleSelect(project)}
                  className="w-full text-left px-4 py-3 text-white text-sm hover:bg-white/10 border-b border-white/5"
                >
                  {project.name}
                </button>
              ))}
              <div className="border-b border-white/10 my-1" />
            </>
          )}

          {/* Filtered project list — exclude items already shown in recents */}
          {filtered.filter(p => !showRecents || !validRecents.some(r => r.id === p.id)).length > 0 ? (
            filtered.filter(p => !showRecents || !validRecents.some(r => r.id === p.id)).map(project => (
              <button
                key={project.id}
                type="button"
                onClick={() => handleSelect(project)}
                className="w-full text-left px-4 py-3 text-white text-sm hover:bg-white/10 border-b border-white/5 last:border-0"
              >
                {project.name}
              </button>
            ))
          ) : (
            <p className="px-4 py-3 text-white/30 text-sm">No project found</p>
          )}

        </div>
      )}
    </div>
  )
}
