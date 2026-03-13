// api/projects.js — GET and POST /api/projects
// GET:  Returns all active projects from Airtable (used to populate project selector).
// POST: Creates a new project — admin only.

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // TODO: fetch active projects from Airtable
    return res.status(200).json({ message: 'GET projects — not yet implemented' })
  }

  if (req.method === 'POST') {
    // TODO: create new project in Airtable (admin only)
    return res.status(200).json({ message: 'POST projects — not yet implemented' })
  }

  res.status(405).json({ error: 'Method not allowed' })
}
