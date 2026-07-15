# Copilot Instructions For This Repository

This repository is a legacy Java Spring Boot refactoring demo. Optimize for safe, incremental refactoring rather than broad rewrites.

## Primary Goal
- Improve design while preserving existing runtime behavior, endpoint contracts, and test outcomes.

## Codebase Context
- The main debt concentration is in service and controller layers, especially `PolicyService` and `ClaimsService`.
- Some controllers and services use manual object construction and mixed concerns.
- Business logic is intentionally duplicated across premium, claim, and underwriting paths.
- Existing tests provide the baseline safety net and should be used aggressively during refactoring.

## Refactoring Expectations
- Prefer small, behavior-preserving edits over large rewrites.
- Extract cohesive responsibilities instead of introducing framework-heavy abstractions.
- Preserve public API shapes unless the user explicitly asks for API changes.
- Keep Spring wiring idiomatic: constructor injection, focused services, clear repository boundaries.
- Avoid changing naming at API boundaries unless compatibility is maintained.

## Java And Spring Boot Guidance
- Prefer constructor injection over field injection and never instantiate Spring-managed collaborators with `new` inside controllers.
- Keep controllers thin. Move business rules, state transitions, and validation orchestration into services.
- Keep services focused. Separate validation, domain decisions, persistence coordination, and response mapping when a class is carrying multiple responsibilities.
- Move raw SQL and ad hoc persistence logic into repositories or repository adapters.
- Use DTOs and bean validation at the REST boundary when touching request or response contracts.
- Prefer domain-specific exceptions plus centralized exception handling over generic catches or swallowed exceptions.

## Validation Workflow
- After the first substantive refactor edit, run the narrowest relevant Maven test before doing more work.
- Prefer targeted commands such as `mvn -Dtest=PolicyServiceLegacyTest test` or `mvn -Dtest=ClaimsServiceLegacyTest test` while iterating.
- Run `mvn clean test` for broader confirmation before concluding multi-file refactors.
- If endpoint behavior is part of the task, verify against the documented REST workflow in the README when practical.

## Change Boundaries
- Do not fix unrelated debt unless it blocks the requested refactor.
- Do not replace stable legacy behavior with guessed business rules.
- Do not remove backward-compatible field names or endpoint parameters without explicit approval.

## Preferred Refactoring Sequence
1. Extract duplicated rules into a dedicated collaborator.
2. Decompose god classes by responsibility.
3. Replace manual wiring with dependency injection.
4. Introduce DTOs, validation, and exception mapping.
5. Isolate persistence concerns.
6. Normalize naming once behavior is protected.

## Files And Areas To Watch
- `src/main/java/com/insurance/admin/service/PolicyService.java`
- `src/main/java/com/insurance/admin/service/ClaimsService.java`
- `src/main/java/com/insurance/admin/controller/PolicyController.java`
- `src/main/java/com/insurance/admin/controller/ClaimsController.java`
- `src/main/java/com/insurance/admin/controller/UnderwritingController.java`
- `src/test/java/com/insurance/admin/`

## Response Style For Refactor Tasks
- State the local hypothesis briefly.
- Make the smallest safe change first.
- Validate immediately with the narrowest relevant test.
- Call out residual risks if behavior-sensitive logic remains unverified.