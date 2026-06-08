# Validation Report JSON Expectations

`validation-report.json` is the machine-readable companion to `VALIDATION_REPORT.md`.

Required:

- `schemaVersion`
- `tenantId`
- `siteKey`
- `gate`
- `status`
- `externalMutationPerformed`
- `findings`
- `nextActions`
- `boundaryConfirmation`

Findings must identify:

- severity
- code
- file or route
- plain-language message
- operator detail
- blocking gate

Do not print secret values in findings. If a secret-like value is found, report detector name, file path, and remediation steps only.
