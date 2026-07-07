# Next Phase Prompt

Approve V2.8.61H Airstrip Owner-Applied DNS Verification and Azure Custom-Domain Binding Preflight only.

Use the V2.8.61G master operator hardcopy as the current recovery and resource reference. Do not read or copy hardcopy secrets into repo reports.

Scope:

- Verify owner-applied Bluehost DNS values for `airstripclublasvegas.com` and `www.airstripclublasvegas.com`.
- Run DNS read-only checks for apex A, apex TXT `asuid`, www CNAME, and www TXT `asuid.www`.
- If DNS matches exactly, verify the live Azure target for `app-airstrip-prod-centralus-001` in `rg-pumpkin-api-prod-centralus`.
- Prepare, but do not execute unless explicitly approved in the same prompt, Azure App Service custom-domain binding and managed TLS commands.
- Run GET-only no-regression before and after any approved binding.

Hard stops:

- No Bluehost automation unless separately approved.
- No nameserver change.
- No Google Workspace/MX/SPF/DKIM/DMARC change.
- No CDN/Front Door.
- No indexing/Search Console/sitemap submission.
- No content, media, user, role, tenant, DomainBinding, appsetting, or storage mutation.
- No contact POST or form submission.
- No deploy.
- No SAS generation.
- No hardcopy staging.
