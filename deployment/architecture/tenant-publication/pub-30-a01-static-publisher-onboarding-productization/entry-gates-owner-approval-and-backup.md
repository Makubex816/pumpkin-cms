# Entry gates, owner approval, and backup

## Verified entry authority

- repository history contained PUB-20 final commit `aa8943ee29c99ae47fd57d7b60dfe160b6afa6e7`;
- active Atlas entry was version 3.7.0 with package SHA-256 `ac127e7dfb2c7e471446947e70a12298b844eba741a476536b903280978b60ce` and manifest SHA-256 `cc0f7bcb307437ae9b2afd266d388c7a9a1b3719526e046f7d0094cd84a3284a`;
- working memory was version 1.4.0 with package SHA-256 `be361392de87bcaa2efda738264174389a20f255cc131a45b634210546bd6ba3` and manifest SHA-256 `755abc68784db39ce80e1f02d0c9f66936448a4363f7bfd840c0f53e533e186c`;
- staging was empty and no Git operation was active at entry;
- the unrelated dirty primary worktree had 780 entries (164 modified and 616 untracked); its sorted porcelain digest was `d07950677ff363116e064f0291240b7991f0f76146a9c9c31806eb5f6dc9d9e8`, and it was left unstaged;
- retained publication `pub20-a02-pilot` was active at revision 4 with exactly one retained synthetic FormEntry;
- retained Free-tier Static Web App, active API/Admin/starter identities, S2/two-worker capacity, and the unexpired capacity authority were read back;
- DPAPI metadata, restricted ACL, same-user in-memory round trip, and zero plaintext token files passed at entry.

## PUB-20 carryforward

The preserved chain is A02 blocked evidence `4a43f3e471d71d8ab49f46ff1e2a6ad23a54d5b8`, publisher correction `55f8cb50727f9e22ca80561ff61edbaac2e15188`, and final PUB-20 closeout `aa8943ee29c99ae47fd57d7b60dfe160b6afa6e7`.

The retained fixture is Free-tier SWA `swa-pumpkin-pub20-a02-pilot`, publication `pub20-a02-pilot`, and synthetic tenant `pub20-a02-synthetic`, with default host `purple-mud-029914d0f.7.azurestaticapps.net`. It has zero custom domains, linked backends, or repository connections. The active deployment-token envelope metadata hash remained `b656a5b823784ca9b1084eabf602d7e930d3297019886030995b8c0fefa406c6`; no token value or envelope content is recorded here.

## Owner approval

The ignored PUB-30-A01 approval parsed, matched the baseline authorities, and had SHA-256 `4c6552221b00cd46948a7ca01f07f41b4828f87fdb66f14fc8880e31c90884e8`.

It authorized repository productization, local candidates, two clean roots, read-only customer planning, backup, at most three corrected deployment attempts per API/Admin/starter/synthetic SWA, one additional synthetic release, and at most one additional logical synthetic form submission. It did not authorize customer mutation/deployment, domains or DNS/TLS, Airstrip runtime, indexing, capacity change, payment work, paid infrastructure, or affected-platform-secret rotation; SWA deployment-token rotation was explicitly denied. Capacity authority extended through `2026-08-06T03:27:08.1575363Z`.

The approval identifies PUB-30-A01, was approved at `2026-07-23T05:23:39.2604578Z`, remained ignored and unstaged, and matched PUB-20 final commit and the Atlas, working-memory, and DPAPI metadata authorities. The deployment and submission maxima were never consumed: each deployment attempt count and the logical/HTTP form-submission count remained zero.

## Backup

The outside-repository pre-productization backup contains 12 checksummed, metadata-only evidence files. Inventory and checksums validated with zero failures:

- backup manifest SHA-256: `6647b23f3d63af719d3c7b9beaf2a788e37eb2b29a08756dd0128cb5e1eff5d0`;
- checksum ledger SHA-256: `fc9c4a71e33c9bd06d7d683a516c754a61e94c9a25a217bdb456687d140c1e2e`.

No live restore was performed.

## Gate raised after entry

A later read-only API settings hash diagnostic exposed protected configuration values only in its command trace. It created no file, entered no commit, and made no live mutation. The repository-safe containment record has SHA-256 `5c5a1c7be41a669b1f6ca0611d8e2acd06af4a923d6f9930a507cc8198c7370d` and contains no protected value. Because PUB-30 did not authorize the now-required rotation, all deployments and synthetic mutations are held for explicit `PLATFORM_SECRET_ROTATION_AND_PARITY_RECOVERY` authority.
