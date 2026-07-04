# Google Workspace Separation Plan

Status: design complete.

Google Workspace email DNS is separate from public web domain binding.

Rules:

- Do not mix MX/SPF/DKIM/DMARC activation with App Service hostname binding.
- Do not block web-domain binding solely because email DNS is inactive.
- Track email DNS readiness in a separate future workflow.
- If email DNS records are shown next to web DNS, label them as separate and inactive unless approved.
- Do not store mailbox credentials, recovery codes, or admin session details.

For Airstrip first use, Google Workspace remains inactive and out of scope.

