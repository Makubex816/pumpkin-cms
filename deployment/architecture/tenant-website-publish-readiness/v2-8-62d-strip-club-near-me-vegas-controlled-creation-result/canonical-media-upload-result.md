# Canonical Media Upload Result

Status: passed and preserved after the TenantAdmin hard stop.

- Command class: `az storage blob upload-batch`
- Destination: `strip-club-near-me-vegas-media/media/assets/`
- Canonical source files rehashed before upload: 302
- Uploaded/read-back blobs: 302
- Unique names: 302
- Duplicate names: 0
- Total bytes: 28,343,976
- Missing: 0
- Unexpected: 0
- Zero-byte blobs: 0
- Size mismatches: 0
- Overwrite: false

A fresh post-stop RBAC read returned 302 blobs, 28,343,976 bytes, and zero zero-byte blobs.
