using System.Collections.ObjectModel;

namespace pumpkin_api.Services.Readiness;

public enum DependencyReadinessState
{
    NotStarted,
    Initializing,
    Ready,
    FailedRetryable,
    FailedTerminal
}

public sealed record DependencyReadinessSnapshot(
    DependencyReadinessState State,
    string? ReasonCode,
    int Attempt,
    IReadOnlyDictionary<string, long> StageTimingsMs)
{
    private static IReadOnlyDictionary<string, long> EmptyTimings { get; } =
        new ReadOnlyDictionary<string, long>(new Dictionary<string, long>(StringComparer.Ordinal));

    public static DependencyReadinessSnapshot Initial { get; } = new(
        DependencyReadinessState.NotStarted,
        "initialization_not_started",
        0,
        EmptyTimings);
}

public interface IDependencyReadinessProbe
{
    Task<IReadOnlyDictionary<string, long>> ProbeAsync(CancellationToken cancellationToken);
}

public sealed class RetryableDependencyReadinessException : Exception
{
    public RetryableDependencyReadinessException(
        string reasonCode,
        IReadOnlyDictionary<string, long>? stageTimingsMs = null,
        Exception? innerException = null)
        : base(reasonCode, innerException)
    {
        ReasonCode = reasonCode;
        StageTimingsMs = stageTimingsMs ?? EmptyTimings;
    }

    public string ReasonCode { get; }
    public IReadOnlyDictionary<string, long> StageTimingsMs { get; }

    private static IReadOnlyDictionary<string, long> EmptyTimings { get; } =
        new ReadOnlyDictionary<string, long>(new Dictionary<string, long>(StringComparer.Ordinal));
}

public sealed class TerminalDependencyReadinessException : Exception
{
    public TerminalDependencyReadinessException(
        string reasonCode,
        IReadOnlyDictionary<string, long>? stageTimingsMs = null,
        Exception? innerException = null)
        : base(reasonCode, innerException)
    {
        ReasonCode = reasonCode;
        StageTimingsMs = stageTimingsMs ?? EmptyTimings;
    }

    public string ReasonCode { get; }
    public IReadOnlyDictionary<string, long> StageTimingsMs { get; }

    private static IReadOnlyDictionary<string, long> EmptyTimings { get; } =
        new ReadOnlyDictionary<string, long>(new Dictionary<string, long>(StringComparer.Ordinal));
}

public sealed record DependencyReadinessRetryPolicy(
    int MaximumAttempts,
    TimeSpan AttemptTimeout,
    IReadOnlyList<TimeSpan> RetryDelays)
{
    public static DependencyReadinessRetryPolicy Production { get; } = new(
        MaximumAttempts: 3,
        AttemptTimeout: TimeSpan.FromSeconds(70),
        RetryDelays: [TimeSpan.FromSeconds(2), TimeSpan.FromSeconds(5)]);
}

public static class AppServiceReadinessContract
{
    public const string Path = "/health/ready";
    public const string WarmupPathSetting = "WEBSITE_WARMUP_PATH";
    public const string WarmupStatusesSetting = "WEBSITE_WARMUP_STATUSES";
    public const string SwapWarmupPathSetting = "WEBSITE_SWAP_WARMUP_PING_PATH";
    public const string SwapWarmupStatusesSetting = "WEBSITE_SWAP_WARMUP_PING_STATUSES";
    public const string AcceptedStatusValue = "200";

    public static bool AcceptsWarmupStatus(int statusCode) => statusCode == StatusCodes.Status200OK;

    public static int StatusCodeFor(DependencyReadinessState state) =>
        state == DependencyReadinessState.Ready
            ? StatusCodes.Status200OK
            : StatusCodes.Status503ServiceUnavailable;

    public static string? SafeReasonCode(string? reasonCode) => reasonCode switch
    {
        null => null,
        "initialization_not_started" => reasonCode,
        "dependencies_initializing" => reasonCode,
        "synthetic_password_verifier_failed" => reasonCode,
        "readiness_route_not_registered" => reasonCode,
        "session_version_parser_unavailable" => reasonCode,
        "database_provider_not_supported" => reasonCode,
        "database_configuration_missing" => reasonCode,
        "identity_foundation_not_active" => reasonCode,
        "identity_runtime_configuration_missing" => reasonCode,
        "app_service_warmup_contract_missing" => reasonCode,
        "identity_dependency_unavailable" => reasonCode,
        "identity_dependency_configuration_invalid" => reasonCode,
        "dependency_probe_timeout" => reasonCode,
        "dependency_probe_unavailable" => reasonCode,
        _ => "dependency_not_ready"
    };

    public static string WireName(DependencyReadinessState state) => state switch
    {
        DependencyReadinessState.NotStarted => "not_started",
        DependencyReadinessState.Initializing => "initializing",
        DependencyReadinessState.Ready => "ready",
        DependencyReadinessState.FailedRetryable => "failed_retryable",
        DependencyReadinessState.FailedTerminal => "failed_terminal",
        _ => "failed_terminal"
    };
}
