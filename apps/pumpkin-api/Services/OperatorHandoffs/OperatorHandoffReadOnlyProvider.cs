namespace pumpkin_api.Services;

public interface IOperatorHandoffReadOnlyProvider
{
    Task<OperatorHandoffReadOnlySnapshot> GetSnapshotAsync(CancellationToken cancellationToken = default);
    Task<OperatorHandoffSnapshot?> GetHandoffAsync(string handoffPacketId, CancellationToken cancellationToken = default);
}

public sealed record OperatorHandoffReadOnlySnapshot(
    string ContractSchemaVersion,
    string CorrelationId,
    IReadOnlyList<OperatorHandoffSnapshot> Handoffs,
    OperatorHandoffSecurityBoundaryDto SecurityBoundary,
    OperatorHandoffSourceDto Source)
{
    public IReadOnlyList<OperatorHandoffMessageDto> Warnings
        => Handoffs.SelectMany(handoff => handoff.Handoff.Warnings).ToList();
}

public sealed record OperatorHandoffSnapshot(
    string FixturePath,
    OperatorHandoffConsumerDto Handoff)
{
    public OperatorHandoffSummaryDto Summary => OperatorHandoffSummaryDto.From(Handoff);
    public OperatorHandoffEvidenceDto Evidence => new(
        Handoff.HandoffPacketId,
        true,
        Handoff.ReadbackSummary,
        Handoff.EntityMappingSummary,
        Handoff.OperatorProjectionRef,
        Handoff.BackupCenterRefs,
        Handoff.ResourceRegistryRefs,
        Handoff.ProviderProfileRefs,
        Handoff.RuntimeQaRefs,
        Handoff.AuditJobRefs,
        Handoff.OlmCarryforwardRefs);
    public OperatorHandoffConsumerProjectionDto ConsumerProjection => new(
        Handoff,
        Handoff.AdminPanels,
        Handoff.FutureApiRoutes,
        Handoff.FutureActions);
    public OperatorHandoffQaChecklistDto QaChecklist => new(
        Handoff.HandoffPacketId,
        true,
        CreateQaChecks(Handoff),
        Handoff.FutureActions);

    private static IReadOnlyList<OperatorHandoffQaCheckDto> CreateQaChecks(OperatorHandoffConsumerDto handoff)
        =>
        [
            new("packet-parity", "V2.12.1 packet parity", handoff.ParityStatus.ContractOk ? "passed" : "failed", handoff.ParityStatus.State),
            new("readonly-boundary", "Read-only boundary", handoff.ReadOnly && handoff.SecurityBoundary.NoWriteBoundarySatisfied ? "passed" : "failed", "No write flags open."),
            new("no-secret-no-archive", "No secret / no archive", handoff.PolicyCompliance.NoSecrets && handoff.PolicyCompliance.NoCompressedArchive ? "passed" : "failed", handoff.RedactionPolicy.ArchivePolicy),
            new("google-indexing-deferred", "Google indexing deferred", handoff.DeferredGates.Contains("google_search_console_indexing_deferred_hard_stop") ? "passed" : "failed", "Display-only deferred gate."),
            new("olm-carryforward", "OLM 2H-23A carryforward", handoff.OlmCarryforwardRefs.Any(reference => reference.Id.Contains("olm-2h23a", StringComparison.OrdinalIgnoreCase)) ? "passed" : "failed", "Separate future safety-boundary goal."),
            new("disabled-actions", "Future actions disabled", handoff.FutureActions.All(action => action.Disabled) ? "passed" : "failed", "No active import/resume/publish/write controls.")
        ];
}

public sealed class FixtureOperatorHandoffReadOnlyProvider : IOperatorHandoffReadOnlyProvider
{
    private const string IceFixturePath = "deployment/architecture/multi-tenant-onboarding/import-package-governance-implementation/fixtures/valid-operator-handoff-ice.operator-handoff.json";
    private const string RollerFixturePath = "deployment/architecture/multi-tenant-onboarding/import-package-governance-implementation/fixtures/valid-operator-handoff-roller-paused.operator-handoff.json";

