# Pumpkin Tenant Website Publish Readiness V2.8.42 MediaAsset Lifecycle Proof Report

Status: blocked after source repair and local validation.

Lane: V2.8 Tenant Website / Pumpkin Live Platform Readiness.

Classification: `pumpkin_api_deploy_failed_mediaasset_record_proof_blocked`.

V2.8.42 repaired the source-level MediaAsset cleanup gap locally, but the approved Pumpkin API deployment did not complete. Per hard stop, no live MediaAsset record create/update/archive/restore/delete proof was attempted.

## Result

- V2.8.41 carryforward was accepted: Azure data-plane proof passed, Admin login and MediaAsset list read passed, and V2.8.41 remained conditional because public HTTP proof and MediaAsset hard cleanup were missing.
- Source inspection confirmed no existing hard MediaAsset cleanup endpoint.
- A minimal tenant-scoped Admin MediaAsset metadata delete route was added.
- Service interfaces and Cosmos/Mongo data connections now expose tenant-scoped `DeleteMediaAssetAsync`.
- Local V2.8.42 source-scope test passed.
- Pumpkin API build passed with zero warnings and zero errors.
- Publish artifact was produced with `pumpkin-api.dll` present and no appsettings/local settings entries.
- The observed OneDeploy record failed with Kudu rsync invalid-argument errors caused by Windows-style path entries in the ZIP deployment package.
- Health endpoints remained HTTP 200 after the failed deployment, but the Web App modification timestamp did not move and the new cleanup route was not proven live.
- A single local synthetic PNG was created for the blob proof. The upload command was invoked once, but no uploaded proof blob was observed afterward; the proof prefix remained empty. No retry was sent.
- Admin UI media readiness passed in isolated and production browser sessions as read-only: `/dashboard/media` loaded, used the live Pumpkin API, made zero localhost API requests, and made zero MediaAsset write requests.
- No Theme/Form work, contact POST, static contact deploy, page/content/publish/import writes, appsetting mutation, DNS/indexing mutation, storage key-listing, delegated signed URL, direct Cosmos mutation, Key Vault access, or protected config read occurred.

## Blocker

The live MediaAsset record lifecycle proof is blocked until the Pumpkin API deployment can complete with POSIX-style ZIP entries or another approved deployment packaging repair. No live proof record was created, so there is no residual MediaAsset record from V2.8.42.

## Files

Result package: `deployment/architecture/tenant-website-publish-readiness/v2-8-42-mediaasset-lifecycle-proof-result/`.

Next approval is folded into `next-phase-prompt.md`.
