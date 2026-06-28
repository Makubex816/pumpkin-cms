# Next Phase Prompt

Continue with V2.8.32X only if approved.

Proposed scope:

- Use the completed V2.8.32W result as carryforward.
- Read only a new approved ignored secure file.
- Do not print or write provider connection strings, passwords, JWT secrets, bearer tokens, or password hashes.
- Source-confirm the `FormEntry` container name and partition key.
- Create or confirm only the source-required `FormEntry` Cosmos container if explicitly approved.
- Do not mutate unrelated Cosmos containers or records.
- Run live Admin login.
- Run authenticated Admin FormEntry readback preflight.
- If readback preflight passes, run static contact preflights.
- If all preflights pass, submit exactly one synthetic non-PII production contact POST.
- Do not retry after a sent POST.
- Read back the returned entry ID or trace through the authenticated Admin FormEntry route.
- Close the contact gate only if the V2.8.32X trace/entry is Admin-visible.

Starting blocker:

`admin_formentry_readback_container_not_found_after_login_repair`
