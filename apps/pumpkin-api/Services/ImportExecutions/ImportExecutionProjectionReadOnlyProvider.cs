namespace pumpkin_api.Services;

public interface IImportExecutionProjectionReadOnlyProvider
{
    Task<ImportExecutionProjectionReadOnlySnapshot> GetSnapshotAsync(CancellationToken cancellationToken = default);
    Task<ImportExecutionProjectionSnapshot?> GetExecutionAsync(string executionRunId, CancellationToken cancellationToken = default);
}

public sealed record ImportExecutionProjectionReadOnlySnapshot(
    string ContractSchemaVersion,
    string CorrelationId,
    IReadOnlyList<ImportExecutionProjectionSnapshot> Executions,
    ImportExecutionProjectionSecurityBoundaryDto SecurityBoundary,
    ImportExecutionProjectionSourceDto Source)
{
    public IReadOnlyList<ImportExecutionProjectionHealthMessageDto> Warnings
        => Executions.SelectMany(execution => execution.Projection.Warnings).ToList();
}

public sealed record ImportExecutionProjectionSnapshot(
    string FixturePath,
    ImportExecutionOperatorProjectionDto Projection)
{
    public ImportExecutionProjectionSummaryDto Summary => ImportExecutionProjectionSummaryDto.From(Projection);
}

public sealed class FixtureImportExecutionProjectionReadOnlyProvider : IImportExecutionProjectionReadOnlyProvider
{
    private const string PhaseResultPath = "deployment/architecture/multi-tenant-onboarding/v2-11-8-import-execution-evidence-freeze-operator-console-projection-result/result-manifest.json";
    private static readonly ImportExecutionOperatorProjectionDto Projection = CreateProjection();

    public Task<ImportExecutionProjectionReadOnlySnapshot> GetSnapshotAsync(CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();
        ValidateProjection(Projection);

        var snapshot = new ImportExecutionProjectionReadOnlySnapshot(
            ImportExecutionProjectionContractVersions.ReadOnlyApiEnvelope,
            CreateCorrelationId(),
            [new ImportExecutionProjectionSnapshot(PhaseResultPath, Projection)],
            ImportExecutionProjectionSecurityBoundaryDto.LocalClosed(),
            ImportExecutionProjectionSourceDto.LocalFrozenEvidence());

        return Task.FromResult(snapshot);
    }

    public Task<ImportExecutionProjectionSnapshot?> GetExecutionAsync(string executionRunId, CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();
        var execution = string.Equals(Projection.ExecutionRunId, executionRunId.Trim(), StringComparison.OrdinalIgnoreCase)
            ? new ImportExecutionProjectionSnapshot(PhaseResultPath, Projection)
            : null;

        return Task.FromResult(execution);
    }

