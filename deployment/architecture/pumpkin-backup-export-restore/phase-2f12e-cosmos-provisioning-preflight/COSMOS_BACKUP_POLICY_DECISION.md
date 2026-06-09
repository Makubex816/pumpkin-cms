# Cosmos Backup Policy Decision

## Decision Needed

Choose the Cosmos platform backup policy before provisioning.

## Periodic Backup

Pros:

- lower-cost default option;
- simpler operational posture;
- suitable for lower write volumes when restore-point granularity can be looser.

Cons:

- limited restore-point granularity;
- may not meet production restore expectations after accidental writes or migrations;
- restore proof still needs Pumpkin portable export for tenant/site-level validation.

## Continuous Backup

Pros:

- point-in-time restore support;
- stronger rollback posture for production CMS data;
- better fit before approved seed/migration execution.

Cons:

- cost and retention implications;
- operational restore process must be documented and tested;
- still not a replacement for Backup Center standard portable export.

## Recommended Preflight Decision

For Ice production CMS data, choose continuous backup if budget and regional availability allow. Otherwise, document periodic retention and require more frequent Backup Center portable exports after live export is approved.

## Important Distinction

Cosmos platform backup evidence is not the same as a Pumpkin standard backup. Production restore proof requires:

- platform backup policy evidence;
- tenant/site-scoped portable export when approved;
- checksums;
- validator pass;
- restore-plan dry-run.
