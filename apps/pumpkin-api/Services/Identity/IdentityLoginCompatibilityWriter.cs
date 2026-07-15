using System.Security.Cryptography;
using System.Text;
using Microsoft.Azure.Cosmos;
using Microsoft.Extensions.Options;
using pumpkin_net_models.Models;
using LegacyUser = pumpkin_net_models.Models.User;

namespace pumpkin_api.Services.Identity;

public interface IIdentityLoginCompatibilityWriter
{
    Task WriteSuccessfulLoginAsync(LegacyUser legacyUser, string requestId, CancellationToken cancellationToken);
}

public sealed class IdentityLoginCompatibilityWriter : IIdentityLoginCompatibilityWriter, IDisposable
{
    private readonly IdentityFeatureOptions _features;
    private readonly DatabaseSettings _databaseSettings;
    private readonly CosmosClient? _cosmos;

    public IdentityLoginCompatibilityWriter(IOptions<IdentityFeatureOptions> features,
        IOptions<DatabaseSettings> databaseSettings, IOptions<CosmosDbSettings> cosmosSettings)
    {
        _features = features.Value;
        _databaseSettings = databaseSettings.Value;
        if (_databaseSettings.Provider.Equals("CosmosDb", StringComparison.OrdinalIgnoreCase) &&
            !string.IsNullOrWhiteSpace(cosmosSettings.Value.ConnectionString))
        {
            _cosmos = new CosmosClient(cosmosSettings.Value.ConnectionString, new CosmosClientOptions
            {
                Serializer = new CosmosSystemTextJsonSerializer(),
                ConnectionMode = ConnectionMode.Gateway
            });
        }
    }

    public async Task WriteSuccessfulLoginAsync(LegacyUser legacyUser, string requestId, CancellationToken cancellationToken)
    {
        if (!_features.Enabled || !_features.DualWriteEnabled) return;
        if (_cosmos is null || !_databaseSettings.Provider.Equals("CosmosDb", StringComparison.OrdinalIgnoreCase))
            throw new InvalidOperationException("identity_dual_write_provider_unavailable");

        var normalizedEmail = IdentitySecurityService.NormalizeEmail(legacyUser.Email);
        var userId = DeterministicId("user", legacyUser.Id, normalizedEmail);
        var database = _cosmos.GetDatabase(_databaseSettings.CosmosDb.DatabaseName);
        var accounts = database.GetContainer("UserAccounts");
        var timestamp = DateTime.UtcNow;
        await accounts.PatchItemAsync<object>(userId, new PartitionKey("global"),
            [PatchOperation.Set("/lastLoginAt", timestamp), PatchOperation.Set("/updatedAt", timestamp)],
            cancellationToken: cancellationToken);

        var audit = database.GetContainer("SecurityAuditEvents");
        await audit.UpsertItemAsync(new
        {
            id = $"login-{requestId}", auditPartition = "global", eventType = "identity_login_dual_write",
            actorUserId = userId, targetUserId = userId, requestId, result = "success", createdAt = timestamp,
            safeNewMetadataJson = "{\"legacyLastLogin\":true,\"identityLastLogin\":true}"
        }, new PartitionKey("global"), cancellationToken: cancellationToken);
    }

    private static string DeterministicId(params string[] parts) => Convert.ToHexString(
        SHA256.HashData(Encoding.UTF8.GetBytes(string.Join("\n", parts)))).ToLowerInvariant()[..32];

    public void Dispose() => _cosmos?.Dispose();
}
