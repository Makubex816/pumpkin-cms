using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Options;
using pumpkin_api.Services.Publications;
using pumpkin_net_models.Models;

namespace pumpkin_api.Tests;

public static class PublicationProductTestRunner
{
    private const string TenantUid = "synthetic-tenant";
    private const string PublicationId = "synthetic-publication";
    private const string BaselineReleaseId = "release-a02";
    private const string SuccessorReleaseId = "release-pub30";
    private const string BaselineArtifactId = "artifact-a02";
    private const string SuccessorArtifactId = "artifact-pub30";

    public static async Task RunAsync()
    {
        Console.WriteLine("PUB-30-A01 publication product source tests");
        TestAuthorization();
        await TestFailClosedGatesAsync();
        await TestCrossPublicationPairDenialAsync();
        await TestLifecycleAsync();
        await TestExplicitSupersessionAsync();
        await TestFormAuthorityLifecycleAsync();
        TestStrictContracts();
        TestProviderAndEndpointSourceContracts();
        Console.WriteLine("PASS PUB-30-A01 publication product source tests");
    }

    private static void TestAuthorization()
    {
        var ownTenantAdmin = Principal("TenantAdmin", TenantUid);
        var otherTenantAdmin = Principal("TenantAdmin", "other-tenant");
        var superAdmin = Principal("SuperAdmin", "platform");
        Assert(PublicationProductAuthorization.CanAccessTenant(ownTenantAdmin, TenantUid),
            "TenantAdmin can read and mutate its own tenant");
        Assert(!PublicationProductAuthorization.CanAccessTenant(otherTenantAdmin, TenantUid),
            "TenantAdmin cross-tenant access is denied");
        Assert(PublicationProductAuthorization.CanAccessTenant(superAdmin, TenantUid),
            "SuperAdmin can access all tenant publication products");
        Assert(PublicationProductAuthorization.IsSuperAdmin(superAdmin),
            "SuperAdmin role is recognized exactly");
        var conflictingRole = new ClaimsPrincipal(new ClaimsIdentity(new[]
        {
            new Claim(ClaimTypes.NameIdentifier, "subject-2"),
            new Claim(ClaimTypes.Role, "TenantAdmin"),
            new Claim("tenantRole", "SuperAdmin"),
            new Claim("tenantUid", TenantUid)
        }, "source-test"));
        Assert(!PublicationProductAuthorization.IsSuperAdmin(conflictingRole),
            "canonical role claim cannot be escalated by a conflicting tenantRole claim");
    }

    private static async Task TestFailClosedGatesAsync()
    {
        var disabledStore = new InMemoryProductStore(Publication());
        var disabled = Service(disabledStore, enabled: false, customerExecution: false);
        Assert((await disabled.ListInventoryAsync(null, null, null, null, null, null, default)).Status ==
            PublicationProductResultStatus.Disabled, "master feature gate fails closed");

        var customerStore = new InMemoryProductStore(Publication("customer-tenant", "customer-publication"));
        var held = Service(customerStore, enabled: true, customerExecution: false, allowSynthetic: false);
        var request = ReleaseRequest(expectedRevision: 1);
        Assert((await held.RegisterReleaseAsync(
            "customer-tenant", "customer-publication", request, "operator-1", "SUPER_ADMIN", default)).Status ==
            PublicationProductResultStatus.ExecutionHeld,
            "customer mutation is held when only synthetic execution is authorized");
        Assert(customerStore.Read("customer-publication").Revision == 1,
            "held customer mutation performs zero writes");
    }

    private static async Task TestCrossPublicationPairDenialAsync()
    {
        const string otherPublicationId = "other-publication";
        var store = new InMemoryProductStore(
            Publication(),
            Publication(TenantUid, otherPublicationId));
        var service = Service(store);
        Assert((await service.RegisterReleaseAsync(
            TenantUid, otherPublicationId, ReleaseRequest(1),
            "operator-1", "SUPER_ADMIN", default)).Status == PublicationProductResultStatus.Created,
            "other-publication release fixture is accepted");
        var artifactRequest = ArtifactRequest(2);
        artifactRequest.PredecessorPublicationId = otherPublicationId;
        Assert((await service.RegisterArtifactAsync(
            TenantUid, otherPublicationId, artifactRequest,
            "tenant-admin-1", "TENANT_ADMIN", default)).Status == PublicationProductResultStatus.Created,
            "other-publication artifact fixture is accepted");

        var crossPublicationJob = await service.CreateJobAsync(
            TenantUid, PublicationId,
            new CreatePublicationJobRequest
            {
                JobId = "job-cross-publication",
                ReleaseId = SuccessorReleaseId,
                ArtifactId = SuccessorArtifactId,
                Kind = "deploy",
                Steps = new() { "validate" },
                IdempotencyKey = "job-cross-publication-0001",
                ExpectedRevision = 1
            },
            "tenant-admin-1", "TENANT_ADMIN", default);
        Assert(crossPublicationJob.Status == PublicationProductResultStatus.Invalid &&
            store.Read(PublicationId).Revision == 1,
            "release/artifact pairs cannot be selected across publication boundaries");

        var center = await service.GetSuperAdminCenterAsync(default);
        var scopedRelease = center.Value!.Releases.Single(item =>
            item.ReleaseId == SuccessorReleaseId);
        Assert(scopedRelease.TenantUid == TenantUid &&
            scopedRelease.PublicationId == otherPublicationId &&
            center.Value.Artifacts.Single(item => item.ArtifactId == SuccessorArtifactId)
                .PublicationId == otherPublicationId,
            "SuperAdmin center release and artifact choices carry unambiguous tenant/publication scope");
    }

