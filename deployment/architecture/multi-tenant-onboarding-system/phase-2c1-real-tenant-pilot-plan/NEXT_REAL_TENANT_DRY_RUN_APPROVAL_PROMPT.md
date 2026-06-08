# Next Real Tenant Dry-Run Approval Prompt

Use this prompt only after a candidate has been selected and approved non-secret intake is available.

```text
Approve Phase 2C-2 first real tenant no-mutation dry run only for <tenant display name>/<tenant slug>: use the approved non-secret intake at <intake path>, generate a local import package candidate, run the offline validator, export a redacted support packet and operator handoff, and document gaps. No real tenant creation, no CMS/Azure/Cloudflare/DNS/deployment/email/Search Console/indexing actions, no external checks, no protected config access, and Roller remains paused.
```

## Required Prompt Fill-Ins

- `<tenant display name>`: public business name approved for the dry run
- `<tenant slug>`: proposed local tenant slug
- `<intake path>`: local path to approved non-secret intake

## Prompt Boundary

This prompt authorizes only a local/offline dry run. It does not authorize execution, import, deployment, external checks, indexing, or Roller work.
