using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Hosting.Server;
using Microsoft.AspNetCore.Hosting.Server.Features;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;
using pumpkin_api.Services.Readiness;

namespace pumpkin_api.Tests;

public static class DependencyAwareReadinessTestRunner
{
    public static async Task RunAsync()
    {
        await InitializingRemainsUnavailableUntilDependenciesPassAsync();
        await RetryableFailureCanRecoverWithinBoundedPolicyAsync();
        await TerminalFailureRemainsUnavailableAsync();
        await RetryExhaustionRemainsUnavailableAsync();
        await ConcurrentStartsAreSingleFlightAsync();
        await HostedHttpEndpointTransitionsFrom503To200Async();
        await SyntheticBcryptPrewarmsOncePerProcessAsync();
        VerifyStatusAndAppServiceContract();
        await VerifyZeroWriteAndSafeSourceContractAsync();

        Console.WriteLine("V2.8.63CRSTU dependency-aware readiness checks passed.");
    }

    private static async Task InitializingRemainsUnavailableUntilDependenciesPassAsync()
    {
        var probe = new BlockingProbe();
        using var coordinator = Coordinator(probe, maximumAttempts: 1);

        Assert(coordinator.Snapshot.State == DependencyReadinessState.NotStarted,
            "Readiness must begin in not_started.");
        Assert(AppServiceReadinessContract.StatusCodeFor(coordinator.Snapshot.State) == 503,
            "not_started must return HTTP 503.");

        var initialization = coordinator.EnsureStarted();
        await WaitForStateAsync(coordinator, DependencyReadinessState.Initializing);
        Assert(AppServiceReadinessContract.StatusCodeFor(coordinator.Snapshot.State) == 503,
            "initializing must return HTTP 503.");

        probe.Release();
        await initialization.WaitAsync(TimeSpan.FromSeconds(2));
        Assert(coordinator.Snapshot.State == DependencyReadinessState.Ready,
            "Dependencies must transition readiness to ready.");
        Assert(AppServiceReadinessContract.StatusCodeFor(coordinator.Snapshot.State) == 200,
            "Only ready may return HTTP 200.");
        Assert(probe.CallCount == 1, "The successful dependency probe must run once.");
    }

    private static async Task RetryableFailureCanRecoverWithinBoundedPolicyAsync()
    {
        var probe = new ScriptedProbe(
            _ => throw new RetryableDependencyReadinessException("cosmos_temporarily_unavailable"),
            _ => Task.FromResult<IReadOnlyDictionary<string, long>>(new Dictionary<string, long>
            {
                ["cosmos_locator_query"] = 1,
                ["cosmos_legacy_point_read"] = 1
            }));
        using var coordinator = Coordinator(
            probe,
            maximumAttempts: 2,
            retryDelays: [TimeSpan.FromMilliseconds(150)]);

        var initialization = coordinator.EnsureStarted();
        await WaitForStateAsync(coordinator, DependencyReadinessState.FailedRetryable);
        Assert(AppServiceReadinessContract.StatusCodeFor(coordinator.Snapshot.State) == 503,
            "A retryable Cosmos failure must keep readiness at HTTP 503.");
        await initialization.WaitAsync(TimeSpan.FromSeconds(2));

        Assert(coordinator.Snapshot.State == DependencyReadinessState.Ready,
            "A bounded retry may recover when dependencies become available.");
        Assert(probe.CallCount == 2, "The bounded retry policy should make exactly two attempts.");
    }

    private static async Task TerminalFailureRemainsUnavailableAsync()
    {
        var probe = new ScriptedProbe(
            _ => throw new TerminalDependencyReadinessException("database_configuration_missing"));
        using var coordinator = Coordinator(probe, maximumAttempts: 3);

        await coordinator.EnsureStarted().WaitAsync(TimeSpan.FromSeconds(2));
        Assert(coordinator.Snapshot.State == DependencyReadinessState.FailedTerminal,
            "A terminal configuration failure must enter failed_terminal.");
        Assert(AppServiceReadinessContract.StatusCodeFor(coordinator.Snapshot.State) == 503,
            "failed_terminal must return HTTP 503.");
        Assert(probe.CallCount == 1, "A terminal failure must not be retried.");
    }

