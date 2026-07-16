# Active downstream and Atlas inventory

## Active downstream repository

- Classification: verified
- Path: `C:\Users\User\Desktop\PumpkinCMS\pumpkin-cms`
- Branch: `feature/admin-page-editor-import-export`
- HEAD at CUR-20 closeout write: `7c252060d18df4001586e61f1ed8db0d152f1d01`
- HEAD tree: `17f5320ac941bd26f63d5a4fc6f709165c110dd3`
- HEAD parent: `87ba5cd0ec305d30b9345ea95475c1b7fcde1c62`
- Staging before CUR-20 documentation write: empty
- Worktree: dirty with substantial pre-existing unrelated modifications and untracked files; preserved.

The public downstream fork is not treated as proof of the active product. It remains historical lineage unless separately promoted by fresh authority.

## Live downstream state

- App Service plan: `asp-pumpkin-api-prod-centralus-001`
- SKU/workers: S2 / 2
- API app: `app-pumpkin-api-prod-centralus-001`, Running
- API active deployment: `c9451f4b-0b2e-44bc-9d08-ac9b767a6c05`
- Rollback slot: `app-pumpkin-api-prod-centralus-001/crr-validation`, Running
- Rollback slot active deployment: `f6bdf0d7-ca60-4e7f-818c-f4c74a710a86`
- Admin app: `app-pumpkin-admin-prod-centralus-001`, Running
- Admin active deployment: `8c960132-3521-45c7-9a16-d5265ddbb640`
- Starter preview app: `app-pumpkin-starter-preview-centralus-001`, Running
- Starter active deployment: `ecd75861-5600-4394-a20b-76202bead5c3`

Read-only runtime checks:

- API `/health`: HTTP 200
- API `/api/health`: HTTP 200
- API `/health/ready`: HTTP 200
- Admin `/`: HTTP 200
- Starter preview `/`: HTTP 200

## Feature flag readback

Production API app settings were read with secret-bearing settings filtered out. Verified state:

- `IdentityFoundation__Enabled=true`
- `IdentityFoundation__DualReadEnabled=true`
- `IdentityFoundation__DualWriteEnabled=true`
- `IdentityFoundation__ManagementEnabled=true`
- `IdentityFoundation__TenantSwitcherEnabled=true`
- `IdentityFoundation__PasswordAndSessionManagementEnabled=true`
- `IdentityFoundation__MembershipManagementEnabled=true`
- `IdentityFoundation__ContactManagementEnabled=true`
- `IdentityFoundation__SuperAdminManagementEnabled=true`
- `IdentityFoundation__ProviderAwareEmailRequestsEnabled=true`
- `IdentityFoundation__RenameExecutionEnabled=false`
- `IdentityFoundation__MigrationExecutionEnabled=false`
- `IdentityFoundation__ExternalNotificationProviderEnabled=false`
- `IdentityFoundation__CapacityDiagnosticsEnabled=false`
- `WEBSITE_WARMUP_PATH=/health/ready`
- `WEBSITE_WARMUP_STATUSES=200`
- `WEBSITE_SWAP_WARMUP_PING_PATH=/health/ready`
- `WEBSITE_SWAP_WARMUP_PING_STATUSES=200`

Rollback slot readback remains foundation/dual-read enabled, dual-write false, rename/migration/external-provider false, and warmup paths on `/health`.

## Active Atlas discovery result

Classification: blocked.

Searches were run across:

- repository files and deployment architecture lanes;
- the project root beside the repository;
- program-management intake/output directories;
- secure-operator handoff references without copying or staging raw artifacts;
- Downloads for supplied package files;
- extracted input packages outside the repository;
- Build Atlas terms, `.project-ops`, package manifests, current-state/current-phase files, CHAT-PACK, milestone ledgers, attempt ledgers, and related references.

Candidate results:

| Candidate | Path | Classification | Result |
| --- | --- | --- | --- |
| Supplied Atlas v3 bridge | `Pumpkin_Downstream_Build_Atlas_Upstream_CAPTCHA_VisualEditor_Payments_v3.0.zip` | supplied proposed bridge | Valid input, not active Atlas. Its operating contract says it remains proposed until the active-build Atlas is ingested. |
| Supplied working-memory v0.9.0 | `PumpkinCMS_Chat_Working_Memory_Persistence_Package_v0.9.0-precloseout_2026-07-15.zip` | precloseout input | Valid input, but it records `V2.8.63CRST` as still running and is not an active Atlas. |
| Empty OPS-010 folders | `program-management-intake/OPS-010`, `program-management-output/OPS-010` | non-authoritative empty folders | Ignored because CUR-20 rejects a competing OPS-010 workflow and the folders contain no evidence. |
| Repo resource-atlas documents | `deployment/architecture/pumpkin-platform/PUMPKIN_PLATFORM_RESOURCE_ATLAS_V2_8_61K.md` and related V2.8.61L/M docs | resource atlas, not Build Atlas | Useful historical resource evidence, but no `.project-ops`, active Build Atlas manifest, update tooling, milestone ledger, or package lifecycle authority. |

No active Build Atlas was located. Per CUR-20 hard-stop rules, no active Atlas backup, migration, overwrite, version advancement, or package release was attempted.

