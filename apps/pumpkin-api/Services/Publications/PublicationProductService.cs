using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Options;
using pumpkin_net_models.Models;

namespace pumpkin_api.Services.Publications;

/// <summary>
/// Provider-neutral publication release and job registry. All durable state is
/// embedded in the existing PublicPublication record and saved with optimistic
/// revision checks. It deliberately performs no deployment or provider call.
/// </summary>
public sealed class PublicationProductService
{
    private static readonly HashSet<string> HostingClasses = new(StringComparer.Ordinal)
    {
        "STATIC_PUBLISHED_SITE",
        "DYNAMIC_SCALE_TO_ZERO_FRONTEND",
        "SHARED_RUNTIME_COMPATIBILITY"
    };

    private readonly IPublicationProductStore _store;
    private readonly PublicationProductOptions _options;
    private readonly TimeProvider _timeProvider;

    public PublicationProductService(
        IPublicationProductStore store,
        IOptions<PublicationProductOptions> options,
        TimeProvider timeProvider)
    {
        _store = store;
        _options = options.Value;
        _timeProvider = timeProvider;
    }

    public bool Enabled => _options.Enabled;
    public bool CustomerExecutionEnabled => _options.CustomerExecutionEnabled;

    public bool CanMutateTenant(string tenantUid) =>
        _options.CustomerExecutionEnabled ||
        _options.SyntheticTenantAllowlist.Any(candidate =>
            string.Equals(candidate?.Trim(), tenantUid.Trim(), StringComparison.Ordinal));

    public async Task<PublicationProductResult<PublicationProductPage<PublicationProductInventoryItem>>> ListInventoryAsync(
        string? tenantUid,
        string? status,
        string? releaseStatus,
        string? hostingClass,
        string? continuationToken,
        int? pageSize,
        CancellationToken cancellationToken)
    {
        if (!Enabled) return Disabled<PublicationProductPage<PublicationProductInventoryItem>>();
        if (!string.IsNullOrWhiteSpace(tenantUid) && !IsIdentifier(tenantUid))
            return Invalid<PublicationProductPage<PublicationProductInventoryItem>>("tenant_uid_invalid");
        if (!TryReadOffset(continuationToken, out var offset))
            return Invalid<PublicationProductPage<PublicationProductInventoryItem>>("continuation_token_invalid");

        var publications = await _store.ListAsync(NullIfWhiteSpace(tenantUid), cancellationToken);
        if (publications.Any(item => item == null || !NormalizeAndValidateRegistry(item)))
            return Invalid<PublicationProductPage<PublicationProductInventoryItem>>("publication_registry_corrupt");
        var items = publications
            .Select(ToInventoryItem)
            .Where(item => string.IsNullOrWhiteSpace(status) ||
                string.Equals(item.Status, status.Trim(), StringComparison.OrdinalIgnoreCase))
            .Where(item => string.IsNullOrWhiteSpace(releaseStatus) ||
                string.Equals(item.ReleaseStatus, releaseStatus.Trim(), StringComparison.OrdinalIgnoreCase))
            .Where(item => string.IsNullOrWhiteSpace(hostingClass) ||
                string.Equals(item.HostingClass, hostingClass.Trim(), StringComparison.OrdinalIgnoreCase))
            .OrderByDescending(item => item.UpdatedAtUtc)
            .ThenBy(item => item.PublicationId, StringComparer.Ordinal)
            .ToList();
        return new(PublicationProductResultStatus.Success, Page(items, offset, pageSize));
    }

    public async Task<PublicationProductResult<PublicationTenantSummary>> GetTenantSummaryAsync(
        string tenantUid,
        CancellationToken cancellationToken)
    {
        if (!Enabled) return Disabled<PublicationTenantSummary>();
        if (!IsIdentifier(tenantUid)) return Invalid<PublicationTenantSummary>("tenant_uid_invalid");
        var publications = (await _store.ListAsync(tenantUid, cancellationToken))
            .OrderByDescending(item => item.UpdatedAtUtc)
            .ThenBy(item => item.PublicationId, StringComparer.Ordinal)
            .ToList();
        if (publications.Count == 0) return NotFound<PublicationTenantSummary>("tenant_publications_not_found");
        if (publications.Any(item => item == null || !NormalizeAndValidateRegistry(item)))
            return Invalid<PublicationTenantSummary>("publication_registry_corrupt");
        var releases = publications.SelectMany(item => item.ProductReleases ?? new()).ToList();
        return new(PublicationProductResultStatus.Success, new PublicationTenantSummary
        {
            TenantUid = tenantUid,
            PublicationCount = publications.Count,
            ReleaseCount = releases.Count,
            ArtifactCount = publications.Sum(item => item.PublicationArtifacts?.Count ?? 0),
            ActivePublicationCount = publications.Count(item =>
                string.Equals(item.Status, "active", StringComparison.OrdinalIgnoreCase)),
            AcceptedReleaseCount = releases.Count(item =>
                string.Equals(item.Status, PublicationProductStates.Accepted, StringComparison.Ordinal)),
            RunningJobCount = publications.SelectMany(item => item.PublicationJobs ?? new()).Count(item =>
                string.Equals(item.Status, PublicationProductStates.Running, StringComparison.Ordinal)),
            LatestPublication = publications[0],
            LatestRelease = releases.OrderByDescending(item => item.UpdatedAtUtc).FirstOrDefault(),
            CustomerExecutionEnabled = CustomerExecutionEnabled
        });
    }

    public async Task<PublicationProductResult<PublicationProductPage<PublicationProductRelease>>> ListReleasesAsync(
        string tenantUid,
        string publicationId,
        string? status,
        string? continuationToken,
        int? pageSize,
        CancellationToken cancellationToken)
    {
        var publicationResult = await ReadPublicationAsync(tenantUid, publicationId, cancellationToken);
        if (publicationResult.Status != PublicationProductResultStatus.Success)
            return Forward<PublicPublication, PublicationProductPage<PublicationProductRelease>>(publicationResult);
        if (!TryReadOffset(continuationToken, out var offset))
            return Invalid<PublicationProductPage<PublicationProductRelease>>("continuation_token_invalid");
        var releases = (publicationResult.Value!.ProductReleases ?? new())
            .Where(item => string.IsNullOrWhiteSpace(status) ||
                string.Equals(item.Status, status.Trim(), StringComparison.OrdinalIgnoreCase))
            .OrderByDescending(item => item.UpdatedAtUtc)
            .ThenBy(item => item.ReleaseId, StringComparer.Ordinal)
            .ToList();
        return new(PublicationProductResultStatus.Success, Page(releases, offset, pageSize));
    }

    public async Task<PublicationProductResult<PublicationProductRelease>> GetReleaseAsync(
        string tenantUid,
        string publicationId,
        string releaseId,
        CancellationToken cancellationToken)
    {
        var publicationResult = await ReadPublicationAsync(tenantUid, publicationId, cancellationToken);
        if (publicationResult.Status != PublicationProductResultStatus.Success)
            return Forward<PublicPublication, PublicationProductRelease>(publicationResult);
        var release = publicationResult.Value!.ProductReleases?.SingleOrDefault(item =>
            string.Equals(item.ReleaseId, releaseId, StringComparison.Ordinal));
        return release == null
            ? NotFound<PublicationProductRelease>("release_not_found")
            : new(PublicationProductResultStatus.Success, release);
    }

    public async Task<PublicationProductResult<PublicationProductPage<TenantPublicationArtifact>>> ListArtifactsAsync(
        string tenantUid,
        string publicationId,
        string? releaseId,
        string? status,
        string? continuationToken,
        int? pageSize,
        CancellationToken cancellationToken)
    {
        var publicationResult = await ReadPublicationAsync(tenantUid, publicationId, cancellationToken);
        if (publicationResult.Status != PublicationProductResultStatus.Success)
            return Forward<PublicPublication, PublicationProductPage<TenantPublicationArtifact>>(publicationResult);
        if (!string.IsNullOrWhiteSpace(releaseId) && !IsIdentifier(releaseId))
            return Invalid<PublicationProductPage<TenantPublicationArtifact>>("release_id_invalid");
        if (!TryReadOffset(continuationToken, out var offset))
            return Invalid<PublicationProductPage<TenantPublicationArtifact>>("continuation_token_invalid");
        var artifacts = publicationResult.Value!.PublicationArtifacts
            .Where(item => string.IsNullOrWhiteSpace(releaseId) ||
                string.Equals(item.ReleaseId, releaseId.Trim(), StringComparison.Ordinal))
            .Where(item => string.IsNullOrWhiteSpace(status) ||
                string.Equals(item.Status, status.Trim(), StringComparison.OrdinalIgnoreCase))
            .OrderByDescending(item => item.UpdatedAtUtc)
            .ThenBy(item => item.ArtifactId, StringComparer.Ordinal)
            .ToList();
        return new(PublicationProductResultStatus.Success, Page(artifacts, offset, pageSize));
    }

    public async Task<PublicationProductResult<TenantPublicationArtifact>> GetArtifactAsync(
        string tenantUid,
        string publicationId,
        string artifactId,
        CancellationToken cancellationToken)
    {
        var publicationResult = await ReadPublicationAsync(tenantUid, publicationId, cancellationToken);
        if (publicationResult.Status != PublicationProductResultStatus.Success)
            return Forward<PublicPublication, TenantPublicationArtifact>(publicationResult);
        var artifact = publicationResult.Value!.PublicationArtifacts.SingleOrDefault(item =>
            string.Equals(item.ArtifactId, artifactId, StringComparison.Ordinal));
        return artifact == null
            ? NotFound<TenantPublicationArtifact>("artifact_not_found")
            : new(PublicationProductResultStatus.Success, artifact);
    }

    public async Task<PublicationProductResult<PublicationProductPage<PublicationProductJob>>> ListJobsAsync(
        string tenantUid,
        string publicationId,
        string? status,
        string? continuationToken,
        int? pageSize,
        CancellationToken cancellationToken)
    {
        var publicationResult = await ReadPublicationAsync(tenantUid, publicationId, cancellationToken);
        if (publicationResult.Status != PublicationProductResultStatus.Success)
            return Forward<PublicPublication, PublicationProductPage<PublicationProductJob>>(publicationResult);
        if (!TryReadOffset(continuationToken, out var offset))
            return Invalid<PublicationProductPage<PublicationProductJob>>("continuation_token_invalid");
        var jobs = (publicationResult.Value!.PublicationJobs ?? new())
            .Where(item => string.IsNullOrWhiteSpace(status) ||
                string.Equals(item.Status, status.Trim(), StringComparison.OrdinalIgnoreCase))
            .OrderByDescending(item => item.UpdatedAtUtc)
            .ThenBy(item => item.JobId, StringComparer.Ordinal)
            .ToList();
        return new(PublicationProductResultStatus.Success, Page(jobs, offset, pageSize));
    }

    public async Task<PublicationProductResult<PublicationProductJob>> GetJobAsync(
        string tenantUid,
        string publicationId,
        string jobId,
        CancellationToken cancellationToken)
    {
        var publicationResult = await ReadPublicationAsync(tenantUid, publicationId, cancellationToken);
        if (publicationResult.Status != PublicationProductResultStatus.Success)
            return Forward<PublicPublication, PublicationProductJob>(publicationResult);
        var job = publicationResult.Value!.PublicationJobs?.SingleOrDefault(item =>
            string.Equals(item.JobId, jobId, StringComparison.Ordinal));
        return job == null
            ? NotFound<PublicationProductJob>("job_not_found")
            : new(PublicationProductResultStatus.Success, job);
    }

    public async Task<PublicationProductResult<PublicationProductCenterSnapshot>> GetTenantCenterAsync(
        string tenantUid,
        string authorizationScope,
        CancellationToken cancellationToken)
    {
        if (!Enabled) return Disabled<PublicationProductCenterSnapshot>();
        if (!IsIdentifier(tenantUid)) return Invalid<PublicationProductCenterSnapshot>("tenant_uid_invalid");
        var publications = (await _store.ListAsync(tenantUid, cancellationToken))
            .OrderByDescending(item => item.UpdatedAtUtc)
            .ThenBy(item => item.PublicationId, StringComparer.Ordinal)
            .ToList();
        if (publications.Count == 0) return NotFound<PublicationProductCenterSnapshot>("tenant_publications_not_found");
        if (publications.Any(item => item == null || !NormalizeAndValidateRegistry(item)))
            return Invalid<PublicationProductCenterSnapshot>("publication_registry_corrupt");
        var current = publications[0];
        return new(PublicationProductResultStatus.Success, new PublicationProductCenterSnapshot
        {
            GeneratedAt = _timeProvider.GetUtcNow(),
            AuthorizationScope = authorizationScope,
            CustomerExecutionEnabled = CustomerExecutionEnabled,
            Tenant = ToTenantView(current),
            Releases = publications.SelectMany(item => item.ProductReleases ?? new())
                .OrderByDescending(item => item.UpdatedAtUtc).Select(ToReleaseView).ToList(),
            Artifacts = publications.SelectMany(item => item.PublicationArtifacts ?? new())
                .OrderByDescending(item => item.UpdatedAtUtc).ToList(),
            Jobs = publications.SelectMany(item => item.PublicationJobs ?? new())
                .OrderByDescending(item => item.UpdatedAtUtc).Select(ToJobView).ToList()
        });
    }

    public async Task<PublicationProductResult<PublicationProductCenterSnapshot>> GetSuperAdminCenterAsync(
        CancellationToken cancellationToken)
    {
        if (!Enabled) return Disabled<PublicationProductCenterSnapshot>();
        var publications = (await _store.ListAsync(null, cancellationToken))
            .OrderByDescending(item => item.UpdatedAtUtc)
            .ThenBy(item => item.PublicationId, StringComparer.Ordinal)
            .ToList();
        if (publications.Any(item => item == null || !NormalizeAndValidateRegistry(item)))
            return Invalid<PublicationProductCenterSnapshot>("publication_registry_corrupt");
        var currentByTenant = publications.GroupBy(item => item.TenantUid, StringComparer.Ordinal)
            .Select(group => group.First()).OrderBy(item => item.TenantUid, StringComparer.Ordinal).ToList();
        return new(PublicationProductResultStatus.Success, new PublicationProductCenterSnapshot
        {
            GeneratedAt = _timeProvider.GetUtcNow(),
            AuthorizationScope = "SUPER_ADMIN_ALL_TENANTS",
            CustomerExecutionEnabled = CustomerExecutionEnabled,
            Tenants = currentByTenant.Select(ToTenantView).ToList(),
            Releases = publications.SelectMany(item => item.ProductReleases ?? new())
                .OrderByDescending(item => item.UpdatedAtUtc).Select(ToReleaseView).ToList(),
            Artifacts = publications.SelectMany(item => item.PublicationArtifacts ?? new())
                .OrderByDescending(item => item.UpdatedAtUtc).ToList(),
            Jobs = publications.SelectMany(item => item.PublicationJobs ?? new())
                .OrderByDescending(item => item.UpdatedAtUtc).Select(ToJobView).ToList(),
            CredentialReferences = SafeCredentialReferences()
        });
    }

