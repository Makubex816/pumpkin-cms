# Operator Signoff Template

Use this template for a later CMS read-only preflight approval or CMS import execution approval. Do not add secrets.

## Gate

- Gate name:
- Tenant: Roller Rink Rentals
- Operator:
- Date/time:
- Package path:
- Validation evidence path:
- Preflight evidence path:
- Execution evidence path, if applicable:
- Rollback owner:
- CMS scope:

## Boundary Confirmation

- [ ] No secrets included.
- [ ] Protected config was not read.
- [ ] Env checks print presence only.
- [ ] CMS scope is draft/preview only.
- [ ] MediaAsset writes excluded.
- [ ] Azure excluded.
- [ ] Cloudflare excluded.
- [ ] DNS excluded.
- [ ] Deployment excluded.
- [ ] Function App settings excluded.
- [ ] Email/Microsoft 365 excluded.
- [ ] Search Console/indexing excluded.
- [ ] External HTTP checks excluded.
- [ ] Static generation excluded.
- [ ] Live pages hard-stopped.

## Decision

- [ ] GO
- [ ] NO-GO

Decision notes:

```text
<operator notes, no secrets>
```

## Required Final Sentence

```text
I confirm this approval does not authorize live pages, deployment, DNS, Cloudflare, Azure, email, Search Console, indexing, protected config reads, or secret printing.
```
