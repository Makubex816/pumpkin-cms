# Local-First Live-On-Demand Model

Pumpkin Backup Center remains local-first.

## Local Modes

`local-dev`, `offline-bundle`, and `fake-provider` perform no live calls. They use fixtures, local folder bundles, dry-run restore plans, and ignored `.tmp` output.

## Read-Only Modes

`local-with-live-readonly` and `live-readonly` are status models only in this implementation. They do not call Azure, CMS/API, Cosmos, blob storage, or protected config by default.

Future live-readonly checks require a separate approval and must remain GET/HEAD-only.

## Write Modes

`production-write-approved` exists only as a hard-stopped future profile. It does not enable writes, exports, migration, runtime switch, deployment, or live-page publication in Phase 2F-12K.

## Cost Control

Local development can continue without live Azure or paid provider calls. The CLI reads fixtures only unless a future phase explicitly adds a live-readonly execution path.

