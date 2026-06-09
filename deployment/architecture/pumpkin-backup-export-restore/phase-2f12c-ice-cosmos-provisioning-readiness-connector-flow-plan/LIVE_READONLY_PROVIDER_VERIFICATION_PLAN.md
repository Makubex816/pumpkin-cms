# Live Read-Only Provider Verification Plan

## Purpose

After provider resolver, endpoint, Cosmos readiness, and CMS wiring are implemented, live read-only verification proves that Backup Center can identify the provider source before export approval.

## Verification Inputs

- provider resolver output;
- CMS provider metadata endpoint response;
- owner-confirmed Azure scope;
- Azure read-only resource metadata if approved;
- tenant/site scope;
- runtime profile classification;
- redaction and forbidden-field scan.

## Verification Checks

- provider type is `cosmos`;
- provider status is `configured` or `discovered`;
- account/database/container names match owner-confirmed scope;
- backup policy metadata is known or explicitly blocked;
- endpoint response has `secretsIncluded = false`;
- export readiness remains false unless a later export approval exists;
- production-restore-proof remains false until export and restore validation complete.

## Not Included

- Cosmos document export;
- database import;
- CMS writes;
- blob downloads;
- Azure mutation;
- deployment;
- Search Console/indexing;
- live-page publication.
