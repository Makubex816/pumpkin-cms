using System.Text.Json.Serialization;

namespace pumpkin_api.Services.Readiness;

public static class ReadinessEndpoints
{
    public static IServiceCollection AddDependencyReadiness(this IServiceCollection services)
    {
        services.AddSingleton(DependencyReadinessRetryPolicy.Production);
        services.AddSingleton<DependencyReadinessRouteRegistry>();
        services.AddSingleton<ISyntheticBcryptPrewarmer, SyntheticBcryptPrewarmer>();
        services.AddSingleton<IDependencyReadinessProbe, ProductionDependencyReadinessProbe>();
        services.AddSingleton<DependencyReadinessCoordinator>();
        services.AddSingleton<IHostedService>(provider =>
            provider.GetRequiredService<DependencyReadinessCoordinator>());
        return services;
    }

    public static IEndpointRouteBuilder MapDependencyReadiness(this IEndpointRouteBuilder endpoints)
    {
        endpoints.ServiceProvider.GetRequiredService<DependencyReadinessRouteRegistry>().MarkRegistered();
        endpoints.MapGet(AppServiceReadinessContract.Path,
            (HttpContext context, DependencyReadinessCoordinator coordinator) =>
            {
                _ = coordinator.EnsureStarted();
                context.Response.Headers.CacheControl = "no-store";
                context.Response.Headers.Pragma = "no-cache";
                var snapshot = coordinator.Snapshot;
                var response = new DependencyReadinessResponse(
                    snapshot.State == DependencyReadinessState.Ready,
                    AppServiceReadinessContract.WireName(snapshot.State),
                    AppServiceReadinessContract.SafeReasonCode(snapshot.ReasonCode));
                return Results.Json(
                    response,
                    statusCode: AppServiceReadinessContract.StatusCodeFor(snapshot.State));
            })
            .WithTags("Health")
            .WithName("GetDependencyReadiness")
            .WithSummary("Get worker dependency readiness")
            .WithDescription("Returns 200 only after this worker's identity dependencies are ready for traffic.")
            .AllowAnonymous();
        return endpoints;
    }

    public sealed record DependencyReadinessResponse(
        bool Ready,
        string State,
        [property: JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] string? ReasonCode);
}
