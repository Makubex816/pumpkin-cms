# Media Assets JSON Expectations

`media-assets.json` lists media metadata, not raw image files.

Required per asset:

- `mediaId`
- `tenantId`
- `siteKey`
- `fileName`
- `kind`
- `altText`
- `sourceStatus`
- `publicUrl`

Production expectations:

- URLs must use the deployment profile media host.
- Local `/media/...` paths are forbidden in production-ready packages.
- Secret-bearing URLs and SAS URLs are forbidden.
- Usage rights status must be recorded.

