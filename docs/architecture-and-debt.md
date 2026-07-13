# Architecture and Technical Debt Assessment

## Current Architecture (Intentionally Legacy)

```mermaid
flowchart LR
  C1[CustomerController] --> S1[CustomerService]
  C2[PolicyController] --> S2[PolicyService God Class]
  C3[ClaimsController] --> S3[ClaimsService God Class]
  C4[BillingController] --> S4[BillingService]
  C5[UnderwritingController] --> S5[UnderwritingService]

  S2 --> R1[PolicyRepository]
  S2 --> R2[CustomerRepository]
  S2 --> DB[(H2)]

  S3 --> R3[ClaimRepository]
  S3 --> R1
  S3 --> DB

  S4 --> R4[BillingRepository]
  S1 --> R2

  C2 -. manual new .-> M1[ManualUnderwritingService]
  C3 -. manual new .-> M1
  C5 -. manual new .-> S5
```

## Debt Inventory
1. God classes: `PolicyService` and `ClaimsService` contain orchestration, calculations, SQL, and persistence.
2. Duplicated logic in multiple premium/threshold methods.
3. Tight coupling from controller-level object creation.
4. Raw SQL in service layer via `JdbcTemplate`.
5. Generic and swallowed exception handling.
6. Hardcoded strings and magic numbers for business rules.
7. Inconsistent naming conventions reducing readability.
8. Entities exposed directly through APIs.
9. Validation spread across ad hoc checks.

## Why This Is Useful For Demos
- Problems are realistic and recognizable in enterprise systems.
- Refactoring opportunities are visible and incremental.
- Behavior can be protected by baseline tests while improving design.
