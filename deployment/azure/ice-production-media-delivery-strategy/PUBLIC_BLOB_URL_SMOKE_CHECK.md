# Public Blob URL Smoke Check

Date: 2026-06-05

## Checked Blob

Approved uploaded blob:

```text
ice-rink-rentals/assets/winterfesticerinkrentals-324b1b89777d/324b1b89777d8f9d277f4cee70390eb0a3f68dd6902457f9f6f19164e1fbb59c/winterfesticerinkrentals-324b1b89777d.png
```

Direct Azure Blob URL shape:

```text
https://iceskatingmedia.blob.core.windows.net/ice-rink-rentals-media/{blobPath}
```

No SAS URL was generated or used.

## Command Type

Safe anonymous HTTP `HEAD` request only.

## Result

```text
HTTP/1.1 409 Public access is not permitted on this storage account.
```

Additional non-secret response fields observed:

```text
x-ms-request-id: present
date: Fri, 05 Jun 2026 13:41:38 GMT
```

## Diagnosis

Anonymous public access does not currently work for the direct Azure Blob origin.

This confirms the current Blob origin is private for anonymous public web delivery. It does not indicate that the blob is missing; authenticated data-plane list checks show 9 uploaded blobs present.

## Implication

The locked production media URLs cannot work until a future approved delivery gate chooses and implements one of these approaches:

- enable public read for approved versioned media blobs and route through Cloudflare or Azure edge delivery
- keep Blob private and use a secret-bearing server-side or edge proxy
- use an Azure delivery layer with appropriate origin access and URL mapping
- defer media delivery until policy is chosen