    private static async Task TestLifecycleAsync()
    {
        var store = new InMemoryProductStore(Publication());
        var service = Service(store);

        var releaseRequest = ReleaseRequest(expectedRevision: 1);
        var tenantReleaseAttempt = await service.RegisterReleaseAsync(
            TenantUid, PublicationId, releaseRequest, "tenant-admin-1", "TENANT_ADMIN", default);
        Assert(tenantReleaseAttempt.Status == PublicationProductResultStatus.Forbidden &&
            store.WriteCount == 0,
            "product release mutation requires SuperAdmin authority even for an own-tenant admin");
        var registered = await service.RegisterReleaseAsync(
            TenantUid, PublicationId, releaseRequest, "operator-1", "SUPER_ADMIN", default);
        Assert(registered.Status == PublicationProductResultStatus.Created &&
            registered.Value is { IdempotentReplay: false, Release.Immutable: true } &&
            registered.Value.Release.Status == PublicationProductStates.Accepted,
            "successor release is immutably accepted");
        Assert(store.Read(PublicationId).Revision == 2 &&
            store.Read(PublicationId).TicketVersion == 2,
            "release registration advances publication authority revision and ticket contract");

        var replay = await service.RegisterReleaseAsync(
            TenantUid, PublicationId, releaseRequest, "operator-1", "SUPER_ADMIN", default);
        Assert(replay.Status == PublicationProductResultStatus.Success &&
            replay.Value?.IdempotentReplay == true &&
            store.Read(PublicationId).Revision == 2,
            "exact release retry is a zero-write idempotent replay");
        var changedRequest = ReleaseRequest(expectedRevision: 1);
        changedRequest.ArtifactSha256 = new string('d', 64);
        Assert((await service.RegisterReleaseAsync(
            TenantUid, PublicationId, changedRequest, "operator-1", "SUPER_ADMIN", default)).Status ==
            PublicationProductResultStatus.Conflict,
            "same release/idempotency identity with changed immutable artifact conflicts");

        var artifactRequest = ArtifactRequest(expectedRevision: 2);
        var registeredArtifact = await service.RegisterArtifactAsync(
            TenantUid, PublicationId, artifactRequest, "tenant-admin-1", "TENANT_ADMIN", default);
        Assert(registeredArtifact.Status == PublicationProductResultStatus.Created &&
            registeredArtifact.Value is { IdempotentReplay: false, Artifact.Immutable: true } &&
            registeredArtifact.Value.Artifact.ReleaseId == SuccessorReleaseId &&
            registeredArtifact.Value.Artifact.RecordSha256.Length == 64,
            "tenant artifact is immutably bound to its accepted product release");
        var artifactReplay = await service.RegisterArtifactAsync(
            TenantUid, PublicationId, artifactRequest, "tenant-admin-1", "TENANT_ADMIN", default);
        Assert(artifactReplay.Status == PublicationProductResultStatus.Success &&
            artifactReplay.Value?.IdempotentReplay == true &&
            store.Read(PublicationId).Revision == 3,
            "exact artifact retry is a zero-write idempotent replay");
        var changedArtifact = ArtifactRequest(expectedRevision: 2);
        changedArtifact.RouteCount++;
        Assert((await service.RegisterArtifactAsync(
            TenantUid, PublicationId, changedArtifact, "tenant-admin-1", "TENANT_ADMIN", default)).Status ==
            PublicationProductResultStatus.Conflict,
            "changed immutable artifact inventory conflicts with the original idempotency identity");

        var inventory = await service.ListInventoryAsync(
            TenantUid, "active", "accepted", "STATIC_PUBLISHED_SITE", null, 10, default);
        Assert(inventory.Status == PublicationProductResultStatus.Success &&
            inventory.Value?.TotalCount == 1, "inventory list supports tenant/status/release/hosting filters");
        var releases = await service.ListReleasesAsync(
            TenantUid, PublicationId, "accepted", null, 1, default);
        Assert(releases.Value?.TotalCount == 2 && releases.Value.Items.Count == 1 &&
            !string.IsNullOrEmpty(releases.Value.ContinuationToken),
            "release list is stable and paginated");
        var artifacts = await service.ListArtifactsAsync(
            TenantUid, PublicationId, SuccessorReleaseId, "accepted", null, 10, default);
        Assert(artifacts.Value?.TotalCount == 1 &&
            artifacts.Value.Items.Single().ArtifactId == SuccessorArtifactId,
            "artifact list supports release/status filtering");

        var createJob = new CreatePublicationJobRequest
        {
            JobId = "job-pub30",
            ReleaseId = SuccessorReleaseId,
            ArtifactId = SuccessorArtifactId,
            RollbackReleaseId = BaselineReleaseId,
            RollbackArtifactId = BaselineArtifactId,
            Kind = "deploy",
            Steps = new() { "validate", "publish", "readback" },
            IdempotencyKey = "job-create-0001",
            ExpectedRevision = 3
        };
        var createdJob = await service.CreateJobAsync(
            TenantUid, PublicationId, createJob, "tenant-admin-1", "TENANT_ADMIN", default);
        Assert(createdJob.Status == PublicationProductResultStatus.Created &&
            createdJob.Value?.Job.DeterministicPlanSha256.Length == 64 &&
            createdJob.Value.Job.Status == PublicationProductStates.Pending,
            "deterministic resumable publication job is created");

        var resumed = await service.ResumeJobAsync(
            TenantUid, PublicationId, "job-pub30",
            new PublicationJobActionRequest
            {
                IdempotencyKey = "job-resume-0001",
                ExpectedRevision = 4,
                Reason = "begin-approved-synthetic-run"
            },
            "tenant-admin-1", "TENANT_ADMIN", default);
        Assert(resumed.Status == PublicationProductResultStatus.Success &&
            resumed.Value?.Job.Status == PublicationProductStates.Running &&
            resumed.Value.Job.CurrentStep == "validate",
            "job resumes from its durable first incomplete step");

        var promoted = await service.PromoteJobAsync(
            TenantUid, PublicationId, "job-pub30",
            new PromotePublicationJobRequest
            {
                IdempotencyKey = "job-promote-0001",
                ExpectedRevision = 5,
                Reason = "promote-accepted-synthetic-release"
            },
            "tenant-admin-1", "TENANT_ADMIN", default);
        Assert(promoted.Status == PublicationProductResultStatus.Success &&
            promoted.Value is { IdempotentReplay: false, PredecessorReleaseId: BaselineReleaseId } &&
            promoted.Value.Publication.ReleaseId == SuccessorReleaseId &&
            promoted.Value.Publication.ArtifactId == SuccessorArtifactId &&
            promoted.Value.Publication.ArtifactSha256 == new string('b', 64) &&
            promoted.Value.Publication.Status == "active" &&
            promoted.Value.Publication.ProductRollbackReleaseId == BaselineReleaseId &&
            promoted.Value.Publication.ProductRollbackArtifactId == BaselineArtifactId &&
            promoted.Value.Job.RollbackReleaseId == BaselineReleaseId &&
            promoted.Value.Job.RollbackArtifactId == BaselineArtifactId &&
            promoted.Value.Publication.CustomerExecutionEnabled &&
            promoted.Value.Publication.FormMode == PublicationProductModes.PublicFormsLive &&
            promoted.Value.Publication.FormMappings.All(item =>
                item.Active && item.SubmitMode == "public-ticket"),
            "promotion atomically binds the accepted artifact and preserves predecessor rollback identity");
        var firstPromotionReplayVersion = promoted.Value!.Publication.ReplayProtectionVersion;

        var promoteReplay = await service.PromoteJobAsync(
            TenantUid, PublicationId, "job-pub30",
            new PromotePublicationJobRequest
            {
                IdempotencyKey = "job-promote-0001",
                ExpectedRevision = 5,
                Reason = "promote-accepted-synthetic-release"
            },
            "tenant-admin-1", "TENANT_ADMIN", default);
        Assert(promoteReplay.Status == PublicationProductResultStatus.Success &&
            promoteReplay.Value?.IdempotentReplay == true &&
            store.Read(PublicationId).Revision == 6,
            "promotion retry is idempotent after the publication revision advances");

        var promotedEntry = PreparedEntry(promoted.Value.Publication);
        var rolledBack = await service.RollbackJobAsync(
            TenantUid, PublicationId, "job-pub30",
            new PublicationJobActionRequest
            {
                IdempotencyKey = "job-rollback-0001",
                ExpectedRevision = 6,
                Reason = "restore-a02-synthetic-baseline",
                RollbackReleaseId = BaselineReleaseId,
                RollbackArtifactId = BaselineArtifactId
            },
            "tenant-admin-1", "TENANT_ADMIN", default);
        Assert(rolledBack.Status == PublicationProductResultStatus.Success &&
            rolledBack.Value?.Publication.ReleaseId == BaselineReleaseId &&
            rolledBack.Value.Publication.ArtifactId == BaselineArtifactId &&
            rolledBack.Value.Publication.ArtifactSha256 == new string('a', 64) &&
            rolledBack.Value.Publication.Status == PublicationProductStates.Draft &&
            rolledBack.Value.Publication.FormMode == PublicationProductModes.PreviewNoPost &&
            !rolledBack.Value.Publication.CustomerExecutionEnabled &&
            rolledBack.Value.Publication.FormMappings.All(item =>
                !item.Active && item.SubmitMode == "disabled-no-post") &&
            rolledBack.Value.Publication.ReplayProtectionVersion > firstPromotionReplayVersion,
            "rollback restores the predecessor as a fail-closed no-post authority");

        var restored = await service.PromoteJobAsync(
            TenantUid, PublicationId, "job-pub30",
            new PromotePublicationJobRequest
            {
                IdempotencyKey = "job-promote-restore-0001",
                ExpectedRevision = 7,
                Reason = "restore-accepted-productized-release"
            },
            "tenant-admin-1", "TENANT_ADMIN", default);
        Assert(restored.Status == PublicationProductResultStatus.Success &&
            restored.Value?.Publication.ReleaseId == SuccessorReleaseId &&
            restored.Value.Publication.Status == "active" &&
            restored.Value.Publication.ReplayProtectionVersion >
                rolledBack.Value!.Publication.ReplayProtectionVersion,
            "accepted successor restores through the same promotion flow with a new replay generation");
        var restoredEntry = PreparedEntry(restored.Value!.Publication);
        Assert(promotedEntry.Id == restoredEntry.Id &&
            promotedEntry.PublicationReplayProtectionVersion != restoredEntry.PublicationReplayProtectionVersion &&
            promotedEntry.PublicPayloadDigest != restoredEntry.PublicPayloadDigest &&
            !pumpkin_api.Services.PublicForms.PublicFormPersistenceContract.IsReplayOf(promotedEntry, restoredEntry),
            "restore replay protection rejects a pre-rollback submission generation");

        var tenantCenter = await service.GetTenantCenterAsync(
            TenantUid, "TENANT_ADMIN_OWN_TENANT", default);
        Assert(tenantCenter.Value?.Tenant is
            {
                TenantName: "Synthetic Publication Tenant",
                DefaultHostname: "synthetic.example.test",
                DomainStage: "synthetic_ready"
            } &&
            tenantCenter.Value.Tenant.Inventories.Routes == 4 &&
            tenantCenter.Value.Tenant.CompatibilityHolds.Contains("customer_execution_held") &&
            tenantCenter.Value.Releases.Count == 2 &&
            tenantCenter.Value.Artifacts.Count == 2 &&
            tenantCenter.Value.Jobs.Count == 1,
            "tenant center returns non-secret readiness, inventory, release, job, and audit projections");
        var superCenter = await service.GetSuperAdminCenterAsync(default);
        Assert(superCenter.Value is
            {
                AuthorizationScope: "SUPER_ADMIN_ALL_TENANTS",
                CustomerExecutionEnabled: false
            } &&
            superCenter.Value.CredentialReferences?.Single().Provider == "WINDOWS_DPAPI_CURRENT_USER" &&
            superCenter.Value.CredentialReferences.Single().FingerprintSha256 == new string('c', 64),
            "SuperAdmin center returns allowlisted credential-reference metadata only");
        var serializedCenter = JsonSerializer.Serialize(superCenter.Value);
        Assert(!serializedCenter.Contains("deploymentToken", StringComparison.OrdinalIgnoreCase) &&
            !serializedCenter.Contains("connectionString", StringComparison.OrdinalIgnoreCase) &&
            !serializedCenter.Contains("credentialValue", StringComparison.OrdinalIgnoreCase),
            "center representation contains no credential values");

        var backup = await service.GetBackupAsync(TenantUid, PublicationId, default);
        Assert(backup.Status == PublicationProductResultStatus.Success &&
            backup.Value is { ValuesIncluded: false } &&
            backup.Value.SnapshotSha256.Length == 64 &&
            string.IsNullOrEmpty(backup.Value.Snapshot.ETag),
            "portable backup is deterministic metadata-only authority with no provider ETag");

        var temporarilyRevoked = await service.RevokePublicationAsync(
            TenantUid, PublicationId,
            new PublicationLifecycleActionRequest
            {
                IdempotencyKey = "publication-revoke-before-restore-0001",
                ExpectedRevision = 8,
                Reason = "exercise-safe-restore"
            },
            "tenant-admin-1", "TENANT_ADMIN", default);
        Assert(temporarilyRevoked.Status == PublicationProductResultStatus.Success,
            "pre-restore lifecycle change is durably recorded");

        var restoreRequest = new RestorePublicationProductRequest
        {
            Backup = backup.Value!,
            IdempotencyKey = "publication-restore-0001",
            ExpectedRevision = 9,
            Reason = "restore-validated-publication-backup"
        };
        var tenantRestoreAttempt = await service.RestoreBackupAsync(
            TenantUid, PublicationId, restoreRequest, "tenant-admin-1", "TENANT_ADMIN", default);
        Assert(tenantRestoreAttempt.Status == PublicationProductResultStatus.Forbidden &&
            store.Read(PublicationId).Revision == 9,
            "backup restore requires platform authority because the envelope is metadata-hashed, not server-signed");
        var restoredBackup = await service.RestoreBackupAsync(
            TenantUid, PublicationId, restoreRequest, "operator-1", "SUPER_ADMIN", default);
        Assert(restoredBackup.Status == PublicationProductResultStatus.Success &&
            restoredBackup.Value is { IdempotentReplay: false } &&
            restoredBackup.Value.Publication.Status == PublicationProductStates.Draft &&
            restoredBackup.Value.Publication.FormMode == PublicationProductModes.PreviewNoPost &&
            !restoredBackup.Value.Publication.CustomerExecutionEnabled &&
            restoredBackup.Value.Publication.FormMappings.All(item =>
                !item.Active && item.SubmitMode == "disabled-no-post") &&
            restoredBackup.Value.Publication.ReplayProtectionVersion >
                temporarilyRevoked.Value!.Publication.ReplayProtectionVersion,
            "backup restore preserves history and always returns in a new no-post replay generation");
        var postRestoreEntry = PreparedEntry(restoredBackup.Value!.Publication);
        Assert(restoredEntry.Id == postRestoreEntry.Id &&
            !pumpkin_api.Services.PublicForms.PublicFormPersistenceContract.IsReplayOf(
                restoredEntry, postRestoreEntry),
            "backup restore invalidates all tickets and replay identities from the backed-up generation");
        var restoreReplay = await service.RestoreBackupAsync(
            TenantUid, PublicationId, restoreRequest, "operator-1", "SUPER_ADMIN", default);
        Assert(restoreReplay.Status == PublicationProductResultStatus.Success &&
            restoreReplay.Value?.IdempotentReplay == true &&
            store.Read(PublicationId).Revision == 10,
            "backup restore retry is idempotent after the authority revision advances");

        var rePromoted = await service.PromoteJobAsync(
            TenantUid, PublicationId, "job-pub30",
            new PromotePublicationJobRequest
            {
                IdempotencyKey = "job-promote-post-backup-0001",
                ExpectedRevision = 10,
                Reason = "promote-after-safe-restore"
            },
            "tenant-admin-1", "TENANT_ADMIN", default);
        Assert(rePromoted.Status == PublicationProductResultStatus.Success &&
            rePromoted.Value?.Publication.Status == PublicationProductStates.Active &&
            rePromoted.Value.Publication.ReplayProtectionVersion >
                restoredBackup.Value.Publication.ReplayProtectionVersion,
            "restored authority can be deliberately re-promoted through the same immutable job");

        var revoked = await service.RevokePublicationAsync(
            TenantUid, PublicationId,
            new PublicationLifecycleActionRequest
            {
                IdempotencyKey = "publication-revoke-0001",
                ExpectedRevision = 11,
                Reason = "finish-synthetic-regression"
            },
            "tenant-admin-1", "TENANT_ADMIN", default);
        Assert(revoked.Status == PublicationProductResultStatus.Success &&
            revoked.Value?.Publication.Status == PublicationProductStates.Revoked &&
            revoked.Value.Publication.FormMode == PublicationProductModes.PreviewNoPost &&
            revoked.Value.Publication.FormMappings.All(item => !item.Active) &&
            !revoked.Value.Publication.CustomerExecutionEnabled,
            "revoke finishes in a disabled no-post state");
        Assert(store.WriteCount == 11,
            "only accepted lifecycle transitions wrote durable state");
    }

