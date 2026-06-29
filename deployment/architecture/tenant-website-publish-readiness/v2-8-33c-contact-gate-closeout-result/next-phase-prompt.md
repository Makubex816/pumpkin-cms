# Next Phase Prompt

Approve a separate key rotation/security follow-up lane only.

Objective:

Rotate the tenant/static contact key material that was exposed during earlier operator troubleshooting, without reopening unrelated deployment or indexing work.

Carryforward:

- Contact gate is closed by V2.8.33B production proof.
- Production trace: `v2-8-33b-production-static-contact-20260629015903-78f5b35b`.
- V2.8.33C performed evidence consolidation only and did not deploy, POST, mutate Azure/appsettings/DNS/indexing, or read protected config files.

Required safety:

- Do not print old or new secret values.
- Do not commit or stage secure handoff files.
- Do not use `git add -A`.
- Discover exact source-required setting names before any runtime binding mutation.
- Use isolated proof before any production proof.
- Send no more than the explicitly approved number of synthetic non-PII contact submissions.
- Stop before production mutation or POST unless the follow-up approval explicitly allows it.

Requested output for that future lane:

- Source-discovered binding summary.
- Rotation execution record with secret values redacted.
- Isolated validation record.
- Production validation record only if approved.
- Admin readback evidence.
- Security cleanup and no-secret-disclosure result.
