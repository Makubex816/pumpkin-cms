# Pumpkin Spectre Dev SuperAdmin Password Rotation V2.8.60WA

Date: 2026-07-05

## Status

Blocked after successful route deployment.

The SuperAdmin password route is live in production, but the approved new Spectre Dev SuperAdmin password was rejected by the source password policy. No successful rotation occurred.

## Live Route

- Method/path: `POST /api/admin/users/{tenantId}/{userId}/password`.
- Authorization: SuperAdmin bearer token required.
- Targeting: self-targeting enforced for the approved rotation path.
- Current password verification: BCrypt verification.
- New password storage: BCrypt hash.
- Response: sanitized; no password or hash returned.

## Production Deployment

- Web App: `app-pumpkin-api-prod-centralus-001`.
- Resource group: `rg-pumpkin-api-prod-centralus`.
- Deployment id: `81fe72d5-eb79-430f-aa73-511f487eb422`.
- Result: succeeded.
- Route readiness: live route returns auth/validation behavior rather than HTTP 404.

## Rotation Attempt

- Current credential login before rotation: succeeded.
- Proposed new credential login before rotation: rejected.
- Rotation request result: HTTP 400 validation rejection.
- Root blocker: proposed new password does not satisfy the live source minimum-length policy.
- Current credential login after rejected rotation: still succeeds.
- Proposed new credential login after rejected rotation: still rejected.

## Operational Meaning

The deployment blocker from V2.8.60W is resolved. The remaining blocker is credential input/policy alignment, not route availability.

Next retry should provide a policy-compliant new password in an approved secure handoff, then run the live route without another API deploy unless source policy changes are separately approved.