    public async Task<PublicationProductResult<PublicationReleaseActionResponse>> RegisterReleaseAsync(
        string tenantUid,
        string publicationId,
        RegisterPublicationReleaseRequest request,
        string actor,
        string actorType,
        CancellationToken cancellationToken)
    {
        var gate = MutationGate<PublicationReleaseActionResponse>(tenantUid);
        if (gate != null) return gate;
        if (!IsSuperAdminActor(actorType))
            return Forbidden<PublicationReleaseActionResponse>("superadmin_required");
        var validation = ValidateReleaseRequest(request);
        if (validation.Length > 0) return Invalid<PublicationReleaseActionResponse>(validation);

        var publicationResult = await ReadPublicationAsync(tenantUid, publicationId, cancellationToken);
        if (publicationResult.Status != PublicationProductResultStatus.Success)
            return Forward<PublicPublication, PublicationReleaseActionResponse>(publicationResult);
        var publication = Clone(publicationResult.Value!);
        var idempotencyHash = HashReference("idempotency", request.IdempotencyKey);
        var fingerprint = ReleaseFingerprint(request);
        var eventId = EventId("release_accepted", request.ReleaseId, idempotencyHash);
        var receipt = FindReceipt(publication, eventId);
        var existing = publication.ProductReleases.SingleOrDefault(item =>
            string.Equals(item.ReleaseId, request.ReleaseId.Trim(), StringComparison.Ordinal));
        if (receipt != null)
        {
            if (existing == null || !string.Equals(receipt.ReasonReference, fingerprint, StringComparison.Ordinal) ||
                !ReleaseEqualsRequest(existing, request))
                return Conflict<PublicationReleaseActionResponse>("idempotency_key_reused");
            return new(PublicationProductResultStatus.Success,
                new PublicationReleaseActionResponse(existing, publication.Revision, true));
        }
        if (existing != null) return Conflict<PublicationReleaseActionResponse>("release_id_conflict");
        if (!HasAuditCapacity(publication))
            return Conflict<PublicationReleaseActionResponse>("audit_registry_limit_reached");
        if (publication.Revision != request.ExpectedRevision)
            return Conflict<PublicationReleaseActionResponse>("publication_revision_conflict");
        publication.ProductReleases ??= new();
        if (publication.ProductReleases.Count >= _options.MaximumReleasesPerPublication)
            return Conflict<PublicationReleaseActionResponse>("release_registry_limit_reached");

        var supersedes = request.SupersedesReleaseId.Trim();
        if (!string.IsNullOrWhiteSpace(supersedes) && !publication.ProductReleases.Any(item =>
                string.Equals(item.ReleaseId, supersedes, StringComparison.Ordinal) &&
                item.Immutable &&
                string.Equals(item.Status, PublicationProductStates.Accepted, StringComparison.Ordinal)))
            return Invalid<PublicationReleaseActionResponse>("superseded_release_unavailable");

        var now = _timeProvider.GetUtcNow();
        var actorReference = HashReference("actor", actor);
        var release = new PublicationProductRelease
        {
            ReleaseId = request.ReleaseId.Trim(),
            Version = request.Version.Trim(),
            TenantUid = tenantUid,
            PublicationId = publicationId,
            ArtifactId = request.ArtifactId.Trim(),
            ArtifactSha256 = request.ArtifactSha256.Trim().ToLowerInvariant(),
            ManifestSha256 = request.ManifestSha256.Trim().ToLowerInvariant(),
            SourceCommit = request.SourceCommit.Trim().ToLowerInvariant(),
            SourceRef = request.SourceRef.Trim().Replace('\\', '/'),
            LockfileSha256 = request.LockfileSha256.Trim().ToLowerInvariant(),
            PackageLockSha256 = request.PackageLockSha256.Trim().ToLowerInvariant(),
            PackageVersions = request.PackageVersions
                .OrderBy(item => item.Key, StringComparer.Ordinal)
                .ToDictionary(item => item.Key.Trim(), item => item.Value.Trim(), StringComparer.Ordinal),
            TestEvidence = request.TestEvidence
                .OrderBy(item => item.SuiteId, StringComparer.Ordinal)
                .Select(item => new PublicationReleaseTestEvidence
                {
                    SuiteId = item.SuiteId.Trim(),
                    Status = item.Status.Trim().ToLowerInvariant(),
                    EvidenceSha256 = item.EvidenceSha256.Trim().ToLowerInvariant()
                }).ToList(),
            LicensingStatus = request.LicensingStatus.Trim().ToLowerInvariant(),
            NoticeStatus = request.NoticeStatus.Trim().ToLowerInvariant(),
            StarterArtifactSha256 = request.StarterArtifactSha256.Trim().ToLowerInvariant(),
            StarterImageDigest = request.StarterImageDigest.Trim().ToLowerInvariant(),
            Status = PublicationProductStates.Accepted,
            HostingClass = request.HostingClass.Trim().ToUpperInvariant(),
            Immutable = true,
            SupersedesReleaseId = supersedes,
            ReplayProtectionVersion = Math.Max(1, publication.ReplayProtectionVersion),
            CreatedAtUtc = now,
            CreatedByReference = actorReference,
            AcceptedAtUtc = now,
            AcceptedByReference = actorReference,
            UpdatedAtUtc = now
        };
        publication.ProductReleases.Add(release);
        publication.ProductRegistryEnabled = true;
        publication.CustomerExecutionEnabled = CustomerExecutionEnabled;
        publication.TicketVersion = Math.Max(2, publication.TicketVersion);
        AddAudit(publication, eventId, "release_accepted", actorReference, actorType, fingerprint, release.ReleaseId, "", "accepted", now);
        var saved = await SaveAsync(publication, request.ExpectedRevision, actorReference, cancellationToken);
        if (saved == null) return Conflict<PublicationReleaseActionResponse>("publication_revision_conflict");
        return new(PublicationProductResultStatus.Created,
            new PublicationReleaseActionResponse(
                saved.ProductReleases.Single(item => item.ReleaseId == release.ReleaseId),
                saved.Revision,
                false));
    }

    public async Task<PublicationProductResult<PublicationArtifactActionResponse>> RegisterArtifactAsync(
        string tenantUid,
        string publicationId,
        RegisterTenantPublicationArtifactRequest request,
        string actor,
        string actorType,
        CancellationToken cancellationToken)
    {
        var gate = MutationGate<PublicationArtifactActionResponse>(tenantUid);
        if (gate != null) return gate;
        var validation = ValidateArtifactRequest(request);
        if (validation.Length > 0) return Invalid<PublicationArtifactActionResponse>(validation);

        var publicationResult = await ReadPublicationAsync(tenantUid, publicationId, cancellationToken);
        if (publicationResult.Status != PublicationProductResultStatus.Success)
            return Forward<PublicPublication, PublicationArtifactActionResponse>(publicationResult);
        var publication = Clone(publicationResult.Value!);
        var idempotencyHash = HashReference("idempotency", request.IdempotencyKey);
        var fingerprint = ArtifactFingerprint(tenantUid, publicationId, request);
        var eventId = EventId("artifact_accepted", request.ArtifactId, idempotencyHash);
        var receipt = FindReceipt(publication, eventId);
        var existing = publication.PublicationArtifacts.SingleOrDefault(item =>
            string.Equals(item.ArtifactId, request.ArtifactId.Trim(), StringComparison.Ordinal));
        if (receipt != null)
        {
            if (existing == null ||
                !string.Equals(receipt.ReasonReference, fingerprint, StringComparison.Ordinal) ||
                !ArtifactEqualsRequest(existing, tenantUid, publicationId, request))
                return Conflict<PublicationArtifactActionResponse>("idempotency_key_reused");
            return new(PublicationProductResultStatus.Success,
                new PublicationArtifactActionResponse(existing, publication.Revision, true));
        }
        if (existing != null) return Conflict<PublicationArtifactActionResponse>("artifact_id_conflict");
        if (!HasAuditCapacity(publication))
            return Conflict<PublicationArtifactActionResponse>("audit_registry_limit_reached");
        if (publication.Revision != request.ExpectedRevision)
            return Conflict<PublicationArtifactActionResponse>("publication_revision_conflict");
        if (publication.PublicationArtifacts.Count >= _options.MaximumArtifactsPerPublication)
            return Conflict<PublicationArtifactActionResponse>("artifact_registry_limit_reached");

        var release = publication.ProductReleases.SingleOrDefault(item =>
            item.Immutable &&
            string.Equals(item.Status, PublicationProductStates.Accepted, StringComparison.Ordinal) &&
            string.Equals(item.ReleaseId, request.ReleaseId.Trim(), StringComparison.Ordinal));
        if (release == null)
            return Invalid<PublicationArtifactActionResponse>("accepted_release_unavailable");

        TenantPublicationArtifact? predecessor = null;
        if (!string.IsNullOrWhiteSpace(request.PredecessorArtifactId))
        {
            predecessor = publication.PublicationArtifacts.SingleOrDefault(item =>
                item.Immutable &&
                string.Equals(item.ArtifactId, request.PredecessorArtifactId.Trim(), StringComparison.Ordinal));
            if (predecessor == null ||
                (!string.IsNullOrWhiteSpace(request.PredecessorPublicationId) &&
                    !string.Equals(request.PredecessorPublicationId.Trim(), publicationId, StringComparison.Ordinal)) ||
                (!string.IsNullOrWhiteSpace(request.PredecessorArtifactSha256) &&
                    !string.Equals(
                        request.PredecessorArtifactSha256.Trim().ToLowerInvariant(),
                        predecessor.ArtifactSha256,
                        StringComparison.Ordinal)))
                return Invalid<PublicationArtifactActionResponse>("predecessor_artifact_unavailable");
        }
        if (!string.IsNullOrWhiteSpace(request.RollbackArtifactId))
        {
            var rollback = publication.PublicationArtifacts.SingleOrDefault(item =>
                item.Immutable &&
                string.Equals(item.ArtifactId, request.RollbackArtifactId.Trim(), StringComparison.Ordinal));
            if (rollback == null)
                return Invalid<PublicationArtifactActionResponse>("rollback_artifact_unavailable");
        }

        var now = _timeProvider.GetUtcNow();
        var actorReference = HashReference("actor", actor);
        var artifact = new TenantPublicationArtifact
        {
            ArtifactId = request.ArtifactId.Trim(),
            TenantUid = tenantUid,
            PublicationId = publicationId,
            ReleaseId = release.ReleaseId,
            SourceSnapshotSha256 = request.SourceSnapshotSha256.Trim().ToLowerInvariant(),
            ArtifactSha256 = request.ArtifactSha256.Trim().ToLowerInvariant(),
            ManifestSha256 = request.ManifestSha256.Trim().ToLowerInvariant(),
            HostingClass = request.HostingClass.Trim().ToUpperInvariant(),
            IndexingMode = request.IndexingMode.Trim().ToUpperInvariant(),
            FormMode = request.FormMode.Trim().ToUpperInvariant(),
            RouteCount = request.RouteCount,
            RedirectCount = request.RedirectCount,
            MediaCount = request.MediaCount,
            FormCount = request.FormCount,
            PredecessorArtifactId = request.PredecessorArtifactId.Trim(),
            PredecessorPublicationId = string.IsNullOrWhiteSpace(request.PredecessorArtifactId)
                ? string.Empty
                : publicationId,
            PredecessorArtifactSha256 = predecessor?.ArtifactSha256 ?? string.Empty,
            RollbackArtifactId = request.RollbackArtifactId.Trim(),
            Status = PublicationProductStates.Accepted,
            Immutable = true,
            RecordSha256 = ArtifactRecordHash(tenantUid, publicationId, request),
            Revision = 1,
            CreatedAtUtc = now,
            AcceptedAtUtc = now,
            AcceptedByReference = actorReference,
            UpdatedAtUtc = now
        };
        publication.PublicationArtifacts.Add(artifact);
        publication.ProductRegistryEnabled = true;
        publication.TicketVersion = Math.Max(2, publication.TicketVersion);
        AddAudit(
            publication, eventId, "artifact_accepted", actorReference, actorType, fingerprint,
            release.ReleaseId, "", "accepted", now, artifact.ArtifactId);
        var saved = await SaveAsync(publication, request.ExpectedRevision, actorReference, cancellationToken);
        if (saved == null) return Conflict<PublicationArtifactActionResponse>("publication_revision_conflict");
        return new(PublicationProductResultStatus.Created,
            new PublicationArtifactActionResponse(
                saved.PublicationArtifacts.Single(item => item.ArtifactId == artifact.ArtifactId),
                saved.Revision,
                false));
    }

    public async Task<PublicationProductResult<PublicationArtifactSupersessionResponse>> SupersedeArtifactAsync(
        string tenantUid,
        string publicationId,
        string artifactId,
        SupersedePublicationArtifactRequest request,
        string actor,
        string actorType,
        CancellationToken cancellationToken)
    {
        var gate = MutationGate<PublicationArtifactSupersessionResponse>(tenantUid);
        if (gate != null) return gate;
        if (!ValidAction(request.IdempotencyKey, request.Reason) ||
            !IsIdentifier(artifactId) ||
            !IsIdentifier(request.SuccessorArtifactId))
            return Invalid<PublicationArtifactSupersessionResponse>("action_request_invalid");
        var publicationResult = await ReadPublicationAsync(tenantUid, publicationId, cancellationToken);
        if (publicationResult.Status != PublicationProductResultStatus.Success)
            return Forward<PublicPublication, PublicationArtifactSupersessionResponse>(publicationResult);
        var publication = Clone(publicationResult.Value!);
        var artifact = publication.PublicationArtifacts.SingleOrDefault(item => item.ArtifactId == artifactId);
        var successor = publication.PublicationArtifacts.SingleOrDefault(item =>
            item.ArtifactId == request.SuccessorArtifactId);
        if (artifact == null || successor == null || !artifact.Immutable || !successor.Immutable ||
            string.Equals(artifact.ArtifactId, successor.ArtifactId, StringComparison.Ordinal))
            return Invalid<PublicationArtifactSupersessionResponse>("artifact_unavailable");
        if (!string.Equals(successor.PredecessorArtifactId, artifact.ArtifactId, StringComparison.Ordinal) ||
            !string.Equals(successor.PredecessorPublicationId, publicationId, StringComparison.Ordinal) ||
            !string.Equals(successor.PredecessorArtifactSha256, artifact.ArtifactSha256, StringComparison.Ordinal))
            return Conflict<PublicationArtifactSupersessionResponse>("successor_predecessor_conflict");

        var idempotencyHash = HashReference("idempotency", request.IdempotencyKey);
        var fingerprint = ActionFingerprint(request.Reason, successor.ArtifactId);
        var eventId = EventId("artifact_superseded", artifactId, idempotencyHash);
        var receipt = FindReceipt(publication, eventId);
        if (receipt != null)
        {
            if (!string.Equals(receipt.ReasonReference, fingerprint, StringComparison.Ordinal))
                return Conflict<PublicationArtifactSupersessionResponse>("idempotency_key_reused");
            return new(PublicationProductResultStatus.Success,
                new PublicationArtifactSupersessionResponse(artifact, successor, true));
        }
        if (!HasAuditCapacity(publication))
            return Conflict<PublicationArtifactSupersessionResponse>("audit_registry_limit_reached");
        if (publication.Revision != request.ExpectedRevision)
            return Conflict<PublicationArtifactSupersessionResponse>("publication_revision_conflict");
        if (!string.IsNullOrWhiteSpace(artifact.SupersededByArtifactId) &&
            !string.Equals(artifact.SupersededByArtifactId, successor.ArtifactId, StringComparison.Ordinal))
            return Conflict<PublicationArtifactSupersessionResponse>("artifact_already_superseded");

        var now = _timeProvider.GetUtcNow();
        artifact.Status = PublicationProductStates.Superseded;
        artifact.SupersededByArtifactId = successor.ArtifactId;
        artifact.Revision++;
        artifact.UpdatedAtUtc = now;
        successor.Status = PublicationProductStates.Accepted;
        successor.Revision++;
        successor.UpdatedAtUtc = now;
        if (string.Equals(publication.ArtifactId, artifact.ArtifactId, StringComparison.Ordinal))
        {
            var release = publication.ProductReleases.Single(item =>
                item.Immutable && item.ReleaseId == successor.ReleaseId);
            ApplyFailClosedArtifact(publication, successor, release, now);
        }
        var actorReference = HashReference("actor", actor);
        AddAudit(
            publication, eventId, "artifact_superseded", actorReference, actorType, fingerprint,
            artifact.ReleaseId, "", "superseded", now, artifact.ArtifactId);
        var saved = await SaveAsync(publication, request.ExpectedRevision, actorReference, cancellationToken);
        if (saved == null)
            return Conflict<PublicationArtifactSupersessionResponse>("publication_revision_conflict");
        return new(PublicationProductResultStatus.Success, new PublicationArtifactSupersessionResponse(
            saved.PublicationArtifacts.Single(item => item.ArtifactId == artifact.ArtifactId),
            saved.PublicationArtifacts.Single(item => item.ArtifactId == successor.ArtifactId),
            false));
    }