    private static async Task TestExplicitSupersessionAsync()
    {
        var store = new InMemoryProductStore(Publication());
        var service = Service(store);
        Assert((await service.RegisterReleaseAsync(
            TenantUid, PublicationId, ReleaseRequest(1),
            "operator-1", "SUPER_ADMIN", default)).Status == PublicationProductResultStatus.Created,
            "supersession fixture accepts the successor release");
        Assert((await service.RegisterArtifactAsync(
            TenantUid, PublicationId, ArtifactRequest(2),
            "tenant-admin-1", "TENANT_ADMIN", default)).Status == PublicationProductResultStatus.Created,
            "supersession fixture accepts the successor tenant artifact");

        var artifactRequest = new SupersedePublicationArtifactRequest
        {
            SuccessorArtifactId = SuccessorArtifactId,
            IdempotencyKey = "artifact-supersede-0001",
            ExpectedRevision = 3,
            Reason = "explicit-artifact-successor-selection"
        };
        var artifactResult = await service.SupersedeArtifactAsync(
            TenantUid, PublicationId, BaselineArtifactId, artifactRequest,
            "tenant-admin-1", "TENANT_ADMIN", default);
        Assert(artifactResult.Status == PublicationProductResultStatus.Success &&
            artifactResult.Value?.Artifact.Status == PublicationProductStates.Superseded &&
            artifactResult.Value.Artifact.SupersededByArtifactId == SuccessorArtifactId &&
            store.Read(PublicationId).ArtifactId == SuccessorArtifactId &&
            store.Read(PublicationId).FormMode == PublicationProductModes.PreviewNoPost,
            "explicit artifact supersession links immutable artifacts and fails execution closed");

        var request = new SupersedePublicationReleaseRequest
        {
            SuccessorReleaseId = SuccessorReleaseId,
            IdempotencyKey = "release-supersede-0001",
            ExpectedRevision = 4,
            Reason = "explicit-successor-selection"
        };
        var result = await service.SupersedeReleaseAsync(
            TenantUid, PublicationId, BaselineReleaseId, request,
            "operator-1", "SUPER_ADMIN", default);
        Assert(result.Status == PublicationProductResultStatus.Success &&
            result.Value?.Release.Status == PublicationProductStates.Superseded &&
            result.Value.Release.SupersededByReleaseId == SuccessorReleaseId &&
            result.Value.SuccessorRelease.SupersedesReleaseId == BaselineReleaseId &&
            store.Read(PublicationId).Status == PublicationProductStates.Draft,
            "explicit supersession links immutable releases and leaves execution fail-closed");
        var replay = await service.SupersedeReleaseAsync(
            TenantUid, PublicationId, BaselineReleaseId, request,
            "operator-1", "SUPER_ADMIN", default);
        var artifactReplay = await service.SupersedeArtifactAsync(
            TenantUid, PublicationId, BaselineArtifactId, artifactRequest,
            "tenant-admin-1", "TENANT_ADMIN", default);
        Assert(replay.Value?.IdempotentReplay == true &&
            artifactReplay.Value?.IdempotentReplay == true &&
            store.WriteCount == 4,
            "supersession retry is idempotent");
    }