    private static ImportExecutionOperatorProjectionDto CreateProjection()
    {
        const string executionRunId = "execution-ice-rink-rentals-carryforward-v2-11-2-v2-11-7a-local";
        const string approvalManifestId = "approval-ice-rink-rentals-carryforward-v2-11-2-v2-11-7a-execution";
        const string packageId = "ice-rink-rentals-carryforward-v2-11-2";
        const string packageHash = "sha256:b0fdd67d5d31e798bf1a9ae3e5f576c17129030cd816e3a8b726b0767002d073";
        const string rollbackPlanId = "rollback:v2-8-17d-production-rollback-plan";
        const string readbackPlanId = "readback-ice-rink-rentals-carryforward-v2-11-2-v2-11-7a-local";
        const string auditTraceId = "audit-trace-ice-rink-rentals-carryforward-v2-11-2-v2-11-7a-local";
        const string targetMode = "local_scoped_import_execution";

        var entityMappings = new ImportExecutionEntityMappingsDto(
            10,
            "local-target-tenant:ice-rink-rentals:ice-rink-rentals",
            [
                "local-route:ice-rink-rentals:ice-rink-rentals:/",
                "local-route:ice-rink-rentals:ice-rink-rentals:/service-areas",
                "local-route:ice-rink-rentals:ice-rink-rentals:/contact"
            ],
            [
                "local-content:ice-rink-rentals:ice-rink-rentals:v2-8-17d-sanitized-static-artifact",
                "local-content:ice-rink-rentals:ice-rink-rentals:content:ice-home",
                "local-content:ice-rink-rentals:ice-rink-rentals:content:ice-service-areas",
                "local-content:ice-rink-rentals:ice-rink-rentals:content:ice-contact"
            ],
            [
                "local-media-ref:ice-rink-rentals:ice-rink-rentals:media:cloudflare-worker-media-delivery-reference"
            ],
            [
                "local-form-config:ice-rink-rentals:ice-rink-rentals:form:ice-contact-reference"
            ],
            [
                "local-target-tenant:ice-rink-rentals:ice-rink-rentals",
                "local-route:ice-rink-rentals:ice-rink-rentals:/",
                "local-route:ice-rink-rentals:ice-rink-rentals:/service-areas",
                "local-route:ice-rink-rentals:ice-rink-rentals:/contact",
                "local-content:ice-rink-rentals:ice-rink-rentals:v2-8-17d-sanitized-static-artifact",
                "local-content:ice-rink-rentals:ice-rink-rentals:content:ice-home",
                "local-content:ice-rink-rentals:ice-rink-rentals:content:ice-service-areas",
                "local-content:ice-rink-rentals:ice-rink-rentals:content:ice-contact",
                "local-media-ref:ice-rink-rentals:ice-rink-rentals:media:cloudflare-worker-media-delivery-reference",
                "local-form-config:ice-rink-rentals:ice-rink-rentals:form:ice-contact-reference"
            ],
            new ImportExecutionMappingCountsDto(10, 1, 3, 4, 1, 1));

        var readback = new ImportExecutionReadbackDto(
            executionRunId,
            readbackPlanId,
            "passed",
            true,
            true,
            new ImportExecutionReadbackCountsDto(
                new ImportExecutionReadbackCountComparisonDto(3, 3, true),
                new ImportExecutionReadbackCountComparisonDto(4, 4, true),
                new ImportExecutionReadbackCountComparisonDto(1, 1, true),
                new ImportExecutionReadbackCountComparisonDto(1, 1, true)),
            true,
            true,
            true,
            true);

        var audit = new ImportExecutionAuditDto(
            executionRunId,
            auditTraceId,
            approvalManifestId,
            rollbackPlanId,
            readbackPlanId,
            "no-go-ice-rink-rentals-carryforward-v2-11-2-v2-11-7a-local",
            [
                "deployment/architecture/multi-tenant-onboarding/v2-11-7a-scoped-ice-import-execution-manifest-target-command-readback-closure-result/result-manifest.json",
                "deployment/architecture/multi-tenant-onboarding/v2-11-8-import-execution-evidence-freeze-operator-console-projection-result/result-manifest.json",
                "deployment/architecture/multi-tenant-onboarding/v2-11-8-import-execution-evidence-freeze-operator-console-projection-result/import-execution-evidence-chain-index.md"
            ]);

        var rollback = new ImportExecutionRollbackDto(
            executionRunId,
            rollbackPlanId,
            false,
            false,
            "Future-gated read-only projection. Rollback and abort controls are not approved in V2.11.9.",
            true);

        var panels = CreatePanelDtos([
            "Import Execution Summary",
            "Approval Manifest",
            "Source Package Identity",
            "Package Hash",
            "Target Binding",
            "Execution Run",
            "Entity Mappings",
            "Readback Verification",
            "Rollback / Abort",
            "Audit Trace",
            "No-Go Conditions",
            "Security Boundary",
            "Roller Exclusion",
            "Google Indexing Deferred",
            "Next Gates"
        ]);

        var futureRoutes = new ImportExecutionApiRouteDto[]
        {
            new("GET", "/api/admin/import-executions", "List read-only execution projections."),
            new("GET", "/api/admin/import-executions/{executionRunId}", "Read one execution projection."),
            new("GET", "/api/admin/import-executions/{executionRunId}/readback", "Read readback verification."),
            new("GET", "/api/admin/import-executions/{executionRunId}/entity-mappings", "Read entity mappings."),
            new("GET", "/api/admin/import-executions/{executionRunId}/audit", "Read trace and audit IDs."),
            new("GET", "/api/admin/import-executions/{executionRunId}/rollback", "Read rollback and abort references."),
            new("GET", "/api/admin/import-executions/{executionRunId}/operator-projection", "Read the complete operator projection.")
        };

        var nextGates = new ImportExecutionProjectionNextGateDto[]
        {
            new("v2-11-10-runtime-signoff-closeout", "future_boundary_required", "V2.11.10 projection runtime signoff and V2.11 closeout."),
            new("post-v2-11-live-import-execution", "future_boundary_required", "Any live import execution remains separately gated."),
            new("google-indexing-hard-stop", "deferred", "Google/Search Console/indexing remains deferred by hard stop.")
        };

        return new ImportExecutionOperatorProjectionDto(
            ImportExecutionProjectionContractVersions.SharedModel,
            "operator-projection-execution-ice-rink-rentals-carryforward-v2-11-2-v2-11-7a-local-v2-11-8",
            "local_readonly_evidence_freeze",
            ImportExecutionProjectionApiProviderModes.LocalFixtureReadOnly,
            true,
            "ice-rink-rentals",
            "ice-rink-rentals",
            packageId,
            packageHash,
            approvalManifestId,
            new ImportExecutionApprovalManifestDto(
                approvalManifestId,
                "scoped_ice_import_execution_local_tmp_target",
                "v2-11-7a-user-approved-scoped-ice-import-execute-if-gates-pass",
                "PumpkinCMS operator",
                true,
                true),
            new ImportExecutionPackageIdentityDto(
                packageId,
                "ice-rink-rentals",
                "ice-rink-rentals",
                packageHash,
                true),
            executionRunId,
            targetMode,
            "complete_local_scoped_execution_readback_passed",
            targetMode,
            new ImportExecutionTargetBindingDto(
                targetMode,
                "local_ignored_tmp_json",
                "ignored_tmp_json_files",
                "target-ice-rink-rentals-carryforward-v2-11-2-v2-11-7a-local",
                "pumpkin-v2-11-7a-execute-scoped-import",
                "pumpkin-v2-11-7a-readback-scoped-import",
                ".tmp/v2-11-7a/scoped-ice-import-target",
                false,
                false,
                false),
            entityMappings,
            readback,
            rollbackPlanId,
            readbackPlanId,
            auditTraceId,
            audit,
            rollback,
            Array.Empty<ImportExecutionProjectionNoGoConditionDto>(),
            ImportExecutionProjectionSecurityBoundaryDto.LocalClosed(),
            new ImportExecutionRollerExclusionDto(
                "blocked_no_import_no_resume",
                "roller-rink-rentals-paused-preview-v2-11-2",
                "roller-rink-rentals",
                "sha256:e5567ddc0f9b3c4e655f958d9f25cd3bef8ec72ce2f553fa37d36bab38a05b29",
                "blocked_no_import_no_resume",
                ["tenant_paused_no_import"],
                false,
                false,
                false),
            new ImportExecutionIndexingStateDto(
                "deferred_hard_stop",
                false,
                false,
                false,
                false,
                false,
                false),
            panels,
            futureRoutes,
            new ImportExecutionAdminProjectionDto(
                "admin_operator_console_readonly",
                true,
                false,
                "executionRunId",
                [
                    "Import Execution Summary",
                    "Approval Manifest",
                    "Package Identity and Hash",
                    "Target Mode",
                    "Entity Mapping Summary",
                    "Readback Verification",
                    "Trace/Audit/Rollback",
                    "Ice Imported Local State",
                    "Roller Paused/No Import",
                    "Hard Stops and Deferred Gates",
                    "Post-Import Hardening Checklist",
                    "Future OLM Staging Write Retry Goal",
                    "Next Gates"
                ]),
            new ImportExecutionElectronProjectionDto(
                "future_electron_operator_console",
                false,
                "local_fixture_or_get_only_api_projection"),
            [
                new ImportExecutionProjectionNextGateDto("post-import-hardening-live-run", "future_boundary_required", "Run post-import hardening only after a separate live-import approval."),
                new ImportExecutionProjectionNextGateDto("production-promotion-review", "future_boundary_required", "Promotion remains gated by production readiness review."),
                new ImportExecutionProjectionNextGateDto("backup-center-finalization", "future_boundary_required", "Backup evidence remains read-only in this projection.")
            ],
            new ImportExecutionProjectionNextGateDto(
                "future-olm-staging-write-retry",
                "future_boundary_required",
                "Retry OLM staging writes only under a later explicit write-approved gate."),
            [
                new ImportExecutionProjectionHealthMessageDto(
                    "INDEXING_DEFERRED_HARD_STOP",
                    "deferred",
                    "warning",
                    "Google/Search Console/indexing remains deferred and no crawl or indexing action is available."),
                new ImportExecutionProjectionHealthMessageDto(
                    "OLM_STAGING_WRITE_DEFERRED",
                    "future_boundary_required",
                    "info",
                    "Outbound Link Manager staging write retry is carried forward as a future goal.")
            ],
            Array.Empty<ImportExecutionProjectionHealthMessageDto>(),
            nextGates,
            [
                new ImportExecutionProjectionFutureActionDto("execute-import", "Execute import", true, "Disabled. V2.11.9 is read-only and cannot perform another import execution."),
                new ImportExecutionProjectionFutureActionDto("resume-roller", "Resume Roller", true, "Disabled. Roller import/resume remains unapproved."),
                new ImportExecutionProjectionFutureActionDto("publish-live", "Publish live", true, "Disabled. CMS/provider/deployment writes are outside this phase."),
                new ImportExecutionProjectionFutureActionDto("run-olm-retry", "Run OLM retry", true, "Disabled. OLM staging write retry is a future gated goal."),
                new ImportExecutionProjectionFutureActionDto("submit-indexing", "Submit indexing", true, "Disabled. Google indexing remains deferred by hard stop.")
            ],
            new ImportExecutionSourceEvidenceDto(
                "deployment/architecture/multi-tenant-onboarding/v2-11-7a-scoped-ice-import-execution-manifest-target-command-readback-closure-result/approval-manifest-finalization-result.md",
                "deployment/architecture/multi-tenant-onboarding/v2-11-7a-scoped-ice-import-execution-manifest-target-command-readback-closure-result/write-execution-result.md",
                "deployment/architecture/multi-tenant-onboarding/v2-11-7a-scoped-ice-import-execution-manifest-target-command-readback-closure-result/readback-verification-result.md",
                "deployment/architecture/multi-tenant-onboarding/v2-11-7a-scoped-ice-import-execution-manifest-target-command-readback-closure-result/roller-exclusion-check.md"),
            "2026-06-14T04:30:00-04:00");
    }