    private static readonly IReadOnlyList<OperatorHandoffSnapshot> Handoffs =
    [
        new(IceFixturePath, CreateIceHandoff()),
        new(RollerFixturePath, CreateRollerHandoff())
    ];

    public Task<OperatorHandoffReadOnlySnapshot> GetSnapshotAsync(CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();
        ValidateHandoffs(Handoffs.Select(handoff => handoff.Handoff));

        return Task.FromResult(new OperatorHandoffReadOnlySnapshot(
            OperatorHandoffContractVersions.ReadOnlyApiEnvelope,
            CreateCorrelationId(),
            Handoffs,
            OperatorHandoffSecurityBoundaryDto.LocalClosed(),
            OperatorHandoffSourceDto.LocalHandoffFixtures()));
    }

    public Task<OperatorHandoffSnapshot?> GetHandoffAsync(string handoffPacketId, CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();
        var trimmed = handoffPacketId.Trim();
        var handoff = Handoffs.FirstOrDefault(candidate =>
            string.Equals(candidate.Handoff.HandoffPacketId, trimmed, StringComparison.OrdinalIgnoreCase));

        return Task.FromResult(handoff);
    }

    private static OperatorHandoffConsumerDto CreateIceHandoff()
    {
        const string handoffPacketId = "handoff-ice-rink-rentals-v2-12-1";
        const string packageHash = "sha256:b0fdd67d5d31e798bf1a9ae3e5f576c17129030cd816e3a8b726b0767002d073";
        const string approvalManifestId = "approval-ice-rink-rentals-carryforward-v2-11-2-v2-11-7a-execution";
        const string executionRunId = "execution-ice-rink-rentals-carryforward-v2-11-2-v2-11-7a-local";

        return CreateHandoff(
            handoffPacketId,
            "ice-rink-rentals",
            "ice-rink-rentals",
            "iceskatingrinkrentals.com",
            "scoped_local_import_executed_readback_passed",
            packageHash,
            approvalManifestId,
            executionRunId,
            "local_scoped_import_execution",
            new OperatorHandoffReadbackSummaryDto(
                "passed",
                new(3, 3, true),
                new(4, 4, true),
                new(1, 1, true),
                new(1, 1, true)),
            new OperatorHandoffEntityMappingSummaryDto(10, 1, 3, 4, 1, 1),
            "passed",
            true,
            [],
            [
                "no_live_tenant_creation",
                "no_second_import_execution",
                "no_cms_or_provider_writes"
            ],
            [
                new("ICE_HANDOFF_READBACK_PASSED", "passed", "info", "Ice scoped local import readback remains 3/3, 4/4, 1/1, 1/1.")
            ],
            [
                new("v2-12-4-runtime-signoff", "future_boundary_required", "info", "Future runtime signoff should validate the API/Admin prototype locally.")
            ]);
    }

    private static OperatorHandoffConsumerDto CreateRollerHandoff()
        => CreateHandoff(
            "handoff-roller-rink-rentals-paused-v2-12-1",
            "roller-rink-rentals",
            "roller-rink-rentals",
            "rollerrinkrentals.com",
            "paused_no_import_no_resume",
            "sha256:e5567ddc0f9b3c4e655f958d9f25cd3bef8ec72ce2f553fa37d36bab38a05b29",
            null,
            null,
            "blocked_no_import_no_resume",
            new OperatorHandoffReadbackSummaryDto(
                "not_executed",
                new(0, 0, true),
                new(0, 0, true),
                new(0, 0, true),
                new(0, 0, true)),
            new OperatorHandoffEntityMappingSummaryDto(0, 0, 0, 0, 0, 0),
            "blocked_by_policy",
            true,
            ["Roller is intentionally paused and has no approval manifest or execution run."],
            [
                "tenant_paused_no_import",
                "no_roller_resume_without_separate_approval"
            ],
            [
                new("ROLLER_PAUSED_NO_IMPORT", "blocked_by_policy", "warning", "Roller remains paused; no import or resume is approved.")
            ],
            [
                new("future-roller-resume-separate-approval-required", "future_boundary_required", "warning", "Roller resume requires separate explicit approval.")
            ]);