    public async Task<PublicationProductResult<PublicationJobActionResponse>> CreateJobAsync(
        string tenantUid,
        string publicationId,
        CreatePublicationJobRequest request,
        string actor,
        string actorType,
        CancellationToken cancellationToken)
    {
        var gate = MutationGate<PublicationJobActionResponse>(tenantUid);
        if (gate != null) return gate;
        var validation = ValidateJobRequest(request);
        if (validation.Length > 0) return Invalid<PublicationJobActionResponse>(validation);
        var publicationResult = await ReadPublicationAsync(tenantUid, publicationId, cancellationToken);
        if (publicationResult.Status != PublicationProductResultStatus.Success)
            return Forward<PublicPublication, PublicationJobActionResponse>(publicationResult);
        var publication = Clone(publicationResult.Value!);
        var idempotencyHash = HashReference("idempotency", request.IdempotencyKey);
        var fingerprint = JobFingerprint(request);
        var eventId = EventId("job_created", request.JobId, idempotencyHash);
        var receipt = FindReceipt(publication, eventId);
        var existing = publication.PublicationJobs.SingleOrDefault(item =>
            string.Equals(item.JobId, request.JobId.Trim(), StringComparison.Ordinal));
        if (receipt != null)
        {
            if (existing == null || !string.Equals(receipt.ReasonReference, fingerprint, StringComparison.Ordinal) ||
                !string.Equals(existing.IdempotencyKeyHash, idempotencyHash, StringComparison.Ordinal))
                return Conflict<PublicationJobActionResponse>("idempotency_key_reused");
            return new(PublicationProductResultStatus.Success, new PublicationJobActionResponse(existing, true));
        }
        if (existing != null) return Conflict<PublicationJobActionResponse>("job_id_conflict");
        if (!HasAuditCapacity(publication))
            return Conflict<PublicationJobActionResponse>("audit_registry_limit_reached");
        if (publication.Revision != request.ExpectedRevision)
            return Conflict<PublicationJobActionResponse>("publication_revision_conflict");
        publication.PublicationJobs ??= new();
        if (publication.PublicationJobs.Count >= _options.MaximumJobsPerPublication)
            return Conflict<PublicationJobActionResponse>("job_registry_limit_reached");
        if (!publication.ProductReleases.Any(item => item.Immutable &&
                string.Equals(item.Status, PublicationProductStates.Accepted, StringComparison.Ordinal) &&
                string.Equals(item.ReleaseId, request.ReleaseId.Trim(), StringComparison.Ordinal)))
            return Invalid<PublicationJobActionResponse>("release_unavailable");
        var targetArtifact = publication.PublicationArtifacts.SingleOrDefault(item =>
            item.Immutable &&
            item.Status is PublicationProductStates.Accepted or PublicationProductStates.Active &&
            string.Equals(item.ArtifactId, request.ArtifactId.Trim(), StringComparison.Ordinal) &&
            string.Equals(item.ReleaseId, request.ReleaseId.Trim(), StringComparison.Ordinal));
        if (targetArtifact == null)
            return Invalid<PublicationJobActionResponse>("artifact_unavailable");
        if (!string.IsNullOrWhiteSpace(request.RollbackReleaseId) &&
            !publication.ProductReleases.Any(item => item.Immutable &&
                string.Equals(item.ReleaseId, request.RollbackReleaseId.Trim(), StringComparison.Ordinal)))
            return Invalid<PublicationJobActionResponse>("rollback_release_unavailable");
        if (!string.IsNullOrWhiteSpace(request.RollbackArtifactId))
        {
            var rollbackArtifact = publication.PublicationArtifacts.SingleOrDefault(item =>
                item.Immutable &&
                string.Equals(item.ArtifactId, request.RollbackArtifactId.Trim(), StringComparison.Ordinal));
            if (rollbackArtifact == null ||
                !string.Equals(rollbackArtifact.ReleaseId, request.RollbackReleaseId.Trim(), StringComparison.Ordinal))
                return Invalid<PublicationJobActionResponse>("rollback_artifact_unavailable");
        }

        var now = _timeProvider.GetUtcNow();
        var actorReference = HashReference("actor", actor);
        var job = new PublicationProductJob
        {
            JobId = request.JobId.Trim(),
            TenantUid = tenantUid,
            PublicationId = publicationId,
            ReleaseId = request.ReleaseId.Trim(),
            ArtifactId = request.ArtifactId.Trim(),
            RollbackReleaseId = request.RollbackReleaseId.Trim(),
            RollbackArtifactId = request.RollbackArtifactId.Trim(),
            Kind = request.Kind.Trim().ToLowerInvariant(),
            Status = PublicationProductStates.Pending,
            Steps = request.Steps.Select(step => new PublicationProductJobStep
            {
                StepId = step.Trim(),
                Status = PublicationProductStates.Pending
            }).ToList(),
            IdempotencyKeyHash = idempotencyHash,
            DeterministicPlanSha256 = DeterministicPlanHash(request),
            Attempt = 0,
            CreatedAtUtc = now,
            UpdatedAtUtc = now
        };
        publication.PublicationJobs.Add(job);
        AddAudit(publication, eventId, "job_created", actorReference, actorType, fingerprint, job.ReleaseId, job.JobId, "accepted", now);
        var saved = await SaveAsync(publication, request.ExpectedRevision, actorReference, cancellationToken);
        if (saved == null) return Conflict<PublicationJobActionResponse>("publication_revision_conflict");
        return new(PublicationProductResultStatus.Created,
            new PublicationJobActionResponse(saved.PublicationJobs.Single(item => item.JobId == job.JobId), false));
    }

    public async Task<PublicationProductResult<PublicationJobActionResponse>> ResumeJobAsync(
        string tenantUid,
        string publicationId,
        string jobId,
        PublicationJobActionRequest request,
        string actor,
        string actorType,
        CancellationToken cancellationToken)
    {
        var gate = MutationGate<PublicationJobActionResponse>(tenantUid);
        if (gate != null) return gate;
        if (!ValidAction(request.IdempotencyKey, request.Reason))
            return Invalid<PublicationJobActionResponse>("action_request_invalid");
        var publicationResult = await ReadPublicationAsync(tenantUid, publicationId, cancellationToken);
        if (publicationResult.Status != PublicationProductResultStatus.Success)
            return Forward<PublicPublication, PublicationJobActionResponse>(publicationResult);
        var publication = Clone(publicationResult.Value!);
        var job = publication.PublicationJobs.SingleOrDefault(item => item.JobId == jobId);
        if (job == null) return NotFound<PublicationJobActionResponse>("job_not_found");
        var idempotencyHash = HashReference("idempotency", request.IdempotencyKey);
        var fingerprint = ActionFingerprint(request.Reason, "");
        var eventId = EventId("job_resumed", jobId, idempotencyHash);
        var receipt = FindReceipt(publication, eventId);
        if (receipt != null)
        {
            if (!string.Equals(receipt.ReasonReference, fingerprint, StringComparison.Ordinal))
                return Conflict<PublicationJobActionResponse>("idempotency_key_reused");
            return new(PublicationProductResultStatus.Success, new PublicationJobActionResponse(job, true));
        }
        if (!HasAuditCapacity(publication))
            return Conflict<PublicationJobActionResponse>("audit_registry_limit_reached");
        if (publication.Revision != request.ExpectedRevision)
            return Conflict<PublicationJobActionResponse>("publication_revision_conflict");
        if (job.Status is PublicationProductStates.Completed or PublicationProductStates.RolledBack)
            return Conflict<PublicationJobActionResponse>("job_terminal");

        var now = _timeProvider.GetUtcNow();
        var running = job.Steps.FirstOrDefault(step => step.Status == PublicationProductStates.Running);
        if (running != null)
        {
            running.Status = PublicationProductStates.Completed;
            running.CompletedAtUtc = now;
            running.ResultCode = "completed";
        }
        var next = job.Steps.FirstOrDefault(step => step.Status == PublicationProductStates.Pending);
        if (next == null)
        {
            job.Status = PublicationProductStates.Completed;
            job.CurrentStep = string.Empty;
            job.CompletedAtUtc = now;
        }
        else
        {
            next.Status = PublicationProductStates.Running;
            next.Attempt++;
            next.StartedAtUtc = now;
            job.Status = PublicationProductStates.Running;
            job.CurrentStep = next.StepId;
        }
        job.Attempt++;
        job.Revision++;
        job.UpdatedAtUtc = now;
        var actorReference = HashReference("actor", actor);
        AddAudit(publication, eventId, "job_resumed", actorReference, actorType, fingerprint, job.ReleaseId, job.JobId, job.Status, now);
        var saved = await SaveAsync(publication, request.ExpectedRevision, actorReference, cancellationToken);
        if (saved == null) return Conflict<PublicationJobActionResponse>("publication_revision_conflict");
        return new(PublicationProductResultStatus.Success,
            new PublicationJobActionResponse(saved.PublicationJobs.Single(item => item.JobId == jobId), false));
    }

    public async Task<PublicationProductResult<PublicationPromotionActionResponse>> PromoteJobAsync(
        string tenantUid,
        string publicationId,
        string jobId,
        PromotePublicationJobRequest request,
        string actor,
        string actorType,
        CancellationToken cancellationToken)
    {
        var gate = MutationGate<PublicationPromotionActionResponse>(tenantUid);
        if (gate != null) return gate;
        if (!ValidAction(request.IdempotencyKey, request.Reason))
            return Invalid<PublicationPromotionActionResponse>("action_request_invalid");
        var publicationResult = await ReadPublicationAsync(tenantUid, publicationId, cancellationToken);
        if (publicationResult.Status != PublicationProductResultStatus.Success)
            return Forward<PublicPublication, PublicationPromotionActionResponse>(publicationResult);
        var publication = Clone(publicationResult.Value!);
        var job = publication.PublicationJobs.SingleOrDefault(item => item.JobId == jobId);
        if (job == null) return NotFound<PublicationPromotionActionResponse>("job_not_found");
        var target = publication.ProductReleases.SingleOrDefault(item =>
            item.Immutable &&
            item.Status == PublicationProductStates.Accepted &&
            item.ReleaseId == job.ReleaseId);
        if (target == null) return Invalid<PublicationPromotionActionResponse>("accepted_release_unavailable");
        var targetArtifact = publication.PublicationArtifacts.SingleOrDefault(item =>
            item.Immutable &&
            item.Status is PublicationProductStates.Accepted or PublicationProductStates.Active &&
            item.ArtifactId == job.ArtifactId &&
            item.ReleaseId == target.ReleaseId);
        if (targetArtifact == null)
            return Invalid<PublicationPromotionActionResponse>("accepted_artifact_unavailable");
        if (targetArtifact.IndexingMode == PublicationProductModes.IndexableOwnerApprovalRequired)
            return new(PublicationProductResultStatus.ExecutionHeld, default, "indexing_execution_held");

        var alreadyTarget = string.Equals(publication.ArtifactId, targetArtifact.ArtifactId, StringComparison.Ordinal);
        var priorReleaseId = alreadyTarget
            ? (job.RollbackReleaseId.Length > 0 ? job.RollbackReleaseId : publication.ProductRollbackReleaseId)
            : publication.ReleaseId;
        var priorArtifactId = alreadyTarget
            ? (job.RollbackArtifactId.Length > 0 ? job.RollbackArtifactId : publication.ProductRollbackArtifactId)
            : publication.ArtifactId;
        var predecessor = string.IsNullOrWhiteSpace(priorReleaseId)
            ? null
            : publication.ProductReleases.SingleOrDefault(item =>
                item.Immutable && item.ReleaseId == priorReleaseId);
        var predecessorArtifact = string.IsNullOrWhiteSpace(priorArtifactId)
            ? null
            : publication.PublicationArtifacts.SingleOrDefault(item =>
                item.Immutable &&
                item.ArtifactId == priorArtifactId &&
                item.ReleaseId == priorReleaseId);
        if ((!string.IsNullOrWhiteSpace(priorReleaseId) && predecessor == null) ||
            (!string.IsNullOrWhiteSpace(priorArtifactId) && predecessorArtifact == null) ||
            (predecessor == null) != (predecessorArtifact == null) ||
            string.Equals(predecessorArtifact?.ArtifactId, targetArtifact.ArtifactId, StringComparison.Ordinal))
            return Invalid<PublicationPromotionActionResponse>("predecessor_authority_unavailable");

        var idempotencyHash = HashReference("idempotency", request.IdempotencyKey);
        var fingerprint = ActionFingerprint(
            request.Reason,
            string.Join(':', target.ReleaseId, targetArtifact.ArtifactId, priorReleaseId, priorArtifactId));
        var eventId = EventId("release_promoted", jobId, idempotencyHash);
        var receipt = FindReceipt(publication, eventId);
        if (receipt != null)
        {
            if (!string.Equals(receipt.ReasonReference, fingerprint, StringComparison.Ordinal))
                return Conflict<PublicationPromotionActionResponse>("idempotency_key_reused");
            return new(PublicationProductResultStatus.Success,
                new PublicationPromotionActionResponse(job, publication, priorReleaseId, true));
        }
        if (!HasAuditCapacity(publication))
            return Conflict<PublicationPromotionActionResponse>("audit_registry_limit_reached");
        if (publication.Revision != request.ExpectedRevision)
            return Conflict<PublicationPromotionActionResponse>("publication_revision_conflict");
        if (string.Equals(publication.ReleaseId, target.ReleaseId, StringComparison.Ordinal) &&
            string.Equals(publication.ArtifactId, targetArtifact.ArtifactId, StringComparison.Ordinal) &&
            string.Equals(publication.Status, "active", StringComparison.Ordinal))
            return Conflict<PublicationPromotionActionResponse>("release_already_promoted");

        var now = _timeProvider.GetUtcNow();
        var actorReference = HashReference("actor", actor);
        job.RollbackReleaseId = priorReleaseId;
        job.RollbackArtifactId = priorArtifactId;
        job.Status = PublicationProductStates.Completed;
        job.CurrentStep = string.Empty;
        job.CompletedAtUtc = now;
        job.UpdatedAtUtc = now;
        job.Revision++;
        foreach (var step in job.Steps)
        {
            step.Status = PublicationProductStates.Completed;
            step.StartedAtUtc ??= now;
            step.CompletedAtUtc ??= now;
            step.ResultCode = "completed";
        }

        publication.ProductRollbackReleaseId = priorReleaseId;
        publication.ProductRollbackArtifactId = priorArtifactId;
        publication.ReleaseId = target.ReleaseId;
        publication.ArtifactId = targetArtifact.ArtifactId;
        publication.ArtifactSha256 = targetArtifact.ArtifactSha256;
        publication.Status = PublicationProductStates.Active;
        publication.IndexingState = "disabled";
        publication.IndexingMode = targetArtifact.IndexingMode;
        publication.FormMode = targetArtifact.FormMode;
        publication.CustomerExecutionEnabled =
            CanMutateTenant(tenantUid) &&
            targetArtifact.FormMode == PublicationProductModes.PublicFormsLive;
        publication.TicketVersion = Math.Max(2, publication.TicketVersion);
        publication.ReplayProtectionVersion = Math.Max(1, publication.ReplayProtectionVersion) + 1;
        publication.ActiveFromUtc = now;
        publication.ActiveUntilUtc = null;
        publication.ActivatedAtUtc = now;
        publication.ActivatedBy = actorReference;
        publication.RevokedAtUtc = null;
        publication.RevokedBy = string.Empty;
        var formsLive = publication.CustomerExecutionEnabled;
        publication.FormMappings.ForEach(mapping =>
        {
            mapping.Active = formsLive && mapping.EnabledForPublication;
            mapping.SubmitMode = mapping.Active ? "public-ticket" : "disabled-no-post";
        });
        publication.ProductMetadata.FormReadiness = formsLive
            ? "public_forms_live"
            : "preview_no_post";
        publication.ProductMetadata.RouteCount = targetArtifact.RouteCount;
        publication.ProductMetadata.RedirectCount = targetArtifact.RedirectCount;
        publication.ProductMetadata.MediaCount = targetArtifact.MediaCount;
        publication.ProductMetadata.FormCount = targetArtifact.FormCount;
        target.ReplayProtectionVersion = publication.ReplayProtectionVersion;
        target.UpdatedAtUtc = now;
        targetArtifact.Status = PublicationProductStates.Active;
        targetArtifact.Revision++;
        targetArtifact.UpdatedAtUtc = now;
        AddAudit(
            publication, eventId, "release_promoted", actorReference, actorType, fingerprint,
            target.ReleaseId, job.JobId, "active", now, targetArtifact.ArtifactId);
        var saved = await SaveAsync(publication, request.ExpectedRevision, actorReference, cancellationToken);
        if (saved == null) return Conflict<PublicationPromotionActionResponse>("publication_revision_conflict");
        return new(PublicationProductResultStatus.Success, new PublicationPromotionActionResponse(
            saved.PublicationJobs.Single(item => item.JobId == jobId), saved, priorReleaseId, false));
    }