    private static async Task TestFormAuthorityLifecycleAsync()
    {
        var store = new InMemoryProductStore(Publication());
        var service = Service(store);
        var request = new UpdatePublicationFormAuthorityRequest
        {
            AllowedOrigins = new() { "https://SYNTHETIC.EXAMPLE.TEST:443" },
            FormMappings = new()
            {
                new()
                {
                    FormMappingId = "contact-form",
                    FormDefinitionId = "contact-definition",
                    Active = true,
                    SubmitMode = "public-ticket",
                    FieldContractVersion = "v2",
                    FormKey = "contact",
                    SiteKey = "synthetic-site",
                    PageSlug = "contact"
                }
            },
            TicketKeyId = "synthetic-key-reference-v2",
            TicketIssuer = "pumpkin-public-forms",
            TicketAudience = "pumpkin-public-form-submit",
            SigningMetadataVersion = 2,
            TicketVersion = 2,
            RatePolicy = new()
            {
                PolicyVersion = "public-form-rate-v2",
                PreflightPermitLimit = 20,
                SubmitPermitLimit = 5,
                WindowSeconds = 60
            },
            AbuseState = "HELD",
            AbuseReasonSha256 = new string('d', 64),
            FrontendResourceBinding = new()
            {
                Provider = "AZURE_STATIC_WEB_APPS",
                ResourceKind = "STATIC_PUBLISHED_SITE",
                ResourceReference = "resource:synthetic-publication",
                DefaultHostname = "synthetic.example.test",
                State = "READY",
                CredentialReferenceId = "pub30-dpapi-envelope"
            },
            DomainReadiness = new()
            {
                Stage = "OWNER_HANDOFF_REQUIRED",
                Hostname = "synthetic.example.test",
                DnsState = "NOT_REQUESTED",
                TlsState = "SWA_DEFAULT",
                OwnerApprovalRequired = true,
                MutationAllowed = false
            },
            IdempotencyKey = "form-authority-update-0001",
            ExpectedRevision = 1,
            Reason = "rotate-metadata-and-hold-publication"
        };

        var tenantAttempt = await service.UpdateFormAuthorityAsync(
            TenantUid, PublicationId, request,
            "tenant-admin-1", "TENANT_ADMIN", default);
        Assert(tenantAttempt.Status == PublicationProductResultStatus.Forbidden &&
            store.WriteCount == 0,
            "signing/origin authority mutation requires SuperAdmin");

        var updated = await service.UpdateFormAuthorityAsync(
            TenantUid, PublicationId, request,
            "operator-1", "SUPER_ADMIN", default);
        Assert(updated.Status == PublicationProductResultStatus.Success &&
            updated.Value is { IdempotentReplay: false } &&
            updated.Value.Publication.Status == PublicationProductStates.Draft &&
            updated.Value.Publication.FormMode == PublicationProductModes.PreviewNoPost &&
            updated.Value.Publication.AllowedOrigins.SequenceEqual(
                new[] { "https://synthetic.example.test" }, StringComparer.Ordinal) &&
            updated.Value.Publication.TicketKeyId == "synthetic-key-reference-v2" &&
            updated.Value.Publication.SigningMetadataVersion == 2 &&
            updated.Value.Publication.TicketVersion == 2 &&
            updated.Value.Publication.PublicFormRatePolicy.SubmitPermitLimit == 5 &&
            updated.Value.Publication.PublicFormAbuseState.ReasonReference ==
                $"reason:{new string('d', 64)}" &&
            updated.Value.Publication.ProductMetadata.OriginBindings.Single().State == "READY" &&
            !updated.Value.Publication.ProductMetadata.DomainReadiness.MutationAllowed &&
            updated.Value.Publication.FormMappings.All(item =>
                !item.Active && item.EnabledForPublication && item.SubmitMode == "disabled-no-post"),
            "origin, signing metadata, mappings, rate, abuse, resource, and domain readiness update atomically and fail closed");

        var replay = await service.UpdateFormAuthorityAsync(
            TenantUid, PublicationId, request,
            "operator-1", "SUPER_ADMIN", default);
        Assert(replay.Status == PublicationProductResultStatus.Success &&
            replay.Value?.IdempotentReplay == true &&
            store.WriteCount == 1,
            "form authority update retry is idempotent");
    }

