// ProjectSearch.jsx — project selector with search
// Displays last 5 recently used projects (from localStorage).
// Includes a search input that filters the full active project list.
// Used inside LogEntry.jsx to let the user pick a project.

import React from 'react'

export default function ProjectSearch({ projects, onSelect }) {
  return (
    <div className="p-4">
      <h3 className="font-bold mb-2">Select Project</h3>
      <p className="text-gray-400">Project search — coming soon</p>
    </div>
  )
}
