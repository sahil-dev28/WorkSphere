# WorkSphere

Employee management system — directory, org hierarchy, role-based access, dashboard, and bulk CSV import. Started from the [Better-T-Stack](https://github.com/AmanVarshney01/create-better-t-stack) scaffold (Next.js + Express + Mongoose monorepo) and built out from there.

## Stack

- **apps/web** — Next.js 16 (App Router), React 19, Tailwind, shadcn/ui, react-hook-form, recharts for the dashboard charts, d3-org-chart for the org chart
- **apps/server** — Express 5 + Mongoose, JWT auth via httpOnly cookie, Zod for request validation, multer + csv-parse for CSV import
- **packages/ui** — shared shadcn primitives, consumed by `apps/web`
- **packages/env** — Zod-validated env vars, one module per app (`@WorkSphere/env/server`, `@WorkSphere/env/web`)
- **packages/config** — shared tsconfig base
- MongoDB for the database, Turborepo to run/build both apps together

## What's actually in it

- Login + forced password change on first login, JWT session in an httpOnly cookie
- Three roles: `super_admin`, `hr_manager`, `employee` — RBAC enforced both on the API (route middleware) and in the UI (fields/buttons hidden per role, not just disabled)
- Employee directory: search, filter, sort, pagination, add/edit/view/delete
- Organizational hierarchy rules enforced server-side: one hr_manager per department, no employee-to-employee reporting, no circular reporting chains
- Org chart page (d3-org-chart) — visual reporting tree, click a node to view that employee
- Dashboard — headcount by department, active/inactive donut, hiring trend over time
- CSV bulk import for employees (super_admin/hr_manager only) — upload a `.csv`, get back a per-row success/failure summary plus generated temporary passwords for whoever got created

## Running it locally

```bash
pnpm install
```

You need a MongoDB instance (local or Atlas). Set up your env files:

`apps/server/.env`

```
DATABASE_URL=mongodb://localhost:27017/worksphere
CORS_ORIGIN=http://localhost:3001
JWT_SECRET=<at least 32 characters>
JWT_EXPIRES_IN=604800
SEED_ADMIN_EMAIL=admin@worksphere.dev
SEED_ADMIN_PASSWORD=ChangeMe123!
```

`apps/web/.env`

```
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
```

Then seed some data and start both apps:

```bash
cd apps/server && pnpm seed   # or pnpm reseed-org for a fuller org with hierarchy
cd ../..
pnpm dev
```

- Web: [http://localhost:3001](http://localhost:3001)
- API: [http://localhost:3000](http://localhost:3000) (health check at `/api/health`)

Login page has quick-fill buttons for the seeded demo accounts (super admin / hr manager / employee) so you don't have to remember passwords.

## Scripts

Root (runs across both apps via turbo):

- `pnpm dev` — everything, dev mode
- `pnpm dev:web` / `pnpm dev:server` — just one side
- `pnpm build`
- `pnpm check-types`

`apps/server` specifically:

- `pnpm seed` — fresh seed data
- `pnpm reseed-org` — wipes and rebuilds a full org (~50 employees) with valid hierarchy, keeps the demo logins stable
- `pnpm backfill-phone` — one-off migration script, probably don't need this unless you're touching old records

## Project structure

```
WorkSphere/
├── apps/
│   ├── web/       # Next.js frontend
│   └── server/    # Express API
├── packages/
│   ├── ui/        # shared shadcn/ui components + design tokens
│   ├── env/       # typed env vars
│   └── config/    # shared tsconfig
```

## Shared UI

`packages/ui` holds the shadcn primitives both apps could use (currently just web does). To add another component to the shared package:

```bash
npx shadcn@latest add <component> -c packages/ui
```

then import it as `@WorkSphere/ui/components/<component>`. Design tokens / global styles live in `packages/ui/src/styles/globals.css` if you need to touch the theme.
