# Import Readiness Impact

## Readiness

| Area | Status | Reason |
| --- | --- | --- |
| Homepage media-ready | yes | Approved/live homepage readback has official media IDs persisted, including the current PPEC logo. |
| Contact media-ready | yes | Validated contact candidate has official IDs; current local route/readback evidence is sufficient for planning. Reconfirm ID persistence before any contact production promotion. |
| Service-areas media-ready | yes | Normalized candidate uses official IDs, local media URLs, alt text, and no raw/external/base64 images. |
| Service-areas ready for local draft import | yes | Media plan introduces no new blocker and does not require a candidate patch. Existing preflight artifacts report no blockers. |
| Static/production media-ready | no | Azure Blob/Cloudflare production media path is not established/verified yet. |

## Import Impact

- Do not import `/service-areas` during this run.
- A future local draft import may use `content-review/ice-service-areas-validated/SERVICE_AREAS_NORMALIZED_CANDIDATE.json` as-is from a media binding standpoint.
- No homepage/contact candidate changes are required for the service-area media plan.
- No CMS, Theme, MediaAsset, static generation, deployment, DNS, email/provider, protected config, or Roller action is required.

## Next Recommended Action

Proceed to a controlled `/service-areas` local draft import only after the user approves the existing normalized candidate and this media reuse plan. Keep production/static media publishing blocked until the cloud media path is verified.
