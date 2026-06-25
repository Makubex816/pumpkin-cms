# Azure Media Readback Plan

This is a plan only. V2.8.19D performed no Azure upload and no Azure readback.

When a later phase is explicitly approved for upload/readback execution, the readback should verify each uploaded, approved row:

- Blob/object path matches the canonical blob name.
- Content type is `image/png`.
- Byte size matches the upload-staging file size.
- SHA-256 or provider-supported checksum matches when available.
- Public URL follows the planned base URL and canonical blob name.
- Metadata includes enough provenance to identify the V2.8.19 staged source, if metadata writing is separately approved.
- Contact replacement rows are absent unless owner approval changes.

Readback output should be a repo doc/JSON report only. It must not print secrets, connection strings, tokens, SAS values, account keys, or protected config.

Readback is not a deploy gate by itself. Isolated staging preview remains a separately approved phase after upload/readback succeeds.