    private static async Task RetryExhaustionRemainsUnavailableAsync()
    {
        var probe = new BlockingProbe();
        using var coordinator = new DependencyReadinessCoordinator(
            probe,
            new DependencyReadinessRetryPolicy(2, TimeSpan.FromMilliseconds(40), []),
            NullLogger<DependencyReadinessCoordinator>.Instance);

        await coordinator.EnsureStarted().WaitAsync(TimeSpan.FromSeconds(2));
        Assert(coordinator.Snapshot.State == DependencyReadinessState.FailedRetryable,
            "Exhausted retryable timeouts must remain failed_retryable.");
        Assert(AppServiceReadinessContract.StatusCodeFor(coordinator.Snapshot.State) == 503,
            "Retry exhaustion must never become ready based on elapsed time.");
        Assert(probe.CallCount == 2, "Retry exhaustion must honor the exact maximum attempt count.");
    }

    private static async Task ConcurrentStartsAreSingleFlightAsync()
    {
        var probe = new BlockingProbe();
        using var coordinator = Coordinator(probe, maximumAttempts: 1);
        var starts = Enumerable.Range(0, 32)
            .Select(_ => Task.Factory.StartNew(coordinator.EnsureStarted))
            .ToArray();
        var initializationTasks = await Task.WhenAll(starts);
        await WaitForStateAsync(coordinator, DependencyReadinessState.Initializing);

        Assert(initializationTasks.All(task => ReferenceEquals(task, initializationTasks[0])),
            "Concurrent readiness callers must share one initialization task.");
        Assert(probe.CallCount == 1, "Concurrent readiness callers must not stampede dependencies.");

        probe.Release();
        await initializationTasks[0].WaitAsync(TimeSpan.FromSeconds(2));
        Assert(coordinator.Snapshot.State == DependencyReadinessState.Ready,
            "The shared initialization task should publish ready once.");
    }

    private static async Task HostedHttpEndpointTransitionsFrom503To200Async()
    {
        var probe = new BlockingProbe();
        var builder = WebApplication.CreateBuilder(new WebApplicationOptions
        {
            Args = [],
            EnvironmentName = Environments.Development
        });
        builder.WebHost.UseUrls("http://127.0.0.1:0");
        builder.Logging.ClearProviders();
        builder.Services.AddSingleton<IDependencyReadinessProbe>(probe);
        builder.Services.AddSingleton(new DependencyReadinessRetryPolicy(1, TimeSpan.FromSeconds(2), []));
        builder.Services.AddSingleton<DependencyReadinessRouteRegistry>();
        builder.Services.AddSingleton<DependencyReadinessCoordinator>();
        builder.Services.AddSingleton<IHostedService>(services =>
            services.GetRequiredService<DependencyReadinessCoordinator>());

        await using var app = builder.Build();
        app.MapGet("/health", () => Results.Ok(new { ok = true })).AllowAnonymous();
        app.MapDependencyReadiness();
        await app.StartAsync();
        try
        {
            var addresses = app.Services.GetRequiredService<IServer>()
                .Features.Get<IServerAddressesFeature>()?.Addresses;
            var address = addresses?.Single() ?? throw new InvalidOperationException("Hosted readiness test address missing.");
            using var client = new HttpClient { BaseAddress = new Uri(address) };

            using var liveness = await client.GetAsync("/health");
            Assert((int)liveness.StatusCode == 200, "Liveness must remain HTTP 200 during dependency initialization.");
            using var unavailable = await client.GetAsync(AppServiceReadinessContract.Path);
            Assert((int)unavailable.StatusCode == 503, "Hosted readiness must begin HTTP 503.");
            Assert(unavailable.Headers.CacheControl?.NoStore == true, "Hosted readiness must emit Cache-Control: no-store.");

            probe.Release();
            var coordinator = app.Services.GetRequiredService<DependencyReadinessCoordinator>();
            await WaitForStateAsync(coordinator, DependencyReadinessState.Ready);
            using var available = await client.GetAsync(AppServiceReadinessContract.Path);
            Assert((int)available.StatusCode == 200, "Hosted readiness must become HTTP 200 after dependencies pass.");
            var payload = await available.Content.ReadAsStringAsync();
            Assert(payload.Contains("\"ready\":true", StringComparison.Ordinal) &&
                payload.Contains("\"state\":\"ready\"", StringComparison.Ordinal),
                "Hosted readiness must return the safe ready payload.");
        }
        finally
        {
            await app.StopAsync();
        }
    }