    private static OperatorHandoffConsumerDto CreateHandoff(
        string handoffPacketId,
        string tenantKey,
        string siteKey,
        string domain,
        string tenantState,
        string packageHash,
        string? approvalManifestId,
        string? executionRunId,
        string targetMode,
        OperatorHandoffReadbackSummaryDto readbackSummary,
        OperatorHandoffEntityMappingSummaryDto entityMappingSummary,
        string parityState,
        bool contractOk,
        IReadOnlyList<string> parityWarnings,
        IReadOnlyList<string> hardStops,
        IReadOnlyList<OperatorHandoffMessageDto> warnings,
        IReadOnlyList<OperatorHandoffMessageDto> nextGates)
    {
        var securityBoundary = OperatorHandoffSecurityBoundaryDto.LocalClosed();
        var policyCompliance = new OperatorHandoffPolicyComplianceDto(true, true, true, true, true, true);
        var redactionPolicy = new OperatorHandoffRedactionPolicyDto(
            "references_only_no_values",
            "do_not_reference_protected_paths",
            "no_compressed_handoff_archives_in_repo",
            "synthetic_or_redacted_only");

        return new OperatorHandoffConsumerDto(
            OperatorHandoffContractVersions.SharedConsumerModel,
            OperatorHandoffApiProviderModes.LocalFixtureReadOnly,
            true,
            handoffPacketId,
            "multi_tenant_onboarding_operator_handoff",
            tenantKey,
            siteKey,
            domain,
            tenantState,
            packageHash,
            approvalManifestId,
            executionRunId,
            targetMode,
            readbackSummary,
            entityMappingSummary,
            new OperatorHandoffProjectionRefDto(
                "operator-projection-execution-ice-rink-rentals-carryforward-v2-11-2-v2-11-7a-local-v2-11-8",
                "pumpkin.importExecutionOperatorProjection.v1",
                true,
                15,
                7,
                "/api/admin/import-executions",
                "/dashboard/import-executions"),
            CreateRefs("backup", tenantKey, "Backup Center carryforward evidence remains reference-only."),
            CreateRefs("resource-registry", tenantKey, "Resource registry carryforward evidence remains reference-only."),
            CreateRefs("provider-profile", tenantKey, "Provider profile carryforward evidence remains non-secret and reference-only."),
            CreateRefs("runtime-qa", tenantKey, "Runtime QA carryforward evidence remains local/read-only."),
            CreateRefs("audit-jobs", tenantKey, "Audit Jobs carryforward remains read-only."),
            [
                new(
                    "olm-2h23a-separate-future-safety-boundary",
                    "OLM 2H-23A carryforward",
                    "V2.12.3",
                    "deployment/architecture/multi-tenant-onboarding/v2-12-2-operator-handoff-readonly-consumer-contract-planning-result/olm-2h23a-carryforward-display-contract.md",
                    "future_boundary_required",
                    true,
                    "reference_only",
                    "No OLM staging write retry is executed by operator handoff consumption.")
            ],
            new OperatorHandoffParityStatusDto(
                parityState,
                contractOk,
                "validate-operator-handoff",
                26,
                32,
                0,
                Array.Empty<string>(),
                parityWarnings),
            policyCompliance,
            hardStops,
            [
                "google_search_console_indexing_deferred_hard_stop",
                "live_provider_import_deferred",
                "electron_runtime_deferred"
            ],
            securityBoundary,
            redactionPolicy,
            warnings,
            tenantState == "paused_no_import_no_resume" ? warnings : Array.Empty<OperatorHandoffMessageDto>(),
            nextGates,
            "2026-06-14T23:22:17-04:00",
            CreateAdminPanels(),
            CreateFutureApiRoutes(),
            CreateFutureActions());
    }

