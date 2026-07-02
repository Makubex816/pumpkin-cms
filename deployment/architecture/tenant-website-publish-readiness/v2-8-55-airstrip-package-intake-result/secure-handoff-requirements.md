# Secure Handoff Requirements

Future controlled creation will need a secure handoff outside repo or under an approved ignored `.tmp` path.

Required secure/non-public values:

- Tenant admin initial password or password source.
- Any tenant API key or static contact/form submission key.
- Production API base binding if not derived from environment.
- Deployment token if a future deploy is approved.
- Provider/runtime secrets if source build or live form routing requires them.

Public package values still needed:

- Final tenant ID.
- Display name.
- Canonical domain and aliases.
- Admin user emails/roles without passwords.
- Form routing metadata without secret keys.
- Publish profile metadata.

Rules:

- Do not write secret values into repo reports.
- Do not stage secure handoff files.
- Do not read owner hard-copy secrets without explicit approval.
- Do not mutate appsettings or deploy during handoff preparation.