    public async Task<PublicationProductResult<PublicationRollbackActionResponse>> RollbackJobAsync(
        string tenantUid,
        string publicationId,
        string jobId,
        PublicationJobActionRequest request,
        string actor,
        string actorType,
        CancellationToken cancellationToken)
    {
        var gate = MutationGate<PublicationRollbackActionResponse>(tenantUid);
        if (gate != null) return gate;
        if (!ValidAction(request.IdempotencyKey, request.Reason))
            return Invalid<PublicationRollbackActionResponse>("action_request_invalid");
        var publicationResult = await ReadPublicationAsync(tenantUid, publicationId, cancellationToken);
        if (publicationResult.Status != PublicationProductResultStatus.Success)
            return Forward<PublicPublication, PublicationRollbackActionResponse>(publicationResult);
        var publication = Clone(publicationResult.Value!);
        var job = publication.PublicationJobs.SingleOrDefault(item => item.JobId == jobId);
        if (job == null) return NotFound<PublicationRollbackActionResponse>("job_not_found");
        var rollbackReleaseId = NullIfWhiteSpace(request.RollbackReleaseId) ?? job.RollbackReleaseId;
        var rollbackArtifactId = NullIfWhiteSpace(request.RollbackArtifactId) ?? job.RollbackArtifactId;
        var target = publication.ProductReleases.SingleOrDefault(item =>
            item.Immutable && item.ReleaseId == rollbackReleaseId);
        if (target == null) return Invalid<PublicationRollbackActionResponse>("rollback_release_unavailable");
        var targetArtifact = publication.PublicationArtifacts.SingleOrDefault(item =>
            item.Immutable &&
            item.ArtifactId == rollbackArtifactId &&
            item.ReleaseId == rollbackReleaseId);
        if (targetArtifact == null)
            return Invalid<PublicationRollbackActionResponse>("rollback_artifact_unavailable");
        var idempotencyHash = HashReference("idempotency", request.IdempotencyKey);
        var fingerprint = ActionFingerprint(
            request.Reason,
            string.Join(':', rollbackReleaseId, rollbackArtifactId));
        var eventId = EventId("job_rolled_back", jobId, idempotencyHash);
        var receipt = FindReceipt(publication, eventId);
        if (receipt != null)
        {
            if (!string.Equals(receipt.ReasonReference, fingerprint, StringComparison.Ordinal))
                return Conflict<PublicationRollbackActionResponse>("idempotency_key_reused");
            return new(PublicationProductResultStatus.Success,
                new PublicationRollbackActionResponse(job, publication, true));
        }
        if (!HasAuditCapacity(publication))
            return Conflict<PublicationRollbackActionResponse>("audit_registry_limit_reached");
        if (publication.Revision != request.ExpectedRevision)
            return Conflict<PublicationRollbackActionResponse>("publication_revision_conflict");

        var now = _timeProvider.GetUtcNow();
        job.RollbackReleaseId = target.ReleaseId;
        job.RollbackArtifactId = targetArtifact.ArtifactId;
        job.Status = PublicationProductStates.RolledBack;
        job.CurrentStep = string.Empty;
        job.CompletedAtUtc = now;
        job.UpdatedAtUtc = now;
        job.Revision++;
        ApplyFailClosedArtifact(publication, targetArtifact, target, now);
        var actorReference = HashReference("actor", actor);
        AddAudit(
            publication, eventId, "job_rolled_back", actorReference, actorType, fingerprint,
            target.ReleaseId, job.JobId, "rolled_back", now, targetArtifact.ArtifactId);
        var saved = await SaveAsync(publication, request.ExpectedRevision, actorReference, cancellationToken);
        if (saved == null) return Conflict<PublicationRollbackActionResponse>("publication_revision_conflict");
        return new(PublicationProductResultStatus.Success,
            new PublicationRollbackActionResponse(
                saved.PublicationJobs.Single(item => item.JobId == jobId), saved, false));
    }

    public async Task<PublicationProductResult<PublicationSupersessionActionResponse>> SupersedeReleaseAsync(
        string tenantUid,
        string publicationId,
        string releaseId,
        SupersedePublicationReleaseRequest request,
        string actor,
        string actorType,
        CancellationToken cancellationToken)
    {
        var gate = MutationGate<PublicationSupersessionActionResponse>(tenantUid);
        if (gate != null) return gate;
        if (!IsSuperAdminActor(actorType))
            return Forbidden<PublicationSupersessionActionResponse>("superadmin_required");
        if (!ValidAction(request.IdempotencyKey, request.Reason) ||
            !IsIdentifier(releaseId) || !IsIdentifier(request.SuccessorReleaseId))
            return Invalid<PublicationSupersessionActionResponse>("action_request_invalid");
        var publicationResult = await ReadPublicationAsync(tenantUid, publicationId, cancellationToken);
        if (publicationResult.Status != PublicationProductResultStatus.Success)
            return Forward<PublicPublication, PublicationSupersessionActionResponse>(publicationResult);
        var publication = Clone(publicationResult.Value!);
        var release = publication.ProductReleases.SingleOrDefault(item => item.ReleaseId == releaseId);
        var successor = publication.ProductReleases.SingleOrDefault(item => item.ReleaseId == request.SuccessorReleaseId);
        if (release == null || successor == null || !release.Immutable || !successor.Immutable ||
            string.Equals(release.ReleaseId, successor.ReleaseId, StringComparison.Ordinal))
            return Invalid<PublicationSupersessionActionResponse>("release_unavailable");
        var idempotencyHash = HashReference("idempotency", request.IdempotencyKey);
        var fingerprint = ActionFingerprint(request.Reason, successor.ReleaseId);
        var eventId = EventId("release_superseded", releaseId, idempotencyHash);
        var receipt = FindReceipt(publication, eventId);
        if (receipt != null)
        {
            if (!string.Equals(receipt.ReasonReference, fingerprint, StringComparison.Ordinal))
                return Conflict<PublicationSupersessionActionResponse>("idempotency_key_reused");
            return new(PublicationProductResultStatus.Success,
                new PublicationSupersessionActionResponse(release, successor, true));
        }
        if (!HasAuditCapacity(publication))
            return Conflict<PublicationSupersessionActionResponse>("audit_registry_limit_reached");
        if (publication.Revision != request.ExpectedRevision)
            return Conflict<PublicationSupersessionActionResponse>("publication_revision_conflict");
        if (!string.IsNullOrEmpty(release.SupersededByReleaseId) &&
            !string.Equals(release.SupersededByReleaseId, successor.ReleaseId, StringComparison.Ordinal))
            return Conflict<PublicationSupersessionActionResponse>("release_already_superseded");
        if (!string.Equals(successor.SupersedesReleaseId, release.ReleaseId, StringComparison.Ordinal))
            return Conflict<PublicationSupersessionActionResponse>("successor_predecessor_conflict");
        var successorArtifact = publication.PublicationArtifacts
            .Where(item => item.Immutable && item.ReleaseId == successor.ReleaseId)
            .OrderByDescending(item => item.UpdatedAtUtc)
            .FirstOrDefault();
        if (successorArtifact == null)
            return Invalid<PublicationSupersessionActionResponse>("successor_artifact_unavailable");

        var now = _timeProvider.GetUtcNow();
        release.Status = PublicationProductStates.Superseded;
        release.SupersededByReleaseId = successor.ReleaseId;
        release.Revision++;
        release.UpdatedAtUtc = now;
        successor.Status = PublicationProductStates.Accepted;
        successor.Revision++;
        successor.UpdatedAtUtc = now;
        ApplyFailClosedArtifact(publication, successorArtifact, successor, now);
        var actorReference = HashReference("actor", actor);
        AddAudit(
            publication, eventId, "release_superseded", actorReference, actorType, fingerprint,
            release.ReleaseId, "", "superseded", now, successorArtifact.ArtifactId);
        var saved = await SaveAsync(publication, request.ExpectedRevision, actorReference, cancellationToken);
        if (saved == null) return Conflict<PublicationSupersessionActionResponse>("publication_revision_conflict");
        return new(PublicationProductResultStatus.Success, new PublicationSupersessionActionResponse(
            saved.ProductReleases.Single(item => item.ReleaseId == releaseId),
            saved.ProductReleases.Single(item => item.ReleaseId == successor.ReleaseId),
            false));
    }

    public async Task<PublicationProductResult<PublicationLifecycleActionResponse>> UpdateFormAuthorityAsync(
        string tenantUid,
        string publicationId,
        UpdatePublicationFormAuthorityRequest request,
        string actor,
        string actorType,
        CancellationToken cancellationToken)
    {
        var gate = MutationGate<PublicationLifecycleActionResponse>(tenantUid);
        if (gate != null) return gate;
        if (!IsSuperAdminActor(actorType))
            return Forbidden<PublicationLifecycleActionResponse>("superadmin_required");
        var validation = ValidateFormAuthorityRequest(request);
        if (validation.Length > 0)
            return Invalid<PublicationLifecycleActionResponse>(validation);

        var publicationResult = await ReadPublicationAsync(tenantUid, publicationId, cancellationToken);
        if (publicationResult.Status != PublicationProductResultStatus.Success)
            return Forward<PublicPublication, PublicationLifecycleActionResponse>(publicationResult);
        var publication = Clone(publicationResult.Value!);
        var idempotencyHash = HashReference("idempotency", request.IdempotencyKey);
        var fingerprint = FormAuthorityFingerprint(request);
        var eventId = EventId("form_authority_updated", publicationId, idempotencyHash);
        var receipt = FindReceipt(publication, eventId);
        if (receipt != null)
        {
            if (!string.Equals(receipt.ReasonReference, fingerprint, StringComparison.Ordinal))
                return Conflict<PublicationLifecycleActionResponse>("idempotency_key_reused");
            return new(PublicationProductResultStatus.Success,
                new PublicationLifecycleActionResponse(publication, true));
        }
        if (!HasAuditCapacity(publication))
            return Conflict<PublicationLifecycleActionResponse>("audit_registry_limit_reached");
        if (publication.Revision != request.ExpectedRevision)
            return Conflict<PublicationLifecycleActionResponse>("publication_revision_conflict");
        if (request.SigningMetadataVersion < publication.SigningMetadataVersion ||
            request.TicketVersion < publication.TicketVersion)
            return Conflict<PublicationLifecycleActionResponse>("ticket_authority_version_rollback");
        var signingChanged =
            !string.Equals(request.TicketKeyId.Trim(), publication.TicketKeyId, StringComparison.Ordinal) ||
            !string.Equals(request.TicketIssuer.Trim(), publication.TicketIssuer, StringComparison.Ordinal) ||
            !string.Equals(request.TicketAudience.Trim(), publication.TicketAudience, StringComparison.Ordinal);
        if (signingChanged &&
            (request.SigningMetadataVersion <= publication.SigningMetadataVersion ||
             request.TicketVersion <= publication.TicketVersion))
            return Conflict<PublicationLifecycleActionResponse>("signing_rotation_version_required");

        var now = _timeProvider.GetUtcNow();
        var origins = request.AllowedOrigins
            .Select(CanonicalPublicOrigin)
            .OrderBy(item => item, StringComparer.Ordinal)
            .ToList();
        var hostnames = origins.Select(item => new Uri(item).IdnHost.ToLowerInvariant())
            .Distinct(StringComparer.Ordinal)
            .OrderBy(item => item, StringComparer.Ordinal)
            .ToList();
        publication.AllowedOrigins = origins;
        publication.AllowedHostnames = hostnames;
        publication.FormMappings = request.FormMappings
            .OrderBy(item => item.FormMappingId, StringComparer.Ordinal)
            .Select(item => new PublicPublicationFormMapping
            {
                FormMappingId = item.FormMappingId.Trim(),
                FormDefinitionId = item.FormDefinitionId.Trim(),
                Active = false,
                EnabledForPublication = item.Active,
                SubmitMode = "disabled-no-post",
                FieldContractVersion = item.FieldContractVersion.Trim(),
                FormKey = item.FormKey.Trim(),
                SiteKey = item.SiteKey.Trim(),
                PageSlug = item.PageSlug.Trim()
            }).ToList();
        publication.TicketKeyId = request.TicketKeyId.Trim();
        publication.TicketIssuer = request.TicketIssuer.Trim();
        publication.TicketAudience = request.TicketAudience.Trim();
        publication.SigningMetadataVersion = request.SigningMetadataVersion;
        publication.SigningMetadataUpdatedAtUtc = now;
        publication.TicketVersion = request.TicketVersion;
        publication.PublicFormRatePolicy = new PublicFormRatePolicy
        {
            PolicyVersion = request.RatePolicy.PolicyVersion.Trim(),
            PreflightPermitLimit = request.RatePolicy.PreflightPermitLimit,
            SubmitPermitLimit = request.RatePolicy.SubmitPermitLimit,
            WindowSeconds = request.RatePolicy.WindowSeconds
        };
        publication.PublicFormAbuseState = new PublicFormAbuseState
        {
            State = request.AbuseState.Trim().ToUpperInvariant(),
            ReasonReference = string.IsNullOrWhiteSpace(request.AbuseReasonSha256)
                ? string.Empty
                : $"reason:{request.AbuseReasonSha256.Trim().ToLowerInvariant()}",
            UpdatedAtUtc = now
        };
        publication.ProductMetadata.FrontendResourceBinding = new PublicationFrontendResourceBinding
        {
            Provider = request.FrontendResourceBinding.Provider.Trim().ToUpperInvariant(),
            ResourceKind = request.FrontendResourceBinding.ResourceKind.Trim().ToUpperInvariant(),
            ResourceReference = request.FrontendResourceBinding.ResourceReference.Trim(),
            DefaultHostname = request.FrontendResourceBinding.DefaultHostname.Trim().ToLowerInvariant(),
            State = request.FrontendResourceBinding.State.Trim().ToUpperInvariant(),
            CredentialReferenceId = request.FrontendResourceBinding.CredentialReferenceId.Trim(),
            UpdatedAtUtc = now
        };
        publication.ProductMetadata.DefaultHostname =
            publication.ProductMetadata.FrontendResourceBinding.DefaultHostname;
        publication.ProductMetadata.OriginBindings = origins.Select(origin =>
        {
            var existing = publication.ProductMetadata.OriginBindings.SingleOrDefault(item =>
                string.Equals(item.Origin, origin, StringComparison.Ordinal));
            return new PublicationOriginBinding
            {
                Origin = origin,
                Hostname = new Uri(origin).IdnHost.ToLowerInvariant(),
                State = "READY",
                Revision = Math.Max(0, existing?.Revision ?? 0) + 1
            };
        }).ToList();
        publication.ProductMetadata.DomainReadiness = new PublicationDomainReadiness
        {
            Stage = request.DomainReadiness.Stage.Trim().ToUpperInvariant(),
            Hostname = request.DomainReadiness.Hostname.Trim().ToLowerInvariant(),
            DnsState = request.DomainReadiness.DnsState.Trim().ToUpperInvariant(),
            TlsState = request.DomainReadiness.TlsState.Trim().ToUpperInvariant(),
            OwnerApprovalRequired = true,
            MutationAllowed = false
        };
        publication.ProductMetadata.DomainStage =
            publication.ProductMetadata.DomainReadiness.Stage.ToLowerInvariant();
        ApplyGenericFailClosed(publication);
        publication.ReplayProtectionVersion =
            Math.Max(1, publicationResult.Value!.ReplayProtectionVersion) + 1;
        var release = publication.ProductReleases.SingleOrDefault(item =>
            item.Immutable && item.ReleaseId == publication.ReleaseId);
        if (release != null)
        {
            release.ReplayProtectionVersion = publication.ReplayProtectionVersion;
            release.UpdatedAtUtc = now;
        }
        var actorReference = HashReference("actor", actor);
        AddAudit(
            publication, eventId, "form_authority_updated", actorReference, actorType, fingerprint,
            publication.ReleaseId, "", "updated_no_post", now, publication.ArtifactId);
        var saved = await SaveAsync(publication, request.ExpectedRevision, actorReference, cancellationToken);
        if (saved == null)
            return Conflict<PublicationLifecycleActionResponse>("publication_revision_conflict");
        return new(PublicationProductResultStatus.Success,
            new PublicationLifecycleActionResponse(saved, false));
    }

