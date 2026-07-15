namespace pumpkin_api.Services.Identity;

public sealed record IdentityContainerDefinition(string Name, string PartitionKey, IReadOnlyList<string> UniqueKeys,
    IReadOnlyList<string> Indexes, bool SoftDelete, bool PortableBackup);

public static class IdentityProviderParity
{
    public static IReadOnlyList<IdentityContainerDefinition> Definitions { get; } =
    [
        new("UserAccounts", "/userId", ["/normalizedEmail", "/userId"], ["/status", "/globalRole"], true, false),
        new("TenantMemberships", "/tenantUid", ["/tenantUid,/userId", "/membershipId"], ["/userId", "/status", "/role"], true, true),
        new("TenantIdentifierAliases", "/tenantUid", ["/previousSlug"], ["/canonicalSlug", "/status"], true, true),
        new("TenantRenameJobs", "/tenantUid", ["/id"], ["/status", "/requestedSlug"], true, true),
        new("IdentityRequests", "/userId", ["/id"], ["/status", "/expiresAt"], true, false),
        new("TenantContactSettings", "/tenantUid", ["/tenantUid"], ["/deliveryCapability"], true, true),
        new("IdentityNotificationOutbox", "/recipientNormalizedEmail", ["/deduplicationKey"], ["/status", "/nextAttemptAt"], true, false),
        new("SecurityAuditEvents", "/targetTenantUid", ["/id"], ["/eventType", "/actorUserId", "/targetUserId", "/createdAt"], false, true),
        new("IdentityMigration", "/id", ["/id"], ["/status", "/category"], true, true)
    ];

    public static void AssertEquivalent(string providerName, IReadOnlyList<IdentityContainerDefinition> actual)
    {
        if (providerName is not ("CosmosDb" or "MongoDb")) throw new InvalidOperationException("unsupported_identity_provider");
        if (actual.Count != Definitions.Count || Definitions.Any(x => !actual.Any(y => y == x)))
            throw new InvalidOperationException("identity_provider_contract_mismatch");
    }
}
