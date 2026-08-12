# Insurance Administration UI

The `frontend/` application is a standalone React 19 + TypeScript + Vite
client for the legacy Spring Boot insurance API. It provides an enterprise
worklist experience for customers, policies, claims, billing, and
underwriting without changing the backend's REST payloads or routes.

## Prerequisites

- Node.js 20+ and npm
- Java 17+ and Maven (for the backend)

The UI expects the backend at `http://localhost:8080`. Vite proxies every
request beginning with `/api` to that address, so no frontend CORS
configuration is required during local development.

## Local setup

Install dependencies once:

```powershell
cd frontend
npm install
```

Run the application as two processes:

**Terminal 1 — Spring Boot API**

```powershell
mvn spring-boot:run
```

**Terminal 2 — Vite UI**

```powershell
cd frontend
npm run dev
```

Open <http://localhost:5173>. Keep the backend process running while using
the UI; the default H2 database is in memory and is reset when the backend
stops.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start Vite with HMR on port 5173 |
| `npm run build` | Type-check and create the production bundle in `dist/` |
| `npm run lint` | Run Oxlint |
| `npm run test` | Run the Vitest suite once |
| `npm run test:watch` | Run Vitest in watch mode |
| `npm run preview` | Serve the built bundle locally |

## Feature map

| Route | Capability | Backend calls |
| --- | --- | --- |
| `/` | Dashboard KPIs, recent claims, status summary | Customer, policy, claim, and billing lists |
| `/customers` | Search, create, and edit customers | `GET/POST /api/customers`, `PUT /api/customers/{id}` |
| `/customers/{id}` | Customer details and linked policies | `GET /api/customers/{id}`, `GET /api/policies/customer/{customerId}` |
| `/policies` | Filtered policy worklist and new-policy wizard | `GET/POST /api/policies` |
| `/policies/{id}` | Policy details, linked claims, billing history | `GET /api/policies/{id}`, `GET /api/claims/policy/{policyId}`, `GET /api/billing/policy/{policyId}` |
| `/claims` | Adjuster queue, intake, approval | `GET/POST /api/claims`, `POST /api/claims/{id}/approve` |
| `/billing` | Payment history and payment recording | `GET /api/billing`, `GET /api/billing/policy/{policyId}`, `POST /api/billing/payment` |
| `/underwriting` | Explicit decision workbench and referral queue | `POST /api/underwriting/decision` plus policy/customer lists |

The intended operational path is customer → policy → claim → billing →
underwriting. Mutations are initiated by explicit form actions; the UI does
not execute an underwriting decision during rendering.

## Architecture

```text
src/
  api/                 API clients, wire DTOs, mappers, query hooks
  components/
    layout/            App shell, sidebar, top bar
    ui/                Cards, tables, forms, modal, toast, error boundary
  pages/               Route-level feature modules
  types/               Shared UI types
  test/                Vitest and MSW setup
  App.tsx              Router and lazy-loaded routes
  main.tsx             React/TanStack Query/bootstrap wiring
```

TanStack Query owns server state, loading/error states, and cache
invalidation. Shared UI components keep accessibility and interaction
patterns consistent across feature pages. Route modules are lazy-loaded
behind an error boundary and a loading fallback.

### Legacy-to-domain boundary

Backend naming is intentionally preserved in the API layer. Each domain
module defines a wire DTO matching the REST contract and maps it before data
reaches page components:

| Backend wire field | Frontend domain field |
| --- | --- |
| `custNm` | `name` |
| `phone_no` | `phone` |
| `policy_id` | `id` |
| `BigDecimal` values serialized as strings | numeric `premium`, `claimAmount`, and `amount` |

Outbound mutations map domain values back to the original wire fields. Do
not rename backend fields in page components or change endpoint paths to
avoid breaking existing clients and tests.

## Troubleshooting

### The page shows “API unavailable”

Confirm that Spring Boot is running on port 8080 and that an API request
works directly:

```powershell
Invoke-RestMethod http://localhost:8080/api/customers
```

Restart Vite after changing its proxy configuration. The proxy is defined in
`vite.config.ts` and only applies to the development server.

### Port 8080 or 5173 is already in use

Stop the process using the port, or start the corresponding service on a
different port and update the Vite proxy target for a local-only session.
Do not commit local runtime overrides.

### Data disappeared after restarting the backend

This demo uses an in-memory H2 database. Seed the workflow again after a
restart; no persistent application data is expected.

### Tests or build fail after dependency changes

From `frontend/`, reinstall the lockfile exactly and rerun validation:

```powershell
npm ci
npm run test
npm run lint
npm run build
```

### Backend field names look inconsistent

That is expected at the wire boundary. Inspect the relevant module in
`src/api/` and its `fromWire`/`toWire` mapper rather than changing the
backend entity or REST contract.

Authentication, authorization, and packaging the UI into the Spring Boot
JAR are outside this phase.