    public async Task<PublicationProductResult<PublicationLifecycleActionResponse>> RevokePublicationAsync(
        string tenantUid,
        string publicationId,
        PublicationLifecycleActionRequest request,
        string actor,
        string actorType,
        CancellationToken cancellationToken)
    {
        var gate = MutationGate<PublicationLifecycleActionResponse>(tenantUid);
        if (gate != null) return gate;
        if (!ValidAction(request.IdempotencyKey, request.Reason))
            return Invalid<PublicationLifecycleActionResponse>("action_request_invalid");
        var publicationResult = await ReadPublicationAsync(tenantUid, publicationId, cancellationToken);
        if (publicationResult.Status != PublicationProductResultStatus.Success)
            return Forward<PublicPublication, PublicationLifecycleActionResponse>(publicationResult);
        var publication = Clone(publicationResult.Value!);
        var idempotencyHash = HashReference("idempotency", request.IdempotencyKey);
        var fingerprint = ActionFingerprint(request.Reason, "");
        var eventId = EventId("publication_revoked", publicationId, idempotencyHash);
        var receipt = FindReceipt(publication, eventId);
        if (receipt != null)
        {
            if (!string.Equals(receipt.ReasonReference, fingerprint, StringComparison.Ordinal))
                return Conflict<PublicationLifecycleActionResponse>("idempotency_key_reused");
            return new(PublicationProductResultStatus.Success,
                new PublicationLifecycleActionResponse(publication, true));
        }
        if (!HasAuditCapacity(publication))
            return Conflict<PublicationLifecycleActionResponse>("audit_registry_limit_reached");
        if (publication.Revision != request.ExpectedRevision)
            return Conflict<PublicationLifecycleActionResponse>("publication_revision_conflict");

        var now = _timeProvider.GetUtcNow();
        var actorReference = HashReference("actor", actor);
        publication.Status = PublicationProductStates.Revoked;
        publication.IndexingState = "disabled";
        publication.IndexingMode = PublicationProductModes.HeldNoIndex;
        publication.FormMode = PublicationProductModes.PreviewNoPost;
        publication.CustomerExecutionEnabled = false;
        publication.ReplayProtectionVersion = Math.Max(1, publication.ReplayProtectionVersion) + 1;
        publication.FormMappings.ForEach(mapping =>
        {
            mapping.Active = false;
            mapping.SubmitMode = "disabled-no-post";
        });
        publication.RevokedAtUtc = now;
        publication.RevokedBy = actorReference;
        publication.ProductMetadata.FormReadiness = "preview_no_post";
        AddAudit(
            publication, eventId, "publication_revoked", actorReference, actorType, fingerprint,
            publication.ReleaseId, "", "revoked", now, publication.ArtifactId);
        var saved = await SaveAsync(publication, request.ExpectedRevision, actorReference, cancellationToken);
        if (saved == null) return Conflict<PublicationLifecycleActionResponse>("publication_revision_conflict");
        return new(PublicationProductResultStatus.Success,
            new PublicationLifecycleActionResponse(saved, false));
    }

    public async Task<PublicationProductResult<PublicationProductBackupEnvelope>> GetBackupAsync(
        string tenantUid,
        string publicationId,
        CancellationToken cancellationToken)
    {
        var publicationResult = await ReadPublicationAsync(tenantUid, publicationId, cancellationToken);
        if (publicationResult.Status != PublicationProductResultStatus.Success)
            return Forward<PublicPublication, PublicationProductBackupEnvelope>(publicationResult);
        var snapshot = PrepareBackupSnapshot(publicationResult.Value!);
        return new(PublicationProductResultStatus.Success, new PublicationProductBackupEnvelope
        {
            TenantUid = tenantUid,
            PublicationId = publicationId,
            Snapshot = snapshot,
            SnapshotSha256 = SnapshotDigest(snapshot),
            CreatedAtUtc = _timeProvider.GetUtcNow(),
            ValuesIncluded = false
        });
    }

    public async Task<PublicationProductResult<PublicationLifecycleActionResponse>> RestoreBackupAsync(
        string tenantUid,
        string publicationId,
        RestorePublicationProductRequest request,
        string actor,
        string actorType,
        CancellationToken cancellationToken)
    {
        var gate = MutationGate<PublicationLifecycleActionResponse>(tenantUid);
        if (gate != null) return gate;
        if (!IsSuperAdminActor(actorType))
            return Forbidden<PublicationLifecycleActionResponse>("superadmin_required");
        if (!ValidAction(request.IdempotencyKey, request.Reason) ||
            request.ExpectedRevision < 1 ||
            request.Backup == null ||
            request.Backup.SchemaVersion != "pumpkin.publication-product-backup.v1" ||
            request.Backup.ValuesIncluded ||
            !string.Equals(request.Backup.TenantUid, tenantUid, StringComparison.Ordinal) ||
            !string.Equals(request.Backup.PublicationId, publicationId, StringComparison.Ordinal) ||
            !IsSha256(request.Backup.SnapshotSha256))
            return Invalid<PublicationLifecycleActionResponse>("backup_contract_invalid");

        var publicationResult = await ReadPublicationAsync(tenantUid, publicationId, cancellationToken);
        if (publicationResult.Status != PublicationProductResultStatus.Success)
            return Forward<PublicPublication, PublicationLifecycleActionResponse>(publicationResult);
        var current = Clone(publicationResult.Value!);
        var backupSnapshot = PrepareBackupSnapshot(request.Backup.Snapshot);
        if (!string.Equals(backupSnapshot.TenantUid, tenantUid, StringComparison.Ordinal) ||
            !string.Equals(backupSnapshot.PublicationId, publicationId, StringComparison.Ordinal) ||
            !string.Equals(backupSnapshot.Id, publicationId, StringComparison.Ordinal) ||
            !string.Equals(
                SnapshotDigest(backupSnapshot),
                request.Backup.SnapshotSha256,
                StringComparison.Ordinal))
            return Invalid<PublicationLifecycleActionResponse>("backup_integrity_invalid");
        var snapshotValidation = ValidateBackupSnapshot(backupSnapshot);
        if (snapshotValidation.Length > 0)
            return Invalid<PublicationLifecycleActionResponse>(snapshotValidation);

        var idempotencyHash = HashReference("idempotency", request.IdempotencyKey);
        var fingerprint = ActionFingerprint(request.Reason, request.Backup.SnapshotSha256);
        var eventId = EventId("publication_restored", publicationId, idempotencyHash);
        var receipt = FindReceipt(current, eventId);
        if (receipt != null)
        {
            if (!string.Equals(receipt.ReasonReference, fingerprint, StringComparison.Ordinal))
                return Conflict<PublicationLifecycleActionResponse>("idempotency_key_reused");
            return new(PublicationProductResultStatus.Success,
                new PublicationLifecycleActionResponse(current, true));
        }
        if (current.Revision != request.ExpectedRevision)
            return Conflict<PublicationLifecycleActionResponse>("publication_revision_conflict");

        var restored = Clone(backupSnapshot);
        var mergeError = MergePreservedRegistryState(restored, current);
        if (mergeError.Length > 0)
            return Conflict<PublicationLifecycleActionResponse>(mergeError);
        if (!HasAuditCapacity(restored))
            return Conflict<PublicationLifecycleActionResponse>("audit_registry_limit_reached");

        var now = _timeProvider.GetUtcNow();
        var priorReplayVersion = Math.Max(
            Math.Max(1, current.ReplayProtectionVersion),
            Math.Max(1, restored.ReplayProtectionVersion));
        var currentArtifact = restored.PublicationArtifacts.SingleOrDefault(item =>
            item.Immutable && item.ArtifactId == restored.ArtifactId);
        var currentRelease = restored.ProductReleases.SingleOrDefault(item =>
            item.Immutable && item.ReleaseId == restored.ReleaseId);
        if (currentArtifact != null && currentRelease != null &&
            string.Equals(currentArtifact.ReleaseId, currentRelease.ReleaseId, StringComparison.Ordinal))
            ApplyFailClosedArtifact(restored, currentArtifact, currentRelease, now);
        else
            ApplyGenericFailClosed(restored);
        restored.ReplayProtectionVersion = priorReplayVersion + 1;
        if (currentRelease != null)
        {
            currentRelease.ReplayProtectionVersion = restored.ReplayProtectionVersion;
            currentRelease.UpdatedAtUtc = now;
        }
        restored.Revision = request.ExpectedRevision;
        restored.ETag = current.ETag;
        restored.ProductRegistryEnabled = true;
        var actorReference = HashReference("actor", actor);
        AddAudit(
            restored, eventId, "publication_restored", actorReference, actorType, fingerprint,
            restored.ReleaseId, "", "restored_no_post", now, restored.ArtifactId);
        var saved = await SaveAsync(restored, request.ExpectedRevision, actorReference, cancellationToken);
        if (saved == null)
            return Conflict<PublicationLifecycleActionResponse>("publication_revision_conflict");
        return new(PublicationProductResultStatus.Success,
            new PublicationLifecycleActionResponse(saved, false));
    }

    private async Task<PublicationProductResult<PublicPublication>> ReadPublicationAsync(
        string tenantUid,
        string publicationId,
        CancellationToken cancellationToken)
    {
        if (!Enabled) return Disabled<PublicPublication>();
        if (!IsIdentifier(tenantUid) || !IsIdentifier(publicationId))
            return Invalid<PublicPublication>("publication_identity_invalid");
        var publication = await _store.GetAsync(publicationId, cancellationToken);
        if (publication == null || !string.Equals(publication.TenantUid, tenantUid, StringComparison.Ordinal))
            return NotFound<PublicPublication>("publication_not_found");
        if (!NormalizeAndValidateRegistry(publication))
            return Invalid<PublicPublication>("publication_registry_corrupt");
        return new(PublicationProductResultStatus.Success, publication);
    }

    private PublicationProductResult<T>? MutationGate<T>(string tenantUid)
    {
        if (!Enabled) return Disabled<T>();
        if (!IsIdentifier(tenantUid)) return Invalid<T>("tenant_uid_invalid");
        return CanMutateTenant(tenantUid)
            ? null
            : new(PublicationProductResultStatus.ExecutionHeld, default, "customer_execution_held");
    }

    private async Task<PublicPublication?> SaveAsync(
        PublicPublication publication,
        long expectedRevision,
        string actorReference,
        CancellationToken cancellationToken)
    {
        publication.Revision = expectedRevision + 1;
        publication.UpdatedAtUtc = _timeProvider.GetUtcNow();
        publication.UpdatedBy = actorReference;
        try
        {
            return await _store.UpdateAsync(publication, expectedRevision, cancellationToken);
        }
        catch (InvalidOperationException)
        {
            return null;
        }
    }

    private void AddAudit(
        PublicPublication publication,
        string eventId,
        string eventType,
        string actorReference,
        string actorType,
        string reasonReference,
        string releaseId,
        string jobId,
        string result,
        DateTimeOffset occurredAt,
        string artifactId = "")
    {
        publication.ProductAuditEvents ??= new();
        publication.ProductAuditEvents.Add(new PublicationProductAuditEvent
        {
            EventId = eventId,
            EventType = eventType,
            ActorReference = actorReference,
            ActorType = NormalizeActorType(actorType),
            ReasonReference = reasonReference,
            ReleaseId = releaseId,
            ArtifactId = artifactId,
            JobId = jobId,
            Result = result,
            OccurredAtUtc = occurredAt
        });
    }

    private bool HasAuditCapacity(PublicPublication publication) =>
        publication.ProductAuditEvents.Count < Math.Max(16, _options.MaximumAuditEventsPerPublication);

    private static void ApplyFailClosedArtifact(
        PublicPublication publication,
        TenantPublicationArtifact artifact,
        PublicationProductRelease release,
        DateTimeOffset now)
    {
        publication.ReleaseId = release.ReleaseId;
        publication.ArtifactId = artifact.ArtifactId;
        publication.ArtifactSha256 = artifact.ArtifactSha256;
        publication.Status = PublicationProductStates.Draft;
        publication.IndexingState = "disabled";
        publication.IndexingMode = PublicationProductModes.HeldNoIndex;
        publication.FormMode = PublicationProductModes.PreviewNoPost;
        publication.CustomerExecutionEnabled = false;
        publication.TicketVersion = Math.Max(2, publication.TicketVersion);
        publication.ReplayProtectionVersion = Math.Max(1, publication.ReplayProtectionVersion) + 1;
        publication.ActiveFromUtc = null;
        publication.ActiveUntilUtc = null;
        publication.FormMappings.ForEach(mapping =>
        {
            mapping.Active = false;
            mapping.SubmitMode = "disabled-no-post";
        });
        publication.ProductMetadata ??= new();
        publication.ProductMetadata.FormReadiness = "preview_no_post";
        publication.ProductMetadata.RouteCount = artifact.RouteCount;
        publication.ProductMetadata.RedirectCount = artifact.RedirectCount;
        publication.ProductMetadata.MediaCount = artifact.MediaCount;
        publication.ProductMetadata.FormCount = artifact.FormCount;
        release.ReplayProtectionVersion = publication.ReplayProtectionVersion;
        release.UpdatedAtUtc = now;
        artifact.Status = PublicationProductStates.Accepted;
        artifact.Revision++;
        artifact.UpdatedAtUtc = now;
    }

    private static void ApplyGenericFailClosed(PublicPublication publication)
    {
        publication.Status = PublicationProductStates.Draft;
        publication.IndexingState = "disabled";
        publication.IndexingMode = PublicationProductModes.HeldNoIndex;
        publication.FormMode = PublicationProductModes.PreviewNoPost;
        publication.CustomerExecutionEnabled = false;
        publication.TicketVersion = Math.Max(2, publication.TicketVersion);
        publication.ActiveFromUtc = null;
        publication.ActiveUntilUtc = null;
        publication.FormMappings.ForEach(mapping =>
        {
            mapping.Active = false;
            mapping.SubmitMode = "disabled-no-post";
        });
        publication.ProductMetadata.FormReadiness = "preview_no_post";
    }

    private static string ValidateReleaseRequest(RegisterPublicationReleaseRequest request)
    {
        if (!IsIdentifier(request.ReleaseId) ||
            !IsSafeLabel(request.Version, 64) ||
            !IsIdentifier(request.ArtifactId))
            return "release_identity_invalid";
        if (!IsSha256(request.ArtifactSha256) || !IsSha256(request.ManifestSha256))
            return "release_digest_invalid";
        if (!IsSha256(request.LockfileSha256))
            return "lockfile_digest_invalid";
        if (!string.IsNullOrWhiteSpace(request.PackageLockSha256) && !IsSha256(request.PackageLockSha256))
            return "package_lock_digest_invalid";
        if (!(request.SourceCommit is { Length: 40 or 64 } && IsLowerHex(request.SourceCommit)))
            return "source_commit_invalid";
        if (!IsSafeRelativeReference(request.SourceRef))
            return "source_ref_invalid";
        if (request.PackageVersions is not { Count: > 0 and <= 128 } ||
            request.PackageVersions.Any(item =>
                !IsSafePackageName(item.Key) || !IsSafePackageVersion(item.Value)))
            return "package_versions_invalid";
        if (request.TestEvidence is not { Count: > 0 and <= 64 } ||
            request.TestEvidence.Any(item =>
                item == null ||
                !IsIdentifier(item.SuiteId) ||
                !IsSafeLabel(item.Status, 32) ||
                !IsSha256(item.EvidenceSha256)) ||
            request.TestEvidence.Select(item => item.SuiteId.Trim())
                .Distinct(StringComparer.Ordinal).Count() != request.TestEvidence.Count)
            return "test_evidence_invalid";
        if (!HostingClasses.Contains(request.HostingClass?.Trim().ToUpperInvariant() ?? string.Empty))
            return "hosting_class_invalid";
        if (!string.IsNullOrWhiteSpace(request.SupersedesReleaseId) && !IsIdentifier(request.SupersedesReleaseId))
            return "supersedes_release_id_invalid";
        if (!IsSafeLabel(request.LicensingStatus, 64) || !IsSafeLabel(request.NoticeStatus, 64))
            return "licensing_or_notice_status_invalid";
        if (!IsSha256(request.StarterArtifactSha256) || !IsSha256Digest(request.StarterImageDigest))
            return "starter_identity_invalid";
        if (!ValidIdempotency(request.IdempotencyKey) || request.ExpectedRevision < 1)
            return "mutation_contract_invalid";
        return string.Empty;
    }

