using System.Collections.ObjectModel;
using System.Diagnostics;
using System.Net;
using Microsoft.Azure.Cosmos;
using Microsoft.Extensions.Options;
using pumpkin_api.Services.Identity;

namespace pumpkin_api.Services.Readiness;

public sealed class DependencyReadinessRouteRegistry
{
    private int _registered;

    public bool IsRegistered => Volatile.Read(ref _registered) == 1;

    public void MarkRegistered() => Interlocked.Exchange(ref _registered, 1);
}

public sealed class ProductionDependencyReadinessProbe : IDependencyReadinessProbe
{
    private readonly IServiceProvider _services;
    private readonly IConfiguration _configuration;
    private readonly ISyntheticBcryptPrewarmer _bcrypt;
    private readonly ILogger<ProductionDependencyReadinessProbe> _logger;

    public ProductionDependencyReadinessProbe(
        IServiceProvider services,
        IConfiguration configuration,
        ISyntheticBcryptPrewarmer bcrypt,
        ILogger<ProductionDependencyReadinessProbe> logger)
    {
        _services = services;
        _configuration = configuration;
        _bcrypt = bcrypt;
        _logger = logger;
    }

    public async Task<IReadOnlyDictionary<string, long>> ProbeAsync(CancellationToken cancellationToken)
    {
        var timings = new Dictionary<string, long>(StringComparer.Ordinal);
        try
        {
            DatabaseSettings databaseSettings = null!;
            CosmosDbSettings cosmosSettings = null!;
            IOptionsMonitor<IdentityFeatureOptions> featureOptions = null!;

            Stage("configuration", () =>
            {
                databaseSettings = _services.GetRequiredService<IOptions<DatabaseSettings>>().Value;
                cosmosSettings = _services.GetRequiredService<IOptions<CosmosDbSettings>>().Value;
                featureOptions = _services.GetRequiredService<IOptionsMonitor<IdentityFeatureOptions>>();
                ValidateConfiguration(databaseSettings, cosmosSettings, featureOptions.CurrentValue);
            }, timings);

            CosmosDataConnection cosmos = null!;
            Stage("identity_service_graph", () =>
            {
                if (!_services.GetRequiredService<DependencyReadinessRouteRegistry>().IsRegistered)
                    throw new TerminalDependencyReadinessException("readiness_route_not_registered", Snapshot(timings));

                cosmos = _services.GetRequiredService<CosmosDataConnection>();
                _ = _services.GetRequiredService<IDatabaseService>();
                _ = _services.GetRequiredService<IdentityManagementService>();
                _ = _services.GetRequiredService<IIdentityLoginCompatibilityWriter>();
                using var sessionVersionJson = System.Text.Json.JsonDocument.Parse("{\"sessionVersion\":1}");
                if (IdentityLoginCompatibilityWriter.ParseSessionVersion(sessionVersionJson.RootElement) != 1)
                    throw new TerminalDependencyReadinessException("session_version_parser_unavailable", Snapshot(timings));
            }, timings);

            var cosmosTimings = await cosmos.ProbeIdentityReadinessAsync(cancellationToken);
            foreach (var timing in cosmosTimings)
                timings[$"cosmos_{timing.Key}"] = timing.Value;

            var bcryptTimer = Stopwatch.StartNew();
            try
            {
                timings["synthetic_bcrypt"] = await _bcrypt.PrewarmAsync(cancellationToken);
            }
            catch (TerminalDependencyReadinessException error)
            {
                timings["synthetic_bcrypt"] = bcryptTimer.ElapsedMilliseconds;
                throw new TerminalDependencyReadinessException(
                    error.ReasonCode,
                    Snapshot(timings),
                    error.InnerException);
            }
            finally
            {
                timings["synthetic_bcrypt"] = bcryptTimer.ElapsedMilliseconds;
            }
            return Snapshot(timings);
        }
        catch (CosmosIdentityReadinessException error)
        {
            foreach (var timing in error.StageTimingsMs)
                timings[$"cosmos_{timing.Key}"] = timing.Value;
            if (cancellationToken.IsCancellationRequested && error.InnerException is OperationCanceledException)
                throw new OperationCanceledException("cosmos_identity_readiness_cancelled", error, cancellationToken);
            if (error.InnerException is not null && IsRetryable(error.InnerException))
                throw new RetryableDependencyReadinessException(
                    "identity_dependency_unavailable",
                    Snapshot(timings),
                    error.InnerException);
            throw new TerminalDependencyReadinessException(
                "identity_dependency_configuration_invalid",
                Snapshot(timings),
                error.InnerException ?? error);
        }
        catch (TerminalDependencyReadinessException)
        {
            throw;
        }
        catch (RetryableDependencyReadinessException)
        {
            throw;
        }
        catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
        {
            throw;
        }
        catch (Exception error) when (IsRetryable(error))
        {
            throw new RetryableDependencyReadinessException(
                "identity_dependency_unavailable",
                Snapshot(timings),
                error);
        }
        catch (Exception error)
        {
            throw new TerminalDependencyReadinessException(
                "identity_dependency_configuration_invalid",
                Snapshot(timings),
                error);
        }
    }

