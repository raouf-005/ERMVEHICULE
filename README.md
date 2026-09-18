# ERMVEHICULE

A garage management and invoicing system — customers, their vehicles, the parts used, and the invoices that come out the other end.

**[Live demo](https://ermvehicule.vercel.app)**

---

## What it does

- **Customers and vehicles** — each customer owns vehicles; each vehicle carries its own service history.
- **Invoicing** — build an invoice from parts and labour, move it through its status workflow, duplicate a previous one to save re-keying, and export it as a **generated PDF**.
- **Access control** — authentication through NextAuth with an admin area for managing users and assigning them to permission groups. Unauthorised routes are cut off in `middleware.ts`, not just hidden in the UI.
- **Dashboard** — activity and revenue charts over the live data.

## Stack

| | |
|---|---|
| Framework | Next.js (App Router), TypeScript |
| Data | PostgreSQL via Prisma, with versioned migrations |
| Auth | NextAuth, role- and group-based authorisation |
| PDF | React PDF renderer |
| Infrastructure | Docker Compose (`docker-compose.yml`, `Dockerfile.postgres`) |

## Running locally

```bash
# 1. Bring up PostgreSQL
docker compose up -d

# 2. Install and configure
npm install
cp .env.example .env        # set DATABASE_URL and NEXTAUTH_SECRET

# 3. Schema and seed data
npx prisma migrate deploy
npx prisma db seed
npx tsx prisma/create-admin.ts   # creates the first admin account

# 4. Run
npm run dev
```

The app is then on `http://localhost:3000`.

## Structure

```
app/
  admin/         users and permission groups
  customers/     customer CRUD and detail views
  vehicles/      vehicle CRUD, linked to a customer
  invoices/      create, edit, duplicate, status transitions
  api/           route handlers for each resource
prisma/          schema, migrations, seed, admin bootstrap
src/components/  UI primitives, dashboard charts, invoice PDF
middleware.ts    route-level authorisation
```