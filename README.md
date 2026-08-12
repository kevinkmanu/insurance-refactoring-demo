# Legacy Insurance Refactoring Demo

Java/Spring Boot demo repository intentionally designed as a realistic legacy codebase for live GitHub Copilot refactoring sessions.

## Goal
This code is intentionally messy. It compiles, runs, and has a baseline test suite, but includes anti-patterns and technical debt for refactoring demonstrations.

## Enterprise administration UI

The standalone React application in `frontend/` provides an enterprise
worklist UI over the existing Spring Boot API. It covers the operational
customer → policy → claim → billing → underwriting workflow while preserving
the backend's routes, payload fields, and legacy behavior.

### Feature map

| UI area | Purpose |
| --- | --- |
| Dashboard | Cross-domain KPIs, recent claim activity, and outstanding premium |
| Customers | Search, create, edit, risk-score display, and linked policies |
| Policies | Type/status worklist, policy wizard, and linked claims/billing |
| Claims | Adjuster queue, claim intake, status filtering, and approval |
| Billing | Payment history, outstanding balances, and payment recording |
| Underwriting | Explicit decision workbench and referral queue |

## Stack
- Java 17
- Spring Boot 3.3.x
- Maven
- H2 in-memory database
- JUnit 5

## Local development: two processes

The backend and UI run independently. Start them in separate terminals:

**Terminal 1 — backend**

```bash
mvn spring-boot:run
```

The API listens on `http://localhost:8080` and uses an in-memory H2 database.

**Terminal 2 — frontend**

```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. Vite proxies `/api` requests to the backend;
the proxy is a development-only convenience and the UI is not packaged into
the Spring Boot JAR in this phase.

## Validation

Backend tests:

```bash
mvn clean test
```

Frontend checks:

```powershell
cd frontend
npm run test
npm run lint
npm run build
```

## API and worklist endpoints

The UI consumes the existing CRUD routes plus these additive collection
routes used by worklists:

- `GET /api/policies`
- `GET /api/claims`
- `GET /api/billing`

Available routes:

- Customers
  - `POST /api/customers`
  - `GET /api/customers`
  - `PUT /api/customers/{id}`
  - `GET /api/customers/{id}`
- Policies
  - `POST /api/policies?age=42&termMonths=12`
  - `GET /api/policies` *(worklist)*
  - `GET /api/policies/{id}`
  - `GET /api/policies/customer/{customerId}`
- Claims
  - `POST /api/claims?adjuster=alex&docs=3`
  - `GET /api/claims` *(worklist)*
  - `POST /api/claims/{id}/approve?force=false`
  - `GET /api/claims/policy/{policyId}`
- Billing
  - `POST /api/billing/payment`
  - `GET /api/billing` *(worklist)*
  - `GET /api/billing/policy/{policyId}`
- Underwriting
  - `POST /api/underwriting/decision?customerId=1&policyType=AUTO`

The `/sql/{id}` diagnostic routes remain available for the legacy demo but
are not used by the UI.

### Legacy-to-domain mapping boundary

The backend wire contract remains authoritative. The frontend API modules
define wire DTOs and map them into clean domain models before rendering:

| Backend field | Frontend field |
| --- | --- |
| `custNm` | `name` |
| `phone_no` | `phone` |
| `policy_id` | `id` |
| Decimal values serialized by Jackson | numeric domain amounts |

Outbound requests map back to the original names. This boundary lets the UI
use consistent vocabulary without renaming entities, changing response
shapes, or breaking existing API clients.

The detailed frontend setup, architecture, scripts, and troubleshooting guide
is in [`frontend/README.md`](frontend/README.md).

## GitHub Actions

The repository uses GitHub Actions for application CI/CD:

- `application-ci.yml` runs on pull requests to `main`, pushes to `main`, and manual dispatch. It builds with Java 17, runs `mvn clean verify`, and uploads Surefire and JaCoCo reports plus the packaged JAR.
- `application-dependency-review.yml` runs on pull requests to `main` and fails on newly introduced high-severity dependency issues.
- `application-release.yml` runs on semantic version tags like `v1.0.0`, rebuilds the tagged commit, and publishes the executable JAR to a GitHub Release.
- `application-codeql.yml` runs CodeQL static security analysis on pull requests to `main`, pushes to `main`, and weekly (Mondays 08:00 UTC). Results appear in the repository Security tab.

JaCoCo is reported by CI, but coverage is not enforced yet.

## Beginning of Demo: POST Request Examples
Run these at the start of your demo to show endpoints working before refactoring, then run the same requests after refactoring to prove behavior parity.

PowerShell (sequential and demo-friendly):
```powershell
# 1) Create customer
$customer = Invoke-RestMethod -Method Post -Uri "http://localhost:8080/api/customers" -ContentType "application/json" -Body '{
  "custNm": "Ava Johnson",
  "email": "ava.johnson@example.com",
  "phone_no": "555-1212",
  "address": "22 Maple Ave, Denver, CO",
  "riskScore": 42
}'

