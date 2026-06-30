# Secure Handoff Requirements

The package intentionally excludes secrets and live credentials.

Future controlled creation requires a secure file or approved secure channel containing:

- TenantAdmin email.
- TenantAdmin initial password.
- Owner name and owner email.
- Lead recipient email or recipient group.
- Contact delivery/runtime secret material if the selected runtime requires it.
- Any deployment token only if a later deployment phase is explicitly approved.

Rules for the future handoff:

- Do not write secret values into repo reports.
- Do not print secret values.
- Do not stage secure files.
- Use placeholder references in public package JSON only.
- Keep deploy, DNS, indexing, contact POST, and media upload behind separate approvals.
