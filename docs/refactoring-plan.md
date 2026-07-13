# Phased Refactoring Plan (For Live Copilot Demo)

## Phase 0 - Baseline Safety
- Run full tests.
- Capture line counts and complexity snapshots.
- Identify business-critical workflows.

## Phase 1 - Rule Extraction
- Extract premium and claim rule logic into dedicated components.
- Keep behavior unchanged; verify with tests.

## Phase 2 - God Class Decomposition
- Split `PolicyService` and `ClaimsService` into:
  - validation service
  - pricing/decision service
  - persistence orchestration service
- Add focused unit tests around extracted services.

## Phase 3 - Dependency Injection and Layer Cleanup
- Remove manual `new` from controllers.
- Introduce interfaces for key services.
- Enforce constructor injection.

## Phase 4 - API Contract Hardening
- Introduce DTOs for requests and responses.
- Add bean validation and global exception mapping.
- Keep backward-compatible payload fields where needed.

## Phase 5 - Data Access Refactoring
- Move SQL into repository adapters or custom repositories.
- Replace ad hoc queries with explicit repository methods.

## Phase 6 - Naming and Maintainability
- Normalize naming across entities/services/controllers.
- Remove magic numbers using named constants/config.

## Phase 7 - Observability and Quality Gate
- Improve logging strategy.
- Increase test coverage and include edge-case tests.
- Compare behavior parity before/after.

## Exit Criteria
- `mvn clean test` passes.
- `mvn spring-boot:run` starts correctly.
- Business workflows remain unchanged.
- Code is modular and easier to reason about.
