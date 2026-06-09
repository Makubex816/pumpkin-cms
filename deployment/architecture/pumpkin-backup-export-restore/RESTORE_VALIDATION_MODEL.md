# Restore Validation Model

## Validation Stages

1. Manifest parse and schema validation.
2. Checksum verification.
3. Artifact inventory validation.
4. Sandbox/local restore plan generation.
5. Sandbox/local restore execution under separate approval.
6. Readback comparison.
7. Recovery report and go/no-go recommendation.

## Standard Backup Validation

Validate:

- manifest version and scope;
- checksum completeness;
- database export metadata;
- CMS content shape;
- media inventory;
- static evidence;
- config inventory redaction;
- escrow absence in standard mode.

## Restore Readback

Compare:

- tenant/site counts;
- page count and route proof;
- media count and reference proof;
- form config proof;
- SEO/sitemap/robots/canonical proof;
- theme reference proof;
- audit/event records expected from restore flow.

## Escrow Restore Proof

Escrow restore proof belongs only in a separately approved escrow restore flow. Standard backup validation can prove escrow payload integrity and recipient metadata, not plaintext values.

## Failure Rule

If restore validation fails, stop and report. Do not continue to CMS writes, deployment, Search Console/indexing, or live-page publication.