    private static void TestStrictContracts()
    {
        AssertThrows<JsonException>(() => JsonSerializer.Deserialize<RegisterPublicationReleaseRequest>(
            "{\"releaseId\":\"release-pub30\",\"artifactId\":\"artifact-pub30\",\"artifactSha256\":\"" +
            new string('b', 64) + "\",\"manifestSha256\":\"" + new string('e', 64) +
            "\",\"hostingClass\":\"STATIC_PUBLISHED_SITE\",\"idempotencyKey\":\"register-0001\",\"expectedRevision\":1,\"deploymentToken\":\"blocked\"}"));
        AssertThrows<JsonException>(() => JsonSerializer.Deserialize<PromotePublicationJobRequest>(
            "{\"idempotencyKey\":\"promote-0001\",\"expectedRevision\":1,\"reason\":\"safe\",\"credentialValue\":\"blocked\"}"));
        AssertThrows<JsonException>(() => JsonSerializer.Deserialize<UpdatePublicationFormAuthorityRequest>(
            "{\"allowedOrigins\":[],\"formMappings\":[],\"ticketKeyId\":\"reference-only\",\"ticketSigningKeyBase64\":\"blocked\"}"));
    }

    private static void TestProviderAndEndpointSourceContracts()
    {
        var root = FindRepositoryRoot();
        var cosmos = File.ReadAllText(Path.Combine(root, "apps", "pumpkin-api", "Services", "CosmosDataConnection.cs"));
        var mongo = File.ReadAllText(Path.Combine(root, "apps", "pumpkin-api", "Services", "MongoDataConnection.cs"));
        var endpoints = File.ReadAllText(Path.Combine(root, "apps", "pumpkin-api", "Services", "Publications", "PublicationProductEndpoints.cs"));
        var tickets = File.ReadAllText(Path.Combine(root, "apps", "pumpkin-api", "Services", "PublicForms", "PublicFormTicketService.cs"));
        Assert(cosmos.Contains("ListPublicPublicationsAsync", StringComparison.Ordinal) &&
            cosmos.Contains("GetContainer(\"PublicPublication\")", StringComparison.Ordinal) &&
            !cosmos.Contains("GetContainer(\"PublicationProduct\")", StringComparison.Ordinal),
            "Cosmos registry reuses PublicPublication without a new container");
        Assert(mongo.Contains("ListPublicPublicationsAsync", StringComparison.Ordinal) &&
            mongo.Contains("GetCollection<PublicPublication>(\"PublicPublication\")", StringComparison.Ordinal) &&
            !mongo.Contains("GetCollection<PublicationProduct", StringComparison.Ordinal),
            "Mongo registry reuses PublicPublication without a new collection");
        Assert(endpoints.Contains("/api/admin/publication-products", StringComparison.Ordinal) &&
            endpoints.Contains("/artifacts/{artifactId}/supersede", StringComparison.Ordinal) &&
            endpoints.Contains("/jobs/{jobId}/promote", StringComparison.Ordinal) &&
            endpoints.Contains("/jobs/{jobId}/rollback", StringComparison.Ordinal) &&
            endpoints.Contains("/publications/{publicationId}/form-authority", StringComparison.Ordinal) &&
            endpoints.Contains("/publications/{publicationId}/backup", StringComparison.Ordinal) &&
            endpoints.Contains("/publications/{publicationId}/restore", StringComparison.Ordinal) &&
            endpoints.Contains("/tenants/{tenantUid}/center", StringComparison.Ordinal) &&
            endpoints.Contains("RequireSuperAdmin(context)", StringComparison.Ordinal) &&
            endpoints.Contains("RequireAuthorization()", StringComparison.Ordinal),
            "authenticated publication-product routes include artifacts, backup/restore, promotion, rollback, and platform release authority");
        Assert(tickets.Contains("new Claim(\"aid\"", StringComparison.Ordinal) &&
            tickets.Contains("new Claim(\"art\"", StringComparison.Ordinal) &&
            tickets.Contains("new Claim(\"prv\"", StringComparison.Ordinal) &&
            tickets.Contains("new Claim(\"rpv\"", StringComparison.Ordinal),
            "public ticket is bound to artifact ID/hash, publication revision, and replay generation");
    }