    private static async Task SyntheticBcryptPrewarmsOncePerProcessAsync()
    {
        var before = SyntheticBcryptPrewarmer.ProcessVerificationCount;
        var prewarmer = new SyntheticBcryptPrewarmer();
        var calls = Enumerable.Range(0, 32)
            .Select(_ => prewarmer.PrewarmAsync(CancellationToken.None));
        _ = await Task.WhenAll(calls).WaitAsync(TimeSpan.FromSeconds(10));
        var after = SyntheticBcryptPrewarmer.ProcessVerificationCount;

        Assert(after == Math.Max(1, before),
            "The fixed synthetic BCrypt verifier must execute at most once per process.");
    }

    private static void VerifyStatusAndAppServiceContract()
    {
        foreach (var state in Enum.GetValues<DependencyReadinessState>())
        {
            var expected = state == DependencyReadinessState.Ready ? 200 : 503;
            Assert(AppServiceReadinessContract.StatusCodeFor(state) == expected,
                $"Unexpected HTTP status for readiness state {state}.");
        }

        Assert(AppServiceReadinessContract.AcceptsWarmupStatus(200),
            "App Service warmup must accept HTTP 200.");
        foreach (var rejected in new[] { 404, 500, 502, 503 })
            Assert(!AppServiceReadinessContract.AcceptsWarmupStatus(rejected),
                $"App Service warmup must reject HTTP {rejected}.");
        Assert(AppServiceReadinessContract.Path == "/health/ready", "The readiness path changed unexpectedly.");
        Assert(AppServiceReadinessContract.AcceptedStatusValue == "200", "Warmup status must be exactly 200.");
        Assert(AppServiceReadinessContract.SafeReasonCode("connection=customer-secret") == "dependency_not_ready",
            "Unknown dependency reasons must be replaced before anonymous output.");
        Assert(AppServiceReadinessContract.WarmupPathSetting == "WEBSITE_WARMUP_PATH", "Warmup path setting changed.");
        Assert(AppServiceReadinessContract.WarmupStatusesSetting == "WEBSITE_WARMUP_STATUSES", "Warmup status setting changed.");
        Assert(AppServiceReadinessContract.SwapWarmupPathSetting == "WEBSITE_SWAP_WARMUP_PING_PATH", "Swap path setting changed.");
        Assert(AppServiceReadinessContract.SwapWarmupStatusesSetting == "WEBSITE_SWAP_WARMUP_PING_STATUSES", "Swap status setting changed.");
        var policy = DependencyReadinessRetryPolicy.Production;
        var boundedWindow = TimeSpan.FromTicks(
            policy.AttemptTimeout.Ticks * policy.MaximumAttempts +
            policy.RetryDelays.Sum(delay => delay.Ticks));
        Assert(boundedWindow > TimeSpan.FromSeconds(136.542),
            "The bounded recovery window must cover the measured CRST cold initialization.");
        Assert(boundedWindow < TimeSpan.FromSeconds(230),
            "The readiness retry policy must stay inside the existing App Service startup budget.");

        var response = new ReadinessEndpoints.DependencyReadinessResponse(
            false,
            "failed_retryable",
            AppServiceReadinessContract.SafeReasonCode("connection=customer-secret"));
        using var json = System.Text.Json.JsonDocument.Parse(System.Text.Json.JsonSerializer.Serialize(
            response,
            new System.Text.Json.JsonSerializerOptions(System.Text.Json.JsonSerializerDefaults.Web)));
        var fields = json.RootElement.EnumerateObject().Select(property => property.Name).ToArray();
        Assert(fields.SequenceEqual(new[] { "ready", "state", "reasonCode" }),
            "Anonymous readiness JSON must contain exactly the three safe fields.");
        Assert(!json.RootElement.GetRawText().Contains("customer-secret", StringComparison.Ordinal),
            "Anonymous readiness JSON must sanitize unknown reason content.");
    }

