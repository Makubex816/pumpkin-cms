using System.Diagnostics;
using System.Text.Json;
using Microsoft.Azure.Cosmos;
using Microsoft.Extensions.Options;
using pumpkin_net_models.Models;

namespace pumpkin_api.Services.Identity;

public interface IIdentityLoginCompatibilityWriter
{
    Task<IdentityLoginWriteResult> WriteSuccessfulLoginAsync(
        IdentityLoginAuthorityResult authority,
        string requestId,
        string sessionId,
        DateTime expiresAt,
        CancellationToken cancellationToken);
}

public sealed record IdentityLoginWriteResult(long SessionVersion, long IdentityWriteMs, long SessionWriteMs, long AuditWriteMs);

public sealed class IdentityLoginCompatibilityWriter : IIdentityLoginCompatibilityWriter
{
    private readonly IOptionsMonitor<IdentityFeatureOptions> _features;
    private readonly DatabaseSettings _databaseSettings;
    private readonly CosmosClient? _cosmos;
    private readonly ILogger<IdentityLoginCompatibilityWriter> _logger;

    public IdentityLoginCompatibilityWriter(IOptionsMonitor<IdentityFeatureOptions> features,
        IOptions<DatabaseSettings> databaseSettings, IServiceProvider serviceProvider,
        ILogger<IdentityLoginCompatibilityWriter> logger)
    {
        _features = features;
        _databaseSettings = databaseSettings.Value;
        _logger = logger;
        if (_databaseSettings.Provider.Equals("CosmosDb", StringComparison.OrdinalIgnoreCase) &&
            !string.IsNullOrWhiteSpace(_databaseSettings.CosmosDb.ConnectionString))
            _cosmos = serviceProvider.GetRequiredService<CosmosDataConnection>().SharedClient;
    }

    public async Task<IdentityLoginWriteResult> WriteSuccessfulLoginAsync(
        IdentityLoginAuthorityResult authority,
        string requestId,
        string sessionId,
        DateTime expiresAt,
        CancellationToken cancellationToken)
    {
        var featureState = _features.CurrentValue;
        if (!authority.Authorized)
            throw new UnauthorizedAccessException("identity_login_authority_rejected");
        if (!featureState.Enabled || !featureState.DualWriteEnabled)
            return new(authority.SessionVersion, 0, 0, 0);
        if (_cosmos is null || !_databaseSettings.Provider.Equals("CosmosDb", StringComparison.OrdinalIgnoreCase))
            throw new InvalidOperationException("identity_dual_write_provider_unavailable");
        if (string.IsNullOrWhiteSpace(sessionId)) throw new ArgumentException("session id is required", nameof(sessionId));
        if (string.IsNullOrWhiteSpace(authority.AccountId) || string.IsNullOrWhiteSpace(authority.UserId))
            throw new InvalidOperationException("identity_login_authority_linkage_missing");

        var stopwatch = Stopwatch.StartNew();
        var userId = authority.UserId;
        var accountId = authority.AccountId;
        var database = _cosmos.GetDatabase(_databaseSettings.CosmosDb.DatabaseName);
        var accounts = database.GetContainer("UserAccounts");
        var timestamp = DateTime.UtcNow;
        var sessionVersion = authority.SessionVersion;
        var identityWriteMs = 0L;
        var sessionWriteMs = 0L;
        var auditWriteMs = 0L;
        try
        {
            using var bounded = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
            bounded.CancelAfter(TimeSpan.FromSeconds(4));
            var identityWriteTimer = Stopwatch.StartNew();
            try
            {
                await accounts.PatchItemAsync<object>(accountId, new PartitionKey("global"),
                    [PatchOperation.Set("/lastLoginAt", timestamp), PatchOperation.Set("/updatedAt", timestamp)],
                    requestOptions: new PatchItemRequestOptions
                    {
                        FilterPredicate = $"FROM c WHERE c.status = 'Active' AND (c.sessionVersion = {sessionVersion.ToString(System.Globalization.CultureInfo.InvariantCulture)} OR c.sessionVersion = '{sessionVersion.ToString(System.Globalization.CultureInfo.InvariantCulture)}')"
                    },
                    cancellationToken: bounded.Token);
            }
            finally
            {
                identityWriteMs = identityWriteTimer.ElapsedMilliseconds;
            }

            var sessionWriteTimer = Stopwatch.StartNew();
            try
            {
                await database.GetContainer("IdentityRequests").UpsertItemAsync(new
                {
                    id = sessionId,
                    requestPartition = userId,
                    type = "UserSession",
                    userId, requestId,
                    sessionVersion,
                    lastSeenAt = timestamp,
                    expiresAt,
                    createdAt = timestamp,
                    updatedAt = timestamp
                }, new PartitionKey(userId), cancellationToken: bounded.Token);
            }
            finally
            {
                sessionWriteMs = sessionWriteTimer.ElapsedMilliseconds;
            }

            var audit = database.GetContainer("SecurityAuditEvents");
            var auditWriteTimer = Stopwatch.StartNew();
            try
            {
                await audit.UpsertItemAsync(new
                {
                    id = $"login-{requestId}", auditPartition = "global", eventType = "identity_login_dual_write",
                    actorUserId = userId, targetUserId = userId, requestId, result = "success", createdAt = timestamp,
                    safeNewMetadataJson = "{\"legacyLastLogin\":true,\"identityLastLogin\":true,\"sessionRecorded\":true}"
                }, new PartitionKey("global"), cancellationToken: bounded.Token);
            }
            finally
            {
                auditWriteMs = auditWriteTimer.ElapsedMilliseconds;
            }
            _logger.LogInformation("IdentityLoginStage request={RequestId} stage=dual-write-audit-complete elapsedMs={Elapsed}", requestId, stopwatch.ElapsedMilliseconds);
        }
        catch (Exception error)
        {
            _logger.LogError("IdentityLoginStage request={RequestId} user={UserId} stage=dual-write-incomplete errorCode={ErrorCode}", requestId, userId, error.GetType().Name);
            await TryRecordReconciliationAsync(database, userId, requestId, error.GetType().Name);
            if (error is OperationCanceledException && cancellationToken.IsCancellationRequested) throw;
            throw new InvalidOperationException("identity_login_dual_write_incomplete", error);
        }
        return new(sessionVersion, identityWriteMs, sessionWriteMs, auditWriteMs);
    }

    public static long ParseSessionVersion(JsonElement root)
    {
        if (!root.TryGetProperty("sessionVersion", out var value) || value.ValueKind is JsonValueKind.Null or JsonValueKind.Undefined) return 1;
        if (value.ValueKind == JsonValueKind.Number && value.TryGetInt64(out var number) && number >= 1) return number;
        if (value.ValueKind == JsonValueKind.String && long.TryParse(value.GetString(), out number) && number >= 1) return number;
        throw new JsonException("session_version_malformed");
    }

    private async Task TryRecordReconciliationAsync(Database database, string userId, string requestId, string errorCode)
    {
        try
        {
            using var bounded = new CancellationTokenSource(TimeSpan.FromSeconds(2));
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

}
