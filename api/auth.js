// api/auth.js — POST /api/auth
// Validates a user login code against the Airtable Users table.
// Returns { name, id, role } if the code is found and the user is active.
// Returns 401 if the code is not found or the user is inactive.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // TODO: implement auth logic
  res.status(200).json({ message: 'Auth endpoint — not yet implemented' })
}
