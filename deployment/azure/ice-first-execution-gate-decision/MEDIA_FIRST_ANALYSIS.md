# Media-First Analysis

Generated: 2026-06-04

## Current Media Blocker Profile

Media is responsible for 6 remaining strict-validator errors:

- `index.html`
- `index.txt`
- `contact/index.html`
- `contact/index.txt`
- `service-areas/index.html`
- `service-areas/index.txt`

These failures are tied to approved visible page imagery and documented MediaAsset IDs. The existing planning docs explicitly warn that approved visible imagery should not be removed merely to make validators pass.

## Why Media Is A Strong First Gate

Media setup is the larger blocker group in the current strict-readiness profile.

It affects visible output quality on all approved routes:

- `/`
- `/contact`
- `/service-areas`

It is also a prerequisite for final production-quality static output because production-bound pages should not retain local `/media/ice-rink-rentals/...` URLs.

## Work Required Later

After explicit approval, the media path will require:

1. final MediaAsset inventory verification
2. source binary, checksum, safe filename, MIME type, and dimension verification
3. production media storage approval
4. Blob/container creation only after approval
5. media upload only after approval
6. Cloudflare media domain setup only after approval
7. MediaAsset production field updates only after approval
8. static rebuild and media URL validation

## Risks And Boundaries

Media-first has more infrastructure and write-boundary dependencies than a doc-only preflight. It must stay gated because it can involve Azure Storage, Blob containers, Cloudflare media hostname setup, media uploads, and MediaAsset updates.

For this decision run:

- no Azure resources were created
- no Blob containers were created
- no media was uploaded
- no Cloudflare or DNS changes occurred
- no CMS or MediaAsset records were changed

## Decision Weight

Media-first has the strongest dependency value because it resolves the larger validator class and protects approved visible imagery before final static-output quality validation.
