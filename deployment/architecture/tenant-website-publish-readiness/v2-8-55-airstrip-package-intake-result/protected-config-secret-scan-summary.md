# Protected Config Secret Scan Summary

Status: redacted_summary_only

Protected/config-looking file names detected:

- `pumpkinairstrip/apps/airstrip-frontend/.env.example`

No protected config contents were printed.

Secret-like identifiers were detected in source/docs/model files, including API key, token, password, credential, and user model field names. This scan recorded paths and counts only during analysis; no values were written to repo reports.

Classification:

`contains_config_template_and_secret_like_identifiers_secure_handoff_required`

Secure handoff must provide later values for:

- API base URL.
- Tenant ID.
- Tenant API/static form key or equivalent.
- Admin user credentials.
- Any deployment token if a later source-build deploy is approved.

