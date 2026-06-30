# Root Cause Classification

Classification:

`swa_managed_api_backend_unavailable_redeploy_requires_missing_swa_deployment_token`

Evidence:

- Apex, www, production default host, and isolated all returned HTTP 500 for `/api/static-contact-health`.
- The source health handler is a static 200 sentinel and does not depend on appsettings, secrets, or Pumpkin API.
- Local static-contact compat tests passed.
- Approved static-contact appsettings were set and then verified by redacted exact-match comparison.
- Isolated SWA diagnostic setting removal did not recover health, and the diagnostic setting was restored.
- GET-only checks against `/api/static-contact`, `/api/static-contact-health`, and a deliberately missing `/api/*` route all returned the same SWA platform `Backend call failure`.

Ruled out:

- Custom-domain-only routing issue.
- Static-contact health handler logic.
- Static-contact appsetting mismatch after repair.
- SWA diagnostic setting as proven causal.
- Pumpkin API health outage.
- Static page publishing regression.

Remaining blocker:

The managed SWA API backend is unavailable across both SWAs. The next repair requires an isolated static-contact SWA package redeploy and then a production redeploy only after isolated health passes. The required deployment token or equivalent approved credential was not present in the approved secure file or process environment.