    private static string ValidateArtifactRequest(RegisterTenantPublicationArtifactRequest request)
    {
        if (!IsIdentifier(request.ArtifactId) || !IsIdentifier(request.ReleaseId))
            return "artifact_identity_invalid";
        if (!IsSha256(request.SourceSnapshotSha256) ||
            !IsSha256(request.ArtifactSha256) ||
            !IsSha256(request.ManifestSha256))
            return "artifact_digest_invalid";
        if (!HostingClasses.Contains(request.HostingClass?.Trim().ToUpperInvariant() ?? string.Empty))
            return "hosting_class_invalid";
        if (request.IndexingMode?.Trim().ToUpperInvariant() is not (
                PublicationProductModes.HeldNoIndex or
                PublicationProductModes.PublicNoIndex or
                PublicationProductModes.IndexableOwnerApprovalRequired))
            return "indexing_mode_invalid";
        if (request.FormMode?.Trim().ToUpperInvariant() is not (
                PublicationProductModes.PreviewNoPost or
                PublicationProductModes.PublicFormsLive))
            return "form_mode_invalid";
        if (new[] { request.RouteCount, request.RedirectCount, request.MediaCount, request.FormCount }
            .Any(value => value is < 0 or > 1_000_000))
            return "artifact_inventory_invalid";
        if (!string.IsNullOrWhiteSpace(request.PredecessorArtifactId) &&
            !IsIdentifier(request.PredecessorArtifactId))
            return "predecessor_artifact_id_invalid";
        if (!string.IsNullOrWhiteSpace(request.PredecessorPublicationId) &&
            !IsIdentifier(request.PredecessorPublicationId))
            return "predecessor_publication_id_invalid";
        if (!string.IsNullOrWhiteSpace(request.PredecessorArtifactSha256) &&
            !IsSha256(request.PredecessorArtifactSha256))
            return "predecessor_artifact_digest_invalid";
        if (string.IsNullOrWhiteSpace(request.PredecessorArtifactId) &&
            (!string.IsNullOrWhiteSpace(request.PredecessorPublicationId) ||
             !string.IsNullOrWhiteSpace(request.PredecessorArtifactSha256)))
            return "predecessor_artifact_contract_invalid";
        if (!string.IsNullOrWhiteSpace(request.PredecessorArtifactId) &&
            (string.IsNullOrWhiteSpace(request.PredecessorPublicationId) ||
             string.IsNullOrWhiteSpace(request.PredecessorArtifactSha256)))
            return "predecessor_artifact_contract_invalid";
        if (!string.IsNullOrWhiteSpace(request.RollbackArtifactId) &&
            !IsIdentifier(request.RollbackArtifactId))
            return "rollback_artifact_id_invalid";
        if (!ValidIdempotency(request.IdempotencyKey) || request.ExpectedRevision < 1)
            return "mutation_contract_invalid";
        return string.Empty;
    }

    private static string ValidateJobRequest(CreatePublicationJobRequest request)
    {
        if (!IsIdentifier(request.JobId) ||
            !IsIdentifier(request.ReleaseId) ||
            !IsIdentifier(request.ArtifactId) ||
            (!string.IsNullOrWhiteSpace(request.RollbackReleaseId) && !IsIdentifier(request.RollbackReleaseId)) ||
            (!string.IsNullOrWhiteSpace(request.RollbackArtifactId) && !IsIdentifier(request.RollbackArtifactId)) ||
            string.IsNullOrWhiteSpace(request.RollbackReleaseId) !=
                string.IsNullOrWhiteSpace(request.RollbackArtifactId))
            return "job_identity_invalid";
        if (!IsSafeLabel(request.Kind, 64) || request.Steps is not { Count: > 0 and <= 32 } ||
            request.Steps.Any(step => !IsIdentifier(step)) ||
            request.Steps.Distinct(StringComparer.Ordinal).Count() != request.Steps.Count)
            return "job_plan_invalid";
        if (!ValidIdempotency(request.IdempotencyKey) || request.ExpectedRevision < 1)
            return "mutation_contract_invalid";
        return string.Empty;
    }

    private static string ValidateFormAuthorityRequest(UpdatePublicationFormAuthorityRequest request)
    {
        if (!ValidAction(request.IdempotencyKey, request.Reason) || request.ExpectedRevision < 1)
            return "mutation_contract_invalid";
        if (request.AllowedOrigins is not { Count: > 0 and <= 32 } ||
            request.AllowedOrigins.Any(item => !TryCanonicalPublicOrigin(item, out _)))
            return "allowed_origins_invalid";
        var origins = request.AllowedOrigins.Select(CanonicalPublicOrigin).ToList();
        if (origins.Distinct(StringComparer.Ordinal).Count() != origins.Count)
            return "allowed_origins_duplicate";
        if (request.FormMappings is not { Count: > 0 and <= 128 } ||
            request.FormMappings.Any(item =>
                item == null ||
                !IsIdentifier(item.FormMappingId) ||
                !IsIdentifier(item.FormDefinitionId) ||
                !IsSafeLabel(item.FieldContractVersion, 128) ||
                !IsIdentifier(item.FormKey) ||
                !IsIdentifier(item.SiteKey) ||
                !IsSafePathValue(item.PageSlug) ||
                item.SubmitMode.Trim().ToLowerInvariant() is not (
                    "public-ticket" or "disabled-no-post")) ||
            request.FormMappings.Select(item => item.FormMappingId.Trim())
                .Distinct(StringComparer.Ordinal).Count() != request.FormMappings.Count)
            return "form_mappings_invalid";
        if (!IsIdentifier(request.TicketKeyId) ||
            !IsSafeLabel(request.TicketIssuer, 128) ||
            !IsSafeLabel(request.TicketAudience, 128) ||
            request.SigningMetadataVersion < 1 ||
            request.TicketVersion < 2)
            return "ticket_authority_invalid";
        if (request.RatePolicy == null ||
            !IsSafeLabel(request.RatePolicy.PolicyVersion, 64) ||
            request.RatePolicy.PreflightPermitLimit is < 1 or > 10_000 ||
            request.RatePolicy.SubmitPermitLimit is < 1 or > 10_000 ||
            request.RatePolicy.WindowSeconds is < 1 or > 86_400)
            return "rate_policy_invalid";
        var abuseState = request.AbuseState?.Trim().ToUpperInvariant() ?? string.Empty;
        if (abuseState is not ("NORMAL" or "THROTTLED" or "BLOCKED" or "HELD") ||
            (abuseState == "NORMAL" && !string.IsNullOrWhiteSpace(request.AbuseReasonSha256)) ||
            (abuseState != "NORMAL" && !IsSha256(request.AbuseReasonSha256)))
            return "abuse_state_invalid";
        var binding = request.FrontendResourceBinding;
        if (binding == null ||
            !IsSafeLabel(binding.Provider, 64) ||
            !HostingClasses.Contains(binding.ResourceKind.Trim().ToUpperInvariant()) ||
            !IsSafeResourceReference(binding.ResourceReference) ||
            !IsHostname(binding.DefaultHostname) ||
            !IsSafeLabel(binding.State, 64) ||
            !IsIdentifier(binding.CredentialReferenceId))
            return "frontend_resource_binding_invalid";
        var allowedHosts = origins.Select(item => new Uri(item).IdnHost.ToLowerInvariant())
            .ToHashSet(StringComparer.Ordinal);
        if (!allowedHosts.Contains(binding.DefaultHostname.Trim().ToLowerInvariant()))
            return "frontend_hostname_not_allowed";
        var domain = request.DomainReadiness;
        if (domain == null ||
            !IsSafeLabel(domain.Stage, 64) ||
            (!string.IsNullOrWhiteSpace(domain.Hostname) && !IsHostname(domain.Hostname)) ||
            !IsSafeLabel(domain.DnsState, 64) ||
            !IsSafeLabel(domain.TlsState, 64) ||
            !domain.OwnerApprovalRequired ||
            domain.MutationAllowed)
            return "domain_readiness_invalid";
        return string.Empty;
    }

    private static bool TryCanonicalPublicOrigin(string? value, out string canonical)
    {
        canonical = string.Empty;
        if (string.IsNullOrWhiteSpace(value) || value.Length > 512 ||
            !Uri.TryCreate(value.Trim(), UriKind.Absolute, out var uri) ||
            !string.Equals(uri.Scheme, Uri.UriSchemeHttps, StringComparison.OrdinalIgnoreCase) ||
            !string.IsNullOrEmpty(uri.UserInfo) ||
            !string.IsNullOrEmpty(uri.Query) ||
            !string.IsNullOrEmpty(uri.Fragment) ||
            uri.AbsolutePath != "/" ||
            (uri.Port != 443 && !uri.IsDefaultPort) ||
            !IsHostname(uri.IdnHost))
            return false;
        canonical = $"https://{uri.IdnHost.ToLowerInvariant()}";
        return true;
    }

    private static string CanonicalPublicOrigin(string? value)
    {
        if (!TryCanonicalPublicOrigin(value, out var canonical))
            throw new InvalidOperationException("origin_validation_contract_broken");
        return canonical;
    }

    private static bool IsHostname(string? value) =>
        !string.IsNullOrWhiteSpace(value) &&
        value.Length <= 253 &&
        value.Split('.').All(label =>
            label.Length is > 0 and <= 63 &&
            char.IsLetterOrDigit(label[0]) &&
            char.IsLetterOrDigit(label[^1]) &&
            label.All(character => char.IsLetterOrDigit(character) || character == '-'));

    private static bool IsSafePathValue(string? value) =>
        !string.IsNullOrWhiteSpace(value) &&
        value.Length <= 256 &&
        !value.Contains("..", StringComparison.Ordinal) &&
        value.All(character =>
            char.IsLetterOrDigit(character) ||
            character is '-' or '_' or '.' or '/');

    private static bool IsSafeResourceReference(string? value)
    {
        if (string.IsNullOrWhiteSpace(value) ||
            value.Length > 512 ||
            value.Any(character => character < (char)0x21 || character > (char)0x7e))
            return false;
        var normalized = value.Trim();
        if (!(normalized.StartsWith("resource:", StringComparison.Ordinal) ||
              normalized.StartsWith("/subscriptions/", StringComparison.OrdinalIgnoreCase)))
            return false;
        if (normalized.Any(character =>
            !(char.IsLetterOrDigit(character) ||
              character is '-' or '_' or '.' or '/' or ':' or '(' or ')')))
            return false;
        return !normalized.Contains("token", StringComparison.OrdinalIgnoreCase) &&
            !normalized.Contains("secret", StringComparison.OrdinalIgnoreCase) &&
            !normalized.Contains("password", StringComparison.OrdinalIgnoreCase) &&
            !normalized.Contains('=') &&
            !normalized.Contains('?') &&
            !normalized.Contains('#');
    }

    private static string ValidateBackupSnapshot(PublicPublication publication)
    {
        if (!IsIdentifier(publication.PublicationId) ||
            !IsIdentifier(publication.TenantUid) ||
            !string.Equals(publication.Id, publication.PublicationId, StringComparison.Ordinal) ||
            publication.Revision < 1 ||
            publication.ReplayProtectionVersion < 1)
            return "backup_publication_invalid";
        if (publication.ProductReleases.Count > 1_000 ||
            publication.PublicationArtifacts.Count > 1_000 ||
            publication.PublicationJobs.Count > 1_000 ||
            publication.ProductAuditEvents.Count > 10_000)
            return "backup_registry_limit_invalid";
        if (publication.ProductReleases.Any(item =>
                item == null ||
                !item.Immutable ||
                !IsIdentifier(item.ReleaseId) ||
                !IsSafeLabel(item.Version, 64) ||
                !string.Equals(item.TenantUid, publication.TenantUid, StringComparison.Ordinal) ||
                !string.Equals(item.PublicationId, publication.PublicationId, StringComparison.Ordinal) ||
                !IsIdentifier(item.ArtifactId) ||
                !IsSha256(item.ArtifactSha256) ||
                !IsSha256(item.ManifestSha256) ||
                !(item.SourceCommit is { Length: 40 or 64 } && IsLowerHex(item.SourceCommit)) ||
                !IsSafeRelativeReference(item.SourceRef) ||
                !IsSha256(item.LockfileSha256) ||
                (!string.IsNullOrWhiteSpace(item.PackageLockSha256) &&
                    !IsSha256(item.PackageLockSha256)) ||
                item.PackageVersions is not { Count: > 0 and <= 128 } ||
                item.PackageVersions.Any(package =>
                    !IsSafePackageName(package.Key) || !IsSafePackageVersion(package.Value)) ||
                item.TestEvidence is not { Count: > 0 and <= 64 } ||
                item.TestEvidence.Any(evidence =>
                    evidence == null ||
                    !IsIdentifier(evidence.SuiteId) ||
                    !IsSafeLabel(evidence.Status, 32) ||
                    !IsSha256(evidence.EvidenceSha256)) ||
                !IsSafeLabel(item.LicensingStatus, 64) ||
                !IsSafeLabel(item.NoticeStatus, 64) ||
                !IsSha256(item.StarterArtifactSha256) ||
                !IsSha256Digest(item.StarterImageDigest) ||
                !HostingClasses.Contains(item.HostingClass) ||
                !IsSafeLabel(item.Status, 64)) ||
            publication.ProductReleases.Select(item => item.ReleaseId)
                .Distinct(StringComparer.Ordinal).Count() != publication.ProductReleases.Count)
            return "backup_release_registry_invalid";
        if (publication.PublicationArtifacts.Any(item =>
                item == null ||
                !item.Immutable ||
                !IsIdentifier(item.ArtifactId) ||
                !IsIdentifier(item.ReleaseId) ||
                !string.Equals(item.TenantUid, publication.TenantUid, StringComparison.Ordinal) ||
                !string.Equals(item.PublicationId, publication.PublicationId, StringComparison.Ordinal) ||
                !IsSha256(item.SourceSnapshotSha256) ||
                !IsSha256(item.ArtifactSha256) ||
                !IsSha256(item.ManifestSha256) ||
                !HostingClasses.Contains(item.HostingClass) ||
                item.IndexingMode is not (
                    PublicationProductModes.HeldNoIndex or
                    PublicationProductModes.PublicNoIndex or
                    PublicationProductModes.IndexableOwnerApprovalRequired) ||
                item.FormMode is not (
                    PublicationProductModes.PreviewNoPost or
                    PublicationProductModes.PublicFormsLive) ||
                new[] { item.RouteCount, item.RedirectCount, item.MediaCount, item.FormCount }
                    .Any(value => value is < 0 or > 1_000_000) ||
                (!string.IsNullOrWhiteSpace(item.PredecessorArtifactId) &&
                    (!IsIdentifier(item.PredecessorArtifactId) ||
                     !IsIdentifier(item.PredecessorPublicationId) ||
                     !IsSha256(item.PredecessorArtifactSha256))) ||
                !IsSafeLabel(item.Status, 64) ||
                !string.Equals(item.RecordSha256, ArtifactRecordHash(item), StringComparison.Ordinal)) ||
            publication.PublicationArtifacts.Select(item => item.ArtifactId)
                .Distinct(StringComparer.Ordinal).Count() != publication.PublicationArtifacts.Count)
            return "backup_artifact_registry_invalid";
        if (publication.PublicationJobs.Any(item =>
                item == null ||
                !IsIdentifier(item.JobId) ||
                !IsIdentifier(item.ReleaseId) ||
                !IsIdentifier(item.ArtifactId) ||
                !string.Equals(item.TenantUid, publication.TenantUid, StringComparison.Ordinal) ||
                !string.Equals(item.PublicationId, publication.PublicationId, StringComparison.Ordinal) ||
                !IsSafeLabel(item.Kind, 64) ||
                !IsSafeLabel(item.Status, 64) ||
                item.Steps is not { Count: > 0 and <= 32 } ||
                item.Steps.Any(step =>
                    step == null ||
                    !IsIdentifier(step.StepId) ||
                    !IsSafeLabel(step.Status, 64)) ||
                !IsSha256(item.DeterministicPlanSha256)) ||
            publication.PublicationJobs.Select(item => item.JobId)
                .Distinct(StringComparer.Ordinal).Count() != publication.PublicationJobs.Count)
            return "backup_job_registry_invalid";
        if (publication.ProductAuditEvents.Any(item =>
                item == null ||
                !IsIdentifier(item.EventId) ||
                !IsSafeLabel(item.EventType, 64) ||
                !IsSafeLabel(item.Result, 64)) ||
            publication.ProductAuditEvents.Select(item => item.EventId)
            .Distinct(StringComparer.Ordinal).Count() != publication.ProductAuditEvents.Count)
            return "backup_audit_registry_invalid";
        return string.Empty;
    }

