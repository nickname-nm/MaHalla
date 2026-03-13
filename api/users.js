// api/users.js — GET, POST, PATCH /api/users
//
// All routes are admin only. Role is checked from the request body (GET uses
// a query param since GET requests have no body).
//
// GET  /api/users?role=admin
//   Returns all users sorted A→Z by name.
//   Response: [{ id, name, code, role, active }, ...]
//
// POST /api/users
//   Creates a new user. Code must be exactly 6 digits and not already taken.
//   Request body: { name, code, role, adminRole }
//   Response: { id, name, code, role, active }
//
// PATCH /api/users/:id
//   Updates a user's active status or role. Never deletes users.
//   Request body: { active, role, adminRole }
//   Response: { id, name, code, role, active }

const AIRTABLE_API_URL = 'https://api.airtable.com/v0'
const VALID_ROLES = ['admin', 'member']

export default async function handler(req, res) {
  const apiKey = process.env.AIRTABLE_API_KEY
  const baseId = process.env.AIRTABLE_BASE_ID

  if (req.method === 'GET') {
    return getUsers(apiKey, baseId, req, res)
  }

  if (req.method === 'POST') {
    return createUser(apiKey, baseId, req, res)
  }

  if (req.method === 'PATCH') {
    return updateUser(apiKey, baseId, req, res)
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

// Maps a raw Airtable record to the shape the frontend expects.
function formatRecord(record) {
  const f = record.fields
  return {
    id: record.id,
    name: f.Name ?? null,
    code: f.Code ?? null,
    role: f.Role ?? null,
    active: f.Active ?? false
  }
}

// Fetches all users from Airtable sorted A→Z by name. Admin only.
// Role is passed as a query param since GET requests have no body.
async function getUsers(apiKey, baseId, req, res) {
  if (req.query.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' })
  }

  const url = `${AIRTABLE_API_URL}/${baseId}/Users`
    + `?sort[0][field]=Name&sort[0][direction]=asc`

  const allUsers = []

  try {
    let pageUrl = url

    // Loop through Airtable pages (100 records per page max)
    while (pageUrl) {
      const response = await fetch(pageUrl, {
        headers: { Authorization: `Bearer ${apiKey}` }
      })

      if (!response.ok) {
        console.error('Airtable GET users failed:', response.status, await response.text())
        return res.status(500).json({ error: 'Server error' })
      }

      const data = await response.json()

      for (const record of data.records) {
        allUsers.push(formatRecord(record))
      }

      // Follow the offset token if more pages exist
      pageUrl = data.offset ? `${url}&offset=${data.offset}` : null
    }

    return res.status(200).json(allUsers)
  } catch (err) {
    console.error('Airtable fetch error:', err)
    return res.status(500).json({ error: 'Server error' })
  }
}

// Creates a new user in Airtable. Admin only.
// Validates code format and uniqueness before writing.
async function createUser(apiKey, baseId, req, res) {
  const { name, code, role, adminRole } = req.body

  if (adminRole !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' })
  }

  if (!name || !code || !role) {
    return res.status(400).json({ error: 'name, code and role are required' })
  }

  // Code must be exactly 6 digits
  if (!/^\d{6}$/.test(code)) {
    return res.status(400).json({ error: 'Code must be exactly 6 digits' })
  }

  if (!VALID_ROLES.includes(role)) {
    return res.status(400).json({ error: `Role must be one of: ${VALID_ROLES.join(', ')}` })
  }

  // Check that the code is not already used by another user
  const duplicate = await findUserByCode(apiKey, baseId, code)
  if (duplicate === null) {
    // null means the Airtable check itself failed
    return res.status(500).json({ error: 'Server error' })
  }
  if (duplicate !== false) {
    return res.status(409).json({ error: 'Code already exists' })
  }

  const url = `${AIRTABLE_API_URL}/${baseId}/Users`

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fields: {
          Name: name,
          Code: code,
          Role: role,
          Active: true
        }
      })
    })

    if (!response.ok) {
      console.error('Airtable POST user failed:', response.status, await response.text())
      return res.status(500).json({ error: 'Server error' })
    }

    const record = await response.json()
    return res.status(201).json(formatRecord(record))
  } catch (err) {
    console.error('Airtable fetch error:', err)
    return res.status(500).json({ error: 'Server error' })
  }
}

// Updates a user's active status or role. Admin only.
// The user ID is the last segment of the request URL: /api/users/:id
async function updateUser(apiKey, baseId, req, res) {
  const id = req.url.split('/').pop().split('?')[0]

  if (!id) {
    return res.status(400).json({ error: 'User ID is required' })
  }

  const { active, role, adminRole } = req.body

  if (adminRole !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' })
  }

  if (role && !VALID_ROLES.includes(role)) {
    return res.status(400).json({ error: `Role must be one of: ${VALID_ROLES.join(', ')}` })
  }

  // Only allow updating active and role — build fields object from what was provided
  const fields = {}
  if (active !== undefined) fields.Active = active
  if (role !== undefined) fields.Role = role

  if (Object.keys(fields).length === 0) {
    return res.status(400).json({ error: 'Nothing to update' })
  }

  const url = `${AIRTABLE_API_URL}/${baseId}/Users/${id}`

  try {
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ fields })
    })

    if (!response.ok) {
      console.error('Airtable PATCH user failed:', response.status, await response.text())
      return res.status(500).json({ error: 'Server error' })
    }

    const record = await response.json()
    return res.status(200).json(formatRecord(record))
  } catch (err) {
    console.error('Airtable fetch error:', err)
    return res.status(500).json({ error: 'Server error' })
  }
}

// Checks whether a code is already in use by any user (active or not).
// Returns the matching record if found, false if not found, null on error.
async function findUserByCode(apiKey, baseId, code) {
  const formula = encodeURIComponent(`{Code}="${code}"`)
  const url = `${AIRTABLE_API_URL}/${baseId}/Users?filterByFormula=${formula}&maxRecords=1`

  try {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${apiKey}` }
    })

    if (!response.ok) {
      console.error('Airtable code check failed:', response.status, await response.text())
      return null
    }

    const data = await response.json()
    return data.records.length > 0 ? data.records[0] : false
  } catch (err) {
    console.error('Airtable fetch error:', err)
    return null
  }
}