    private static PublicationProductService Service(
        InMemoryProductStore store,
        bool enabled = true,
        bool customerExecution = false,
        bool allowSynthetic = true)
    {
        var options = new PublicationProductOptions
        {
            Enabled = enabled,
            CustomerExecutionEnabled = customerExecution,
            SyntheticTenantAllowlist = allowSynthetic ? new() { TenantUid } : new(),
            DefaultPageSize = 25,
            MaximumPageSize = 100,
            CredentialReferences = new()
            {
                new()
                {
                    ReferenceId = "pub30-dpapi-envelope",
                    Provider = "WINDOWS_DPAPI_CURRENT_USER",
                    Status = "READY",
                    FingerprintSha256 = new string('c', 64),
                    AclStatus = "operator_system_only",
                    Portability = "current_user_host_bound",
                    LastVerifiedAt = DateTimeOffset.UnixEpoch
                }
            }
        };
        return new PublicationProductService(
            store, Options.Create(options),
            new FixedTimeProvider(new DateTimeOffset(2026, 7, 23, 12, 0, 0, TimeSpan.Zero)));
    }

    private static RegisterPublicationReleaseRequest ReleaseRequest(long expectedRevision) => new()
    {
        ReleaseId = SuccessorReleaseId,
        Version = "3.4.0",
        ArtifactId = SuccessorArtifactId,
        ArtifactSha256 = new string('b', 64),
        ManifestSha256 = new string('e', 64),
        SourceCommit = new string('1', 40),
        SourceRef = "artifacts/product-release-3.4.0.json",
        LockfileSha256 = new string('7', 64),
        PackageLockSha256 = new string('f', 64),
        PackageVersions = new(StringComparer.Ordinal)
        {
            ["pumpkin-api"] = "3.4.0",
            ["pumpkin-publication-product"] = "1.0.0"
        },
        TestEvidence = new()
        {
            new()
            {
                SuiteId = "pub-30-a01",
                Status = "passed",
                EvidenceSha256 = new string('6', 64)
            }
        },
        LicensingStatus = "approved",
        NoticeStatus = "approved",
        StarterArtifactSha256 = new string('5', 64),
        StarterImageDigest = $"sha256:{new string('4', 64)}",
        HostingClass = "STATIC_PUBLISHED_SITE",
        SupersedesReleaseId = BaselineReleaseId,
        IdempotencyKey = "release-register-0001",
        ExpectedRevision = expectedRevision
    };

