# College Event Management System

A full-stack web app where students can browse and register for campus events, and admins can create and manage those events.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm --filter @workspace/college-events run dev` — run the frontend (port assigned by workflow)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- Required env: `MONGODB_URL` — MongoDB connection string (e.g. MongoDB Atlas)
- Required env: `SESSION_SECRET` — JWT signing secret (already set)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + TanStack Query + Wouter + shadcn/ui
- API: Express 5
- DB: MongoDB + Mongoose
- Auth: JWT (jsonwebtoken + bcryptjs), role-based (student / admin)
- Validation: Zod (`zod/v4`), Orval-generated schemas
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI contract (source of truth)
- `lib/api-client-react/src/generated/` — generated React Query hooks
- `lib/api-zod/src/generated/` — generated Zod validation schemas
- `artifacts/api-server/src/models/` — Mongoose models (User, Event, Registration)
- `artifacts/api-server/src/middlewares/auth.ts` — JWT auth middleware + helpers
- `artifacts/api-server/src/routes/` — Express route handlers
- `artifacts/api-server/src/lib/seed.ts` — Sample data seeder (runs on first startup)
- `artifacts/college-events/src/` — React frontend
- `artifacts/college-events/src/lib/auth.tsx` — AuthContext, ProtectedRoute, AdminRoute

## Architecture decisions

- MongoDB chosen over PostgreSQL for this app (user preference); Mongoose models handle User, Event, Registration
- JWT auth stored in localStorage under key `cem_token`; attached via custom-fetch.ts Authorization header
- Role-based access: `student` and `admin` roles set at registration; admins access `/admin/*` routes
- Seed data runs automatically on first startup if no events exist — creates demo accounts
- `spotsLeft` is maintained as a denormalized counter on the Event document (decremented on register, incremented on unregister)

## Product

- **Browse Events** — public landing page with search, category filter, and event cards
- **Student Auth** — register with student ID, login, JWT persisted in localStorage
- **Admin Auth** — register as admin, full dashboard access
- **Event Registration** — students register/unregister for events with spot tracking
- **My Events** — student view of their registered events
- **Admin Dashboard** — stats (total events, students, registrations, upcoming) + popular events
- **Admin Events** — full CRUD table with participant counts
- **Participants** — admin view of who registered for each event

## Demo Accounts (auto-seeded)

- Admin: `admin@college.edu` / `admin123`
- Student: `alex@college.edu` / `student123`
- Student: `maria@college.edu` / `student123`

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- The API server requires `MONGODB_URL` to start — set it via the Secrets tab or the agent will prompt for it
- `spotsLeft` on Event is a denormalized counter; keep it in sync with Registration inserts/deletes
- Always run codegen after changing `lib/api-spec/openapi.yaml`: `pnpm --filter @workspace/api-spec run codegen`
- JWT secret is `SESSION_SECRET` (already provisioned)

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
