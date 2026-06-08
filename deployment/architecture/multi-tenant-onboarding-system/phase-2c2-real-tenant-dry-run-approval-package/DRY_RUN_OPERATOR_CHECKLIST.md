# Dry-Run Operator Checklist

Use this checklist only after the user gives the later exact first real dry-run approval.

This checklist includes package generation steps for that later approval. It is not authorization to run them during Phase 2C-2 package creation.

## Before Creating Any Answers File

- [ ] Candidate selection worksheet is complete.
- [ ] Candidate recommendation is `go` or `go_with_notes`.
- [ ] User-facing intake checklist is complete.
- [ ] No-secrets agreement is acknowledged.
- [ ] Required information worksheet is complete.
- [ ] Owner review before generation is complete.
- [ ] Intake contains no secrets.
- [ ] Intake contains no private customer data.
- [ ] Intake contains no protected config.
- [ ] Candidate is not Roller-related, or a separate Roller-specific approval exists.
- [ ] External systems are explicitly excluded.
- [ ] Future approval wording names the exact candidate and approved intake path.

## Prepare Local Answers

- [ ] Work only in a local approved working folder.
- [ ] Keep generated files under ignored local output such as `.tmp/real-tenant-pilots/<tenant-slug>/`.
- [ ] Prepare the non-secret answers JSON file from approved intake only.
- [ ] Do not copy raw intake that includes unsafe values.
- [ ] Use placeholders for runtime-only or later external values.
- [ ] Choose or record the preferred deployment profile for dry-run assumptions only.
- [ ] Confirm the deployment profile is not executed.
- [ ] Confirm form fields include `leadRecipientRef` where needed.
- [ ] Confirm legacy `recipientGroup` compatibility where needed.

## Builder Dry-Run Preview

- [ ] Run the builder preview only after the later exact approval.
- [ ] Confirm preview writes no package files.
- [ ] Review planned route, media, form, and file outputs.
- [ ] Stop if preview references unrelated tenants, paused tenants, secrets, unsafe URLs, protected paths, or external mutations.

## Local Package Generation

- [ ] Generate the package locally only after preview review.
- [ ] Use explicit output folder.
- [ ] Use `--overwrite` only if the output folder is known generated output.
- [ ] Confirm no CMS records were written.
- [ ] Confirm no MediaAsset records were written.
- [ ] Confirm no external system was contacted.

## Validator And Support Packet

- [ ] Run the offline validator.
- [ ] Generate `validation-report.json`.
- [ ] Generate the human-readable validation report.
- [ ] Generate the redacted support packet.
- [ ] Generate operator handoff notes.
- [ ] Confirm no `failed` status remains.
- [ ] Confirm no `blocked` status remains.
- [ ] Confirm support packet redaction passes.
- [ ] Confirm Search Console and indexing remain blocked.

## Owner Review

- [ ] Review business name and domain intent with owner.
- [ ] Review pages and routes with owner.
- [ ] Review media and rights status with owner.
- [ ] Review form recipient reference and mailbox owner with owner.
- [ ] Review legal/privacy status with owner.
- [ ] Review analytics/tracking decision with owner.
- [ ] Review monitoring owner and rollback owner with owner.
- [ ] Confirm owner understands this is not a launch approval.

## Final Stop

- [ ] Stop before CMS import.
- [ ] Stop before tenant creation.
- [ ] Stop before Azure, Cloudflare, DNS, deployment, Function App, email, Microsoft 365, Search Console, indexing, external checks, or Roller work.
- [ ] Document gaps and next approval needed.