    private static IReadOnlyList<ImportExecutionOperatorPanelDto> CreatePanelDtos(IReadOnlyList<string> names)
        => names.Select(name => new ImportExecutionOperatorPanelDto(ToPanelId(name), name, "read_only")).ToList();

    private static string ToPanelId(string name)
        => name.ToLowerInvariant()
            .Replace(" / ", "-")
            .Replace(" ", "-")
            .Replace("/", "-");

    private static void ValidateProjection(ImportExecutionOperatorProjectionDto projection)
    {
        if (projection.SchemaVersion != ImportExecutionProjectionContractVersions.SharedModel
            || projection.ProjectionMode != "local_readonly_evidence_freeze"
            || projection.ProviderMode != ImportExecutionProjectionApiProviderModes.LocalFixtureReadOnly
            || !projection.ReadOnly
            || projection.EntityMappings.Total != 10
            || projection.ReadbackResults.Status != "passed"
            || !projection.ReadbackResults.Ok
            || projection.IndexingState.State != "deferred_hard_stop"
            || projection.RollerExclusion.ImportApproved
            || projection.RollerExclusion.ResumeApproved
            || projection.FutureApiRoutes.Any(route => route.Method != "GET")
            || projection.FutureActions.Any(action => !action.Disabled)
            || projection.SecurityBoundary.OpenFlags.Count != 0
            || projection.SecurityBoundary.ProhibitedActionFlags.Any(flag => flag.Value))
        {
            throw new InvalidOperationException("Import execution projection fixture contract is invalid.");
        }
    }

    private static string CreateCorrelationId() => $"corr_import_execution_api_{Guid.NewGuid():N}"[..32];
}
