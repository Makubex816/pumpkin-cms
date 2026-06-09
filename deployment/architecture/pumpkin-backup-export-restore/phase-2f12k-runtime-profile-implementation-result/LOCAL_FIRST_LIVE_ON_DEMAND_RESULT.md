# Local-First Live-On-Demand Result

Phase 2F-12K preserves local-first development.

## Local Profiles

`local-dev`, `offline-bundle`, and `fake-provider` do not call Azure, CMS/API, Cosmos, blob storage, or protected config.

## Read-Only Profiles

`local-with-live-readonly` and `live-readonly` exist as status profiles only. They do not perform live calls in this implementation.

## Live Provider Calls

No live provider calls were added. Future live-readonly behavior requires a separate approval and implementation.

## Cost Control

The Backup Center can continue running fixture tests, bundle validation, and restore-plan dry-runs without live provider costs.

