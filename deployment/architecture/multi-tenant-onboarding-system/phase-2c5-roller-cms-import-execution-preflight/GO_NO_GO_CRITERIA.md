# Go/No-Go Criteria

## Go For Future CMS Read-Only Preflight Approval

The next gate may be approved only if:

- Phase 2C-5 package is reviewed.
- The operator agrees to no-write CMS read-only preflight only.
- Env checks are presence-only and print no values.
- Protected config reads remain blocked.
- Generated Roller `.tmp` package output remains ignored and not staged.
- The preflight evidence path is generated output.
- No external systems are included.

## No-Go For Future CMS Read-Only Preflight

Stop if:

- approval asks for CMS writes
- approval asks for tenant creation
- approval asks to print or collect secrets
- approval asks to read protected config
- approval asks for external HTTP checks
- approval includes Azure, Cloudflare, DNS, deployment, email, Search Console, indexing, or live pages

## Go For Future CMS Import Execution Approval

A later CMS import execution approval may be considered only after:

- CMS read-only preflight completed successfully.
- Env presence evidence is complete and redacted.
- Offline validator still passes with 0 errors.
- CMS read-only conflict checks pass.
- Importer command exists and supports no-write defaults, draft/preview scope, approval ID, and ID capture.
- Rollback owner and evidence path are named.
- All excluded systems are listed in approval wording.
- Live-page hard stop is acknowledged.

## No-Go For Future CMS Import Execution

Stop before execution if:

- the CMS importer is missing or cannot enforce draft/preview scope
- any required env variable is `MISSING`
- validation has errors
- read-only preflight finds conflicts
- rollback owner is missing
- approval wording is ambiguous
- any live-page, deployment, email, Search Console, indexing, DNS, Azure, or Cloudflare action is requested

## Current Classification

| Area | Status |
| --- | --- |
| Ready for CMS read-only preflight approval | yes, approval decision only |
| Ready for CMS import execution approval | no, pending read-only preflight evidence |
| Ready for CMS import execution | no |
| Ready for live pages | no, hard-stopped |
