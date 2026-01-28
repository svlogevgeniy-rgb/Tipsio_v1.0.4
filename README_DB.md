# 🗄️ Local Database Setup

This guide explains how to bring up the PostgreSQL database that powers Tipsio on your workstation. Follow these steps and a brand-new database (with seed data and a test account) will be ready in under two minutes.

---

## Requirements

- **Docker Desktop** (or Docker Engine) with Compose v2 support
- **Node.js 20+** and the project dependencies (`npm install`)
- **OpenSSL** (only if you want to generate fresh secrets)

> If Docker is not available, see [Manual setup](#manual-setup-without-docker) for alternative instructions.

---

## 1. Configure Environment Variables

1. Copy the example file and edit it:
   ```bash
   cp .env.example .env
   ```
2. Update the database-related values if you need to use a non-default port or credentials:

   ```env
   DB_HOST="localhost"
   DB_PORT="5432"
   DB_USER="tipsio"
   DB_PASSWORD="postgres"
   DB_NAME="tipsio"
   DATABASE_URL="postgresql://tipsio:postgres@localhost:5432/tipsio?schema=public"
   ```

`docker-compose` automatically reads `.env`. Keep `DATABASE_URL` in sync with the `DB_*` values so Prisma connects to the same instance you start through Docker.

---

## 2. Initialize the Database (recommended path)

```bash
npm run init-db
```

What happens under the hood:

1. `docker compose` starts the `postgres:15-alpine` container using `docker-compose.yml` + `docker-compose.local.yml` (the override file exposes the container on `localhost:${DB_PORT}`).
2. `prisma db push --skip-generate` creates or updates the schema.
3. `npm run db:seed` runs `prisma/seed.ts` to load demo data (venue, QR-codes, etc.).

This gives you:
- a ready-to-use schema aligned with `prisma/schema.prisma`;
- `manager@test.com / password123` manager account plus demo venue/staff;
- seed QR codes at `/tip/agung001`, `/tip/table01`, `/tip/organic`.

Need a clean slate? Run:

```bash
npm run reset-db
```

`reset-db` keeps the container running, drops all tables via `prisma db push --force-reset`, and re-runs the seed.

---

## 3. Handy Commands

| Command | Purpose |
| --- | --- |
| `npm run db:up` | Start (or recreate) the PostgreSQL container locally |
| `npm run db:stop` | Stop the local container but keep the data volume |
| `npm run db:push` | Sync schema with the DB without seeding |
| `npm run db:reset` / `npm run reset-db` | Drop schema, recreate, seed demo data |
| `npm run db:seed` | Run `prisma/seed.ts` only |
| `npm run create:test-user` | Upsert a single test account (override via `TEST_USER_*`) |

---

## Manual Setup (without Docker)

If Docker is not an option, install PostgreSQL 15+ locally and create the database manually:

```bash
# macOS (Homebrew example)
brew install postgresql@15
brew services start postgresql@15

# Create role + database
createuser tipsio --pwprompt
createdb tipsio --owner=tipsio
```

Update `.env` with the hostname and port of your local server (often `/tmp` / unix socket or `localhost:5432`). Then run:

```bash
npm run db:push   # applies schema
npm run db:seed   # demo data
```

---

## Troubleshooting

- **`docker compose: command not found`** — install Docker Desktop ≥ 4.16 or use the standalone Compose v2 plugin. If you must use the legacy binary, replace `docker compose` with `docker-compose` inside `package.json`.
- **`connect ECONNREFUSED 127.0.0.1:5432`** — verify the container is running (`docker compose ps db`) and the port in `.env` matches the host port from `docker-compose.local.yml`.
- **Port 5432 already in use** — change `DB_PORT` in `.env` (for example `5433`) and rerun `npm run init-db`. The override file will expose the container on the new port.
- **Permission denied when seeding** — make sure the user defined in `DB_USER` owns the database. If you changed credentials, update both `DB_*` entries and `DATABASE_URL`.
- **Need to wipe data** — run `npm run reset-db`.

---

## Stopping / Removing Everything

To stop the database without destroying data:
```bash
npm run db:stop
```

To remove containers and volumes entirely:
```bash
docker compose -f docker-compose.yml -f docker-compose.local.yml down -v
```

You can then rerun `npm run init-db` to recreate everything.

---

## Notes

- `prisma db push` is used instead of `prisma migrate dev` because this repository does not ship migration files. When you create new schema changes, remember to generate migrations in your feature branch.
- Seed data contains Midtrans sandbox credentials. Replace them if you need realistic data.
- Production deployments still use `docker-compose.yml` alone; the local override is for development only.
