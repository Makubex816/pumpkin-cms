# Media Artifact Security Rules

Media blobs may contain licensed, private, branded, or customer-provided assets. Treat copied media as sensitive backup material.

## Required Rules

- Media copies must never be staged into Git.
- Media copies must be written only under ignored `.tmp` output or approved private backup storage.
- Blob-copy manifests must avoid signed URLs and storage credentials.
- Each copied blob must have a checksum entry.
- Preserve content type, size, source asset ID, safe filename, and page reference metadata where available.
- Record failed or skipped blobs explicitly.
- Retention and cleanup rules must be documented before execution.

## Prohibited

- MediaAsset writes.
- Blob uploads to production media storage.
- Public backup buckets/containers.
- Signed URLs in standard backup manifests.
- Storage keys or SAS URLs in reports.
- Raw media copies staged into Git.

## Recommended Local Output Pattern

```text
deployment/architecture/pumpkin-backup-export-restore/backup-implementation/.tmp/ice-database-media-completion/
  media-blobs/
    blobs/
    media-blob-copy-manifest.json
    media-blob-checksums.sha256
    MEDIA_COPY_RESULT.md
```

