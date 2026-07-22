# Shared API public transport proof

Blocked before deployment. The current shared API form submit, definition, and preflight routes require a tenant bearer key. No `/public/forms/submit` or other anonymous publication endpoint exists. CORS allowlisting alone does not independently reject forged/missing Origin requests, and no active tenant/release/form publication allowlist exists. Embedding the tenant key in static files is prohibited.

A focused API contract and deployment are strictly required, but would not cure the immutable artifact's noindex/runnable-client defect.