    private static string MergePreservedRegistryState(
        PublicPublication restored,
        PublicPublication current)
    {
        foreach (var restoredRelease in restored.ProductReleases)
        {
            var currentRelease = current.ProductReleases.SingleOrDefault(item =>
                item.ReleaseId == restoredRelease.ReleaseId);
            if (currentRelease == null)
                return "backup_unknown_release";
            if (!string.Equals(
                    ReleaseImmutableHash(restoredRelease),
                    ReleaseImmutableHash(currentRelease),
                    StringComparison.Ordinal))
                return "immutable_release_conflict";
        }
        foreach (var currentRelease in current.ProductReleases)
        {
            var restoredRelease = restored.ProductReleases.SingleOrDefault(item =>
                item.ReleaseId == currentRelease.ReleaseId);
            if (restoredRelease == null)
            {
                restored.ProductReleases.Add(currentRelease);
                continue;
            }
            if (!string.Equals(
                    ReleaseImmutableHash(restoredRelease),
                    ReleaseImmutableHash(currentRelease),
                    StringComparison.Ordinal))
                return "immutable_release_conflict";
        }
        foreach (var restoredArtifact in restored.PublicationArtifacts)
        {
            var currentArtifact = current.PublicationArtifacts.SingleOrDefault(item =>
                item.ArtifactId == restoredArtifact.ArtifactId);
            if (currentArtifact == null)
                return "backup_unknown_artifact";
            if (!string.Equals(
                    ArtifactRecordHash(restoredArtifact),
                    ArtifactRecordHash(currentArtifact),
                    StringComparison.Ordinal))
                return "immutable_artifact_conflict";
        }
        foreach (var currentArtifact in current.PublicationArtifacts)
        {
            var restoredArtifact = restored.PublicationArtifacts.SingleOrDefault(item =>
                item.ArtifactId == currentArtifact.ArtifactId);
            if (restoredArtifact == null)
            {
                restored.PublicationArtifacts.Add(currentArtifact);
                continue;
            }
            if (!string.Equals(
                    ArtifactRecordHash(restoredArtifact),
                    ArtifactRecordHash(currentArtifact),
                    StringComparison.Ordinal))
                return "immutable_artifact_conflict";
        }
        foreach (var restoredJob in restored.PublicationJobs)
        {
            var currentJob = current.PublicationJobs.SingleOrDefault(item =>
                item.JobId == restoredJob.JobId);
            if (currentJob == null)
                return "backup_unknown_job";
            if (!string.Equals(
                    restoredJob.DeterministicPlanSha256,
                    currentJob.DeterministicPlanSha256,
                    StringComparison.Ordinal))
                return "deterministic_job_conflict";
        }
        foreach (var currentJob in current.PublicationJobs)
        {
            var restoredJob = restored.PublicationJobs.SingleOrDefault(item =>
                item.JobId == currentJob.JobId);
            if (restoredJob == null)
            {
                restored.PublicationJobs.Add(currentJob);
                continue;
            }
            if (!string.Equals(
                    restoredJob.DeterministicPlanSha256,
                    currentJob.DeterministicPlanSha256,
                    StringComparison.Ordinal))
                return "deterministic_job_conflict";
            if (currentJob.Revision > restoredJob.Revision)
            {
                restored.PublicationJobs.Remove(restoredJob);
                restored.PublicationJobs.Add(currentJob);
            }
        }
        var knownAudit = restored.ProductAuditEvents.Select(item => item.EventId)
            .ToHashSet(StringComparer.Ordinal);
        restored.ProductAuditEvents.AddRange(current.ProductAuditEvents.Where(item =>
            knownAudit.Add(item.EventId)));
        restored.ProductReleases = restored.ProductReleases
            .OrderBy(item => item.ReleaseId, StringComparer.Ordinal).ToList();
        restored.PublicationArtifacts = restored.PublicationArtifacts
            .OrderBy(item => item.ArtifactId, StringComparer.Ordinal).ToList();
        restored.PublicationJobs = restored.PublicationJobs
            .OrderBy(item => item.JobId, StringComparer.Ordinal).ToList();
        restored.ProductAuditEvents = restored.ProductAuditEvents
            .OrderBy(item => item.OccurredAtUtc).ThenBy(item => item.EventId, StringComparer.Ordinal).ToList();
        return string.Empty;
    }

    private static bool ValidAction(string? idempotencyKey, string? reason) =>
        ValidIdempotency(idempotencyKey) && IsSafeReason(reason);

    private static bool ValidIdempotency(string? value) =>
        !string.IsNullOrWhiteSpace(value) && value.Length is >= 8 and <= 256 &&
        value.All(character => character is >= (char)0x21 and <= (char)0x7e);

    private static bool IsSafeReason(string? value) =>
        !string.IsNullOrWhiteSpace(value) && value.Length <= 256 &&
        value.All(character => character is >= (char)0x20 and <= (char)0x7e);

    private static bool IsIdentifier(string? value)
    {
        if (string.IsNullOrWhiteSpace(value) || value.Length is < 3 or > 128 ||
            !char.IsLetterOrDigit(value[0]) || !char.IsLetterOrDigit(value[^1]))
            return false;
        return value.All(character =>
            character is >= 'a' and <= 'z' or >= 'A' and <= 'Z' or >= '0' and <= '9' or '-' or '_' or '.' or ':');
    }

    private static bool IsSafeLabel(string? value, int maximum) =>
        !string.IsNullOrWhiteSpace(value) && value.Length <= maximum &&
        value.All(character =>
            character is >= 'a' and <= 'z' or >= 'A' and <= 'Z' or >= '0' and <= '9' or '-' or '_' or '.');

    private static bool IsSha256(string? value) => value is { Length: 64 } && IsLowerHex(value);
    private static bool IsSha256Digest(string? value) =>
        IsSha256(value) ||
        (value?.StartsWith("sha256:", StringComparison.Ordinal) == true && IsSha256(value[7..]));

    private static bool IsLowerHex(string? value) => value != null && value.All(character =>
        character is >= '0' and <= '9' or >= 'a' and <= 'f');

    private static bool IsSafeRelativeReference(string? value)
    {
        if (string.IsNullOrWhiteSpace(value) || value.Length > 512)
            return false;
        var normalized = value.Trim().Replace('\\', '/');
        if (normalized.StartsWith('/') ||
            normalized.Contains("://", StringComparison.Ordinal) ||
            normalized.Split('/').Any(segment =>
                segment.Length == 0 || segment is "." or ".."))
            return false;
        return normalized.All(character =>
            char.IsLetterOrDigit(character) ||
            character is '-' or '_' or '.' or '/' or '@');
    }

    private static bool IsSafePackageName(string? value) =>
        !string.IsNullOrWhiteSpace(value) &&
        value.Length <= 256 &&
        value.All(character =>
            char.IsLetterOrDigit(character) ||
            character is '-' or '_' or '.' or '/' or '@');

    private static bool IsSafePackageVersion(string? value) =>
        !string.IsNullOrWhiteSpace(value) &&
        value.Length <= 128 &&
        value.All(character =>
            char.IsLetterOrDigit(character) ||
            character is '-' or '_' or '.' or '+' or ':');

    private static string HashValue(string value) =>
        Convert.ToHexStringLower(SHA256.HashData(Encoding.UTF8.GetBytes(value)));

    private static string HashReference(string kind, string value) =>
        $"{kind}:{HashValue(value.Trim())}";

