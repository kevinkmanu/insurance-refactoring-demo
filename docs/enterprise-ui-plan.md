# Enterprise Insurance UI Implementation Plan

## Purpose

Build an enterprise-style insurance administration UI for the Spring Boot REST API while keeping backend behavior and existing API contracts stable.

## Decisions

- **Frontend:** React 19, TypeScript, and Vite.
- **Location:** Standalone `frontend/` directory.
- **Development:** Vite proxies `/api` requests to Spring Boot on `http://localhost:8080`.
- **Backend additions:** Additive read-only list endpoints only; do not rename existing API fields.
- **Wire compatibility:** Frontend maps legacy fields such as `custNm`, `phone_no`, and `policy_id` into clean TypeScript domain models.

## Phase 0 — Backend Worklist Endpoints

**Status: Complete**

Add collection endpoints required by enterprise worklists:

- `GET /api/policies`
- `GET /api/claims`
- `GET /api/billing`

Implementation:

- Add `findAll()` methods to the relevant services.
- Add thin controller collection routes.
- Preserve all existing routes and response shapes.
- Add endpoint coverage in `WorklistEndpointsTest`.
- Document the routes in the root README.

Validation:

```powershell
$env:JAVA_HOME = "C:\Program Files\Java\jdk-21.0.12"
mvn clean test
```

## Phase 1 — Frontend Foundation

**Status: Complete**

Create the standalone Vite application in `frontend/`:

- React 19 and TypeScript with strict mode.
- Vite development server.
- React Router.
- TanStack Query for server state.
- React Hook Form and Zod for forms and validation.
- `/api` proxy to the Spring Boot backend.
- Frontend build output and dependencies excluded from Git.

Validation:

```powershell
cd frontend
npm run build
```

## Phase 2 — Enterprise Shell and Design System

**Status: Complete**

Build the application frame and reusable visual language:

- Sidebar navigation for Dashboard, Customers, Policies, Claims, Billing, and Underwriting.
- Top bar with search placeholder, notifications, and user menu.
- Breadcrumb navigation.
- Responsive content layout.
- CSS custom-property design tokens for colors, typography, spacing, borders, and elevation.
- Reusable components:
  - `Card`
  - `DataTable`
  - `StatusBadge`
  - `Modal`
  - `Toast`
  - `FormField`
  - `EmptyState`
  - `SkeletonLoader`
- Static dashboard content for validating the shell before API integration.
- Semantic HTML, keyboard-friendly controls, ARIA support, and readable contrast.

Validation:

```powershell
cd frontend
npm run lint
npm run build
```

## Phase 3 — Typed API Integration

**Status: Complete**

Create a typed boundary between legacy REST payloads and UI components:

- Implement a shared `apiClient` with:
  - JSON serialization/deserialization.
  - Typed HTTP errors.
  - Request cancellation.
  - Consistent response handling.
- Add domain API modules:
  - `customers`
  - `policies`
  - `claims`
  - `billing`
  - `underwriting`
- Define wire DTOs that preserve backend field names.
- Define clean frontend domain types.
- Add wire-to-domain and domain-to-wire mappers.
- Add TanStack Query hooks for reads and mutations.
- Add loading, empty, error, and cache-invalidation behavior.

Important wire fields:

| Backend field | Frontend field |
|---|---|
| `custNm` | `customerName` |
| `phone_no` | `phoneNumber` |
| `policy_id` | `policyId` |

Validation:

```powershell
cd frontend
npm run lint
npm run build
npm test
```

## Phase 4 — Insurance Feature Modules

**Status: Complete**

Replace static screens with functional enterprise workflows:

### Dashboard

- Active policy KPI.
- Open claims KPI.
- Pending underwriting referrals.
- Outstanding premium.
- Recent activity.
- Claims-by-status visualization.

### Customers

- Searchable customer grid.
- Customer detail view.
- Risk score display.
- Linked policies.
- Create and edit forms.

### Policies

- Policy worklist with type and status filters.
- Policy detail view.
- New-policy wizard:
  1. Select customer.
  2. Select policy type.
  3. Enter age and term.
  4. Display premium quote.
  5. Confirm policy creation.
- Linked claims and billing history.

### Claims

- Adjuster worklist queue.
- Status filtering.
- Claim intake form with adjuster and document count.
- Claim detail view.
- Approve action with optional force override and confirmation dialog.

### Billing

- Payment history by policy.
- Outstanding balance view.
- Record-payment form.
- Payment status presentation.

### Underwriting

- Customer and policy-type selection.
- Explicit decision execution.
- `APPROVE`, `REFER`, and `DECLINE` result states.
- Referral queue.

## Phase 5 — Cross-Cutting Reliability and UX

**Status: Complete**

- Add React error boundaries and fallback UI.
- Add global toast notifications for mutation outcomes.
- Add loading skeletons and empty states throughout.
- Surface backend errors in forms and notifications.
- Add route-based lazy loading with `React.lazy` and `Suspense`.
- Add optimistic updates only where behavior is safe and reversible.
- Keep mutations explicit; do not trigger underwriting decisions during render.

## Phase 6 — Frontend Testing

**Status: Complete**

Add frontend test tooling and coverage:

- Vitest.
- React Testing Library.
- MSW for API-mocked integration tests.
- Accessibility assertions for primary views.

Priority tests:

- Wire-to-domain mapper tests.
- Domain-to-wire request tests.
- `StatusBadge` rendering for backend statuses.
- `DataTable` filtering and interaction.
- Customer, policy, claim, billing, and underwriting form behavior.
- Key end-to-end UI workflows using mocked API responses.

Validation:

```powershell
cd frontend
npm run test
npm run lint
npm run build
```

## Phase 7 — Documentation and Delivery

**Status: Complete**

- Add `frontend/README.md` with setup, scripts, architecture, and troubleshooting.
- Update root README with:
  - UI purpose and feature map.
  - Two-process local workflow.
  - Backend startup instructions.
  - Frontend startup instructions.
  - New worklist endpoints.
- Document the legacy-to-domain mapping boundary.
- Perform a backend and frontend smoke test using the documented customer → policy → claim → billing → underwriting workflow.
- Confirm no existing backend behavior or endpoint contract has changed.

## Validation Matrix

| Milestone | Required validation |
|---|---|
| Phase 0 | `mvn clean test` |
| Phase 1 | `cd frontend; npm run build` |
| Phase 2 | `cd frontend; npm run lint; npm run build` |
| Phase 3 | Mapper tests, lint, and build |
| Phase 4 | Feature tests, lint, and build |
| Phase 5 | Error/loading/mutation behavior tests |
| Phase 6 | Full frontend test suite, lint, and build |
| Phase 7 | Backend/frontend smoke workflow and documentation review |

## Scope Boundaries

- Authentication and authorization are out of scope because the backend has no security layer.
- Maven-to-SPA single-JAR integration is deferred.
- Existing backend field names and endpoint contracts remain backward compatible.
- H2 remains the persistence provider for this demo.
