# Go/No-Go Criteria

## Phase 2F-9 Preflight Result

Go for a later owner decision on database/media completion execution.

No-go for declaring complete production restore proof today.

## Go Criteria For Later Execution

Proceed only if:

- owner explicitly approves database/media completion execution;
- database mode is selected;
- media mode is selected;
- required env presence checks pass without values printed;
- required tooling checks pass;
- output path/storage target is approved;
- database artifact encryption/access-control rules are accepted;
- media artifact security rules are accepted;
- manifest/checksum integration is ready;
- validator and restore-plan dry-run are required after artifact creation;
- generated backup artifacts remain ignored or privately stored;
- no protected config read is needed.

## No-Go Conditions

Do not proceed if:

- execution requires reading protected config;
- secret values would be printed or written;
- output path is not ignored or privately controlled;
- database artifact cannot be encrypted or access-limited;
- media copy would require broad write permissions to production storage;
- standard backup would include an escrow payload;
- CMS writes or MediaAsset writes are included;
- Azure, Cloudflare, DNS, deployment, email, Search Console, indexing, or live-page publication actions are included without explicit separate approval;
- generated artifacts would be staged into Git.

## Production Restore Proof Criteria

Production restore proof remains no-go until:

- database artifact proof or approved platform backup evidence is captured;
- media blob recovery proof is captured or explicitly waived by owner;
- checksums pass;
- validator passes in completion/full-proof mode;
- restore-plan dry-run marks production restore proof as complete for selected scope;
- owner reviews and accepts the result.

