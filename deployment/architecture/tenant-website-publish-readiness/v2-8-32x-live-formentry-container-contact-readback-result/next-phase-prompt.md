# Next Phase Prompt

Continue with V2.8.32Y only if approved.

Proposed scope:

- Use the completed V2.8.32X result as carryforward.
- Do not deploy, mutate appsettings, mutate DNS/custom domains, run indexing, access inbox/provider systems, or read protected config except a new approved secure file.
- Do not print or write provider connection strings, passwords, JWT secrets, bearer tokens, or password hashes.
- Confirm the `FormEntry` container still exists with `/tenantId`.
- Use source-confirmed static-contact routing reference keys, not literal public endpoint/email routing references.
- Log into live Pumpkin API.
- Preflight authenticated Admin FormEntry readback.
- Preflight static contact health and contact page.
- If all preflights pass, submit exactly one synthetic non-PII production contact POST.
- Do not retry after a sent POST.
- Read back the returned entry ID or trace through authenticated Admin FormEntry route.
- Close the contact gate only if the new trace/entry is Admin-visible.

Starting blocker:

`production_contact_post_failed_http_400_no_retry`
