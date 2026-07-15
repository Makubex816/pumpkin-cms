using System.Security.Cryptography;
using System.Diagnostics;
using System.Text;
using System.Text.Json;
using Microsoft.Azure.Cosmos;
using Microsoft.Extensions.Options;
using pumpkin_net_models.Models;
using LegacyUser = pumpkin_net_models.Models.User;

namespace pumpkin_api.Services.Identity;

public interface IIdentityLoginCompatibilityWriter
{
    Task<long> WriteSuccessfulLoginAsync(LegacyUser legacyUser, string requestId, CancellationToken cancellationToken);
}

public sealed class IdentityLoginCompatibilityWriter : IIdentityLoginCompatibilityWriter, IDisposable
{
    private readonly IOptionsMonitor<IdentityFeatureOptions> _features;
    private readonly DatabaseSettings _databaseSettings;
    private readonly CosmosClient? _cosmos;
    private readonly ILogger<IdentityLoginCompatibilityWriter> _logger;

    public IdentityLoginCompatibilityWriter(IOptionsMonitor<IdentityFeatureOptions> features,
        IOptions<DatabaseSettings> databaseSettings, IOptions<CosmosDbSettings> cosmosSettings,
        ILogger<IdentityLoginCompatibilityWriter> logger)
    {
        _features = features;
        _databaseSettings = databaseSettings.Value;
        _logger = logger;
        if (_databaseSettings.Provider.Equals("CosmosDb", StringComparison.OrdinalIgnoreCase) &&
            !string.IsNullOrWhiteSpace(cosmosSettings.Value.ConnectionString))
        {
            _cosmos = new CosmosClient(cosmosSettings.Value.ConnectionString, new CosmosClientOptions
            {
                Serializer = new CosmosSystemTextJsonSerializer(),
                ConnectionMode = ConnectionMode.Gateway,
                LimitToEndpoint = true,
                RequestTimeout = TimeSpan.FromSeconds(10)
            });
        }
    }

    public async Task<long> WriteSuccessfulLoginAsync(LegacyUser legacyUser, string requestId, CancellationToken cancellationToken)
    {
        var featureState = _features.CurrentValue;
        if (!featureState.Enabled || !featureState.DualWriteEnabled) return 1;
        if (_cosmos is null || !_databaseSettings.Provider.Equals("CosmosDb", StringComparison.OrdinalIgnoreCase))
            throw new InvalidOperationException("identity_dual_write_provider_unavailable");

        var stopwatch = Stopwatch.StartNew();
        var normalizedEmail = IdentitySecurityService.NormalizeEmail(legacyUser.Email);
        var userId = DeterministicId("user", legacyUser.Id, normalizedEmail);
        var database = _cosmos.GetDatabase(_databaseSettings.CosmosDb.DatabaseName);
        var accounts = database.GetContainer("UserAccounts");
        var timestamp = DateTime.UtcNow;
        var sessionVersion = 1L;
        try
        {
            using var bounded = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
            bounded.CancelAfter(TimeSpan.FromSeconds(4));
            _logger.LogInformation("IdentityLoginStage request={RequestId} user={UserId} stage=session-version-read-start provider=Cosmos", requestId, userId);
            using var response = await accounts.ReadItemStreamAsync(userId, new PartitionKey("global"), cancellationToken: bounded.Token);
            response.EnsureSuccessStatusCode();
            using var document = await JsonDocument.ParseAsync(response.Content, cancellationToken: bounded.Token);
            sessionVersion = ParseSessionVersion(document.RootElement);
            _logger.LogInformation("IdentityLoginStage request={RequestId} user={UserId} stage=session-version-read-complete elapsedMs={Elapsed}", requestId, userId, stopwatch.ElapsedMilliseconds);
            await accounts.PatchItemAsync<object>(userId, new PartitionKey("global"),
                [PatchOperation.Set("/lastLoginAt", timestamp), PatchOperation.Set("/updatedAt", timestamp)], cancellationToken: bounded.Token);
            var audit = database.GetContainer("SecurityAuditEvents");
            await audit.UpsertItemAsync(new
            {
                id = $"login-{requestId}", auditPartition = "global", eventType = "identity_login_dual_write",
                actorUserId = userId, targetUserId = userId, requestId, result = "success", createdAt = timestamp,
                safeNewMetadataJson = "{\"legacyLastLogin\":true,\"identityLastLogin\":true}"
            }, new PartitionKey("global"), cancellationToken: bounded.Token);
            _logger.LogInformation("IdentityLoginStage request={RequestId} user={UserId} stage=dual-write-audit-complete elapsedMs={Elapsed}", requestId, userId, stopwatch.ElapsedMilliseconds);
        }
        catch (Exception error) when (error is not OperationCanceledException || !cancellationToken.IsCancellationRequested)
        {
            _logger.LogError("IdentityLoginStage request={RequestId} user={UserId} stage=additive-write-fallback errorCode={ErrorCode}", requestId, userId, error.GetType().Name);
            await TryRecordReconciliationAsync(database, userId, requestId, error.GetType().Name, cancellationToken);
        }
        return sessionVersion;
    }

    public static long ParseSessionVersion(JsonElement root)
    {
        if (!root.TryGetProperty("sessionVersion", out var value) || value.ValueKind is JsonValueKind.Null or JsonValueKind.Undefined) return 1;
        if (value.ValueKind == JsonValueKind.Number && value.TryGetInt64(out var number) && number >= 1) return number;
        if (value.ValueKind == JsonValueKind.String && long.TryParse(value.GetString(), out number) && number >= 1) return number;
        throw new JsonException("session_version_malformed");
    }

    private async Task TryRecordReconciliationAsync(Database database, string userId, string requestId, string errorCode, CancellationToken cancellationToken)
    {
        try
        {
            using var bounded = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
            bounded.CancelAfter(TimeSpan.FromSeconds(2));
            await database.GetContainer("IdentityMigration").UpsertItemAsync(new
            {
                id = $"login-reconcile-{requestId}", migrationPartition = "global", type = "IdentityLoginReconciliation",
                userId, requestId, errorCode, status = "Pending", createdAt = DateTime.UtcNow
            }, new PartitionKey("global"), cancellationToken: bounded.Token);
        }
        catch (Exception reconciliationError)
        {
            _logger.LogError("IdentityLoginStage request={RequestId} user={UserId} stage=reconciliation-write-failed errorCode={ErrorCode}", requestId, userId, reconciliationError.GetType().Name);
        }
    }

    private static string DeterministicId(params string[] parts) => Convert.ToHexString(
        SHA256.HashData(Encoding.UTF8.GetBytes(string.Join("\n", parts)))).ToLowerInvariant()[..32];

    public void Dispose() => _cosmos?.Dispose();
}
