// api/logs.js — GET, POST, PATCH /api/logs
//
// GET  /api/logs?userId=...&startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
//   Returns time logs filtered by userId and/or date range, newest first.
//   Response: [{ id, userId, userName, date, startTime, endTime, hours,
//               projectId, projectName, description, status, adminNote, submittedAt }, ...]
//
// POST /api/logs
//   Creates a new log entry with status "pending".
//   Request body: { userId, date, startTime, endTime, projectId, description }
//   Response: the created log object (same shape as GET items)
//
// PATCH /api/logs/:id
//   Updates a log's status and/or adminNote (approve, reject, or revert to pending).
//   Request body: { status, adminNote }
//   Response: the updated log object (same shape as GET items)

const AIRTABLE_API_URL = 'https://api.airtable.com/v0'
const VALID_STATUSES = ['pending', 'approved', 'rejected']

export default async function handler(req, res) {
  const apiKey = process.env.AIRTABLE_API_KEY
  const baseId = process.env.AIRTABLE_BASE_ID

  if (req.method === 'GET') {
    return getLogs(apiKey, baseId, req, res)
  }

  if (req.method === 'POST') {
    return createLog(apiKey, baseId, req, res)
  }

  if (req.method === 'PATCH') {
    return updateLog(apiKey, baseId, req, res)
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

// Calculates decimal hours between two HH:MM strings.
// Example: calcHours('09:00', '12:30') → 3.5
function calcHours(startTime, endTime) {
  const [startH, startM] = startTime.split(':').map(Number)
  const [endH, endM] = endTime.split(':').map(Number)
  return ((endH * 60 + endM) - (startH * 60 + startM)) / 60
}

// Maps a raw Airtable record to the shape the frontend expects.
// Linked record fields (User, Project) are arrays of record IDs in Airtable,
// so we take the first element of each array.
function formatRecord(record) {
  const f = record.fields
  return {
    id: record.id,
    userId: f.User?.[0] ?? null,
    userName: f['User Name'] ?? null,  // populated via Airtable lookup field
    date: f.Date ?? null,
    startTime: f['Start Time'] ?? null,
    endTime: f['End Time'] ?? null,
    hours: f.Hours ?? null,
    projectId: f.Project?.[0] ?? null,
    projectName: f['Project Name'] ?? null, // populated via Airtable lookup field
    description: f.Description ?? null,
    status: f.Status ?? 'pending',
    adminNote: f['Admin Note'] ?? null,
    submittedAt: f['Submitted At'] ?? null
  }
}

// Fetches logs from Airtable, filtered by optional userId and/or date range.
// Handles Airtable pagination and sorts results by date descending.
async function getLogs(apiKey, baseId, req, res) {
  const { userId, startDate, endDate } = req.query

  // Build filter clauses — only add the ones we actually have values for
  const clauses = []

  if (userId) {
    // Airtable linked record fields need FIND() to match by record ID
    clauses.push(`FIND("${userId}", ARRAYJOIN({User}))`)
  }

  if (startDate) {
    clauses.push(`{Date}>="${startDate}"`)
  }

  if (endDate) {
    clauses.push(`{Date}<="${endDate}"`)
  }

  const formula = clauses.length > 0
    ? encodeURIComponent(`AND(${clauses.join(',')})`)
    : ''

  const baseUrl = `${AIRTABLE_API_URL}/${baseId}/Time%20Logs`
    + `?sort[0][field]=Date&sort[0][direction]=desc`
    + (formula ? `&filterByFormula=${formula}` : '')

  const allLogs = []

  try {
    let url = baseUrl

    // Loop through Airtable pages (100 records per page max)
    while (url) {
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${apiKey}` }
      })

      if (!response.ok) {
        console.error('Airtable GET logs failed:', response.status, await response.text())
        return res.status(500).json({ error: 'Server error' })
      }

      const data = await response.json()

      for (const record of data.records) {
        allLogs.push(formatRecord(record))
      }

      // Follow the offset token if more pages exist
      url = data.offset
        ? `${baseUrl}&offset=${data.offset}`
        : null
    }

    return res.status(200).json(allLogs)
  } catch (err) {
    console.error('Airtable fetch error:', err)
    return res.status(500).json({ error: 'Server error' })
  }
}

// Creates a new log entry in Airtable with status set to "pending".
async function createLog(apiKey, baseId, req, res) {
  const { userId, date, startTime, endTime, projectId, description } = req.body

  if (!userId || !date || !startTime || !endTime || !projectId || !description) {
    return res.status(400).json({ error: 'All fields are required' })
  }

  if (endTime <= startTime) {
    return res.status(400).json({ error: 'End time must be after start time' })
  }

  const hours = calcHours(startTime, endTime)

  const url = `${AIRTABLE_API_URL}/${baseId}/Time%20Logs`

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fields: {
          User: [userId],       // linked record — must be an array
          Date: date,
          'Start Time': startTime,
          'End Time': endTime,
          Hours: hours,
          Project: [projectId], // linked record — must be an array
          Description: description,
          Status: 'pending'
        }
      })
    })

    if (!response.ok) {
      console.error('Airtable POST log failed:', response.status, await response.text())
      return res.status(500).json({ error: 'Server error' })
    }

    const record = await response.json()
    return res.status(201).json(formatRecord(record))
  } catch (err) {
    console.error('Airtable fetch error:', err)
    return res.status(500).json({ error: 'Server error' })
  }
}

// Updates a log's status and optional admin note.
// Call as: PATCH /api/logs?id=recXXXXXX
async function updateLog(apiKey, baseId, req, res) {
  const id = req.query.id

  if (!id) {
    return res.status(400).json({ error: 'Log ID is required' })
  }

  const { status, adminNote } = req.body

  if (status && !VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: `Status must be one of: ${VALID_STATUSES.join(', ')}` })
  }

  // Only send fields that were actually provided
  const fields = {}
  if (status) fields.Status = status
  if (adminNote !== undefined) fields['Admin Note'] = adminNote

  if (Object.keys(fields).length === 0) {
    return res.status(400).json({ error: 'Nothing to update' })
  }

  const url = `${AIRTABLE_API_URL}/${baseId}/Time%20Logs/${id}`

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
      console.error('Airtable PATCH log failed:', response.status, await response.text())
      return res.status(500).json({ error: 'Server error' })
    }

    const record = await response.json()
    return res.status(200).json(formatRecord(record))
  } catch (err) {
    console.error('Airtable fetch error:', err)
    return res.status(500).json({ error: 'Server error' })
  }
}