# 2) Create policy
$policy = Invoke-RestMethod -Method Post -Uri "http://localhost:8080/api/policies?age=38&termMonths=12" -ContentType "application/json" -Body (@{ customerId = $customer.id; policyType = "AUTO" } | ConvertTo-Json -Compress)

# 3) Submit claim
$claim = Invoke-RestMethod -Method Post -Uri "http://localhost:8080/api/claims?adjuster=alex&docs=3" -ContentType "application/json" -Body (@{ policyId = $policy.policy_id; claimAmount = 1800.00; claimReason = "Windshield damage" } | ConvertTo-Json -Compress)

# 4) Process billing payment
$billing = Invoke-RestMethod -Method Post -Uri "http://localhost:8080/api/billing/payment" -ContentType "application/json" -Body (@{ policyId = $policy.policy_id; amount = 220.50; paymentStatus = "PAID"; dueDate = "2026-08-01" } | ConvertTo-Json -Compress)

# 5) Run underwriting decision
$customerId = $customer.id
$underwriting = Invoke-RestMethod -Method Post -Uri "http://localhost:8080/api/underwriting/decision?customerId=$customerId&policyType=AUTO"

# Optional: claim approval endpoint
$approval = Invoke-RestMethod -Method Post -Uri "http://localhost:8080/api/claims/$($claim.id)/approve?force=false"

$customer
$policy
$claim
$billing
$underwriting
```

## Intentional Legacy Issues Included
1. God classes: `PolicyService` and `ClaimsService` are 500+ lines each.
2. Duplicated business logic: premium/threshold rules duplicated in multiple classes.
3. Tight coupling: controllers instantiate services with `new` in several methods.
4. Poor exception handling: swallowed exceptions and generic catch blocks.
5. Magic numbers/hardcoded strings across premium and claim decisions.
6. Long methods and deep nesting in core service methods.
7. Inconsistent naming: `custNm`, `phone_no`, `policy_id`, mixed styles.
8. SQL in service layer using raw `JdbcTemplate` queries.
9. Missing abstractions: no interfaces, weak layering boundaries.
10. Weak validation and entity exposure directly via REST.

## Presenter Guide: Refactoring Flow
Use this sequence during the live demo.

### Step 1: Extract Premium Rules
Target files:
- `src/main/java/com/insurance/admin/service/PolicyService.java`
- `src/main/java/com/insurance/admin/service/legacy/LegacyPremiumUtil.java`

Prompt:
> Extract duplicated premium calculation into a single cohesive component with unit tests. Keep all current behavior identical.

### Step 2: Break Down God Classes
Target files:
- `src/main/java/com/insurance/admin/service/PolicyService.java`
- `src/main/java/com/insurance/admin/service/ClaimsService.java`

Prompt:
> Split this god class into focused services (validation, pricing, persistence orchestration). Preserve existing public API and passing tests.

### Step 3: Replace Manual Instantiation With DI
Target files:
- `src/main/java/com/insurance/admin/controller/PolicyController.java`
- `src/main/java/com/insurance/admin/controller/ClaimsController.java`
- `src/main/java/com/insurance/admin/controller/UnderwritingController.java`

Prompt:
> Remove manual `new` service construction in controllers and switch to constructor-based dependency injection.

### Step 4: Improve Exception Handling
Target files:
- `src/main/java/com/insurance/admin/service/PolicyService.java`
- `src/main/java/com/insurance/admin/service/ClaimsService.java`

Prompt:
> Replace swallowed exceptions and generic catches with meaningful domain exceptions and centralized handler responses.

### Step 5: Introduce DTOs and Validation
Target files:
- all controllers and entities

Prompt:
> Introduce request/response DTOs, bean validation, and mapping while preserving endpoint behavior.

### Step 6: Isolate SQL/Repository Concerns
Target files:
- `src/main/java/com/insurance/admin/service/PolicyService.java`
- `src/main/java/com/insurance/admin/service/ClaimsService.java`

Prompt:
> Move raw SQL out of services into repository adapters and reduce service responsibilities.

### Step 7: Normalize Naming and Domain Vocabulary
Prompt:
> Rename inconsistent fields and methods to consistent domain-driven naming and keep compatibility with tests.

## Demo Success Criteria
- App still runs with `mvn spring-boot:run`
- Tests remain green after each refactoring stage
- Business behavior remains stable

## Repository Structure
```text
src/
  main/java/com/insurance/admin/
    controller/
    entity/
    repository/
    service/
      legacy/
    util/
  test/java/com/insurance/admin/
docs/
```

## Additional Docs
- `docs/architecture-and-debt.md`
- `docs/refactoring-plan.md`
- `docs/enterprise-ui-plan.md`
