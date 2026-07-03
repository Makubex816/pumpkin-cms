# Airstrip Controlled Creation Plan V2.8.58

Status: plan only, not executed.

V2.8.58 objective:

Create the Airstrip tenant records in a controlled, auditable sequence using the V2.8.56 normalized package and the outside-repo secure handoff. Stop before deploy, DNS, indexing, contact POST, form submission, and media upload unless separately approved.

Creation order:

1. Reconfirm active branch, staged state, secure handoff hash, package validator, and tenant absence.
2. Create tenant record for `airstrip-club-las-vegas` with canonical domain `airstripclublasvegas.com`.
3. Create TenantAdmin user from secure handoff, with password value supplied only at runtime.
4. Bind tenant credential metadata from secure handoff without printing credential values.
5. Create brand and theme records, then activate the Airstrip theme.
6. Create baseline pages: home, contact, service-areas.
7. Create extra pages: request-booking, packages, and selected preserved routes from validation routes.
8. Create FormDefinition `airstrip-reservation`.
9. Create MediaAsset records with future target prefix, but do not upload binary media unless separately approved.
10. Create contact binding metadata for lead routing, but do not send contact POST.
11. Create ImportRun and PublishRun audit records only if source-discovered workflow requires them.
12. Read back all created records through authenticated Admin routes.
13. Stop with a creation-result package and rollback instructions.

Hard stops:

- Stop if Airstrip already exists before creation.
- Stop if validator fails.
- Stop if secure handoff hash mismatches.
- Stop if any write route would require an unapproved secret or deploy.
- Stop before DNS, indexing, contact POST, form submission, media upload, or production cutover.

