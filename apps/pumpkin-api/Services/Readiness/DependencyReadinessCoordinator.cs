using System.Collections.ObjectModel;

namespace pumpkin_api.Services.Readiness;

public sealed class DependencyReadinessCoordinator : IHostedService, IDisposable
{
    private readonly IDependencyReadinessProbe _probe;
    private readonly DependencyReadinessRetryPolicy _policy;
    private readonly ILogger<DependencyReadinessCoordinator> _logger;
    private readonly object _startGate = new();
    private readonly CancellationTokenSource _stopping = new();
    private DependencyReadinessSnapshot _snapshot = DependencyReadinessSnapshot.Initial;
    private Task? _initializationTask;
    private bool _disposed;

    public DependencyReadinessCoordinator(
        IDependencyReadinessProbe probe,
        DependencyReadinessRetryPolicy policy,
        ILogger<DependencyReadinessCoordinator> logger)
    {
        _probe = probe;
        _policy = policy;
        _logger = logger;
        if (policy.MaximumAttempts < 1)
            throw new ArgumentOutOfRangeException(nameof(policy), "At least one readiness attempt is required.");
        if (policy.AttemptTimeout <= TimeSpan.Zero)
            throw new ArgumentOutOfRangeException(nameof(policy), "The readiness attempt timeout must be positive.");
    }

    public DependencyReadinessSnapshot Snapshot => Volatile.Read(ref _snapshot);

    public Task EnsureStarted()
    {
        lock (_startGate)
        {
            ObjectDisposedException.ThrowIf(_disposed, this);
            return _initializationTask ??= InitializeAsync(_stopping.Token);
        }
    }

    public Task StartAsync(CancellationToken cancellationToken)
    {
        _ = EnsureStarted();
        return Task.CompletedTask;
    }

    public async Task StopAsync(CancellationToken cancellationToken)
    {
        _stopping.Cancel();
        Task? running;
        lock (_startGate) running = _initializationTask;
        if (running is null) return;
        try
        {
            await running.WaitAsync(cancellationToken);
        }
        catch (OperationCanceledException)
        {
            // Host shutdown is not a dependency-readiness failure.
        }
    }

    private async Task InitializeAsync(CancellationToken stoppingToken)
    {
        for (var attempt = 1; attempt <= _policy.MaximumAttempts; attempt++)
        {
            Publish(DependencyReadinessState.Initializing, "dependencies_initializing", attempt);
            try
            {
                using var bounded = CancellationTokenSource.CreateLinkedTokenSource(stoppingToken);
                bounded.CancelAfter(_policy.AttemptTimeout);
                var timings = await _probe.ProbeAsync(bounded.Token).WaitAsync(bounded.Token);
                Publish(DependencyReadinessState.Ready, null, attempt, timings);
                LogTimings(attempt, timings);
                _logger.LogInformation("DependencyReadiness state=ready attempt={Attempt}", attempt);
                return;
            }
            catch (TerminalDependencyReadinessException error)
            {
                Publish(DependencyReadinessState.FailedTerminal, error.ReasonCode, attempt, error.StageTimingsMs);
                LogTimings(attempt, error.StageTimingsMs);
                _logger.LogError("DependencyReadiness state=failed_terminal attempt={Attempt} reason={ReasonCode}",
                    attempt, error.ReasonCode);
                return;
            }
            catch (RetryableDependencyReadinessException error)
            {
                Publish(DependencyReadinessState.FailedRetryable, error.ReasonCode, attempt, error.StageTimingsMs);
                LogTimings(attempt, error.StageTimingsMs);
                _logger.LogWarning("DependencyReadiness state=failed_retryable attempt={Attempt} reason={ReasonCode}",
                    attempt, error.ReasonCode);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                return;
            }
            catch (OperationCanceledException)
            {
                Publish(DependencyReadinessState.FailedRetryable, "dependency_probe_timeout", attempt);
                _logger.LogWarning("DependencyReadiness state=failed_retryable attempt={Attempt} reason=dependency_probe_timeout", attempt);
            }
            catch (Exception error)
            {
                Publish(DependencyReadinessState.FailedRetryable, "dependency_probe_unavailable", attempt);
                _logger.LogWarning(
                    "DependencyReadiness state=failed_retryable attempt={Attempt} reason=dependency_probe_unavailable category={Category}",
                    attempt,
                    error.GetType().Name);
            }

            if (attempt == _policy.MaximumAttempts)
                return;

            var delayIndex = Math.Min(attempt - 1, _policy.RetryDelays.Count - 1);
            var delay = delayIndex >= 0 ? _policy.RetryDelays[delayIndex] : TimeSpan.Zero;
            if (delay > TimeSpan.Zero)
                await Task.Delay(delay, stoppingToken);
        }
    }

    private void Publish(
        DependencyReadinessState state,
        string? reasonCode,
        int attempt,
        IReadOnlyDictionary<string, long>? timings = null)
    {
        var safeTimings = timings is null
            ? new ReadOnlyDictionary<string, long>(new Dictionary<string, long>(StringComparer.Ordinal))
            : new ReadOnlyDictionary<string, long>(new Dictionary<string, long>(timings, StringComparer.Ordinal));
        Volatile.Write(ref _snapshot, new DependencyReadinessSnapshot(state, reasonCode, attempt, safeTimings));
    }

    private void LogTimings(int attempt, IReadOnlyDictionary<string, long> timings)
    {
        foreach (var timing in timings.OrderBy(entry => entry.Key, StringComparer.Ordinal))
        {
            _logger.LogInformation(
                "DependencyReadinessStage attempt={Attempt} stage={Stage} elapsedMs={ElapsedMs}",
                attempt,
                timing.Key,
                timing.Value);
        }
    }

    public void Dispose()
    {
        lock (_startGate)
        {
            if (_disposed) return;
            _disposed = true;
            _stopping.Cancel();
            _stopping.Dispose();
        }
    }
}
