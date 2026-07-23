using Microsoft.AspNetCore.Cors.Infrastructure;
using Microsoft.Extensions.Options;
using pumpkin_api.Services.PublicForms;
using System.Collections.Concurrent;

namespace pumpkin_api.Services;

public class TenantCorsPolicyProvider : ICorsPolicyProvider
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<TenantCorsPolicyProvider> _logger;
    private readonly DefaultCorsPolicyProvider _defaultProvider;
    private readonly TimeSpan _cacheDuration;
    private readonly ConcurrentDictionary<string, (CorsPolicy? Policy, DateTime ExpiresAt)> _policyCache = new();
    private readonly ConcurrentDictionary<string, (CorsPolicy? Policy, DateTime ExpiresAt)> _publicPolicyCache = new();

    public TenantCorsPolicyProvider(
        IServiceProvider serviceProvider,
        ILogger<TenantCorsPolicyProvider> logger,
        IOptions<CorsOptions> options,
        IConfiguration configuration)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
        _defaultProvider = new DefaultCorsPolicyProvider(options);
        _cacheDuration = TimeSpan.FromMinutes(
            configuration.GetValue<int>("Cors:CacheMinutes", 30));
    }

    public async Task<CorsPolicy?> GetPolicyAsync(HttpContext context, string? policyName)
    {
        if (policyName == "TenantCors")
        {
            var tenantId = context.Request.RouteValues["tenantId"]?.ToString();

            if (string.IsNullOrEmpty(tenantId))
            {
                _logger.LogWarning("TenantCors: No tenantId in route, denying CORS");
                return null;
            }

            if (_policyCache.TryGetValue(tenantId, out var cached) && DateTime.UtcNow < cached.ExpiresAt)
                return cached.Policy;

            var policy = await BuildTenantPolicyAsync(tenantId);
            _policyCache[tenantId] = (policy, DateTime.UtcNow.Add(_cacheDuration));
            _logger.LogDebug("TenantCors: Cached origins for tenant {TenantId} for {Minutes} minutes",
                tenantId, _cacheDuration.TotalMinutes);

            return policy;
        }

        if (policyName == "PublicPublicationCors")
        {
            var publicationId = context.Request.RouteValues["publicationId"]?.ToString();
            if (!PublicPublicationService.IsBoundedIdentifier(publicationId)) return null;
            var boundedPublicationId = publicationId!;
            if (_publicPolicyCache.TryGetValue(boundedPublicationId, out var cached) && DateTime.UtcNow < cached.ExpiresAt)
                return cached.Policy;

            var policy = await BuildPublicPublicationPolicyAsync(boundedPublicationId, context.RequestAborted);
            _publicPolicyCache[boundedPublicationId] = (policy, DateTime.UtcNow.AddSeconds(30));
            return policy;
        }

        return await _defaultProvider.GetPolicyAsync(context, policyName);
    }

    private async Task<CorsPolicy?> BuildPublicPublicationPolicyAsync(string publicationId, CancellationToken requestAborted)
    {
        try
        {
            var databaseService = _serviceProvider.GetRequiredService<IDatabaseService>();
            using var timeout = CancellationTokenSource.CreateLinkedTokenSource(requestAborted);
            timeout.CancelAfter(TimeSpan.FromSeconds(2));
            var publication = await databaseService.GetPublicPublicationAsync(publicationId, timeout.Token);
            var now = DateTimeOffset.UtcNow;
            if (publication == null ||
                !string.Equals(publication.Status, "active", StringComparison.Ordinal) ||
                !string.Equals(publication.IndexingState, "disabled", StringComparison.Ordinal) ||
                (publication.ActiveFromUtc.HasValue && publication.ActiveFromUtc > now) ||
                (publication.ActiveUntilUtc.HasValue && publication.ActiveUntilUtc <= now) ||
                publication.AllowedOrigins.Count == 0)
                return null;

            return new CorsPolicyBuilder()
                .WithOrigins(publication.AllowedOrigins.ToArray())
                .WithMethods("POST")
                .WithHeaders("Content-Type", "X-Pumpkin-Public-Form-Ticket")
                .WithExposedHeaders("X-Pumpkin-Request-Id")
                .Build();
        }
        catch (Exception)
        {
            return null;
        }
    }

    private async Task<CorsPolicy?> BuildTenantPolicyAsync(string tenantId)
    {
        try
        {
            var databaseService = _serviceProvider.GetRequiredService<IDatabaseService>();
            var tenant = await databaseService.GetTenantAsync(tenantId);

            if (tenant?.Settings?.AllowedOrigins == null || tenant.Settings.AllowedOrigins.Length == 0)
            {
                _logger.LogWarning("TenantCors: No allowed origins configured for tenant {TenantId}", tenantId);
                return null;
            }

            return new CorsPolicyBuilder()
                .WithOrigins(tenant.Settings.AllowedOrigins)
                .AllowAnyMethod()
                .AllowAnyHeader()
                .Build();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "TenantCors: Error loading tenant {TenantId}", tenantId);
            return null;
        }
    }
}
