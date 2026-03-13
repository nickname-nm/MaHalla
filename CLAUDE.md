Here's the full updated CLAUDE.md — copy everything below:

---

```
# CLAUDE.md — MaHalla Stunden

## Project Overview

**MaHalla Stunden** is an internal hour-tracking web app for Mahalla Event Space, Berlin. Staff, freelancers, and project contributors log their working hours against projects. An admin can review, approve, and monitor all logged hours across the team.

This is a mobile-first progressive web app (PWA) built with React, backed by Airtable via Vercel serverless API functions.

---

## Developer Context

The primary developer is a junior-level React developer. Code must be:

- **Simple and readable** — avoid over-engineering
- **Well commented** — future maintainers may not be developers
- **Modular** — components and API functions should be easy to swap or extend
- **Mobile-first** — most users will log hours on their phone

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite) + Tailwind CSS |
| PWA | Vite PWA plugin (basic service worker, installable) |
| API layer | Vercel serverless functions (`/api/*`) |
| Database | Airtable (new dedicated base) |
| Hosting | Vercel (free hobby plan) |
| Version control | GitHub |

---

## Repository Structure

Keep the structure **as flat as possible**. Do not create extra folders until complexity clearly demands it.

```
mahalla-stunden/
├── public/
│   ├── mahalla-logo.svg     ← drop logo file here
│   └── manifest.json
├── src/
│   ├── components/          ← all UI components, flat (no subfolders)
│   │   ├── Login.jsx
│   │   ├── LogEntry.jsx
│   │   ├── ProjectSearch.jsx
│   │   ├── DailyView.jsx
│   │   ├── MonthlyView.jsx
│   │   └── AdminPanel.jsx
│   ├── helpers.js           ← time utils and small helper functions
│   ├── App.jsx              ← routing + auth state
│   └── main.jsx
├── api/                     ← Vercel serverless functions
│   ├── auth.js
│   ├── logs.js
│   ├── projects.js
│   └── users.js
├── .env.example
├── .env.local               ← never commit this
├── vercel.json
├── vite.config.js
├── tailwind.config.js
├── CLAUDE.md
└── package.json
```

---

## Airtable Structure

**Base name:** `MaHalla Stunden`
**Workspace:** Mahalla Airtable workspace

### Table: `Users`

| Field | Type | Notes |
|---|---|---|
| Name | Single line text | Display name |
| Code | Single line text | Unique 6-digit login code e.g. `123456` |
| Role | Single select | `admin` or `member` |
| Active | Checkbox | Deactivate without deleting |

### Table: `Projects`

| Field | Type | Notes |
|---|---|---|
| Name | Single line text | Project display name |
| Type | Single select | `event` or `ongoing` |
| Active | Checkbox | Only active projects appear in app |

### Table: `Time Logs`

| Field | Type | Notes |
|---|---|---|
| User | Link to Users | Who logged the hours |
| Date | Date | Date of work |
| Start Time | Single line text | e.g. `09:00` |
| End Time | Single line text | e.g. `12:30` |
| Hours | Formula | Calculate from start/end |
| Project | Link to Projects | Which project |
| Description | Long text | What was done |
| Status | Single select | `pending`, `approved`, `rejected` |
| Admin Note | Single line text | Optional note on approval/rejection |
| Submitted At | Created time | Automatic |

---

## Authentication

- Users log in with a **6-digit numeric code**
- No email, no password, no signup flow
- On login the API checks `Users` table for a matching active code
- On success the user object `{ id, name, role, code }` is saved to `localStorage`
- Admin role unlocks the admin panel
- No JWT or session management needed at this stage

---

## Features & User Roles

### `member`
- Log hours: date, start time, end time (30-min steps), project (search), description
- View own logs by day
- View own monthly summary (total hours per project)

### `admin`
- View all logs across all users
- Filter by date range and user
- Approve or reject `pending` logs
- Add new projects
- View all users
- Create new users (name + unique 6-digit code + role)
- Deactivate users (sets Active to false — never delete)

---

## UI: Log Entry

- Date picker (default today)
- Start time + end time — dropdown in 30-minute steps (`07:00` to `23:30`)
- Project — searchable dropdown, shows all active projects. Recently used projects appear at the top
- Description — free text input
- Submit button → creates log with status `pending`

---

## UI: Member Dashboard

- Default view: today's logs
- Toggle to monthly view: total hours per project for selected month
- Simple list of log entries per day with project name, hours, description, status badge

---

## UI: Admin Panel

- Date range filter + user filter
- Table of all logs: user, date, project, hours, description, status
- Approve / reject buttons per log row
- Optional admin note on rejection
- **User management section:**
  - List of all users with name, code, role, active status
  - Create new user form (name, 6-digit code, role: admin/member)
  - Deactivate user toggle (does not delete, just sets Active = false)
  - Code must be unique — validate against existing users before saving
- Add new project form (name + type)

---

## API Routes

```
POST   /api/auth              Login with code → return user object
GET    /api/projects          Fetch all active projects
POST   /api/projects          Create new project (admin only)
GET    /api/logs              Fetch logs (filtered by user, date range)
POST   /api/logs              Create new log entry
PATCH  /api/logs/:id          Update log (edit or approve/reject)
GET    /api/users             Fetch all users (admin only)
POST   /api/users             Create new user (admin only)
PATCH  /api/users/:id         Update user — deactivate or change role (admin only)
```

---

## Environment Variables

```
AIRTABLE_API_KEY=your_personal_access_token
AIRTABLE_BASE_ID=appXXXXXXXXXXXXXX
```

Never commit `.env.local`. Always use `process.env` in serverless functions.

---

## UI & Styling

- Use **Tailwind CSS** for all styling — no separate CSS files unless absolutely necessary
- Large tap targets (minimum 44px height for buttons and inputs)
- No animations or transitions needed at this stage
- Focus on clarity over aesthetics

### Brand

| Token | Value |
|---|---|
| Primary red | `#FB0007` |
| Black | `#000000` |
| White | `#FFFFFF` |
| Font | Helvetica, Arial, sans-serif (system font, no import needed) |

- Logo file: `public/mahalla-logo.svg` (or `.png`) — use in login screen header and PWA manifest
- Black backgrounds throughout
- White for text and contrast elements

### UI Vibe

This is an internal tool for Mahalla Event Space, Berlin. It should feel like the brand — not a generic SaaS app.

- **Dark, bold, minimal** — black backgrounds, high contrast
- **Brutalist feel** — sharp edges, no rounded corners anywhere, no drop shadows, no gradients
- **Typography** — uppercase labels, wide letter spacing for headings, large bold text for key numbers/times
- **Inputs** — no box borders, use a single bottom border line in red `#FB0007` instead
- **Buttons** — solid red `#FB0007`, black text, bold, uppercase, sharp corners
- **Errors** — white text, minimal, no alert boxes
- **No decorative elements** — no illustrations, no icons unless absolutely necessary for clarity
- Think: Berlin club aesthetic meets functional internal tool

---

## What NOT to Build Yet

- No invoice generation
- No billable/volunteering hour split
- No rate or payroll calculations
- No email notifications
- No test setup
- No user-level project filtering (everyone sees all active projects)

---

## Development Phases

**Phase 1 (now):**
1. Airtable base setup — **manual step, done in Airtable UI before running Claude Code**
2. Vercel project + repo connected — **manual step**
3. Auth flow (login with code)
4. Log entry form
5. Member dashboard (daily + monthly view)
6. Admin panel (view all logs, approve/reject, manage users and projects)

**Phase 2 (later):**
- Invoice generation from approved hours
- CSV export
- Basic API tests

---

## Code Style Rules

- No TypeScript — plain JavaScript only
- No external libraries unless absolutely necessary — use native fetch for all API calls
- Every file must have a comment at the top explaining what it does
- Every function must have a short comment explaining what it does
- Keep components under 150 lines where possible — split if longer
- No console.log left in production code
```