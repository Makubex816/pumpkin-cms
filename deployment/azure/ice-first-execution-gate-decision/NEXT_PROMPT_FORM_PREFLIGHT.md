# Next Prompt: Form Preflight

Use this prompt if choosing the alternate form-first gate or after media preflight is complete.

```text
Work only from the local repo filesystem and terminal.

Repo:
C:\Users\User\Desktop\PumpkinCMS\pumpkin-cms

Branch:
feature/admin-page-editor-import-export

Primary site:
IceSkatingRinkRentals.com

Paused:
RollerRinkRentals.com remains paused.

Goal:
Create a static form endpoint setup preflight for IceSkatingRinkRentals.com only.

This is preflight/planning only unless this prompt explicitly grants approval for a named execution step.

Review safe docs and inventories, including:

- deployment/azure/ice-production-readiness-master-plan/
- deployment/azure/ice-static-form-endpoint-setup-planning/
- deployment/azure/ice-first-execution-gate-decision/

Confirm endpoint behavior, validation/sanitization requirements, public endpoint variable placeholders, backend verification requirements, local/staging test criteria, email delivery boundaries, and exact next approval needed.

Do not deploy an endpoint unless explicitly approved inside this future prompt.
Do not create Azure resources unless explicitly approved inside this future prompt.
Do not create Cosmos resources.
Do not set production secrets.
Do not set STATIC_FORM_ENDPOINT_VERIFIED=true.
Do not send email.
Do not touch Microsoft 365.
Do not update CMS records.
Do not update MediaAsset records.
Do not change Cloudflare or DNS.
Do not deploy the static site.
Do not read protected config.
Do not print secret values.
Do not print JWT values.
Do not stage generated static artifacts.
Do not touch Roller.

Protected config:
Do not read or modify .env.local, appsettings.Development.json, or protected config files.

Acceptance:

- form endpoint preflight package or report exists
- current form blockers are clearly restated
- exact approval required for endpoint deployment or verification is documented
- no endpoint deployment, email, Microsoft 365 action, production secret setting, protected config read, or Roller action occurred
```
