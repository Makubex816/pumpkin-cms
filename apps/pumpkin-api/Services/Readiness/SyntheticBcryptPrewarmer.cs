using System.Diagnostics;

namespace pumpkin_api.Services.Readiness;

public interface ISyntheticBcryptPrewarmer
{
    Task<long> PrewarmAsync(CancellationToken cancellationToken);
}

public sealed class SyntheticBcryptPrewarmer : ISyntheticBcryptPrewarmer
{
    private const string SyntheticPlaintext = "pumpkin-readiness-prewarm-v1";
    private const string SyntheticCostTwelveHash = "$2a$12$eu29Lce9WoqQcWpUvsZ2lOPJ2ldlb7Oz6fEtnyU8m7qd7WSCvxnxq";

    private static int _processVerificationCount;
    private static readonly Lazy<Task<bool>> ProcessVerification = new(
        () => Task.Run(() =>
        {
            Interlocked.Increment(ref _processVerificationCount);
            return BCrypt.Net.BCrypt.Verify(SyntheticPlaintext, SyntheticCostTwelveHash);
        }),
        LazyThreadSafetyMode.ExecutionAndPublication);

    public static int ProcessVerificationCount => Volatile.Read(ref _processVerificationCount);

    public async Task<long> PrewarmAsync(CancellationToken cancellationToken)
    {
        var timer = Stopwatch.StartNew();
        var verified = await ProcessVerification.Value.WaitAsync(cancellationToken);
        if (!verified)
            throw new TerminalDependencyReadinessException("synthetic_password_verifier_failed");
        return timer.ElapsedMilliseconds;
    }
}
