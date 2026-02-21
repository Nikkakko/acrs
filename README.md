# Aesthetic Center Reservation System (ACRS)

Monorepo MVP using:
- Frontend: React + Vite (`apps/web`)
- Backend: Express + Prisma (`apps/api`)
- Database: PostgreSQL

## Quick start

1. Start PostgreSQL:
```bash
docker compose up -d
```

2. Install dependencies:
```bash
pnpm install
```

3. Generate Prisma client and push schema:
```bash
pnpm --filter api prisma:generate
pnpm --filter api db:migrate
```

4. Seed demo data:
```bash
pnpm --filter api db:seed
```

5. Run apps:
```bash
pnpm dev
```

- API: `http://localhost:4000`
- Web: `http://localhost:5173`

## Environment

Copy `.env.example` values into your environment (or `.env` in repo root):
- `DATABASE_URL=postgres://postgres:postgres@localhost:5432/acrs`
- `API_PORT=4000`
- `WEB_PORT=5173`

## Current scope in code

- Staff CRUD + search
- Services CRUD + search
- Service custom fields creation
- Service column order persistence endpoints
- Reservation CRUD + day view
- Reservation overlap guard per specialist/day

## Remaining to build from full test brief

- Schedule grid UI with column/time-slot layout
- Reservation modal edit flow on click
- Drag & drop reservation move with snapping + conflict rollback
- Services custom field values in add/edit modal UX
- Services table column drag-and-drop UI
- Video demo recording