    private static async Task VerifyZeroWriteAndSafeSourceContractAsync()
    {
        var root = FindRepoRoot();
        var program = await File.ReadAllTextAsync(Path.Combine(root, "apps", "pumpkin-api", "Program.cs"));
        var cosmos = await File.ReadAllTextAsync(Path.Combine(root, "apps", "pumpkin-api", "Services", "CosmosDataConnection.cs"));
        var endpoints = await File.ReadAllTextAsync(Path.Combine(root, "apps", "pumpkin-api", "Services", "Readiness", "ReadinessEndpoints.cs"));
        var contracts = await File.ReadAllTextAsync(Path.Combine(root, "apps", "pumpkin-api", "Services", "Readiness", "DependencyReadinessContracts.cs"));
        var coordinator = await File.ReadAllTextAsync(Path.Combine(root, "apps", "pumpkin-api", "Services", "Readiness", "DependencyReadinessCoordinator.cs"));
        var probe = await File.ReadAllTextAsync(Path.Combine(root, "apps", "pumpkin-api", "Services", "Readiness", "DependencyReadinessProbe.cs"));
        var bcrypt = await File.ReadAllTextAsync(Path.Combine(root, "apps", "pumpkin-api", "Services", "Readiness", "SyntheticBcryptPrewarmer.cs"));

        Assert(program.Contains("app.MapGet(\"/health\", GetHealth)", StringComparison.Ordinal),
            "Existing /health liveness must remain registered.");
        Assert(program.Contains("app.MapGet(\"/api/health\", GetHealth)", StringComparison.Ordinal),
            "Existing /api/health liveness must remain registered.");
        Assert(program.Contains("providerStatus = \"not_checked\"", StringComparison.Ordinal),
            "Liveness must remain dependency-light.");
        Assert(program.Contains("app.MapDependencyReadiness()", StringComparison.Ordinal),
            "The dedicated readiness route must be mapped.");
        Assert(program.Contains("AppServiceReadinessContract.Path", StringComparison.Ordinal),
            "The anonymous health-path bypass must include readiness.");

        Assert(endpoints.Contains("Headers.CacheControl = \"no-store\"", StringComparison.Ordinal),
            "Readiness responses must be no-store.");
        Assert(endpoints.Contains(".AllowAnonymous()", StringComparison.Ordinal),
            "Readiness must be anonymous for App Service warmup.");
        Assert(endpoints.Contains("bool Ready,", StringComparison.Ordinal) &&
            endpoints.Contains("string State,", StringComparison.Ordinal) &&
            endpoints.Contains("string? ReasonCode", StringComparison.Ordinal),
            "Readiness output must contain only the safe readiness fields.");
        foreach (var forbiddenOutput in new[] { "ConnectionString", "DatabaseName", "PasswordHash", "LoginEmail", "UserId", "TenantId" })
            Assert(!endpoints.Contains(forbiddenOutput, StringComparison.OrdinalIgnoreCase),
                $"Readiness output source must not expose {forbiddenOutput}.");

        var cosmosProbe = SliceBetween(cosmos,
            "public async Task<IReadOnlyDictionary<string, long>> ProbeIdentityReadinessAsync",
            "private Task GetAccountMetadataTask()");
        foreach (var requiredRead in new[] { "ReadAsync", "ReadContainerAsync", "GetItemQueryIterator", "ReadNextAsync", "ReadItemStreamAsync" })
            Assert(cosmosProbe.Contains(requiredRead, StringComparison.Ordinal),
                $"Cosmos readiness must include bounded {requiredRead}.");
        foreach (var forbiddenWrite in new[]
        {
            "CreateItem", "UpsertItem", "ReplaceItem", "PatchItem", "DeleteItem",
            "UpdateUserLastLogin", "SaveForm", "AuditAsync"
        })
            Assert(!cosmosProbe.Contains(forbiddenWrite, StringComparison.Ordinal),
                $"Cosmos readiness must remain zero-write: {forbiddenWrite}.");
        Assert(cosmosProbe.Contains("PartitionKey = new PartitionKey(\"global\")", StringComparison.Ordinal),
            "The locator query must be partition-pinned.");
        Assert(cosmosProbe.Contains("SELECT TOP 1 VALUE 1", StringComparison.Ordinal) &&
            cosmosProbe.Contains("__PUMPKIN_READINESS_PROBE__@READINESS.INVALID", StringComparison.Ordinal),
            "The locator query must use only the fixed synthetic sentinel and constant projection.");
        Assert(cosmosProbe.Contains("00000000-0000-0000-0000-000000000000", StringComparison.Ordinal) &&
            cosmosProbe.Contains("__identity_readiness_probe__", StringComparison.Ordinal) &&
            cosmosProbe.Contains("response.StatusCode != HttpStatusCode.NotFound", StringComparison.Ordinal),
            "The legacy path must use the fixed expected-miss point read.");
        Assert(!cosmosProbe.Contains("legacyUserId", StringComparison.OrdinalIgnoreCase) &&
            !cosmosProbe.Contains("legacyTenantId", StringComparison.OrdinalIgnoreCase),
            "Readiness must not project customer locator identifiers.");
        Assert(!cosmosProbe.Contains("password", StringComparison.OrdinalIgnoreCase),
            "The Cosmos readiness probe must not project a credential.");
        Assert(cosmosProbe.Contains("TimeSpan.FromSeconds(65)", StringComparison.Ordinal),
            "Each cold Cosmos stage must remain bounded while covering the measured initialization window.");

        Assert(bcrypt.Contains("Lazy<Task<bool>>", StringComparison.Ordinal),
            "BCrypt prewarm must be one process-wide lazy task.");
        Assert(bcrypt.Contains("$2a$12$", StringComparison.Ordinal),
            "BCrypt prewarm must retain cost 12.");
        Assert(bcrypt.Contains("BCrypt.Net.BCrypt.Verify(SyntheticPlaintext, SyntheticCostTwelveHash)", StringComparison.Ordinal),
            "BCrypt prewarm must use only the fixed synthetic vector.");
        Assert(!bcrypt.Contains("HashPassword", StringComparison.Ordinal),
            "Readiness must not generate or lower a password hash.");

        var stateMachineSource = contracts + coordinator;
        Assert(stateMachineSource.Contains("DependencyReadinessState.NotStarted", StringComparison.Ordinal), "Missing not_started state.");
        Assert(stateMachineSource.Contains("DependencyReadinessState.Initializing", StringComparison.Ordinal), "Missing initializing state.");
        Assert(stateMachineSource.Contains("DependencyReadinessState.Ready", StringComparison.Ordinal), "Missing ready state.");
        Assert(stateMachineSource.Contains("DependencyReadinessState.FailedRetryable", StringComparison.Ordinal), "Missing failed_retryable state.");
        Assert(stateMachineSource.Contains("DependencyReadinessState.FailedTerminal", StringComparison.Ordinal), "Missing failed_terminal state.");
        Assert(coordinator.Contains("var timings = await _probe.ProbeAsync", StringComparison.Ordinal),
            "Ready must be dependency-result-driven, not elapsed-time-driven.");
        Assert(!coordinator.Contains("Thread.Sleep", StringComparison.Ordinal),
            "A fixed sleep cannot establish readiness.");
        foreach (var forbiddenMutation in new[] { "AuditAsync", "UpdateUserLastLogin", "PatchItem", "UpsertItem" })
            Assert(!probe.Contains(forbiddenMutation, StringComparison.Ordinal),
                $"Identity service initialization must not mutate state: {forbiddenMutation}.");
        foreach (var requiredSetting in new[]
        {
            "AppServiceReadinessContract.WarmupPathSetting",
            "AppServiceReadinessContract.WarmupStatusesSetting",
            "AppServiceReadinessContract.SwapWarmupPathSetting",
            "AppServiceReadinessContract.SwapWarmupStatusesSetting"
        })
            Assert(probe.Contains(requiredSetting, StringComparison.Ordinal),
                $"Production readiness must validate {requiredSetting}.");
        Assert(probe.Contains("OperationCanceledException => true", StringComparison.Ordinal),
            "A bounded Cosmos stage timeout must remain retryable.");
    }

