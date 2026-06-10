# Offline And Live Profile Preservation

Phase 2H-12 keeps local/offline operation as the default profile.

The normalized action profile preserves:

- `localOfflineDefault: true`
- `fakeProvider: true`
- `offlineBundle: true`
- `localFileBackedStore: true`
- `liveReadonlyExplicit` only when explicitly requested
- `liveWriteApproved: false`
- `productionWriteApproved: false`

Future Azure, Admin, API, or provider wiring must keep local/fake/offline profiles available for development, QA, backups, onboarding packages, and regression tests. Live-readonly providers must remain separate from live-write providers.
