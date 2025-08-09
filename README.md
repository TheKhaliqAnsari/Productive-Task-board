# TaskBoard App

A Next.js (App Router) task management app with secure JWT auth, protected routes, boards and tasks CRUD, drag-and-drop reordering, responsive UI, light/dark themes, and toast notifications.

## Features
- User authentication with JWT (HTTP-only cookie)
- Protected routes and user-specific data
- Boards: create, rename, delete
- Tasks: create, update (title, description, status, due date), delete
- Drag-and-drop task reordering (dnd-kit)
- List and Grid views for tasks
- Global theme toggle (light/dark) with persistence
- Toast notifications for success/error
- Tailwind CSS styling with subtle animations (framer-motion)

## Tech Stack
- Next.js (App Router)
- React
- Tailwind CSS v4
- @dnd-kit/core, @dnd-kit/sortable
- jsonwebtoken, bcryptjs
- framer-motion

## Getting Started

1) Install dependencies
```bash
npm install
```

2) Run the dev server
```bash
npm run dev
```

Visit http://localhost:3000

## Project Structure
- `app/` pages and API routes
  - `app/api/auth/[...route]` → register, login, logout, me
  - `app/api/boards/[...route]` → boards CRUD
  - `app/api/tasks/[...route]` → tasks CRUD + reorder
- `components/` reusable UI (ThemeToggle, Toast)
- `lib/` utilities (auth, db)
- `data/db.json` JSON database
- `styles/global.css` global styles

## Environment
- Demo secret is hardcoded in `lib/auth.js` for simplicity; use env vars for production.

## Usage Flow
- Register at `/register` → then login `/login` → dashboard `/dashboard`
- Create a board, open it, add tasks, toggle status, reorder tasks via drag handle
- Switch list/grid view, toggle theme in header

## Validation & Error Handling
- Backend: all inputs validated and sanitized with clear HTTP codes (400/401/403/404)
- Frontend: client-side checks with inline errors and toasts; handles invalid JWTs and network errors

## Accessibility
- Keyboard navigable forms and buttons
- ARIA labels for drag handles

## Dependencies
```json
{
  "dependencies": {
    "next": "15.x",
    "react": "19.x",
    "react-dom": "19.x",
    "@dnd-kit/core": "^6.3.1",
    "@dnd-kit/sortable": "^10.0.0",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^3.0.2",
    "framer-motion": "^11"
  }
}
```

## Notes
- Data is persisted in `data/db.json` using synchronous fs; suitable for demo/small apps.
- For production, move secrets to env and replace JSON storage with a database.
