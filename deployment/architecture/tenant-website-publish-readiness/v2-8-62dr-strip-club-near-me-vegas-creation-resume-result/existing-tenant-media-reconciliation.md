# Existing Tenant And Media Reconciliation

The tenant `strip-club-near-me-vegas` existed exactly once and was not recreated. Before mutation it had zero users, themes, pages, forms, MediaAssets, domains, import runs, and publish runs, with no active submit key.

Storage RBAC readback used login auth only: 302 blobs, 302 unique names, 28,343,976 bytes, 0 missing, 0 unexpected, 0 size mismatches, and 0 zero-byte blobs. No storage keys, `listKeys`, SAS, upload, container creation, or deletion was used.
