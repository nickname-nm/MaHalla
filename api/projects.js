// api/projects.js — GET and POST /api/projects
//
// GET  /api/projects
//   Returns all active projects sorted alphabetically by name.
//   Response: [{ id, name, type }, ...]
//
// POST /api/projects
//   Creates a new project in Airtable. Admin only.
//   Request body: { name, type, role }
//   Response: { id, name, type }

const AIRTABLE_API_URL = 'https://api.airtable.com/v0'

export default async function handler(req, res) {
  const apiKey = process.env.AIRTABLE_API_KEY
  const baseId = process.env.AIRTABLE_BASE_ID

  if (req.method === 'GET') {
    return getProjects(apiKey, baseId, res)
  }

  if (req.method === 'POST') {
    return createProject(apiKey, baseId, req, res)
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

// Fetches all active projects from Airtable, sorted A→Z by name.
// Handles Airtable pagination by following the offset token if present.
async function getProjects(apiKey, baseId, res) {
  const allProjects = []

  // Filter to active projects only, sorted alphabetically
  const formula = encodeURIComponent('{Active}=TRUE()')
  let url = `${AIRTABLE_API_URL}/${baseId}/Projects?filterByFormula=${formula}&sort[0][field]=Name&sort[0][direction]=asc`

  try {
    // Loop through Airtable pages (each page returns up to 100 records)
    while (url) {
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${apiKey}` }
      })

      if (!response.ok) {
        console.error('Airtable GET projects failed:', response.status, await response.text())
        return res.status(500).json({ error: 'Server error' })
      }

      const data = await response.json()

      // Map each record to only the fields the frontend needs
      for (const record of data.records) {
        allProjects.push({
          id: record.id,
          name: record.fields.Name,
          type: record.fields.Type
        })
      }

      // If Airtable returns an offset token there are more pages to fetch
      url = data.offset
        ? `${AIRTABLE_API_URL}/${baseId}/Projects?filterByFormula=${formula}&sort[0][field]=Name&sort[0][direction]=asc&offset=${data.offset}`
        : null
    }

    return res.status(200).json(allProjects)
  } catch (err) {
    console.error('Airtable fetch error:', err)
    return res.status(500).json({ error: 'Server error' })
  }
}

// Creates a new project in Airtable. Admin role required.
async function createProject(apiKey, baseId, req, res) {
  const { name, type, role } = req.body

  // Only admins may create projects
  if (role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' })
  }

  if (!name || !type) {
    return res.status(400).json({ error: 'name and type are required' })
  }

  const url = `${AIRTABLE_API_URL}/${baseId}/Projects`

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
          Type: type,
          Active: true
        }
      })
    })

    if (!response.ok) {
      console.error('Airtable POST project failed:', response.status, await response.text())
      return res.status(500).json({ error: 'Server error' })
    }

    const record = await response.json()

    return res.status(201).json({
      id: record.id,
      name: record.fields.Name,
      type: record.fields.Type
    })
  } catch (err) {
    console.error('Airtable fetch error:', err)
    return res.status(500).json({ error: 'Server error' })
  }
}
