# Aesthetic Center Reservation System (ACRS)

A full-stack MVP for managing staff, services, and reservations in an aesthetic / beauty center. Built with React, Express, and PostgreSQL.

## Tech Stack

| Layer    | Technology                                                              |
| -------- | ----------------------------------------------------------------------- |
| Frontend | React 19, Vite, TanStack Query, React Router 7, Tailwind CSS, shadcn/ui |
| Backend  | Node.js, Express 5, Prisma                                              |
| Database | PostgreSQL                                                              |

## Quick Start

1. **Start PostgreSQL:**

   ```bash
   docker compose up -d
   ```

2. **Install dependencies:**

   ```bash
   pnpm install
   ```

3. **Generate Prisma client and run migrations:**

   ```bash
   pnpm --filter api prisma:generate
   pnpm --filter api db:migrate
   ```

4. **Seed demo data:**

   ```bash
   pnpm --filter api db:seed
   ```

5. **Run the app:**
   ```bash
   pnpm dev
   ```

- **API:** http://localhost:4000
- **Web:** http://localhost:5173

## Environment

Copy `.env.example` to `.env` and set:

| Variable       | Description                         |
| -------------- | ----------------------------------- |
| `DATABASE_URL` | PostgreSQL connection string        |
| `API_PORT`     | API server port (default: 4000)     |
| `WEB_PORT`     | Web dev server port (default: 5173) |

Example:

```
DATABASE_URL=postgres://postgres:postgres@localhost:5432/acrs
API_PORT=4000
WEB_PORT=5173
```

## Project Structure

```
acrs/
├── apps/
│   ├── api/          # Express API, Prisma, REST endpoints
│   └── web/          # React SPA, Vite
├── docker-compose.yml
└── pnpm-workspace.yaml
```

## Features

### Schedule Page

- Time-based calendar: columns = specialists, rows = 30-min slots
- Create reservation by clicking a slot; modal with date, time, specialist, duration, services
- Edit reservation by clicking a block
- Delete reservation via modal
- Drag-and-drop to move reservations (same/different specialist, time slots)
- Snap to 30-min grid; overlap prevention; ghost preview and cursor feedback

### Staff Page

- List of specialists with photo, name, surname
- Search by name or surname (debounced, URL-synced via nuqs)
- Add, edit, delete staff with photo upload

### Services Page

- List of services with color, name, price
- Search by name and custom fields (debounced, URL-synced)
- Add custom fields; columns persist and can be reordered via drag-and-drop
- Add, edit, delete services; custom field columns can be removed from header
- Color palette for service/reservation styling

### Data & Logic

- One reservation → one specialist, one or multiple services
- End time = start time + duration
- No overlapping reservations per specialist
- Past slots disabled for new reservations

## Scripts

| Command                           | Description                                |
| --------------------------------- | ------------------------------------------ |
| `pnpm dev`                        | Run API and web app in parallel            |
| `pnpm build`                      | Build all packages                         |
| `pnpm typecheck`                  | Run TypeScript checks                      |
| `pnpm --filter api prisma:studio` | Open Prisma Studio for database inspection |
