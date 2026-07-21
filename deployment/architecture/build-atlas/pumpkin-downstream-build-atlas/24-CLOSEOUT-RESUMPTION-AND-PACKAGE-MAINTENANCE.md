# Closeout, Resumption, and Package Maintenance

## Required closeout fields

```text
phase/milestone ID and result
active authority and exact scope
upstream source/frozen/qualified SHAs
active downstream repo/branch/head
files/contracts/data changed
attempt ledger and mutation counts
build/test/security/browser results
deployment IDs and artifact hashes
live readback and tenant isolation
CAPTCHA/form/editor/payment dimensions
rollback state
Atlas changes
package version/manifest/ZIP SHA-256
next safe gate
```

The running phase's closeout is a prerequisite input, not a narrative addendum. Preserve it raw, normalize it, reconcile contradictions, and regenerate package state before using the ZIP as current system context.

## Versioning

- Major: architecture/schema/authority change.
- Minor: compatible workstream or milestone addition.
- Patch: evidence refresh/correction.

## Regeneration

```bash
python tools/build_chat_pack.py .
python tools/build_release_package.py . --output ../Pumpkin-package.zip
python tools/validate_package.py .
```

Build, then validate again so manifest and checksums are included. Retain every milestone package and checksum.
