CLAUDE.md — MaHalla Stunden| Frontend | React (Vite) + Tailwind CSS |

| PWA | Vite PWA plugin (basic service worker, installable) | | API layer | Vercel serverless functions (/api/*) | | Database | Airtable (new dedicated base) | | Hosting | Vercel (free hobby plan) | | Version control | GitHub || Frontend | React (Vite) + Tailwind CSS |# CLAUDE.md — MaHalla Stunden

Place this file in the root of your repository. Claude Code reads it automatically at the start of every session.
Project Overview

MaHalla Stunden is an internal hour-tracking web app for Mahalla Event Space, Berlin. Staff, freelancers, and project contributors log their working hours against projects. An admin can review, approve, and monitor all logged hours across the team.

This is a mobile-first progressive web app (PWA) built with React, backed by Airtable via Vercel serverless API functions.

Developer Context

The primary developer is a junior-level React developer. Code must be:

Simple and readable — avoid over-engineering
Well commented — future maintainers may not be developers
Modular — components and API functions should be easy to swap or extend
Mobile-first — most users will log hours on their phone
Tech Stack

LayerTechnologyFrontendReact (Vite) + Tailwind CSSPWAVite PWA plugin (basic service worker, installable)API layerVercel serverless functions (/api/*)DatabaseAirtable (new dedicated base)HostingVercel (free hobby plan)Version controlGitHub

Repository Structure

Keep the structure as flat as possible. Do not create extra folders until complexity clearly demands it.

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

Airtable Structure

Base name: MaHalla Stunden Workspace: Mahalla Airtable workspace

Table: Users

FieldTypeNotesNameSingle line textDisplay nameCodeSingle line textUnique login code, e.g. MAR42RoleSingle selectadmin or memberActiveCheckboxDeactivate without deleting

Table: Projects

FieldTypeNotesNameSingle line textProject display nameTypeSingle selectevent or ongoingActiveCheckboxOnly active projects appear in app

Table: Time Logs

FieldTypeNotesUserLink to UsersWho logged the hoursDateDateDate of workStart TimeSingle line texte.g. 09:00End TimeSingle line texte.g. 12:30HoursFormulaCalculate from start/endProjectLink to ProjectsWhich projectDescriptionLong textWhat was doneStatusSingle selectpending, approved, rejectedAdmin NoteSingle line textOptional note from admin on approval/rejectionSubmitted AtCreated timeAuto

Environment Variables

Store in .env.local locally and in Vercel project settings for production. Never commit secrets.

AIRTABLE_API_KEY=your_airtable_personal_access_token
AIRTABLE_BASE_ID=your_base_id

The frontend never calls Airtable directly. All Airtable access goes through /api/* serverless functions.

Authentication

No email/password signup
Each user has a unique personal code (e.g. MAR42, KLA07)
On login, the app sends the code to /api/auth which looks up the user in Airtable
If found and active, returns user name, ID, and role
Role is stored in sessionStorage for the session
No JWT or complex auth needed at this stage — this is an internal tool
User Roles & Permissions

member

Log new hours
View own daily and monthly overview
Edit own pending logs only
Cannot see other users' logs
admin

View all logs across all users
Filter by date range and user
Approve or reject pending logs
Add new projects
View all users
Create new users (name + unique code + role)
Deactivate users (sets Active to false — never delete)
Core Features

1. Login

Single code input field, large and mobile-friendly
On success: redirect to dashboard (member) or admin panel (admin)
2. Log Entry Form

Date picker (defaults to today)
Start time selector — 30-minute steps (07:00 → 23:00)
End time selector — 30-minute steps, must be after start time
Project selector:
Shows recently used projects (last 5, stored in localStorage)
Search input to find any active project by name
Results appear as user types (filter from preloaded project list)
Description — free text, required
Submit button — large, thumb-friendly
3. Member Dashboard

Daily view — all logs for a selected date, total hours that day
Monthly view — logs grouped by project, total hours per project, grand total for the month
Simple month/day navigation
Status badge on each log (pending / approved / rejected)
4. Admin Panel

Date range filter (default: current month)
User filter (all users or select one)
Table/list of all matching logs with: user name, date, hours, project, description, status
Approve / Reject buttons per log
Optional admin note on rejection
Summary row: total hours per user in selected period
Add new project form (name + type)
User management section:
List of all users with name, code, role, active status
Create new user form (name, code, role: admin/member)
Deactivate user toggle (does not delete, just sets Active = false)
Code must be unique — validate against existing users before saving
API Routes

All routes live in /api/ as Vercel serverless functions.

POST   /api/auth              Validate user code, return user info
GET    /api/projects          Fetch all active projects
POST   /api/projects          Create new project (admin only)
GET    /api/logs              Fetch logs (filtered by user, date range)
POST   /api/logs              Create new log entry
PATCH  /api/logs/:id          Update log (edit or approve/reject)
GET    /api/users             Fetch all users (admin only)
POST   /api/users             Create new user (admin only)
PATCH  /api/users/:id         Update user — deactivate or change role (admin only)

Time Handling

All times stored as strings in HH:MM format (e.g. 09:00, 14:30)
Hours calculated as: (endTime - startTime) in decimal hours
Example: 09:00 to 12:30 = 3.5 hours
Utility functions live in src/helpers.js
Time picker shows 30-minute steps only — enforce this in the UI, not just validation
UI & Styling

Mobile-first, designed for phone use
Use Tailwind CSS for all styling — no separate CSS files unless absolutely necessary
Large tap targets (minimum 44px height for buttons and inputs)
No animations or transitions needed at this stage
Focus on clarity over aesthetics
Brand

TokenValuePrimary red#FB0007Black#000000White#FFFFFFFontHelvetica, Arial, sans-serif (system font, no import needed)

Logo file: public/mahalla-logo.svg (or .png) — use in login screen header and PWA manifest
Use red for primary buttons, active states, and key UI accents
Use black for text and navigation
White backgrounds throughout
PWA Requirements

Installable on Android and iOS home screen
Basic offline message if no connection (no offline data sync needed yet)
manifest.json with app name, icons, theme color
Service worker via Vite PWA plugin (minimal config)
What NOT to Build Yet

Do not implement the following unless explicitly asked:

Invoice generation
Billable vs. non-billable hour tracking
Per-user project filtering
Email notifications
Export to CSV
Google Sheets integration
Rate or salary management
Shift scheduling
Code Style & Conventions

Use functional React components with hooks only
No class components
Use async/await not .then() chains
Name components clearly: LogEntry, ProjectSearch, AdminPanel
Keep components small — if a component is getting long, split it
API functions in /api/ should each do one thing only
Add a short comment above every function explaining what it does
Use .env variables for all secrets and config — never hardcode
Deployment

Hosted on Vercel (free hobby plan)
Connected to GitHub — every push to main triggers a deploy
Environment variables set in Vercel project dashboard
Custom domain optional: e.g. stunden.mahalla.berlin
Development Phases

Phase 1 — Core (build first)

Airtable base setup — manual step, done in Airtable UI before running Claude Code
Vercel project + repo connected — manual step
Auth flow (code login)
Log entry form
Member dashboard (daily + monthly view)
Admin panel (view + approve/reject)
Add project form (admin)
Phase 2 — Polish

PWA setup (installable, offline message)
Recent projects in localStorage
Mobile UX refinements
Admin summary totals
Phase 3 — Later

Invoice generation
CSV export
Billable hour tracking
Google Sheets migration (when Google Workspace switch is complete)
Notes for Claude Code

Always check existing files before creating new ones
When adding a new API route, update this CLAUDE.md routes section
Keep Airtable field names consistent with the table definitions above — any changes must be reflected here
When in doubt, do less and ask — this project will be maintained by a junior developer
Prefer explicit over clever code