    private static DependencyReadinessCoordinator Coordinator(
        IDependencyReadinessProbe probe,
        int maximumAttempts,
        IReadOnlyList<TimeSpan>? retryDelays = null) =>
        new(
            probe,
            new DependencyReadinessRetryPolicy(
                maximumAttempts,
                TimeSpan.FromSeconds(1),
                retryDelays ?? []),
            NullLogger<DependencyReadinessCoordinator>.Instance);

    private static async Task WaitForStateAsync(
        DependencyReadinessCoordinator coordinator,
        DependencyReadinessState state)
    {
        using var timeout = new CancellationTokenSource(TimeSpan.FromSeconds(2));
        while (coordinator.Snapshot.State != state)
            await Task.Delay(5, timeout.Token);
    }

    private static string SliceBetween(string source, string startMarker, string endMarker)
    {
        var start = source.IndexOf(startMarker, StringComparison.Ordinal);
        Assert(start >= 0, $"Missing start marker: {startMarker}");
        var end = source.IndexOf(endMarker, start, StringComparison.Ordinal);
        Assert(end > start, $"Missing end marker after {startMarker}: {endMarker}");
        return source[start..end];
    }

    private static string FindRepoRoot()
    {
        var current = new DirectoryInfo(Directory.GetCurrentDirectory());
        while (current is not null)
        {
            if (File.Exists(Path.Combine(current.FullName, "apps", "pumpkin-api", "Program.cs")))
                return current.FullName;
            current = current.Parent;
        }
        throw new DirectoryNotFoundException("Could not locate pumpkin-cms repo root.");
    }

