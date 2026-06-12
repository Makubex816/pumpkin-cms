# Missing Operator Inputs

Remaining exact inputs:

1. Approve the minimum backend POST/form verification scope, including endpoint URL, test payload, expected response, evidence path, and abort rule.
2. Confirm whether dry-run/no-email backend verification is enough for staging, or whether real email/Pumpkin API persistence must be verified.
3. Name the future staging deploy operator.
4. Name the rollback/abort owner.
5. Confirm deployment token/secret storage location outside the repo.
6. Confirm whether staging publish execution may target `swa-ice-static-staging` at `happy-mud-0b375e20f.7.azurestaticapps.net`.

Still closed unless separately approved:

- DNS mutation,
- Search Console/indexing,
- live publication,
- external crawling/live page checks,
- provider/CMS writes.

