using pumpkin_net_models.Models;

namespace pumpkin_api.Services.PublicForms;

public static class PublicFormPersistenceContract
{
    public static bool IsValidCandidate(FormEntry entry) =>
        !string.IsNullOrWhiteSpace(entry.TenantId) &&
        !string.IsNullOrWhiteSpace(entry.TenantUid) &&
        !string.IsNullOrWhiteSpace(entry.PublicationId) &&
        !string.IsNullOrWhiteSpace(entry.ReleaseId) &&
        (entry.TicketVersion < 2 ||
            PublicPublicationService.IsBoundedIdentifier(entry.PublicationArtifactId)) &&
        IsLowerHexSha256(entry.ReleaseArtifactSha256) &&
        entry.TicketVersion >= 1 &&
        entry.PublicationRevision >= 1 &&
        entry.PublicationReplayProtectionVersion >= 1 &&
        !string.IsNullOrWhiteSpace(entry.FormMappingId) &&
        !string.IsNullOrWhiteSpace(entry.FieldContractVersion) &&
        IsLowerHexSha256(entry.PublicIdempotencyIdentity) &&
        IsLowerHexSha256(entry.PublicPayloadDigest) &&
        PublicFormCanonicalizer.TryCanonicalGuid(entry.SubmissionId, out var canonicalSubmissionId) &&
        string.Equals(canonicalSubmissionId, entry.SubmissionId, StringComparison.Ordinal) &&
        PublicFormCanonicalizer.TryCanonicalGuid(entry.CorrelationId, out var canonicalCorrelationId) &&
        string.Equals(canonicalCorrelationId, entry.CorrelationId, StringComparison.Ordinal) &&
        string.Equals(entry.Id, PublicFormCanonicalizer.ComputeStorageId(entry.TenantUid, entry.SubmissionId), StringComparison.Ordinal) &&
        string.Equals(entry.IdempotencyKey, entry.SubmissionId, StringComparison.Ordinal) &&
        string.Equals(entry.PublicIdempotencyIdentity, PublicFormCanonicalizer.ComputeIdempotencyIdentity(
            entry.TenantUid, entry.PublicationId, entry.FormMappingId, entry.SubmissionId), StringComparison.Ordinal) &&
        PublicFormCanonicalizer.FixedTimeDigestEquals(
            entry.PublicPayloadDigest, PublicFormCanonicalizer.ComputePayloadDigest(entry));

    public static bool IsReplayOf(FormEntry existing, FormEntry candidate) =>
        string.Equals(existing.Id, candidate.Id, StringComparison.Ordinal) &&
        string.Equals(existing.TenantId, candidate.TenantId, StringComparison.Ordinal) &&
        string.Equals(existing.TenantUid, candidate.TenantUid, StringComparison.Ordinal) &&
        string.Equals(existing.PublicationId, candidate.PublicationId, StringComparison.Ordinal) &&
        string.Equals(existing.ReleaseId, candidate.ReleaseId, StringComparison.Ordinal) &&
        string.Equals(existing.PublicationArtifactId, candidate.PublicationArtifactId, StringComparison.Ordinal) &&
        string.Equals(existing.ReleaseArtifactSha256, candidate.ReleaseArtifactSha256, StringComparison.Ordinal) &&
        existing.TicketVersion == candidate.TicketVersion &&
        existing.PublicationRevision == candidate.PublicationRevision &&
        existing.PublicationReplayProtectionVersion == candidate.PublicationReplayProtectionVersion &&
        string.Equals(existing.FormMappingId, candidate.FormMappingId, StringComparison.Ordinal) &&
        string.Equals(existing.FieldContractVersion, candidate.FieldContractVersion, StringComparison.Ordinal) &&
        string.Equals(existing.FormId, candidate.FormId, StringComparison.Ordinal) &&
        string.Equals(existing.SubmissionId, candidate.SubmissionId, StringComparison.Ordinal) &&
        string.Equals(existing.IdempotencyKey, candidate.IdempotencyKey, StringComparison.Ordinal) &&
        string.Equals(existing.PublicIdempotencyIdentity, candidate.PublicIdempotencyIdentity, StringComparison.Ordinal) &&
        PublicFormCanonicalizer.FixedTimeDigestEquals(existing.PublicPayloadDigest, candidate.PublicPayloadDigest);

    public static PublicFormEntryCreateResult ResolveDuplicate(FormEntry existing, FormEntry candidate)
    {
        if (!IsReplayOf(existing, candidate))
            return new(PublicFormEntryCreateStatus.Conflict, null);
        existing.Metadata ??= new FormEntryMetadata();
        existing.Metadata.IdempotentReplay = true;
        return new(PublicFormEntryCreateStatus.Replay, existing);
    }

    private static bool IsLowerHexSha256(string value) =>
        value.Length == 64 && value.All(character =>
            character is >= '0' and <= '9' or >= 'a' and <= 'f');
}