    private void ValidateConfiguration(
        DatabaseSettings databaseSettings,
        CosmosDbSettings cosmosSettings,
        IdentityFeatureOptions features)
    {
        if (!databaseSettings.Provider.Equals("CosmosDb", StringComparison.OrdinalIgnoreCase))
            throw new TerminalDependencyReadinessException("database_provider_not_supported");
        if (string.IsNullOrWhiteSpace(databaseSettings.CosmosDb.ConnectionString) ||
            string.IsNullOrWhiteSpace(cosmosSettings.ConnectionString) ||
            string.IsNullOrWhiteSpace(databaseSettings.CosmosDb.DatabaseName) ||
            string.IsNullOrWhiteSpace(cosmosSettings.DatabaseName) ||
            !string.Equals(databaseSettings.CosmosDb.DatabaseName, cosmosSettings.DatabaseName, StringComparison.Ordinal))
            throw new TerminalDependencyReadinessException("database_configuration_missing");
        if (!features.Enabled || !features.DualReadEnabled)
            throw new TerminalDependencyReadinessException("identity_foundation_not_active");

        if (!string.Equals(_configuration[AppServiceReadinessContract.WarmupPathSetting], AppServiceReadinessContract.Path, StringComparison.Ordinal) ||
            !string.Equals(_configuration[AppServiceReadinessContract.WarmupStatusesSetting], AppServiceReadinessContract.AcceptedStatusValue, StringComparison.Ordinal) ||
            !string.Equals(_configuration[AppServiceReadinessContract.SwapWarmupPathSetting], AppServiceReadinessContract.Path, StringComparison.Ordinal) ||
            !string.Equals(_configuration[AppServiceReadinessContract.SwapWarmupStatusesSetting], AppServiceReadinessContract.AcceptedStatusValue, StringComparison.Ordinal))
            throw new TerminalDependencyReadinessException("app_service_warmup_contract_missing");

        var jwt = _configuration.GetSection("Jwt");
        var jwtSecret = jwt["SecretKey"];
        if (string.IsNullOrWhiteSpace(jwt["Issuer"]) ||
            string.IsNullOrWhiteSpace(jwt["Audience"]) ||
            string.IsNullOrWhiteSpace(jwtSecret) ||
            jwtSecret.Length < 32 ||
            jwtSecret.StartsWith("REPLACE-", StringComparison.OrdinalIgnoreCase) ||
            !int.TryParse(jwt["ExpirationMinutes"], out var expirationMinutes) ||
            expirationMinutes <= 0)
            throw new TerminalDependencyReadinessException("identity_runtime_configuration_missing");

        _logger.LogInformation(
            "DependencyReadinessConfiguration provider=CosmosDb foundationEnabled={FoundationEnabled} dualReadEnabled={DualReadEnabled}",
            features.Enabled,
            features.DualReadEnabled);
    }

    private static void Stage(
        string name,
        Action action,
        IDictionary<string, long> timings)
    {
        var timer = Stopwatch.StartNew();
        try
        {
            action();
        }
        catch (TerminalDependencyReadinessException error)
        {
            timings[name] = timer.ElapsedMilliseconds;
            throw new TerminalDependencyReadinessException(
                error.ReasonCode,
                Snapshot(timings),
                error.InnerException);
        }
        catch (RetryableDependencyReadinessException error)
        {
            timings[name] = timer.ElapsedMilliseconds;
            throw new RetryableDependencyReadinessException(
                error.ReasonCode,
                Snapshot(timings),
                error.InnerException);
        }
        finally
        {
            timings[name] = timer.ElapsedMilliseconds;
        }
    }

    private static IReadOnlyDictionary<string, long> Snapshot(IEnumerable<KeyValuePair<string, long>> timings) =>
        new ReadOnlyDictionary<string, long>(new Dictionary<string, long>(timings, StringComparer.Ordinal));

    private static bool IsRetryable(Exception error) => error switch
    {
        CosmosException cosmos => cosmos.StatusCode is HttpStatusCode.RequestTimeout or
            HttpStatusCode.TooManyRequests or HttpStatusCode.InternalServerError or
            HttpStatusCode.BadGateway or HttpStatusCode.ServiceUnavailable or
            HttpStatusCode.GatewayTimeout,
        OperationCanceledException => true,
        TimeoutException => true,
        HttpRequestException => true,
        _ when error.InnerException is not null => IsRetryable(error.InnerException),
        _ => false
    };
}