    private static string EventId(string eventType, string targetId, string idempotencyHash) =>
        $"evt-{Convert.ToHexStringLower(SHA256.HashData(Encoding.UTF8.GetBytes(
            string.Join('\n', eventType, targetId, idempotencyHash))))}";

    private static string ReleaseFingerprint(RegisterPublicationReleaseRequest request) =>
        HashReference("request", ReleaseCanonical(request));

    private static string ReleaseCanonical(RegisterPublicationReleaseRequest request) =>
        string.Join('\n',
            request.ReleaseId.Trim(),
            request.Version.Trim(),
            request.ArtifactId.Trim(),
            request.ArtifactSha256.Trim().ToLowerInvariant(),
            request.ManifestSha256.Trim().ToLowerInvariant(),
            request.SourceCommit.Trim().ToLowerInvariant(),
            request.SourceRef.Trim().Replace('\\', '/'),
            request.LockfileSha256.Trim().ToLowerInvariant(),
            request.PackageLockSha256.Trim().ToLowerInvariant(),
            string.Join('\n', request.PackageVersions.OrderBy(item => item.Key, StringComparer.Ordinal)
                .Select(item => $"{item.Key.Trim()}={item.Value.Trim()}")),
            string.Join('\n', request.TestEvidence.OrderBy(item => item.SuiteId, StringComparer.Ordinal)
                .Select(item => string.Join('|',
                    item.SuiteId.Trim(),
                    item.Status.Trim().ToLowerInvariant(),
                    item.EvidenceSha256.Trim().ToLowerInvariant()))),
            request.LicensingStatus.Trim().ToLowerInvariant(),
            request.NoticeStatus.Trim().ToLowerInvariant(),
            request.StarterArtifactSha256.Trim().ToLowerInvariant(),
            request.StarterImageDigest.Trim().ToLowerInvariant(),
            request.HostingClass.Trim().ToUpperInvariant(),
            request.SupersedesReleaseId.Trim());

    private static string ReleaseCanonical(PublicationProductRelease release) =>
        string.Join('\n',
            release.ReleaseId,
            release.Version,
            release.ArtifactId,
            release.ArtifactSha256,
            release.ManifestSha256,
            release.SourceCommit,
            release.SourceRef.Replace('\\', '/'),
            release.LockfileSha256,
            release.PackageLockSha256,
            string.Join('\n', release.PackageVersions.OrderBy(item => item.Key, StringComparer.Ordinal)
                .Select(item => $"{item.Key}={item.Value}")),
            string.Join('\n', release.TestEvidence.OrderBy(item => item.SuiteId, StringComparer.Ordinal)
                .Select(item => string.Join('|', item.SuiteId, item.Status, item.EvidenceSha256))),
            release.LicensingStatus,
            release.NoticeStatus,
            release.StarterArtifactSha256,
            release.StarterImageDigest,
            release.HostingClass,
            release.SupersedesReleaseId);

    private static string ReleaseImmutableHash(PublicationProductRelease release) =>
        HashValue(ReleaseCanonical(release));

    private static string ArtifactFingerprint(
        string tenantUid,
        string publicationId,
        RegisterTenantPublicationArtifactRequest request) =>
        HashReference("request", ArtifactCanonical(tenantUid, publicationId, request));

    private static string ArtifactRecordHash(
        string tenantUid,
        string publicationId,
        RegisterTenantPublicationArtifactRequest request) =>
        HashValue(ArtifactCanonical(tenantUid, publicationId, request));

    private static string ArtifactCanonical(
        string tenantUid,
        string publicationId,
        RegisterTenantPublicationArtifactRequest request) =>
        string.Join('\n',
            "pumpkin.tenant-publication-artifact.v1",
            request.ArtifactId.Trim(),
            tenantUid,
            publicationId,
            request.ReleaseId.Trim(),
            request.SourceSnapshotSha256.Trim().ToLowerInvariant(),
            request.ArtifactSha256.Trim().ToLowerInvariant(),
            request.ManifestSha256.Trim().ToLowerInvariant(),
            request.HostingClass.Trim().ToUpperInvariant(),
            request.IndexingMode.Trim().ToUpperInvariant(),
            request.FormMode.Trim().ToUpperInvariant(),
            request.RouteCount,
            request.RedirectCount,
            request.MediaCount,
            request.FormCount,
            request.PredecessorArtifactId.Trim(),
            string.IsNullOrWhiteSpace(request.PredecessorArtifactId)
                ? string.Empty
                : publicationId,
            request.PredecessorArtifactSha256.Trim().ToLowerInvariant(),
            request.RollbackArtifactId.Trim());

    private static string ArtifactRecordHash(TenantPublicationArtifact artifact) =>
        HashValue(string.Join('\n',
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
            artifact.RollbackArtifactId));

    private static string JobFingerprint(CreatePublicationJobRequest request) =>
        HashReference("request", string.Join('\n',
            request.JobId.Trim(), request.ReleaseId.Trim(), request.ArtifactId.Trim(),
            request.RollbackReleaseId.Trim(), request.RollbackArtifactId.Trim(),
            request.Kind.Trim().ToLowerInvariant(), string.Join('\n', request.Steps.Select(item => item.Trim()))));

    private static string FormAuthorityFingerprint(UpdatePublicationFormAuthorityRequest request) =>
        HashReference("request", JsonSerializer.Serialize(new
        {
            allowedOrigins = request.AllowedOrigins.Select(CanonicalPublicOrigin)
                .OrderBy(item => item, StringComparer.Ordinal),
            formMappings = request.FormMappings.OrderBy(item => item.FormMappingId, StringComparer.Ordinal)
                .Select(item => new
                {
                    formMappingId = item.FormMappingId.Trim(),
                    formDefinitionId = item.FormDefinitionId.Trim(),
                    enabled = item.Active,
                    fieldContractVersion = item.FieldContractVersion.Trim(),
                    formKey = item.FormKey.Trim(),
                    siteKey = item.SiteKey.Trim(),
                    pageSlug = item.PageSlug.Trim()
                }),
            ticketKeyId = request.TicketKeyId.Trim(),
            ticketIssuer = request.TicketIssuer.Trim(),
            ticketAudience = request.TicketAudience.Trim(),
            request.SigningMetadataVersion,
            request.TicketVersion,
            ratePolicy = request.RatePolicy,
            abuseState = request.AbuseState.Trim().ToUpperInvariant(),
            abuseReasonSha256 = request.AbuseReasonSha256.Trim().ToLowerInvariant(),
            frontendResourceBinding = request.FrontendResourceBinding,
            domainReadiness = request.DomainReadiness,
            reason = request.Reason.Trim()
        }));

    private static string ActionFingerprint(string reason, string target) =>
        HashReference("request", string.Join('\n', reason.Trim(), target.Trim()));

    private static string DeterministicPlanHash(CreatePublicationJobRequest request) =>
        Convert.ToHexStringLower(SHA256.HashData(Encoding.UTF8.GetBytes(string.Join('\n',
            request.Kind.Trim().ToLowerInvariant(), request.ReleaseId.Trim(), request.ArtifactId.Trim(),
            request.RollbackReleaseId.Trim(), request.RollbackArtifactId.Trim(),
            string.Join('\n', request.Steps.Select(item => item.Trim()))))));

    private static bool ReleaseEqualsRequest(
        PublicationProductRelease release,
        RegisterPublicationReleaseRequest request) =>
        release.Immutable &&
        string.Equals(
            ReleaseImmutableHash(release),
            HashValue(ReleaseCanonical(request)),
            StringComparison.Ordinal);

    private static bool ArtifactEqualsRequest(
        TenantPublicationArtifact artifact,
        string tenantUid,
        string publicationId,
        RegisterTenantPublicationArtifactRequest request) =>
        artifact.Immutable &&
        string.Equals(
            ArtifactRecordHash(artifact),
            ArtifactRecordHash(tenantUid, publicationId, request),
            StringComparison.Ordinal);

    private static PublicationProductAuditEvent? FindReceipt(PublicPublication publication, string eventId) =>
        publication.ProductAuditEvents?.SingleOrDefault(item =>
            string.Equals(item.EventId, eventId, StringComparison.Ordinal));

    private static void NormalizeCollections(PublicPublication publication)
    {
        publication.ProductReleases ??= new();
        publication.PublicationArtifacts ??= new();
        publication.PublicationJobs ??= new();
        publication.ProductAuditEvents ??= new();
        publication.ProductMetadata ??= new();
        publication.ProductMetadata.CompatibilityHolds ??= new();
        publication.ProductMetadata.FrontendResourceBinding ??= new();
        publication.ProductMetadata.OriginBindings ??= new();
        publication.ProductMetadata.DomainReadiness ??= new();
        publication.FormMappings ??= new();
        publication.PublicFormRatePolicy ??= new();
        publication.PublicFormAbuseState ??= new();
        foreach (var release in publication.ProductReleases)
        {
            if (release == null) continue;
            release.PackageVersions ??= new(StringComparer.Ordinal);
            release.TestEvidence ??= new();
        }
        foreach (var job in publication.PublicationJobs)
        {
            if (job == null) continue;
            job.Steps ??= new();
        }
    }

    private static bool NormalizeAndValidateRegistry(PublicPublication publication)
    {
        NormalizeCollections(publication);
        return !publication.ProductReleases.Any(item => item == null) &&
            !publication.PublicationArtifacts.Any(item => item == null) &&
            !publication.PublicationJobs.Any(item => item == null) &&
            !publication.ProductAuditEvents.Any(item => item == null);
    }

    private static PublicPublication PrepareBackupSnapshot(PublicPublication publication)
    {
        var snapshot = Clone(publication);
        snapshot.ETag = string.Empty;
        snapshot.ProductReleases = snapshot.ProductReleases
            .OrderBy(item => item.ReleaseId, StringComparer.Ordinal).ToList();
        foreach (var release in snapshot.ProductReleases)
        {
            release.PackageVersions = release.PackageVersions
                .OrderBy(item => item.Key, StringComparer.Ordinal)
                .ToDictionary(item => item.Key, item => item.Value, StringComparer.Ordinal);
            release.TestEvidence = release.TestEvidence
                .OrderBy(item => item.SuiteId, StringComparer.Ordinal).ToList();
        }
        snapshot.PublicationArtifacts = snapshot.PublicationArtifacts
            .OrderBy(item => item.ArtifactId, StringComparer.Ordinal).ToList();
        snapshot.PublicationJobs = snapshot.PublicationJobs
            .OrderBy(item => item.JobId, StringComparer.Ordinal).ToList();
        snapshot.ProductAuditEvents = snapshot.ProductAuditEvents
            .OrderBy(item => item.OccurredAtUtc)
            .ThenBy(item => item.EventId, StringComparer.Ordinal).ToList();
        snapshot.AllowedOrigins = snapshot.AllowedOrigins
            .OrderBy(item => item, StringComparer.Ordinal).ToList();
        snapshot.AllowedHostnames = snapshot.AllowedHostnames
            .OrderBy(item => item, StringComparer.Ordinal).ToList();
        snapshot.FormMappings = snapshot.FormMappings
            .OrderBy(item => item.FormMappingId, StringComparer.Ordinal).ToList();
        return snapshot;
    }

    private static string SnapshotDigest(PublicPublication snapshot) =>
        HashValue(JsonSerializer.Serialize(snapshot));

    private static PublicPublication Clone(PublicPublication publication)
    {
        var result = JsonSerializer.Deserialize<PublicPublication>(JsonSerializer.Serialize(publication))
            ?? throw new InvalidOperationException("publication_clone_failed");
        NormalizeCollections(result);
        return result;
    }

    private PublicationProductPage<T> Page<T>(IReadOnlyList<T> items, int offset, int? requestedPageSize)
    {
        var size = Math.Clamp(requestedPageSize ?? _options.DefaultPageSize, 1, Math.Max(1, _options.MaximumPageSize));
        var safeOffset = Math.Min(offset, items.Count);
        var pageItems = items.Skip(safeOffset).Take(size).ToList();
        var next = safeOffset + pageItems.Count;
        return new PublicationProductPage<T>
        {
            Items = pageItems,
            TotalCount = items.Count,
            ContinuationToken = next < items.Count
                ? Convert.ToBase64String(Encoding.UTF8.GetBytes($"v1:{next}"))
                : string.Empty
        };
    }

    private static bool TryReadOffset(string? token, out int offset)
    {
        offset = 0;
        if (string.IsNullOrWhiteSpace(token)) return true;
        if (token.Length > 128) return false;
        try
        {
            var value = Encoding.UTF8.GetString(Convert.FromBase64String(token));
            return value.StartsWith("v1:", StringComparison.Ordinal) &&
                int.TryParse(value.AsSpan(3), out offset) && offset >= 0;
        }
        catch (FormatException)
        {
            return false;
        }
    }

    private static PublicationProductInventoryItem ToInventoryItem(PublicPublication publication)
    {
        NormalizeCollections(publication);
        var release = publication.ProductReleases.SingleOrDefault(item => item.ReleaseId == publication.ReleaseId)
            ?? publication.ProductReleases.OrderByDescending(item => item.UpdatedAtUtc).FirstOrDefault();
        var artifact = publication.PublicationArtifacts.SingleOrDefault(item =>
            item.ArtifactId == publication.ArtifactId);
        return new PublicationProductInventoryItem
        {
            TenantUid = publication.TenantUid,
            PublicationId = publication.PublicationId,
            Status = publication.Status,
            ReleaseStatus = release?.Status ?? string.Empty,
            HostingClass = artifact?.HostingClass ?? release?.HostingClass ?? "UNASSIGNED",
            ReleaseId = publication.ReleaseId,
            Revision = publication.Revision,
            UpdatedAtUtc = publication.UpdatedAtUtc
        };
    }

    private static PublicationProductTenantView ToTenantView(PublicPublication publication)
    {
        NormalizeCollections(publication);
        var release = publication.ProductReleases.SingleOrDefault(item => item.ReleaseId == publication.ReleaseId)
            ?? publication.ProductReleases.OrderByDescending(item => item.UpdatedAtUtc).FirstOrDefault();
        var artifact = publication.PublicationArtifacts.SingleOrDefault(item =>
            item.ArtifactId == publication.ArtifactId);
        var metadata = publication.ProductMetadata;
        return new PublicationProductTenantView
        {
            TenantUid = publication.TenantUid,
            TenantName = string.IsNullOrWhiteSpace(metadata.TenantDisplayName)
                ? publication.TenantUid
                : metadata.TenantDisplayName,
            HostingClass = artifact?.HostingClass ?? release?.HostingClass ?? "SHARED_RUNTIME_COMPATIBILITY",
            PublicationId = publication.PublicationId,
            PublicationState = publication.Status.ToUpperInvariant(),
            PublicationRevision = publication.Revision,
            ReleaseId = publication.ReleaseId,
            ArtifactId = publication.ArtifactId,
            ArtifactSha256 = publication.ArtifactSha256,
            ManifestSha256 = artifact?.ManifestSha256 ?? release?.ManifestSha256 ?? string.Empty,
            DefaultHostname = SafeHostname(metadata.DefaultHostname),
            IndexingMode = publication.IndexingMode,
            FormMode = publication.FormMode,
            FormReadiness = metadata.FormReadiness,
            DomainStage = metadata.DomainStage,
            Inventories = new PublicationProductInventoryView
            {
                Routes = Math.Max(0, artifact?.RouteCount ?? metadata.RouteCount),
                Redirects = Math.Max(0, artifact?.RedirectCount ?? metadata.RedirectCount),
                Media = Math.Max(0, artifact?.MediaCount ?? metadata.MediaCount),
                Forms = Math.Max(0, artifact?.FormCount ?? metadata.FormCount)
            },
            FrontendResourceBinding = SafeFrontendResourceBinding(metadata.FrontendResourceBinding),
            OriginBindings = metadata.OriginBindings
                .Where(IsSafeOriginBinding)
                .Select(item => new PublicationOriginBinding
                {
                    Origin = CanonicalPublicOrigin(item.Origin),
                    Hostname = item.Hostname.ToLowerInvariant(),
                    State = item.State.ToUpperInvariant(),
                    Revision = item.Revision
                }).ToList(),
            DomainReadiness = SafeDomainReadiness(metadata.DomainReadiness),
            CompatibilityHolds = metadata.CompatibilityHolds.Where(item => IsSafeLabel(item, 128))
                .Distinct(StringComparer.Ordinal).OrderBy(item => item, StringComparer.Ordinal).ToList(),
            AuditEvents = publication.ProductAuditEvents.OrderByDescending(item => item.OccurredAtUtc)
                .Select(item => new PublicationProductAuditView
                {
                    EventId = item.EventId,
                    EventType = item.EventType.ToUpperInvariant(),
                    OccurredAt = item.OccurredAtUtc,
                    ActorType = NormalizeActorType(item.ActorType),
                    Outcome = item.Result.ToUpperInvariant(),
                    Detail = string.IsNullOrWhiteSpace(item.ReasonReference)
                        ? string.Empty
                        : $"reference:{DigestSuffix(item.ReasonReference)}"
                }).ToList()
        };
    }

    private static PublicationProductReleaseView ToReleaseView(PublicationProductRelease release) => new()
    {
        TenantUid = release.TenantUid,
        PublicationId = release.PublicationId,
        ReleaseId = release.ReleaseId,
        Version = release.Version,
        SourceCommit = release.SourceCommit,
        Status = release.Status.ToUpperInvariant(),
        AcceptedAt = release.AcceptedAtUtc,
        SupersededByReleaseId = release.SupersededByReleaseId,
        PackageLockSha256 = release.PackageLockSha256,
        LockfileSha256 = release.LockfileSha256,
        LicensingStatus = release.LicensingStatus.ToUpperInvariant(),
        NoticeStatus = release.NoticeStatus.ToUpperInvariant(),
        ArtifactSha256 = release.ArtifactSha256
    };

    private static PublicationProductJobView ToJobView(PublicationProductJob job)
    {
        var completed = job.Steps.Count(item => item.Status == PublicationProductStates.Completed);
        var next = job.Steps.FirstOrDefault(item => item.Status is PublicationProductStates.Running or PublicationProductStates.Pending);
        return new PublicationProductJobView
        {
            JobId = job.JobId,
            TenantUid = job.TenantUid,
            PublicationId = job.PublicationId,
            ArtifactId = job.ArtifactId,
            State = job.Status switch
            {
                PublicationProductStates.Completed => "SUCCEEDED",
                PublicationProductStates.RolledBack => "ROLLED_BACK",
                PublicationProductStates.Failed => "FAILED",
                PublicationProductStates.Running when completed > 0 => "PARTIAL",
                PublicationProductStates.Running => "RUNNING",
                _ => "PENDING"
            },
            CompletedSteps = completed,
            TotalSteps = job.Steps.Count,
            NextStep = next?.StepId ?? string.Empty,
            DeterministicPlanSha256 = job.DeterministicPlanSha256,
            CanResume = job.Status is PublicationProductStates.Pending or PublicationProductStates.Running or PublicationProductStates.Failed,
            CanRollback = !string.IsNullOrWhiteSpace(job.RollbackReleaseId) &&
                job.Status != PublicationProductStates.RolledBack,
            UpdatedAt = job.UpdatedAtUtc
        };
    }

    private IReadOnlyList<PublicationCredentialReferenceMetadata> SafeCredentialReferences() =>
        _options.CredentialReferences.Where(IsSafeCredentialReference)
            .Select(item => new PublicationCredentialReferenceMetadata
            {
                ReferenceId = item.ReferenceId,
                Provider = item.Provider,
                Status = item.Status,
                FingerprintSha256 = item.FingerprintSha256,
                AclStatus = item.AclStatus,
                Portability = item.Portability,
                LastVerifiedAt = item.LastVerifiedAt
            }).ToList();

    private static bool IsSafeCredentialReference(PublicationCredentialReferenceMetadata item) =>
        IsIdentifier(item.ReferenceId) &&
        item.Provider is "WINDOWS_DPAPI_CURRENT_USER" or "MANAGED_MULTI_OPERATOR_DESIGN_ONLY" &&
        item.Status is "READY" or "HELD" or "SUPERSEDED" or "UNAVAILABLE" &&
        (string.IsNullOrWhiteSpace(item.FingerprintSha256) || IsSha256(item.FingerprintSha256)) &&
        (string.IsNullOrWhiteSpace(item.AclStatus) || IsSafeLabel(item.AclStatus, 64)) &&
        (string.IsNullOrWhiteSpace(item.Portability) || IsSafeLabel(item.Portability, 64)) &&
        (item.Status != "READY" ||
            (IsSha256(item.FingerprintSha256) &&
             IsSafeLabel(item.AclStatus, 64) &&
             IsSafeLabel(item.Portability, 64) &&
             item.LastVerifiedAt.HasValue));

    private static string SafeHostname(string value)
    {
        if (string.IsNullOrWhiteSpace(value) || value.Length > 253 ||
            value.Any(character => !(char.IsLetterOrDigit(character) || character is '.' or '-')))
            return string.Empty;
        return value.ToLowerInvariant();
    }

    private static PublicationFrontendResourceBinding SafeFrontendResourceBinding(
        PublicationFrontendResourceBinding? binding)
    {
        if (binding == null ||
            !IsSafeLabel(binding.Provider, 64) ||
            !HostingClasses.Contains(binding.ResourceKind.ToUpperInvariant()) ||
            !IsSafeResourceReference(binding.ResourceReference) ||
            !IsHostname(binding.DefaultHostname) ||
            !IsSafeLabel(binding.State, 64) ||
            !IsIdentifier(binding.CredentialReferenceId))
            return new PublicationFrontendResourceBinding { State = "HELD" };
        return new PublicationFrontendResourceBinding
        {
            Provider = binding.Provider.ToUpperInvariant(),
            ResourceKind = binding.ResourceKind.ToUpperInvariant(),
            ResourceReference = binding.ResourceReference,
            DefaultHostname = binding.DefaultHostname.ToLowerInvariant(),
            State = binding.State.ToUpperInvariant(),
            CredentialReferenceId = binding.CredentialReferenceId,
            UpdatedAtUtc = binding.UpdatedAtUtc
        };
    }

    private static bool IsSafeOriginBinding(PublicationOriginBinding? binding) =>
        binding != null &&
        TryCanonicalPublicOrigin(binding.Origin, out var origin) &&
        IsHostname(binding.Hostname) &&
        string.Equals(
            new Uri(origin).IdnHost,
            binding.Hostname,
            StringComparison.OrdinalIgnoreCase) &&
        IsSafeLabel(binding.State, 64) &&
        binding.Revision >= 1;

    private static PublicationDomainReadiness SafeDomainReadiness(
        PublicationDomainReadiness? readiness)
    {
        if (readiness == null ||
            !IsSafeLabel(readiness.Stage, 64) ||
            (!string.IsNullOrWhiteSpace(readiness.Hostname) && !IsHostname(readiness.Hostname)) ||
            !IsSafeLabel(readiness.DnsState, 64) ||
            !IsSafeLabel(readiness.TlsState, 64))
            return new PublicationDomainReadiness();
        return new PublicationDomainReadiness
        {
            Stage = readiness.Stage.ToUpperInvariant(),
            Hostname = readiness.Hostname.ToLowerInvariant(),
            DnsState = readiness.DnsState.ToUpperInvariant(),
            TlsState = readiness.TlsState.ToUpperInvariant(),
            OwnerApprovalRequired = true,
            MutationAllowed = false
        };
    }

    private static string NormalizeActorType(string value) => value.ToUpperInvariant() switch
    {
        "TENANT_ADMIN" => "TENANT_ADMIN",
        "SUPER_ADMIN" => "OPERATOR",
        "OPERATOR" => "OPERATOR",
        _ => "SYSTEM"
    };

    private static bool IsSuperAdminActor(string value) =>
        value.ToUpperInvariant() is "SUPER_ADMIN" or "OPERATOR";

    private static string DigestSuffix(string reference)
    {
        var separator = reference.LastIndexOf(':');
        var digest = separator >= 0 ? reference[(separator + 1)..] : reference;
        return digest[..Math.Min(12, digest.Length)];
    }

    private static string? NullIfWhiteSpace(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    private static PublicationProductResult<T> Disabled<T>() =>
        new(PublicationProductResultStatus.Disabled, default, "publication_product_disabled");

    private static PublicationProductResult<T> Invalid<T>(string code) =>
        new(PublicationProductResultStatus.Invalid, default, code);

    private static PublicationProductResult<T> Conflict<T>(string code) =>
        new(PublicationProductResultStatus.Conflict, default, code);

    private static PublicationProductResult<T> Forbidden<T>(string code) =>
        new(PublicationProductResultStatus.Forbidden, default, code);

    private static PublicationProductResult<T> NotFound<T>(string code) =>
        new(PublicationProductResultStatus.NotFound, default, code);

    private static PublicationProductResult<TOut> Forward<TIn, TOut>(PublicationProductResult<TIn> result) =>
        new(result.Status, default, result.ErrorCode);
}
