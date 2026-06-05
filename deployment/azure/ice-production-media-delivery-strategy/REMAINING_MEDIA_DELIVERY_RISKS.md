# Remaining Media Delivery Risks

## Public Access Policy Risk

Option A requires anonymous public Blob read. That may conflict with security policy even though the content is public marketing imagery.

Mitigation:

- approve public access only for the media storage account/container
- set container public access to `blob`, not `container`, to avoid anonymous listing
- use checksum-versioned immutable paths
- keep non-public assets out of this container

## Path Mapping Risk

The locked public URL pattern omits the Azure Blob container segment. A plain CNAME cannot satisfy the target path by itself.

Mitigation:

- include Cloudflare URL Rewrite, Origin Rules, Cloud Connector, Worker, Azure Front Door origin path, or equivalent path mapping in the future delivery approval
- validate all 9 exact target URLs before MediaAsset writes

## Host Header And TLS Risk

Azure Blob origins and custom domains have specific hostname and HTTPS behavior. Cloudflare may need Host header, SNI, DNS override, or Cloud Connector behavior to reach the correct origin while serving the public hostname.

Mitigation:

- use Cloudflare Cloud Connector or explicit Origin Rules if available
- verify Full/Strict TLS behavior after DNS/proxy changes
- avoid Flexible SSL

## Cache Risk

The blobs were uploaded with immutable cache-control. That is appropriate for checksum-versioned paths, but mistakes can be hard to reverse if the binary changes without a checksum path change.

Mitigation:

- never overwrite a checksum path with different bytes
- generate a new checksum path for changed binaries
- keep old checksum paths available through the rollback window

## Secret Risk

Private-origin approaches require secrets or signing. Static HTML must not contain SAS URLs or tokens.

Mitigation:

- use Option A for public marketing media if policy permits
- if private origin is required, store secrets only in an approved server-side or edge-secret mechanism
- never print or commit secret values

## Readiness Risk

Even after media delivery works, production is not live-ready until MediaAsset updates, static rebuild, validation, contact form readiness, staging, DNS cutover, and indexing controls are separately completed.

