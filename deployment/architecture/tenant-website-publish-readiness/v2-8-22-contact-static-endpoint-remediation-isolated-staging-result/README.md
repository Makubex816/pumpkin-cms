# V2.8.22 Contact Static Endpoint Remediation and Isolated Staging Verification

Date: 2026-06-25

Status: completed with isolated staging blocker.

V2.8.22 remediated the static contact form source so Ice static builds serialize `/api/static-contact` for the public contact form. The sanitized artifact and isolated contact page preflight verified that the recovered contact page now points to `/api/static-contact` and preserves `contact@iceskatingrinkrentals.com`.

Exactly one deployment was sent to the approved isolated target `swa-ice-static-isolated-staging`. Exactly one synthetic isolated POST was sent to `https://kind-island-0a85a740f.7.azurestaticapps.net/api/static-contact` with trace ID `v2-8-22-isolated-contact-20260625181642`. The POST returned HTTP 404 with an empty body, so no retry was sent and production remains blocked.

Conclusion: the original static frontend `/api/contact` issue is locally remediated, but the isolated SWA API route was not live after the app-plus-API deployment. A new approval is required to diagnose and remediate the SWA managed API deployment shape before any production release or production contact POST retry.
