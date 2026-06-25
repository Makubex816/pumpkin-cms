# Upload Execution Gate Checklist

Upload execution is currently blocked.

Required gates before any future upload execution:

- Operator explicitly approves Azure media upload execution.
- `ownerAllowsAzureMediaUploadExecutionNextPhase` is true or superseded by an explicit phase approval.
- Target storage/provider is confirmed.
- Target container is confirmed.
- Public base URL/CDN base is confirmed.
- Auth/session mode is confirmed without printing or storing secrets.
- Readback method is confirmed.
- Cache-control policy is confirmed.
- Overwrite policy is confirmed.
- Upload plan includes only rows with `readyForUpload: true`.
- Contact replacement rows remain excluded unless `contactReplacementAssetsApproved` becomes true.
- No deploy is bundled with upload execution.
- No DNS/custom-domain mutation is bundled with upload execution.
- No Search Console/indexing action is bundled with upload execution.
- No contact-form POST is bundled with upload execution.
- No upload-staging media files are staged in git.

Current gate result: blocked by upload execution approval and unresolved target execution values.
