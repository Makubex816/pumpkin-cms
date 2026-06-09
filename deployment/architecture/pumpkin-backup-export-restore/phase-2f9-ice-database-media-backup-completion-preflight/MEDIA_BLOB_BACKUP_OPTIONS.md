# Media Blob Backup Options

## Option A: Metadata Inventory Only

Use when blob copy/download is not approved.

Pros:

- lowest risk;
- already achieved in Phase 2F-8 for 12 MediaAsset records;
- no storage credentials or blob downloads required.

Cons:

- does not prove binary recoverability;
- media restore remains incomplete.

Production restore proof impact: no-go for complete media recovery proof.

## Option B: Blob Copy To Ignored Local Output

Use when a read-only source credential or approved identity is available and local artifact handling is approved.

Pros:

- produces local binary copies for checksum validation;
- integrates with manifest and restore dry-run;
- easy to inspect for count/checksum completeness.

Cons:

- local storage can grow quickly;
- media may contain licensed/private customer assets;
- requires strict cleanup and Git-ignore enforcement.

Production restore proof impact: recommended for a small first completion run if output storage is sufficient.

## Option C: Blob Copy To Private Backup Storage

Use when long-term backup storage is approved.

Pros:

- better retention and access control;
- avoids large local media payloads;
- can use storage-side copy where supported.

Cons:

- requires Azure storage action approval;
- needs destination access controls and retention policy;
- may require additional copy verification.

Production restore proof impact: recommended for operational backups after the first local completion validation.

## Option D: Manifest-Only Evidence

Use when the owner only approves inventory evidence.

Pros:

- can document media URLs, blob paths, sizes, content types, and known hashes.

Cons:

- still no binary copy proof;
- cannot validate downloaded bytes.

Production restore proof impact: partial evidence only.

## Recommendation

For the next execution, prefer either:

- a bounded local blob copy under ignored `.tmp` for all 12 known MediaAsset records, if source access and local capacity are ready; or
- a private backup-storage copy if the owner wants operational retention in the same execution.

