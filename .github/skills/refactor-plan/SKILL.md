---
name: refactor-plan
description: Plan and execute safe, incremental refactors for legacy Java Spring Boot applications. Use when decomposing god classes, extracting business rules, introducing DTOs and validation, replacing manual wiring with dependency injection, moving SQL out of services, or improving exception handling while preserving behavior.
---

# Refactor Plan

Use this skill when the user wants help refactoring a Java Spring Boot codebase without changing business behavior. It is optimized for legacy service-heavy applications where controllers, services, repositories, and domain rules are tightly coupled.

## Trigger Phrases
- refactor this Spring Boot service
- break up this god class
- extract duplicated business logic
- introduce DTOs and validation
- replace manual new with dependency injection
- move SQL out of the service layer
- preserve behavior while improving design
- create a phased refactoring plan

## Goals
- Preserve runtime behavior and public API contracts unless the user explicitly asks for a contract change.
- Make small, testable changes that reduce coupling and isolate business rules.
- Prefer extracting responsibilities into focused components instead of rewriting large classes.
- Keep the application runnable and tests green after each refactoring step.

## Working Style
1. Start from the smallest concrete anchor: the named class, failing test, endpoint, or duplicated rule.
2. Form one local hypothesis about the controlling behavior before editing.
3. Make the smallest useful refactor first.
4. Run the narrowest validation that can falsify the change.
5. Continue in phases only after the previous slice is stable.

## Refactoring Priorities For Legacy Spring Boot
1. Extract duplicated business rules into cohesive domain services or strategy-style collaborators.
2. Decompose god classes into focused services for validation, decisioning, orchestration, and persistence coordination.
3. Replace controller-level object construction and manual wiring with constructor injection.
4. Introduce DTOs and bean validation at the API boundary instead of exposing entities directly.
5. Centralize exception mapping with domain-specific exceptions and a controller advice.
6. Move raw SQL and persistence details into repository adapters or custom repositories.
7. Replace magic numbers and hardcoded rule strings with named constants or configuration.
8. Normalize inconsistent naming only when behavior is protected by tests or compatibility shims.

## Spring Boot Refactoring Rules
- Preserve existing request mappings, query parameters, and response field names unless the user asks to change them.
- Prefer constructor injection over field injection.
- Keep transaction boundaries explicit when moving persistence logic.
- Avoid mixing HTTP response shaping with domain calculations inside services.
- If entity naming is inconsistent, use DTOs or mapping layers to improve internals before changing API contracts.
- Keep new abstractions justified by duplication, unstable dependencies, or mixed concerns.

## Validation Strategy
- Prefer a nearby focused test over a full suite when iterating.
- If no focused test exists, run the smallest Maven test slice that covers the touched behavior.
- Use full `mvn clean test` only after local slices pass or before concluding a larger refactor.
- For endpoint-sensitive work, preserve behavior by re-running the documented workflow requests when practical.

## Repo-Specific Guidance For This Demo
- Expect intentional technical debt in `PolicyService` and `ClaimsService`.
- Preserve the existing endpoint behavior for customers, policies, claims, billing, and underwriting.
- Treat premium calculation, claim thresholds, and underwriting rules as high-risk business logic.
- Prefer phased refactors that match the repository documentation:
	- rule extraction
	- god class decomposition
	- dependency injection cleanup
	- DTO and validation hardening
	- repository/data access isolation
- Keep the demo runnable with Maven and maintain parity with the baseline test suite.

## Output Expectations
When helping with a refactor, produce:
- a brief statement of the local hypothesis
- the smallest proposed or implemented change
- the validation command or test used
- any compatibility risk that remains

## Example Prompts
```text
Refactor PolicyService by extracting premium calculation into a dedicated component. Keep all current behavior identical and add focused tests.
```

```text
Break up ClaimsService into validation, decision, and persistence orchestration pieces. Preserve the current controller contract and run the narrowest relevant Maven tests after each step.
```

```text
Replace manual service construction in the controllers with constructor injection, but do not change endpoint mappings or payload fields.
```