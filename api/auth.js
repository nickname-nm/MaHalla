// api/auth.js — POST /api/auth
// Validates a user by matching both name and code against the Airtable Users table.
// Expects request body: { name: "John", code: "123456" }
// Name check is case-insensitive.
// Returns 200 { id, name, role, code } on success.
// Returns 401 { error } if no match found or user is inactive.
// Returns 500 { error } if the Airtable request fails.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { name, code } = req.body

  if (!name || !code) {
    return res.status(400).json({ error: 'Name and code are required' })
  }

  const apiKey = process.env.AIRTABLE_API_KEY
  const baseId = process.env.AIRTABLE_BASE_ID

  // Match code exactly, name case-insensitively, and require Active = true
  const formula = encodeURIComponent(
    `AND({Code}="${code}", LOWER({Name})="${name.toLowerCase().trim()}", {Active}=TRUE())`
  )

  const url = `https://api.airtable.com/v0/${baseId}/Users?filterByFormula=${formula}&maxRecords=1`

  let data

  try {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${apiKey}` }
    })

    if (!response.ok) {
      console.error('Airtable request failed:', response.status, await response.text())
      return res.status(500).json({ error: 'Server error' })
    }

    data = await response.json()
  } catch (err) {
    console.error('Airtable fetch error:', err)
    return res.status(500).json({ error: 'Server error' })
  }

  // No matching active user found
  if (!data.records || data.records.length === 0) {
    return res.status(401).json({ error: 'Name oder Code nicht gefunden' })
  }

  // Return the matched user
  const record = data.records[0]
  return res.status(200).json({
    id: record.id,
    name: record.fields.Name,
    role: record.fields.Role,
    code: record.fields.Code
  })
}