    private static IReadOnlyList<OperatorHandoffRefDto> CreateRefs(string prefix, string tenantKey, string notes)
        =>
        [
            new(
                $"{prefix}:{tenantKey}:v2-12-3",
                $"{prefix} carryforward for {tenantKey}",
                "V2.12.3",
                "deployment/architecture/multi-tenant-onboarding/v2-12-3-operator-handoff-getonly-api-admin-prototype-result/",
                "carried_forward_readonly",
                true,
                "reference_only_no_secret_values",
                notes)
        ];

    public static IReadOnlyList<OperatorHandoffAdminPanelDto> CreateAdminPanels()
        =>
        new[]
        {
            "Handoff Summary",
            "Tenant State",
            "Package Identity",
            "Execution Evidence",
            "Readback Summary",
            "Entity Mapping Summary",
            "Fixture Parity",
            "Backup / Registry / Provider / RuntimeQA",
            "Audit Jobs",
            "OLM 2H-23A Carryforward",
            "Security / Redaction / No Archive",
            "Hard Stops / Deferred Gates",
            "Next Gates"
        }.Select(name => new OperatorHandoffAdminPanelDto(ToPanelId(name), name, "read_only")).ToList();

    public static IReadOnlyList<OperatorHandoffApiRouteDto> CreateFutureApiRoutes()
        =>
        [
            new("GET", "/api/admin/operator-handoffs", "List read-only handoff package summaries."),
            new("GET", "/api/admin/operator-handoffs/{handoffPacketId}", "Read one handoff consumer model."),
            new("GET", "/api/admin/operator-handoffs/{handoffPacketId}/parity", "Read handoff parity status."),
            new("GET", "/api/admin/operator-handoffs/{handoffPacketId}/evidence", "Read handoff evidence references."),
            new("GET", "/api/admin/operator-handoffs/{handoffPacketId}/consumer-projection", "Read complete Admin-ready consumer projection."),
            new("GET", "/api/admin/operator-handoffs/{handoffPacketId}/qa-checklist", "Read operator QA checklist.")
        ];

    public static IReadOnlyList<OperatorHandoffFutureActionDto> CreateFutureActions()
        =>
        [
            new("execute-import", "Execute import", true, "Disabled. Operator handoff consumption is read-only."),
            new("resume-roller", "Resume Roller", true, "Disabled. Roller resume requires separate approval."),
            new("import-roller", "Import Roller", true, "Disabled. Roller import requires separate approval."),
            new("publish-live", "Publish live", true, "Disabled. CMS/provider/deployment writes are outside this phase."),
            new("run-olm-retry", "Run OLM retry", true, "Disabled. OLM 2H-23A remains a separate future gate."),
            new("submit-indexing", "Submit indexing", true, "Disabled. Google/Search Console/indexing remains deferred.")
        ];

    private static void ValidateHandoffs(IEnumerable<OperatorHandoffConsumerDto> handoffs)
    {
        foreach (var handoff in handoffs)
        {
            if (handoff.SchemaVersion != OperatorHandoffContractVersions.SharedConsumerModel
                || handoff.ConsumerMode != OperatorHandoffApiProviderModes.LocalFixtureReadOnly
                || !handoff.ReadOnly
                || handoff.AdminPanels.Count != 13
                || handoff.FutureApiRoutes.Count != 6
                || handoff.FutureApiRoutes.Any(route => route.Method != "GET")
                || handoff.FutureActions.Any(action => !action.Disabled)
                || handoff.SecurityBoundary.OpenFlags.Count != 0
                || handoff.SecurityBoundary.ProhibitedActionFlags.Any(flag => flag.Value)
                || !handoff.PolicyCompliance.NoSecrets
                || !handoff.PolicyCompliance.NoCompressedArchive
                || !handoff.DeferredGates.Contains("google_search_console_indexing_deferred_hard_stop"))
            {
                throw new InvalidOperationException("Operator handoff consumer fixture contract is invalid.");
            }
        }
    }

    private static string ToPanelId(string name)
        => name.ToLowerInvariant()
            .Replace(" / ", "-")
            .Replace(" ", "-")
            .Replace("/", "-");

    private static string CreateCorrelationId() => $"corr_operator_handoff_api_{Guid.NewGuid():N}"[..32];
}
