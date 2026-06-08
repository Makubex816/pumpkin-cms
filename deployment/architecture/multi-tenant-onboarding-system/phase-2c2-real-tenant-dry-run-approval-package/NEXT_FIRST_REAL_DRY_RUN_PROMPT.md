# Next First Real Dry-Run Prompt

Use this prompt only after all Phase 2C-2 worksheets are complete for one candidate.

```text
Approve Phase 2C-3 first real tenant no-mutation dry run only for <tenant display name>/<tenant slug>: use the approved non-secret intake at <intake path>, prepare a local non-secret answers JSON file at <answers path>, run the builder dry-run preview, generate a local import package candidate at <local output path>, run the offline validator, export a redacted support packet and operator handoff, review the local outputs with the owner, and document gaps. No real tenant creation, no CMS/Azure/Cloudflare/DNS/deployment/email/Search Console/indexing actions, no external checks, no protected config access, no secrets, no generated output staging, and Roller remains paused.
```

## Must Be Filled In

- `<tenant display name>`
- `<tenant slug>`
- `<intake path>`
- `<answers path>`
- `<local output path>`

## Prompt Review Checklist

- [ ] Candidate is selected.
- [ ] Intake is approved and non-secret.
- [ ] No-secrets agreement is acknowledged.
- [ ] Owner review is complete.
- [ ] Output path is local and ignored.
- [ ] All external systems are excluded.
- [ ] Roller remains paused.

## Not Authorized By This Prompt

This prompt still does not authorize CMS import, tenant creation, deployment, external checks, email, Search Console, indexing, or Roller work.