    private static void Assert(bool condition, string message)
    {
        if (!condition) throw new InvalidOperationException(message);
    }

    private sealed class BlockingProbe : IDependencyReadinessProbe
    {
        private readonly TaskCompletionSource _release = new(TaskCreationOptions.RunContinuationsAsynchronously);
        private int _callCount;

        public int CallCount => Volatile.Read(ref _callCount);

        public async Task<IReadOnlyDictionary<string, long>> ProbeAsync(CancellationToken cancellationToken)
        {
            Interlocked.Increment(ref _callCount);
            await _release.Task.WaitAsync(cancellationToken);
            return new Dictionary<string, long> { ["all_dependencies"] = 1 };
        }

        public void Release() => _release.TrySetResult();
    }

    private sealed class ScriptedProbe : IDependencyReadinessProbe
    {
        private readonly Queue<Func<CancellationToken, Task<IReadOnlyDictionary<string, long>>>> _steps;
        private int _callCount;

        public ScriptedProbe(params Func<CancellationToken, Task<IReadOnlyDictionary<string, long>>>[] steps) =>
            _steps = new Queue<Func<CancellationToken, Task<IReadOnlyDictionary<string, long>>>>(steps);

        public int CallCount => Volatile.Read(ref _callCount);

        public Task<IReadOnlyDictionary<string, long>> ProbeAsync(CancellationToken cancellationToken)
        {
            Interlocked.Increment(ref _callCount);
            return _steps.Dequeue()(cancellationToken);
        }
    }
}
