// api/users.js — GET, POST, PATCH /api/users
// GET:   Returns all users — admin only.
// POST:  Creates a new user with name, unique code, and role — admin only.
// PATCH: Updates a user — deactivate or change role — admin only.
//        Never deletes users; sets Active = false instead.

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // TODO: fetch all users from Airtable (admin only)
    return res.status(200).json({ message: 'GET users — not yet implemented' })
  }

  if (req.method === 'POST') {
    // TODO: create new user in Airtable, validate code is unique
    return res.status(200).json({ message: 'POST users — not yet implemented' })
  }

  if (req.method === 'PATCH') {
    // TODO: update user (deactivate or change role)
    return res.status(200).json({ message: 'PATCH users — not yet implemented' })
  }

  res.status(405).json({ error: 'Method not allowed' })
}
