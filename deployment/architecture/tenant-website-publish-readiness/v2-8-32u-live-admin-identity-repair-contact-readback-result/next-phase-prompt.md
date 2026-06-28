# Next Phase Prompt

Approve V2.8.32V only: resolve the V2.8.32U `admin_identity_container_not_found` blocker.

Recommended scope:

- Review V2.8.32U result package.
- Decide whether to approve creation/provisioning of the source-required `User` container, or whether to approve a source change/deploy that aligns login identity storage with the provisioned provider metadata container names.
- Use a new ignored secure handoff file if protected provider/Admin values are needed.
- Do not print or write connection strings, passwords, hashes, JWT secrets, tokens, or cookies.
- Do not appsettings list/show.
- After identity storage is aligned, create/update exactly one Admin identity record.
- Run live Admin login.
- Use returned bearer token only in memory.
- Run authenticated Admin FormEntry readback preflight.
- Only if readback preflight returns 2xx, run static contact preflights and exactly one production contact POST.
- Read back the resulting FormEntry by returned ID or trace.

Hard stops:

- No DNS/indexing.
- No inbox/provider login.
- No more than one production contact POST.
- No secret value disclosure.

