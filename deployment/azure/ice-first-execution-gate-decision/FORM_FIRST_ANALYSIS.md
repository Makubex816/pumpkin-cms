# Form-First Analysis

Generated: 2026-06-04

## Current Form Blocker Profile

The static form endpoint is responsible for 2 remaining strict-validator errors:

- static form endpoint is not configured for production/static deploy readiness
- static form endpoint/backend verification is missing

The approved Ice snapshot contains form blocks on `home` and `contact`, and contact form production readiness remains `no`.

## Why Form-First Is Plausible

Form-first would reduce contact workflow risk early. It would clarify endpoint architecture, public build variables, verification flow, validation/sanitization behavior, and the later email delivery path.

It may also uncover integration details before Azure staging, especially around:

- approved origins
- endpoint route
- backend forwarding or storage
- verification criteria
- public static endpoint variable
- `STATIC_FORM_ENDPOINT_VERIFIED`

## Why Form-First Is Not Recommended First

Form accounts for fewer current strict-validator errors than media.

The form path also depends on endpoint hosting, runtime settings, verification flow, and later email/Microsoft 365 approval. It does not resolve the visible page imagery dependency, and Azure staging/DNS remain blocked until both media and form readiness are resolved or an explicit staging exception is approved.

## Work Required Later

After explicit approval, the form path will require:

1. endpoint architecture confirmation
2. endpoint host/provider approval
3. public endpoint URL planning
4. runtime settings planning without secrets in git or chat
5. validation and sanitization review
6. local/staging test plan
7. endpoint deployment only after approval
8. backend verification before setting `STATIC_FORM_ENDPOINT_VERIFIED=true`
9. email/Microsoft 365 actions only after separate approval

## Decision Weight

Form-first is important but secondary. It should follow media-first unless the user prefers to reduce contact-form integration risk before resolving visible-media readiness.
