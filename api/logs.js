// api/logs.js — GET and POST /api/logs, PATCH /api/logs/:id
// GET:   Returns time logs filtered by userId and/or date range.
// POST:  Creates a new time log entry for a member.
// PATCH: Updates a log — used for editing, approving, or rejecting.

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // TODO: fetch logs from Airtable filtered by query params
    return res.status(200).json({ message: 'GET logs — not yet implemented' })
  }

  if (req.method === 'POST') {
    // TODO: create new log entry in Airtable
    return res.status(200).json({ message: 'POST logs — not yet implemented' })
  }

  if (req.method === 'PATCH') {
    // TODO: update log status or fields in Airtable
    return res.status(200).json({ message: 'PATCH logs — not yet implemented' })
  }

  res.status(405).json({ error: 'Method not allowed' })
}