    private static RegisterTenantPublicationArtifactRequest ArtifactRequest(long expectedRevision) => new()
    {
        ArtifactId = SuccessorArtifactId,
        ReleaseId = SuccessorReleaseId,
        SourceSnapshotSha256 = new string('3', 64),
        ArtifactSha256 = new string('b', 64),
        ManifestSha256 = new string('e', 64),
        HostingClass = "STATIC_PUBLISHED_SITE",
        IndexingMode = PublicationProductModes.HeldNoIndex,
        FormMode = PublicationProductModes.PublicFormsLive,
        RouteCount = 4,
        RedirectCount = 2,
        MediaCount = 3,
        FormCount = 1,
        PredecessorArtifactId = BaselineArtifactId,
        PredecessorPublicationId = PublicationId,
        PredecessorArtifactSha256 = new string('a', 64),
        RollbackArtifactId = BaselineArtifactId,
        IdempotencyKey = "artifact-register-0001",
        ExpectedRevision = expectedRevision
    };

    private static PublicPublication Publication(
        string tenantUid = TenantUid,
        string publicationId = PublicationId)
    {
        var baseline = new PublicationProductRelease
        {
            ReleaseId = BaselineReleaseId,
            Version = "3.2.0",
            TenantUid = tenantUid,
            PublicationId = publicationId,
            ArtifactId = BaselineArtifactId,
            ArtifactSha256 = new string('a', 64),
            ManifestSha256 = new string('9', 64),
            SourceCommit = new string('0', 40),
            SourceRef = "artifacts/product-release-3.2.0.json",
            LockfileSha256 = new string('7', 64),
            PackageLockSha256 = new string('8', 64),
            PackageVersions = new(StringComparer.Ordinal) { ["pumpkin-api"] = "3.2.0" },
            TestEvidence = new()
            {
                new()
                {
                    SuiteId = "pub-20-a02",
                    Status = "passed",
                    EvidenceSha256 = new string('6', 64)
                }
            },
            LicensingStatus = "approved",
            NoticeStatus = "approved",
            StarterArtifactSha256 = new string('5', 64),
            StarterImageDigest = $"sha256:{new string('4', 64)}",
            Status = PublicationProductStates.Accepted,
            HostingClass = "STATIC_PUBLISHED_SITE",
            Immutable = true,
            ReplayProtectionVersion = 1,
            CreatedAtUtc = DateTimeOffset.UnixEpoch,
            AcceptedAtUtc = DateTimeOffset.UnixEpoch,
            UpdatedAtUtc = DateTimeOffset.UnixEpoch
        };
        var baselineArtifact = new TenantPublicationArtifact
        {
            ArtifactId = BaselineArtifactId,
            TenantUid = tenantUid,
            PublicationId = publicationId,
            ReleaseId = BaselineReleaseId,
            SourceSnapshotSha256 = new string('2', 64),
            ArtifactSha256 = new string('a', 64),
            ManifestSha256 = new string('9', 64),
            HostingClass = "STATIC_PUBLISHED_SITE",
            IndexingMode = PublicationProductModes.HeldNoIndex,
            FormMode = PublicationProductModes.PublicFormsLive,
            RouteCount = 4,
            RedirectCount = 2,
            MediaCount = 3,
            FormCount = 1,
            Status = PublicationProductStates.Accepted,
            Immutable = true,
            Revision = 1,
            CreatedAtUtc = DateTimeOffset.UnixEpoch,
            AcceptedAtUtc = DateTimeOffset.UnixEpoch,
            AcceptedByReference = "actor:baseline",
            UpdatedAtUtc = DateTimeOffset.UnixEpoch
        };
        baselineArtifact.RecordSha256 = ComputeArtifactRecordSha256(baselineArtifact);
        return new PublicPublication
        {
            Id = publicationId,
            PublicationId = publicationId,
            TenantId = tenantUid,
            TenantUid = tenantUid,
            ReleaseId = BaselineReleaseId,
            ArtifactId = BaselineArtifactId,
            ArtifactSha256 = baseline.ArtifactSha256,
            Status = "active",
            IndexingState = "disabled",
            IndexingMode = PublicationProductModes.HeldNoIndex,
            FormMode = PublicationProductModes.PublicFormsLive,
            AllowedOrigins = new() { "https://synthetic.example.test" },
            AllowedHostnames = new() { "synthetic.example.test" },
            FormMappings = new()
            {
                new()
                {
                    FormMappingId = "contact-form",
                    FormDefinitionId = "contact-definition",
                    Active = true,
                    SubmitMode = "public-ticket",
                    FieldContractVersion = "v1",
                    FormKey = "contact",
                    SiteKey = "synthetic-site",
                    PageSlug = "contact"
                }
            },
            TicketKeyId = "synthetic-key-reference",
            TicketIssuer = "pumpkin-public-forms",
            TicketAudience = "pumpkin-public-form-submit",
            SigningMetadataVersion = 1,
            SigningMetadataUpdatedAtUtc = DateTimeOffset.UnixEpoch,
            TicketVersion = 1,
            ReplayProtectionVersion = 1,
            ProductRegistryEnabled = true,
            CustomerExecutionEnabled = false,
            ProductReleases = new() { baseline },
            PublicationArtifacts = new() { baselineArtifact },
            Revision = 1,
            CreatedAtUtc = DateTimeOffset.UnixEpoch,
            UpdatedAtUtc = DateTimeOffset.UnixEpoch,
            ProductMetadata = new()
            {
                TenantDisplayName = "Synthetic Publication Tenant",
                DefaultHostname = "synthetic.example.test",
                DomainStage = "synthetic_ready",
                FormReadiness = "public_forms_live",
                RouteCount = 4,
                RedirectCount = 2,
                MediaCount = 3,
                FormCount = 1,
                CompatibilityHolds = new() { "customer_execution_held" },
                FrontendResourceBinding = new()
                {
                    Provider = "AZURE_STATIC_WEB_APPS",
                    ResourceKind = "STATIC_PUBLISHED_SITE",
                    ResourceReference = "resource:synthetic",
                    DefaultHostname = "synthetic.example.test",
                    State = "READY",
                    CredentialReferenceId = "pub30-dpapi-envelope",
                    UpdatedAtUtc = DateTimeOffset.UnixEpoch
                },
                OriginBindings = new()
                {
                    new()
                    {
                        Origin = "https://synthetic.example.test",
                        Hostname = "synthetic.example.test",
                        State = "READY",
                        Revision = 1
                    }
                },
                DomainReadiness = new()
                {
                    Stage = "SYNTHETIC_READY",
                    Hostname = "synthetic.example.test",
                    DnsState = "NOT_REQUESTED",
                    TlsState = "SWA_DEFAULT",
                    OwnerApprovalRequired = true,
                    MutationAllowed = false
                }
            }
        };
    }

