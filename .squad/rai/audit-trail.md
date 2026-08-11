# RAI Audit Trail

> Append-only evidence log. Entries are redacted — never contains raw secrets or harmful content.

<!-- Rai appends findings below -->
## Phase 3 Frontend Review (Insurance UI Branch)

**Timestamp:** 2026-08-10 15:56:51
**Reviewer:** Rai (RAI Agent)
**Branch:** insurance-ui
**Scope:** Typed API client, mappers, hooks, tests, provider integration

### Critical Finding: ?? RED

#### Finding 1: PII Exposure in Dashboard Component
- **File:** frontend/src/pages/Dashboard.tsx
- **Lines:** RECENT_CLAIMS array (lines ~22-26), ACTIVITY array (lines ~28-34)
- **Category:** PII Exposure
- **Severity:** Critical
- **Issue:** Hardcoded customer names in dashboard mock data (Sarah Okonkwo, James Rutherford, Maria Santos, David Chen, Amara Diallo, Yuki Tanaka, Priya Mehta). These appear to be realistic person names and constitute PII.
- **Risk:** Exposes real names in source control; violates PII minimal exposure principle. If this code branches to test/staging, names become part of build artifacts.
- **Remediation:** Replace all person names with generic placeholders (e.g., "Customer Name", "John Doe" standard test placeholder). Use anonymized mock data.

#### Finding 2: URL Parameter Injection Risk in Underwriting API
- **File:** frontend/src/api/underwriting.ts
- **Line:** requestDecision() function, URL construction
- **Category:** Injection Vulnerability
- **Severity:** Critical
- **Issue:** Manual URL construction: `/api/underwriting/decision?customerId=${customerId}&policyType=${encodeURIComponent(policyType)}`. While policyType is encoded, customerId is interpolated without validation. Pattern is fragile and error-prone.
- **Risk:** If customerId validation is missed at runtime, could allow query string injection. Manual concatenation makes patterns hard to audit.
- **Remediation:** Use URLSearchParams API (already used in policies.ts) to build query strings. Example: `new URLSearchParams({ customerId: String(customerId), policyType })`.

### Advisory Findings: ?? YELLOW

#### Finding 3: Error Message Leakage
- **File:** frontend/src/api/apiClient.ts, parseErrorBody()
- **Issue:** Returns backend error text directly: `return text || res.statusText`. Backend errors (e.g., "SQLException: duplicate key", "NullPointerException at line X") expose sensitive details.
- **Risk:** Information disclosure; debugging information leakage. Affects error handling across all API calls.
- **Recommendation:** Sanitize or map backend errors to generic user-facing messages. Implement error boundary or per-endpoint error mapping.

#### Finding 4: Insufficient Error Handling Configuration
- **File:** frontend/src/api/queryClient.ts
- **Issue:** QueryClient has no global error handler. Mutations/queries can expose raw error objects in console/logs.
- **Risk:** Errors could leak sensitive context (API URLs, user IDs, backend structure).
- **Recommendation:** Add defaultOptions.mutations.onError and global error logger with sanitization.

#### Finding 5: Sensitive Data in Query Cache Keys
- **File:** frontend/src/api/queryClient.ts, queryKeys definition
- **Issue:** Cache keys include customerId, policyId (e.g., `['policies', 'customer', customerId]`). If cache is persisted or logged, PII leaks.
- **Risk:** Cache debuggers, Redux DevTools, or logging tools could expose customer IDs.
- **Recommendation:** If cache must be inspected for debugging, add flag to redact keys. Or use hashed identifiers in dev mode.

#### Finding 6: XSS Risk in Toast Message Rendering
- **File:** frontend/src/components/ui/Toast.tsx
- **Issue:** Message rendered directly: `<span className="toast__message">{message}</span>`. React escapes text, but best practice is explicit sanitization if message comes from API.
- **Risk:** If API returns malicious message or message is user-controlled, XSS is possible despite React defaults.
- **Recommendation:** Validate/sanitize toast messages at source (useToast hook). Add optional DOMPurify or dompurify for high-risk contexts.

#### Finding 7: Overly Permissive Force Parameter in Claim Approval
- **File:** frontend/src/api/claims.ts, useApproveClaim()
- **Issue:** `approveClaim(id: number, force = false)` allows frontend to force-bypass approval workflows.
- **Risk:** Compliance violation; claims approval should require backend-side authorization, not frontend override toggle.
- **Recommendation:** Remove force parameter from frontend. Backend should handle authorization; frontend should never have override button.

#### Finding 8: Missing Audit Trail for Financial Operations
- **File:** frontend/src/api/billing.ts, policies.ts, claims.ts
- **Issue:** No logging/audit mechanism for premium updates, claim submissions, or payment processing. Insurance systems require transaction audit trails for regulatory compliance.
- **Risk:** Compliance violation (SOX, insurance regs); no accountability trail for sensitive operations.
- **Recommendation:** Add audit logger wrapper to financial mutations. Log mutation type, user context, payload summary (not raw PII).

### Green Findings: ? No Issues

- ? No hardcoded API credentials or secrets detected
- ? Wire/domain mappers are well-tested and comprehensive (wireMappers.test.ts validates all transformations)
- ? React Query provider properly isolated; no cache pollution between features
- ? Mapper pattern correctly prevents direct backend shape exposure to components
- ? AbortSignal correctly propagated for cleanup; no memory leaks
- ? Router configuration is basic and safe; no dynamic route injection

### Verdict: ?? RED (Blocking)

**Work CANNOT ship in current state.** Two critical findings must be remediated before merge:
1. Remove hardcoded person names from Dashboard
2. Replace manual URL construction in underwriting with URLSearchParams

After those fixes, 6 yellow findings should be addressed per insurance industry best practices (audit trails, error handling, force parameter removal).