    private static string ComputeArtifactRecordSha256(TenantPublicationArtifact artifact) =>
        Convert.ToHexStringLower(SHA256.HashData(Encoding.UTF8.GetBytes(string.Join('\n',
            artifact.SchemaVersion,
            artifact.ArtifactId,
            artifact.TenantUid,
            artifact.PublicationId,
            artifact.ReleaseId,
            artifact.SourceSnapshotSha256,
            artifact.ArtifactSha256,
            artifact.ManifestSha256,
            artifact.HostingClass,
            artifact.IndexingMode,
            artifact.FormMode,
            artifact.RouteCount,
            artifact.RedirectCount,
            artifact.MediaCount,
            artifact.FormCount,
            artifact.PredecessorArtifactId,
            artifact.PredecessorPublicationId,
            artifact.PredecessorArtifactSha256,
            artifact.RollbackArtifactId))));

    private static FormEntry PreparedEntry(PublicPublication publication)
    {
        var entry = new FormEntry
        {
            Id = "same",
            TenantId = publication.TenantId,
            TenantUid = publication.TenantUid,
            PublicationId = publication.PublicationId,
            ReleaseId = publication.ReleaseId,
            PublicationArtifactId = publication.ArtifactId,
            ReleaseArtifactSha256 = publication.ArtifactSha256,
            TicketVersion = publication.TicketVersion,
            PublicationRevision = publication.Revision,
            PublicationReplayProtectionVersion = publication.ReplayProtectionVersion,
            FormMappingId = "contact-form",
            FormId = "contact-definition",
            FieldContractVersion = "v1",
            SubmissionId = "00000000-0000-0000-0000-000000000001",
            IdempotencyKey = "00000000-0000-0000-0000-000000000001",
            PublicIdempotencyIdentity = new string('1', 64),
            FormData = new() { ["message"] = "same" }
        };
        entry.PublicPayloadDigest = pumpkin_api.Services.PublicForms.PublicFormCanonicalizer.ComputePayloadDigest(entry);
        return entry;
    }

    private static ClaimsPrincipal Principal(string role, string tenantUid) =>
        new(new ClaimsIdentity(new[]
        {
            new Claim(ClaimTypes.NameIdentifier, "subject-1"),
            new Claim("tenantRole", role),
            new Claim("tenantUid", tenantUid)
        }, "source-test"));

    private static string FindRepositoryRoot()
    {
        var current = new DirectoryInfo(AppContext.BaseDirectory);
        while (current != null)
        {
            if (Directory.Exists(Path.Combine(current.FullName, ".git")) ||
                File.Exists(Path.Combine(current.FullName, ".git")))
                return current.FullName;
            current = current.Parent;
        }
        throw new DirectoryNotFoundException("Repository root not found.");
    }

    private static void Assert(bool condition, string message)
    {
        if (!condition) throw new InvalidOperationException($"FAIL {message}");
        Console.WriteLine($"PASS {message}");
    }

    private static void AssertThrows<TException>(Action action) where TException : Exception
    {
        try
        {
            action();
            throw new InvalidOperationException($"FAIL expected {typeof(TException).Name}");
        }
        catch (TException)
        {
        }
    }

    private sealed class InMemoryProductStore : IPublicationProductStore
    {
        private readonly Dictionary<string, PublicPublication> _items;
        public int WriteCount { get; private set; }

        public InMemoryProductStore(params PublicPublication[] publications)
        {
            _items = publications.ToDictionary(item => item.PublicationId, Clone, StringComparer.Ordinal);
        }

        public Task<PublicPublication?> GetAsync(string publicationId, CancellationToken cancellationToken) =>
            Task.FromResult(_items.TryGetValue(publicationId, out var item) ? Clone(item) : null);

        public Task<IReadOnlyList<PublicPublication>> ListAsync(
            string? tenantUid,
            CancellationToken cancellationToken) =>
            Task.FromResult<IReadOnlyList<PublicPublication>>(_items.Values
                .Where(item => string.IsNullOrWhiteSpace(tenantUid) || item.TenantUid == tenantUid)
                .Select(Clone).ToList());

        public Task<PublicPublication> UpdateAsync(
            PublicPublication publication,
            long expectedRevision,
            CancellationToken cancellationToken)
        {
            if (!_items.TryGetValue(publication.PublicationId, out var current) ||
                current.Revision != expectedRevision ||
                publication.Revision != expectedRevision + 1)
                throw new InvalidOperationException("public_publication_revision_conflict");
            WriteCount++;
            _items[publication.PublicationId] = Clone(publication);
            return Task.FromResult(Clone(publication));
        }

        public PublicPublication Read(string publicationId) => Clone(_items[publicationId]);

        private static PublicPublication Clone(PublicPublication publication) =>
            JsonSerializer.Deserialize<PublicPublication>(JsonSerializer.Serialize(publication))!;
    }

    private sealed class FixedTimeProvider : TimeProvider
    {
        private readonly DateTimeOffset _value;
        public FixedTimeProvider(DateTimeOffset value) => _value = value;
        public override DateTimeOffset GetUtcNow() => _value;
    }
}
