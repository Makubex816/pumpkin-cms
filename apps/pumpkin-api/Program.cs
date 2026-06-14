using pumpkin_api.Services;
using pumpkin_api.Managers;
using pumpkin_net_models.Models;
using System.Text.Json.Serialization;
using Microsoft.OpenApi.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Cors.Infrastructure;
using Microsoft.Extensions.FileProviders;

var builder = WebApplication.CreateBuilder(args);

// Configure JSON serialization options for handling polymorphic HTML blocks
builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.Converters.Add(new HtmlBlockBaseJsonConverter());
    options.SerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
});

// Add Swagger/OpenAPI services
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Pumpkin CMS API",
        Version = "v1",
        Description = "A flexible, headless CMS API for managing pages, forms, and content with multi-tenant support",
        Contact = new OpenApiContact
        {
            Name = "Pumpkin CMS",
            Url = new Uri("https://github.com/sdi-ai/pumpkin-cms")
        }
    });

    // Add API Key authentication scheme
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "API Key authorization using the Bearer scheme. Enter your API key in the text input below.",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "API Key"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// Configure Database settings
builder.Services.Configure<DatabaseSettings>(
    builder.Configuration.GetSection(DatabaseSettings.SectionName));

// Configure Cosmos DB settings
builder.Services.Configure<CosmosDbSettings>(
    builder.Configuration.GetSection($"{DatabaseSettings.SectionName}:CosmosDb"));

// Configure MongoDB settings
builder.Services.Configure<MongoDbSettings>(
    builder.Configuration.GetSection($"{DatabaseSettings.SectionName}:MongoDb"));

// Configure JWT authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        var jwtSettings = builder.Configuration.GetSection("Jwt");
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings["Issuer"],
            ValidAudience = jwtSettings["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                System.Text.Encoding.UTF8.GetBytes(jwtSettings["SecretKey"]!))
        };
    });

builder.Services.AddAuthorization();

// Configure CORS
// Admin/auth routes use the "AllowAll" policy (access is controlled by JWT).
// Content routes use the "TenantCors" policy, which resolves per-tenant allowed origins from the database.
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader();
    });
});
builder.Services.AddSingleton<ICorsPolicyProvider, TenantCorsPolicyProvider>();

// Register data connection implementations
builder.Services.AddSingleton<CosmosDataConnection>();
builder.Services.AddSingleton<MongoDataConnection>();

// Register the main database service (singleton for connection reuse)
builder.Services.AddSingleton<IDatabaseService, DatabaseService>();
builder.Services.AddSingleton<IMediaStorageService, MediaStorageService>();
builder.Services.AddOutboundLinkReadOnlyFoundation();
builder.Services.AddOutboundLinkWriteFoundation();
builder.Services.AddAuditJobReadOnlyFoundation();
builder.Services.AddImportIntakeReadOnlyFoundation();

var app = builder.Build();

// Configure CORS (must be before authentication/authorization).
// "AllowAll" is the default for admin/auth routes; content routes override with "TenantCors".
app.UseCors("AllowAll");

// Configure authentication and authorization
app.UseAuthentication();
app.UseAuthorization();

// Local development media serving. Production media should use Azure Blob/CDN-compatible storage.
var localMediaRoot = Path.Combine(app.Environment.ContentRootPath, ".local-media");
Directory.CreateDirectory(localMediaRoot);
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(localMediaRoot),
    RequestPath = "/media"
});

// Configure Swagger UI
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "Pumpkin CMS API v0.2");
        options.RoutePrefix = "swagger";
        options.DocumentTitle = "Pumpkin CMS API Documentation";
        options.DefaultModelsExpandDepth(2);
        options.DefaultModelExpandDepth(2);
    });
}

// Root endpoint
app.MapGet("/", PumpkinManager.GetWelcomeMessage)
    .WithTags("General")
    .WithSummary("Welcome message")
    .WithDescription("Returns a welcome message for the Pumpkin CMS API");

// Main API endpoint - Get page by slug with API key authentication via Authorization header
app.MapGet("/api/pages/{tenantId}/{**pageSlug}",
    async (IDatabaseService databaseService, string tenantId, string pageSlug, HttpContext context, ILogger<Program> logger) =>
    {
        // Extract API key from Authorization header (Bearer token format)
        var authHeader = context.Request.Headers.Authorization.FirstOrDefault();
        var apiKey = string.Empty;

        if (!string.IsNullOrEmpty(authHeader) && authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
        {
            apiKey = authHeader.Substring("Bearer ".Length).Trim();
        }

        // Decode the pageSlug in case it's URL encoded
        var decodedPageSlug = Uri.UnescapeDataString(pageSlug);

        return await PumpkinManager.GetPageAsync(databaseService, apiKey, tenantId, decodedPageSlug, logger);
    })
    .WithTags("Pages")
    .WithName("GetPage")
    .WithSummary("Get a published page by slug")
    .WithDescription("Retrieves a published page by its slug for a specific tenant. Requires API key authentication via Authorization header (Bearer {apiKey})")
    .RequireCors("TenantCors");

// Save a new page
app.MapPost("/api/pages/{tenantId}",
    async (IDatabaseService databaseService, string tenantId, pumpkin_net_models.Models.Page page, HttpContext context) =>
    {
        // Extract API key from Authorization header (Bearer token format)
        var authHeader = context.Request.Headers.Authorization.FirstOrDefault();
        var apiKey = string.Empty;

        if (!string.IsNullOrEmpty(authHeader) && authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
        {
            apiKey = authHeader.Substring("Bearer ".Length).Trim();
        }

        return await PumpkinManager.SavePageAsync(databaseService, apiKey, tenantId, page);
    })
    .WithTags("Pages")
    .WithName("SavePage")
    .WithSummary("Create a new page")
    .WithDescription("Creates a new page for a specific tenant. Requires API key authentication via Authorization header (Bearer {apiKey})")
    .RequireCors("TenantCors");

// Update an existing page
app.MapPut("/api/pages/{tenantId}/{**pageSlug}",
    async (IDatabaseService databaseService, string tenantId, string pageSlug, pumpkin_net_models.Models.Page page, HttpContext context) =>
    {
        // Extract API key from Authorization header (Bearer token format)
        var authHeader = context.Request.Headers.Authorization.FirstOrDefault();
        var apiKey = string.Empty;

        if (!string.IsNullOrEmpty(authHeader) && authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
        {
            apiKey = authHeader.Substring("Bearer ".Length).Trim();
        }

        return await PumpkinManager.UpdatePageAsync(databaseService, apiKey, tenantId, pageSlug, page);
    })
    .WithTags("Pages")
    .WithName("UpdatePage")
    .WithSummary("Update an existing page by slug")
    .WithDescription("Updates an existing page by its slug for a specific tenant. Requires API key authentication via Authorization header (Bearer {apiKey})")
    .RequireCors("TenantCors");

// Delete a page
app.MapDelete("/api/pages/{tenantId}/{**pageSlug}",
    async (IDatabaseService databaseService, string tenantId, string pageSlug, HttpContext context) =>
    {
        // Extract API key from Authorization header (Bearer token format)
        var authHeader = context.Request.Headers.Authorization.FirstOrDefault();
        var apiKey = string.Empty;

        if (!string.IsNullOrEmpty(authHeader) && authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
        {
            apiKey = authHeader.Substring("Bearer ".Length).Trim();
        }

        return await PumpkinManager.DeletePageAsync(databaseService, apiKey, tenantId, pageSlug);
    })
    .WithTags("Pages")
    .WithName("DeletePage")
    .WithSummary("Delete a page by slug")
    .WithDescription("Deletes a page by its slug for a specific tenant. Requires API key authentication via Authorization header (Bearer {apiKey})")
    .RequireCors("TenantCors");

// Save a form entry
app.MapPost("/api/forms/{tenantId}/entries",
    async (IDatabaseService databaseService, string tenantId, FormEntry formEntry, HttpContext context) =>
    {
        // Extract API key from Authorization header (Bearer token format)
        var authHeader = context.Request.Headers.Authorization.FirstOrDefault();
        var apiKey = string.Empty;

        if (!string.IsNullOrEmpty(authHeader) && authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
        {
            apiKey = authHeader.Substring("Bearer ".Length).Trim();
        }

        return await PumpkinManager.SaveFormEntryAsync(databaseService, apiKey, tenantId, formEntry);
    })
    .WithTags("Forms")
    .WithName("SaveFormEntry")
    .WithSummary("Submit a form entry")
    .WithDescription("Submits a new form entry for a specific tenant. Requires API key authentication via Authorization header (Bearer {apiKey})")
    .RequireCors("TenantCors");

// Get sitemap pages
app.MapGet("/api/tenant/{tenantId}/sitemap",
    async (IDatabaseService databaseService, string tenantId, HttpContext context) =>
    {
        // Extract API key from Authorization header (Bearer token format)
        var authHeader = context.Request.Headers.Authorization.FirstOrDefault();
        var apiKey = string.Empty;

        if (!string.IsNullOrEmpty(authHeader) && authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
        {
            apiKey = authHeader.Substring("Bearer ".Length).Trim();
        }

        return await PumpkinManager.GetSitemapPagesAsync(databaseService, apiKey, tenantId);
    })
    .WithTags("Sitemap")
    .WithName("GetSitemapPages")
    .WithSummary("Get all published page slugs for sitemap generation")
    .WithDescription("Returns a list of all published page slugs where isPublished=true and includeInSitemap=true. Useful for generating XML sitemaps. Requires API key authentication via Authorization header (Bearer {apiKey})")
    .RequireCors("TenantCors");

// ===== CONTENT SERVING: THEME ENDPOINTS =====

// Get the active theme for a tenant (public, API key required)
app.MapGet("/api/themes/{tenantId}",
    async (IDatabaseService databaseService, string tenantId, HttpContext context, ILogger<Program> logger) =>
    {
        var authHeader = context.Request.Headers.Authorization.FirstOrDefault();
        var apiKey = string.Empty;
        if (!string.IsNullOrEmpty(authHeader) && authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
        {
            apiKey = authHeader.Substring("Bearer ".Length).Trim();
        }

        return await PumpkinManager.GetActiveThemeAsync(databaseService, apiKey, tenantId, logger);
    })
    .WithTags("Themes")
    .WithName("GetActiveTheme")
    .WithSummary("Get the active theme for a tenant")
    .WithDescription("Retrieves the active theme including header blocks, footer blocks, block styles, and navigation menu. Requires API key authentication via Authorization header (Bearer {apiKey})")
    .RequireCors("TenantCors");

// Get a specific theme by ID (public, API key required)
app.MapGet("/api/themes/{tenantId}/{themeId}",
    async (IDatabaseService databaseService, string tenantId, string themeId, HttpContext context, ILogger<Program> logger) =>
    {
        var authHeader = context.Request.Headers.Authorization.FirstOrDefault();
        var apiKey = string.Empty;
        if (!string.IsNullOrEmpty(authHeader) && authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
        {
            apiKey = authHeader.Substring("Bearer ".Length).Trim();
        }

        return await PumpkinManager.GetThemeAsync(databaseService, apiKey, tenantId, themeId, logger);
    })
    .WithTags("Themes")
    .WithName("GetTheme")
    .WithSummary("Get a specific theme by ID")
    .WithDescription("Retrieves a specific theme by its ID for a tenant. Requires API key authentication via Authorization header (Bearer {apiKey})")
    .RequireCors("TenantCors");

// ===== AUTHENTICATION ENDPOINTS =====

// Login endpoint
app.MapPost("/api/auth/login",
    async (IDatabaseService databaseService, LoginRequest request, IConfiguration configuration) =>
    {
        var user = await databaseService.GetUserByEmailAsync(request.Email);

        if (user == null || !user.IsActive)
        {
            return Results.Unauthorized();
        }

        // Verify password with BCrypt
        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            return Results.Unauthorized();
        }

        Console.WriteLine($"[Login] User: {user.Username}, Role enum value: {user.Role}, Role as string: {user.Role.ToString()}");

        // Generate JWT token
        var jwtSettings = configuration.GetSection("Jwt");
        var secretKey = new SymmetricSecurityKey(
            System.Text.Encoding.UTF8.GetBytes(jwtSettings["SecretKey"]!));

        var credentials = new SigningCredentials(secretKey, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Name, user.Username),
            new Claim(ClaimTypes.Role, user.Role.ToString()),
            new Claim("tenantId", user.TenantId)
        };

        var expirationMinutes = int.Parse(jwtSettings["ExpirationMinutes"]!);
        var expiresAt = DateTime.UtcNow.AddMinutes(expirationMinutes);

        var token = new JwtSecurityToken(
            issuer: jwtSettings["Issuer"],
            audience: jwtSettings["Audience"],
            claims: claims,
            expires: expiresAt,
            signingCredentials: credentials
        );

        var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

        // Update last login
        await databaseService.UpdateUserLastLoginAsync(user.Id, user.TenantId);

        return Results.Ok(new LoginResponse
        {
            Token = tokenString,
            ExpiresAt = expiresAt,
            User = new UserInfo
            {
                Id = user.Id,
                TenantId = user.TenantId,
                Email = user.Email,
                Username = user.Username,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Role = user.Role.ToString(),
                Permissions = user.Permissions
            }
        });
    })
    .WithTags("Authentication")
    .WithName("Login")
    .WithSummary("User login")
    .WithDescription("Authenticates a user with email and password, returns JWT token for subsequent requests")
    .AllowAnonymous();

// Verify current JWT and return current user info
app.MapGet("/api/auth/verify",
    async (IDatabaseService databaseService, HttpContext context) =>
    {
        if (context.User?.Identity?.IsAuthenticated != true)
        {
            return Results.Unauthorized();
        }

        var email = context.User.FindFirst(ClaimTypes.Email)?.Value;
        var userId = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var tenantId = context.User.FindFirst("tenantId")?.Value;
        var username = context.User.FindFirst(ClaimTypes.Name)?.Value;
        var role = context.User.FindFirst(ClaimTypes.Role)?.Value;

        if (string.IsNullOrWhiteSpace(email) ||
            string.IsNullOrWhiteSpace(userId) ||
            string.IsNullOrWhiteSpace(tenantId) ||
            string.IsNullOrWhiteSpace(username) ||
            string.IsNullOrWhiteSpace(role))
        {
            return Results.Unauthorized();
        }

        var user = await databaseService.GetUserByEmailAsync(email);
        if (user == null || !user.IsActive || user.Id != userId || user.TenantId != tenantId)
        {
            return Results.Unauthorized();
        }

        return Results.Ok(new UserInfo
        {
            Id = user.Id,
            TenantId = user.TenantId,
            Email = user.Email,
            Username = user.Username,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Role = user.Role.ToString(),
            Permissions = user.Permissions
        });
    })
    .RequireAuthorization()
    .WithTags("Authentication")
    .WithName("VerifyToken")
    .WithSummary("Verify current JWT")
    .WithDescription("Validates the current JWT and returns the authenticated user's current tenant, role, and permissions.");

// Stateless JWT logout acknowledgement. The admin clears local token state client-side.
app.MapPost("/api/auth/logout",
    (HttpContext context) =>
    {
        if (context.User?.Identity?.IsAuthenticated != true)
        {
            return Results.Unauthorized();
        }

        return Results.Ok(new { message = "Logged out" });
    })
    .RequireAuthorization()
    .WithTags("Authentication")
    .WithName("Logout")
    .WithSummary("Acknowledge logout")
    .WithDescription("Acknowledges logout for stateless JWT auth. Clients should clear local token state.");

// ===== ADMIN ENDPOINTS =====

var allowedFormEntryStatuses = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
{
    "new",
    "reviewed",
    "contacted",
    "quoted",
    "won",
    "lost",
    "spam",
    "suspected-spam",
    "archived"
};

// Admin: Get non-secret provider metadata for Backup Center resolver wiring
app.MapGet("/api/admin/provider-metadata",
    (string? tenantKey, string? siteKey, string? environment, HttpContext context) =>
    {
        if (context.User?.Identity?.IsAuthenticated != true)
        {
            return Results.Unauthorized();
        }

        var requestedTenantKey = (tenantKey ?? string.Empty).Trim().ToLowerInvariant();
        if (string.IsNullOrWhiteSpace(requestedTenantKey))
        {
            return Results.BadRequest("tenantKey is required.");
        }

        var userTenantId = context.User.FindFirst("tenantId")?.Value;
        var userRole = context.User.FindFirst(ClaimTypes.Role)?.Value;
        if (string.IsNullOrWhiteSpace(userTenantId))
        {
            return Results.BadRequest("User tenant ID not found in token");
        }

        if (!ProviderMetadataService.IsAuthorizedForMetadata(userTenantId, userRole, requestedTenantKey))
        {
            return Results.Forbid();
        }

        var lookup = ProviderMetadataService.Lookup(requestedTenantKey, siteKey, environment);
        return lookup.Status switch
        {
            "found" => Results.Ok(lookup.Response),
            "bad-request" => Results.BadRequest(lookup.Error),
            _ => Results.NotFound("Provider metadata profile not found.")
        };
    })
    .RequireAuthorization()
    .WithTags("Admin - Provider Metadata")
    .WithName("GetProviderMetadata")
    .WithSummary("Get non-secret provider metadata")
    .WithDescription("Returns allowlisted non-secret provider metadata for Backup Center. Requires JWT authentication and TenantAdmin, Operator, or SuperAdmin authorization. Does not read protected config, list keys, return connection strings, export data, or switch runtime providers.");

app.MapOutboundLinkReadOnlyEndpoints();
app.MapOutboundLinkWriteEndpoints();
app.MapAuditJobReadOnlyEndpoints();
app.MapImportIntakeReadOnlyEndpoints();

// Admin: Get specific tenant
app.MapGet("/api/admin/tenants/{tenantId}",
    async (IDatabaseService databaseService, string tenantId, HttpContext context) =>
    {
        // Validate JWT authentication
        if (context.User?.Identity?.IsAuthenticated != true)
        {
            return Results.Unauthorized();
        }

        // Extract user info from JWT claims
        var userRole = context.User.FindFirst(ClaimTypes.Role)?.Value;

        // Only SuperAdmins can get any tenant
        if (userRole != "SuperAdmin")
        {
            return Results.Forbid();
        }

        return await PumpkinManager.GetTenantAsync(databaseService, tenantId);
    })
    .RequireAuthorization()
    .WithTags("Admin")
    .WithName("GetTenant")
    .WithSummary("Get tenant by ID (SuperAdmin only)")
    .WithDescription("Retrieves a specific tenant by ID. Requires SuperAdmin role and JWT authentication via Bearer token.");

// Admin: Create new tenant
app.MapPost("/api/admin/tenants",
    async (IDatabaseService databaseService, HttpContext context, Tenant tenant) =>
    {
        // Validate JWT authentication
        if (context.User?.Identity?.IsAuthenticated != true)
        {
            return Results.Unauthorized();
        }

        // Debug: Log all claims
        Console.WriteLine("[CreateTenant] All claims:");
        foreach (var claim in context.User.Claims)
        {
            Console.WriteLine($"  {claim.Type}: {claim.Value}");
        }

        // Extract user info from JWT claims
        var userTenantId = context.User.FindFirst("tenantId")?.Value;
        var userRole = context.User.FindFirst(ClaimTypes.Role)?.Value;

        Console.WriteLine($"[CreateTenant] User TenantId: {userTenantId}, Role: {userRole}");
        Console.WriteLine($"[CreateTenant] ClaimTypes.Role constant: {ClaimTypes.Role}");

        if (string.IsNullOrEmpty(userTenantId))
        {
            return Results.BadRequest("User tenant ID not found in token");
        }

        // Only SuperAdmins can create tenants
        if (userRole != "SuperAdmin")
        {
            Console.WriteLine($"[CreateTenant] Access denied. Required: SuperAdmin, Got: {userRole}");
            return Results.Json(
                new { error = "Forbidden", message = $"This action requires SuperAdmin role. Your role: {userRole ?? "none"}" },
                statusCode: 403
            );
        }

        try
        {
            var createdTenant = await PumpkinManager.CreateTenantAsync(databaseService, tenant);
            return Results.Ok(createdTenant);
        }
        catch (InvalidOperationException ex)
        {
            return Results.BadRequest(ex.Message);
        }
        catch (UnauthorizedAccessException)
        {
            return Results.Forbid();
        }
        catch (Exception ex)
        {
            return Results.Problem($"Error creating tenant: {ex.Message}");
        }
    })
    .RequireAuthorization()
    .WithTags("Admin")
    .WithName("CreateTenant")
    .WithSummary("Create new tenant (SuperAdmin only)")
    .WithDescription("Creates a new tenant. Requires SuperAdmin role and JWT authentication.");

// Admin: Get all tenants
// Admin: Get tenants (JWT-authenticated)
app.MapGet("/api/admin/tenants",
    async (IDatabaseService databaseService, HttpContext context) =>
    {
        // Validate JWT authentication
        if (context.User?.Identity?.IsAuthenticated != true)
        {
            return Results.Unauthorized();
        }

        // Extract user info from JWT claims
        var userTenantId = context.User.FindFirst("tenantId")?.Value;
        var userRole = context.User.FindFirst(ClaimTypes.Role)?.Value;

        if (string.IsNullOrEmpty(userTenantId))
        {
            return Results.BadRequest("User tenant ID not found in token");
        }

        try
        {
            // If SuperAdmin, return all tenants; otherwise just return the user's tenant
            var tenants = await databaseService.GetTenantsForUserAsync(userTenantId, userRole == "SuperAdmin");
            return Results.Ok(new { tenants, count = tenants.Count });
        }
        catch (Exception ex)
        {
            return Results.Problem($"Error retrieving tenants: {ex.Message}");
        }
    })
    .RequireAuthorization()
    .WithTags("Admin")
    .WithName("GetAllTenants")
    .WithSummary("Get tenants for authenticated user")
    .WithDescription("Retrieves tenants accessible to the authenticated user. SuperAdmins see all tenants, others see only their own. Requires JWT authentication via Bearer token.");

// Admin: Update tenant (JWT-authenticated)
app.MapPut("/api/admin/tenants/{tenantId}",
    async (IDatabaseService databaseService, HttpContext context, string tenantId, Tenant tenant) =>
    {
        // Validate JWT authentication
        if (context.User?.Identity?.IsAuthenticated != true)
        {
            return Results.Unauthorized();
        }

        // Extract user info from JWT claims
        var userTenantId = context.User.FindFirst("tenantId")?.Value;
        var userRole = context.User.FindFirst(ClaimTypes.Role)?.Value;

        if (string.IsNullOrEmpty(userTenantId))
        {
            return Results.BadRequest("User tenant ID not found in token");
        }

        // Only SuperAdmins can update tenants
        if (userRole != "SuperAdmin")
        {
            return Results.Forbid();
        }

        try
        {
            var updatedTenant = await databaseService.UpdateTenantAsync(tenantId, tenant);
            return Results.Ok(updatedTenant);
        }
        catch (InvalidOperationException ex)
        {
            return Results.NotFound(ex.Message);
        }
        catch (UnauthorizedAccessException)
        {
            return Results.Forbid();
        }
        catch (Exception ex)
        {
            return Results.Problem($"Error updating tenant: {ex.Message}");
        }
    })
    .RequireAuthorization()
    .WithTags("Admin")
    .WithName("UpdateTenant")
    .WithSummary("Update tenant (SuperAdmin only)")
    .WithDescription("Updates an existing tenant. Requires SuperAdmin role and JWT authentication via Bearer token.");
// Admin: Regenerate tenant API key (JWT-authenticated)
app.MapPost("/api/admin/tenants/{tenantId}/regenerate-api-key",
    async (IDatabaseService databaseService, HttpContext context, string tenantId) =>
    {
        // Validate JWT authentication
        if (context.User?.Identity?.IsAuthenticated != true)
        {
            return Results.Unauthorized();
        }

        // Extract user info from JWT claims
        var userTenantId = context.User.FindFirst("tenantId")?.Value;
        var userRole = context.User.FindFirst(ClaimTypes.Role)?.Value;

        if (string.IsNullOrEmpty(userTenantId))
        {
            return Results.BadRequest("User tenant ID not found in token");
        }

        // Only SuperAdmins can regenerate API keys
        if (userRole != "SuperAdmin")
        {
            return Results.Forbid();
        }

        try
        {
            // Get the tenant first
            var tenant = await databaseService.GetTenantAsync(tenantId);
            if (tenant == null)
            {
                return Results.NotFound($"Tenant {tenantId} not found");
            }

            // Generate new API key
            var keyBytes = System.Security.Cryptography.RandomNumberGenerator.GetBytes(32);
            var newApiKey = Convert.ToBase64String(keyBytes);
            var newApiKeyHash = BCrypt.Net.BCrypt.HashPassword(newApiKey, 12);

            // Update tenant with new API key
            tenant.ApiKey = newApiKey;
            tenant.ApiKeyHash = newApiKeyHash;
            tenant.ApiKeyMeta = new ApiKeyMeta
            {
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };
            tenant.UpdatedAt = DateTime.UtcNow;

            // Save updated tenant
            var updatedTenant = await databaseService.UpdateTenantAsync(tenantId, tenant);

            // Return the plain-text API key (one-time view)
            return Results.Ok(new
            {
                tenant = updatedTenant,
                apiKey = newApiKey  // Plain-text key for one-time display
            });
        }
        catch (InvalidOperationException ex)
        {
            return Results.NotFound(ex.Message);
        }
        catch (UnauthorizedAccessException)
        {
            return Results.Forbid();
        }
        catch (Exception ex)
        {
            return Results.Problem($"Error regenerating API key: {ex.Message}");
        }
    })
    .RequireAuthorization()
    .WithTags("Admin")
    .WithName("RegenerateTenantApiKey")
    .WithSummary("Regenerate tenant API key (SuperAdmin only)")
    .WithDescription("Generates a new API key for an existing tenant. The plain-text key is returned once for immediate capture. Requires SuperAdmin role and JWT authentication.");
// Admin: Delete tenant (JWT-authenticated)
app.MapDelete("/api/admin/tenants/{tenantId}",
    async (IDatabaseService databaseService, HttpContext context, string tenantId) =>
    {
        // Validate JWT authentication
        if (context.User?.Identity?.IsAuthenticated != true)
        {
            return Results.Unauthorized();
        }

        // Extract user info from JWT claims
        var userTenantId = context.User.FindFirst("tenantId")?.Value;
        var userRole = context.User.FindFirst(ClaimTypes.Role)?.Value;

        if (string.IsNullOrEmpty(userTenantId))
        {
            return Results.BadRequest("User tenant ID not found in token");
        }

        // Only SuperAdmins can delete tenants
        if (userRole != "SuperAdmin")
        {
            return Results.Forbid();
        }

        // Prevent deleting their own tenant
        if (tenantId == userTenantId)
        {
            return Results.BadRequest("Cannot delete your own tenant");
        }

        try
        {
            var deleted = await databaseService.DeleteTenantAsync(tenantId);
            if (deleted)
            {
                return Results.Ok(new { message = "Tenant deleted successfully", tenantId });
            }
            return Results.NotFound("Tenant not found");
        }
        catch (UnauthorizedAccessException)
        {
            return Results.Forbid();
        }
        catch (Exception ex)
        {
            return Results.Problem($"Error deleting tenant: {ex.Message}");
        }
    })
    .RequireAuthorization()
    .WithTags("Admin")
    .WithName("DeleteTenant")
    .WithSummary("Delete tenant (SuperAdmin only)")
    .WithDescription("Deletes a tenant. Requires SuperAdmin role and JWT authentication via Bearer token. Cannot delete own tenant.");

// Admin: Get all pages (optionally filtered by tenant)
app.MapGet("/api/admin/pages",
    async (IDatabaseService databaseService, HttpContext context, string? tenantId = null) =>
    {
        // Validate JWT authentication
        if (context.User?.Identity?.IsAuthenticated != true)
        {
            return Results.Unauthorized();
        }

        // Extract user info from JWT claims
        var userTenantId = context.User.FindFirst("tenantId")?.Value;
        var userRole = context.User.FindFirst(ClaimTypes.Role)?.Value;

        if (string.IsNullOrEmpty(userTenantId))
        {
            return Results.BadRequest("User tenant ID not found in token");
        }

        // Determine which tenant's pages to retrieve
        // If tenantId query param is provided, use that (requires SuperAdmin)
        // Otherwise, use the user's tenantId from the JWT
        var targetTenantId = tenantId ?? userTenantId;

        // If requesting different tenant data, verify SuperAdmin role
        if (targetTenantId != userTenantId && userRole != "SuperAdmin")
        {
            return Results.Forbid();
        }

        try
        {
            var pages = await databaseService.GetPagesByTenantAsync(targetTenantId);
            return Results.Ok(new { pages, count = pages.Count, tenantId = targetTenantId });
        }
        catch (Exception ex)
        {
            return Results.Problem($"Error retrieving pages: {ex.Message}");
        }
    })
    .RequireAuthorization()
    .WithTags("Admin")
    .WithName("GetAllPages")
    .WithSummary("Get all pages for authenticated user's tenant")
    .WithDescription("Retrieves pages for the authenticated user's tenant. Requires JWT authentication via Bearer token.");

// Admin: Get a single page by slug (JWT, no API key, includes drafts)
app.MapGet("/api/admin/pages/{tenantId}/{**pageSlug}",
    async (IDatabaseService databaseService, string tenantId, string pageSlug, HttpContext context) =>
    {
        if (context.User?.Identity?.IsAuthenticated != true)
        {
            return Results.Unauthorized();
        }

        var userTenantId = context.User.FindFirst("tenantId")?.Value;
        var userRole = context.User.FindFirst(ClaimTypes.Role)?.Value;

        if (string.IsNullOrEmpty(userTenantId))
        {
            return Results.BadRequest("User tenant ID not found in token");
        }

        if (tenantId != userTenantId && userRole != "SuperAdmin")
        {
            return Results.Forbid();
        }

        var decodedSlug = Uri.UnescapeDataString(pageSlug);
        var page = await databaseService.GetPageBySlugAsync(tenantId, decodedSlug);

        if (page == null)
        {
            return Results.NotFound("Page not found");
        }

        return Results.Ok(page);
    })
    .RequireAuthorization()
    .WithTags("Admin")
    .WithName("GetPageBySlug")
    .WithSummary("Get a single page by slug for editing")
    .WithDescription("Retrieves a page by slug for a specific tenant. Returns both published and draft pages. Requires JWT authentication.");

// Admin: Create a new page (JWT auth, no API key)
app.MapPost("/api/admin/pages/{tenantId}",
    async (IDatabaseService databaseService, string tenantId, pumpkin_net_models.Models.Page page, HttpContext context) =>
    {
        if (context.User?.Identity?.IsAuthenticated != true)
        {
            return Results.Unauthorized();
        }

        var userTenantId = context.User.FindFirst("tenantId")?.Value;
        var userRole = context.User.FindFirst(ClaimTypes.Role)?.Value;

        if (string.IsNullOrEmpty(userTenantId))
        {
            return Results.BadRequest("User tenant ID not found in token");
        }

        if (tenantId != userTenantId && userRole != "SuperAdmin")
        {
            return Results.Forbid();
        }

        try
        {
            if (page == null)
                return Results.BadRequest("Page data is required");
            if (string.IsNullOrEmpty(page.PageId))
                return Results.BadRequest("Page ID is required");
            if (string.IsNullOrWhiteSpace(page.PageSlug))
                return Results.BadRequest("Page slug is required");
            if (!string.IsNullOrWhiteSpace(page.TenantId) && page.TenantId != tenantId)
                return Results.BadRequest("Page tenant ID must match the route tenant ID");

            var designValidation = DesignSystemGuard.ValidatePage(page);
            if (!designValidation.Ok)
                return Results.BadRequest(designValidation);

            var existingPageWithSlug = await databaseService.GetPageBySlugAsync(tenantId, page.PageSlug);
            if (existingPageWithSlug != null)
                return Results.Conflict($"Page with slug '{page.PageSlug}' already exists");

            var savedPage = await databaseService.SavePageAdminAsync(tenantId, page);
            return Results.Created($"/api/admin/pages/{tenantId}/{savedPage.PageSlug}", savedPage);
        }
        catch (InvalidOperationException ex)
        {
            return Results.Conflict(ex.Message);
        }
        catch (ArgumentException ex)
        {
            return Results.BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            return Results.Problem($"Error creating page: {ex.Message}");
        }
    })
    .RequireAuthorization()
    .WithTags("Admin")
    .WithName("AdminCreatePage")
    .WithSummary("Create a new page (admin)")
    .WithDescription("Creates a new page for a specific tenant. Requires JWT authentication.");

// Admin: Update an existing page (JWT auth, no API key)
app.MapPut("/api/admin/pages/{tenantId}/{**pageSlug}",
    async (IDatabaseService databaseService, string tenantId, string pageSlug, pumpkin_net_models.Models.Page page, HttpContext context, string? changeSource, string? changeSummary) =>
    {
        if (context.User?.Identity?.IsAuthenticated != true)
        {
            return Results.Unauthorized();
        }

        var userTenantId = context.User.FindFirst("tenantId")?.Value;
        var userRole = context.User.FindFirst(ClaimTypes.Role)?.Value;

        if (string.IsNullOrEmpty(userTenantId))
        {
            return Results.BadRequest("User tenant ID not found in token");
        }

        if (tenantId != userTenantId && userRole != "SuperAdmin")
        {
            return Results.Forbid();
        }

        try
        {
            if (page == null)
                return Results.BadRequest("Page data is required");
            if (string.IsNullOrWhiteSpace(page.PageSlug))
                return Results.BadRequest("Page slug is required");
            if (!string.IsNullOrWhiteSpace(page.TenantId) && page.TenantId != tenantId)
                return Results.BadRequest("Page tenant ID must match the route tenant ID");

            var decodedSlug = Uri.UnescapeDataString(pageSlug);
            var normalizedRouteSlug = PageRedirectGuard.NormalizeSlug(decodedSlug);
            var normalizedBodySlug = PageRedirectGuard.NormalizeSlug(page.PageSlug);
            page.PageSlug = normalizedBodySlug;
            if (string.IsNullOrWhiteSpace(normalizedBodySlug))
                return Results.BadRequest("Page slug must contain valid slug characters");

            var existingPage = await databaseService.GetPageBySlugAsync(tenantId, normalizedRouteSlug);
            if (existingPage == null)
            {
                return Results.NotFound($"Page with slug '{decodedSlug}' not found");
            }

            if (normalizedBodySlug != normalizedRouteSlug)
            {
                var pageWithTargetSlug = await databaseService.GetPageBySlugAsync(tenantId, normalizedBodySlug);
                if (pageWithTargetSlug != null && pageWithTargetSlug.PageId != existingPage.PageId)
                    return Results.Conflict($"Page with slug '{page.PageSlug}' already exists");
            }

            var redirectValidationError = PageRedirectGuard.ValidatePageRedirects(page);
            if (!string.IsNullOrWhiteSpace(redirectValidationError))
            {
                return Results.BadRequest(redirectValidationError);
            }

            var designValidation = DesignSystemGuard.ValidatePage(page);
            if (!designValidation.Ok)
            {
                return Results.BadRequest(designValidation);
            }

            var tenantPages = await databaseService.GetPagesByTenantAsync(tenantId);
            var redirectCollisionError = PageRedirectGuard.ValidateTenantRedirectCollisions(page, existingPage, tenantPages, normalizedRouteSlug);
            if (!string.IsNullOrWhiteSpace(redirectCollisionError))
            {
                return Results.Conflict(redirectCollisionError);
            }

            var changedBy = context.User.FindFirst(ClaimTypes.Email)?.Value
                ?? context.User.FindFirst(ClaimTypes.Name)?.Value
                ?? context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? "Pumpkin CMS Admin";

            var changeContext = new PageChangeContext
            {
                ChangeSource = string.IsNullOrWhiteSpace(changeSource) ? "manual_unknown" : changeSource,
                ChangeSummary = changeSummary ?? string.Empty,
                ChangedBy = changedBy
            };

            var updatedPage = await databaseService.UpdatePageAdminAsync(tenantId, normalizedRouteSlug, page, changeContext);
            return Results.Ok(updatedPage);
        }
        catch (KeyNotFoundException ex)
        {
            return Results.NotFound(ex.Message);
        }
        catch (ArgumentException ex)
        {
            return Results.BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            return Results.Problem($"Error updating page: {ex.Message}");
        }
    })
    .RequireAuthorization()
    .WithTags("Admin")
    .WithName("AdminUpdatePage")
    .WithSummary("Update an existing page (admin)")
    .WithDescription("Updates a page by slug for a specific tenant. Requires JWT authentication.");

// Admin: Roll back a page to its latest stored pre-update snapshot (JWT auth, no API key)
app.MapPost("/api/admin/pages/{tenantId}/{pageSlug}/rollback",
    async (IDatabaseService databaseService, string tenantId, string pageSlug, HttpContext context, string? changeSummary) =>
    {
        if (context.User?.Identity?.IsAuthenticated != true)
        {
            return Results.Unauthorized();
        }

        var userTenantId = context.User.FindFirst("tenantId")?.Value;
        var userRole = context.User.FindFirst(ClaimTypes.Role)?.Value;

        if (string.IsNullOrEmpty(userTenantId))
        {
            return Results.BadRequest("User tenant ID not found in token");
        }

        if (tenantId != userTenantId && userRole != "SuperAdmin")
        {
            return Results.Forbid();
        }

        try
        {
            var decodedSlug = Uri.UnescapeDataString(pageSlug);
            var currentPage = await databaseService.GetPageBySlugAsync(tenantId, decodedSlug);
            if (currentPage == null)
            {
                return Results.NotFound($"Page with slug '{decodedSlug}' not found");
            }

            var snapshot = currentPage.Revision?.LatestSnapshot;
            var snapshotPage = snapshot?.Page;
            var snapshotRevisionId = snapshot?.RevisionId ?? "latest snapshot";
            if (snapshotPage == null)
            {
                return Results.BadRequest("Rollback is unavailable because no latest page snapshot exists");
            }

            var rollbackSlug = snapshotPage.PageSlug.ToLowerInvariant();
            if (!string.Equals(rollbackSlug, currentPage.PageSlug.ToLowerInvariant(), StringComparison.Ordinal))
            {
                var pageWithRollbackSlug = await databaseService.GetPageBySlugAsync(tenantId, rollbackSlug);
                if (pageWithRollbackSlug != null && pageWithRollbackSlug.PageId != currentPage.PageId)
                {
                    return Results.Conflict($"Rollback target slug '{snapshotPage.PageSlug}' is already used by another page");
                }
            }

            snapshotPage.PageId = currentPage.PageId;
            snapshotPage.TenantId = tenantId;
            snapshotPage.Id = currentPage.PageId;

            var changedBy = context.User.FindFirst(ClaimTypes.Email)?.Value
                ?? context.User.FindFirst(ClaimTypes.Name)?.Value
                ?? context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? "Pumpkin CMS Admin";

            var rollbackSummary = string.IsNullOrWhiteSpace(changeSummary)
                ? $"Rollback to {snapshotRevisionId}"
                : changeSummary;

            var rolledBackPage = await databaseService.UpdatePageAdminAsync(
                tenantId,
                decodedSlug,
                snapshotPage,
                new PageChangeContext
                {
                    ChangeSource = "rollback",
                    ChangeSummary = rollbackSummary,
                    ChangedBy = changedBy
                });

            return Results.Ok(new
            {
                page = rolledBackPage,
                rolledBackToRevisionId = snapshotRevisionId,
                message = "Rollback completed"
            });
        }
        catch (KeyNotFoundException ex)
        {
            return Results.NotFound(ex.Message);
        }
        catch (ArgumentException ex)
        {
            return Results.BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            return Results.Problem($"Error rolling back page: {ex.Message}");
        }
    })
    .RequireAuthorization()
    .WithTags("Admin")
    .WithName("AdminRollbackPage")
    .WithSummary("Roll back a page to its latest revision snapshot (admin)")
    .WithDescription("Restores a page to the latest stored pre-update snapshot. Requires JWT authentication.");

// Admin: List form entries for a tenant (JWT auth, no API key)
app.MapGet("/api/admin/{tenantId}/form-entries",
    async (IDatabaseService databaseService, string tenantId, HttpContext context) =>
    {
        if (context.User?.Identity?.IsAuthenticated != true)
            return Results.Unauthorized();

        var userTenantId = context.User.FindFirst("tenantId")?.Value;
        var userRole = context.User.FindFirst(ClaimTypes.Role)?.Value;

        if (string.IsNullOrEmpty(userTenantId))
            return Results.BadRequest("User tenant ID not found in token");

        if (tenantId != userTenantId && userRole != "SuperAdmin")
            return Results.Forbid();

        try
        {
            var formEntries = await databaseService.GetFormEntriesByTenantAsync(tenantId);
            return Results.Ok(new { formEntries, count = formEntries.Count, tenantId });
        }
        catch (Exception ex)
        {
            return Results.Problem($"Error retrieving form entries: {ex.Message}");
        }
    })
    .RequireAuthorization()
    .WithTags("Admin - Form Entries")
    .WithName("GetFormEntries")
    .WithSummary("Get form entries for a tenant")
    .WithDescription("Lists tenant-scoped form submissions newest first. Requires JWT authentication.");

// Admin: Get one form entry for a tenant (JWT auth, no API key)
app.MapGet("/api/admin/{tenantId}/form-entries/{id}",
    async (IDatabaseService databaseService, string tenantId, string id, HttpContext context) =>
    {
        if (context.User?.Identity?.IsAuthenticated != true)
            return Results.Unauthorized();

        var userTenantId = context.User.FindFirst("tenantId")?.Value;
        var userRole = context.User.FindFirst(ClaimTypes.Role)?.Value;

        if (string.IsNullOrEmpty(userTenantId))
            return Results.BadRequest("User tenant ID not found in token");

        if (tenantId != userTenantId && userRole != "SuperAdmin")
            return Results.Forbid();

        try
        {
            var formEntry = await databaseService.GetFormEntryAsync(tenantId, id);
            return formEntry == null ? Results.NotFound("Form entry not found") : Results.Ok(formEntry);
        }
        catch (Exception ex)
        {
            return Results.Problem($"Error retrieving form entry: {ex.Message}");
        }
    })
    .RequireAuthorization()
    .WithTags("Admin - Form Entries")
    .WithName("GetFormEntry")
    .WithSummary("Get one form entry")
    .WithDescription("Reads one tenant-scoped form submission. Requires JWT authentication.");

// Admin: Update form entry status/tags only (JWT auth, no API key)
app.MapPatch("/api/admin/{tenantId}/form-entries/{id}",
    async (IDatabaseService databaseService, string tenantId, string id, FormEntryStatusUpdate statusUpdate, HttpContext context) =>
    {
        if (context.User?.Identity?.IsAuthenticated != true)
            return Results.Unauthorized();

        var userTenantId = context.User.FindFirst("tenantId")?.Value;
        var userRole = context.User.FindFirst(ClaimTypes.Role)?.Value;

        if (string.IsNullOrEmpty(userTenantId))
            return Results.BadRequest("User tenant ID not found in token");

        if (tenantId != userTenantId && userRole != "SuperAdmin")
            return Results.Forbid();

        if (statusUpdate == null)
            return Results.BadRequest("Status update data is required");

        var normalizedStatus = (statusUpdate.Status ?? string.Empty).Trim().ToLowerInvariant();
        if (!allowedFormEntryStatuses.Contains(normalizedStatus))
            return Results.BadRequest($"Status must be one of: {string.Join(", ", allowedFormEntryStatuses)}");

        statusUpdate.Status = normalizedStatus;
        statusUpdate.Tags = statusUpdate.Tags?
            .Where(tag => !string.IsNullOrWhiteSpace(tag))
            .Select(tag => tag.Trim())
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .Take(20)
            .ToList();

        try
        {
            var updatedFormEntry = await databaseService.UpdateFormEntryStatusAsync(tenantId, id, statusUpdate);
            return Results.Ok(updatedFormEntry);
        }
        catch (KeyNotFoundException ex)
        {
            return Results.NotFound(ex.Message);
        }
        catch (UnauthorizedAccessException)
        {
            return Results.Forbid();
        }
        catch (Exception ex)
        {
            return Results.Problem($"Error updating form entry: {ex.Message}");
        }
    })
    .RequireAuthorization()
    .WithTags("Admin - Form Entries")
    .WithName("UpdateFormEntryStatus")
    .WithSummary("Update form entry status/tags")
    .WithDescription("Updates lead workflow metadata only. Does not delete or alter submitted formData.");

// Admin: List publish/build runs for a tenant (JWT auth, no API key)
app.MapGet("/api/admin/{tenantId}/publish-runs",
    async (IDatabaseService databaseService, string tenantId, HttpContext context) =>
    {
        if (context.User?.Identity?.IsAuthenticated != true)
            return Results.Unauthorized();

        var userTenantId = context.User.FindFirst("tenantId")?.Value;
        var userRole = context.User.FindFirst(ClaimTypes.Role)?.Value;

        if (string.IsNullOrEmpty(userTenantId))
            return Results.BadRequest("User tenant ID not found in token");

        if (tenantId != userTenantId && userRole != "SuperAdmin")
            return Results.Forbid();

        try
        {
            var publishRuns = await databaseService.GetPublishRunsByTenantAsync(tenantId);
            return Results.Ok(new { publishRuns, count = publishRuns.Count, tenantId });
        }
        catch (Exception ex)
        {
            return Results.Problem($"Error retrieving publish runs: {ex.Message}");
        }
    })
    .RequireAuthorization()
    .WithTags("Admin - Publish Runs")
    .WithName("GetPublishRuns")
    .WithSummary("Get publish/build run history for a tenant")
    .WithDescription("Lists tenant-scoped static dry-run/build history records. Requires JWT authentication.");

// Admin: Get one publish/build run for a tenant (JWT auth, no API key)
app.MapGet("/api/admin/{tenantId}/publish-runs/{id}",
    async (IDatabaseService databaseService, string tenantId, string id, HttpContext context) =>
    {
        if (context.User?.Identity?.IsAuthenticated != true)
            return Results.Unauthorized();

        var userTenantId = context.User.FindFirst("tenantId")?.Value;
        var userRole = context.User.FindFirst(ClaimTypes.Role)?.Value;

        if (string.IsNullOrEmpty(userTenantId))
            return Results.BadRequest("User tenant ID not found in token");

        if (tenantId != userTenantId && userRole != "SuperAdmin")
            return Results.Forbid();

        try
        {
            var publishRun = await databaseService.GetPublishRunAsync(tenantId, id);
            return publishRun == null ? Results.NotFound("Publish run not found") : Results.Ok(publishRun);
        }
        catch (Exception ex)
        {
            return Results.Problem($"Error retrieving publish run: {ex.Message}");
        }
    })
    .RequireAuthorization()
    .WithTags("Admin - Publish Runs")
    .WithName("GetPublishRun")
    .WithSummary("Get one publish/build run")
    .WithDescription("Reads one tenant-scoped static dry-run/build history record. Requires JWT authentication.");

// Admin: Save/import a dry-run manifest summary as a publish/build run (JWT auth, no API key)
app.MapPost("/api/admin/{tenantId}/publish-runs",
    async (IDatabaseService databaseService, string tenantId, PublishRun publishRun, HttpContext context) =>
    {
        if (context.User?.Identity?.IsAuthenticated != true)
            return Results.Unauthorized();

        var userTenantId = context.User.FindFirst("tenantId")?.Value;
        var userRole = context.User.FindFirst(ClaimTypes.Role)?.Value;

        if (string.IsNullOrEmpty(userTenantId))
            return Results.BadRequest("User tenant ID not found in token");

        if (tenantId != userTenantId && userRole != "SuperAdmin")
            return Results.Forbid();

        try
        {
            var createdBy = context.User.FindFirst(ClaimTypes.Email)?.Value
                ?? context.User.FindFirst(ClaimTypes.Name)?.Value
                ?? context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? "Pumpkin CMS Admin";

            var preparedPublishRun = PublishRunSanitizer.PrepareForSave(publishRun, tenantId, createdBy);
            var savedPublishRun = await databaseService.SavePublishRunAsync(tenantId, preparedPublishRun);
            return Results.Created($"/api/admin/{tenantId}/publish-runs/{savedPublishRun.Id}", savedPublishRun);
        }
        catch (ArgumentException ex)
        {
            return Results.BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            return Results.Problem($"Error saving publish run: {ex.Message}");
        }
    })
    .RequireAuthorization()
    .WithTags("Admin - Publish Runs")
    .WithName("CreatePublishRun")
    .WithSummary("Create/import a publish/build run")
    .WithDescription("Stores sanitized dry-run/build metadata only. Does not deploy, upload, purge, or execute shell commands.");

// Admin: List import runs for a tenant (JWT auth, no API key)
app.MapGet("/api/admin/{tenantId}/import-runs",
    async (IDatabaseService databaseService, string tenantId, HttpContext context) =>
    {
        if (context.User?.Identity?.IsAuthenticated != true)
            return Results.Unauthorized();

        var userTenantId = context.User.FindFirst("tenantId")?.Value;
        var userRole = context.User.FindFirst(ClaimTypes.Role)?.Value;

        if (string.IsNullOrEmpty(userTenantId))
            return Results.BadRequest("User tenant ID not found in token");

        if (tenantId != userTenantId && userRole != "SuperAdmin")
            return Results.Forbid();

        try
        {
            var importRuns = await databaseService.GetImportRunsByTenantAsync(tenantId);
            return Results.Ok(new { importRuns, count = importRuns.Count, tenantId });
        }
        catch (Exception ex)
        {
            return Results.Problem($"Error retrieving import runs. Confirm the ImportRun container exists with partition key /tenantId. Details: {ex.Message}");
        }
    })
    .RequireAuthorization()
    .WithTags("Admin - Import Runs")
    .WithName("GetImportRuns")
    .WithSummary("Get import audit history for a tenant")
    .WithDescription("Lists tenant-scoped import audit records. Requires JWT authentication.");

// Admin: Get one import run for a tenant (JWT auth, no API key)
app.MapGet("/api/admin/{tenantId}/import-runs/{id}",
    async (IDatabaseService databaseService, string tenantId, string id, HttpContext context) =>
    {
        if (context.User?.Identity?.IsAuthenticated != true)
            return Results.Unauthorized();

        var userTenantId = context.User.FindFirst("tenantId")?.Value;
        var userRole = context.User.FindFirst(ClaimTypes.Role)?.Value;

        if (string.IsNullOrEmpty(userTenantId))
            return Results.BadRequest("User tenant ID not found in token");

        if (tenantId != userTenantId && userRole != "SuperAdmin")
            return Results.Forbid();

        try
        {
            var importRun = await databaseService.GetImportRunAsync(tenantId, id);
            return importRun == null ? Results.NotFound("Import run not found") : Results.Ok(importRun);
        }
        catch (Exception ex)
        {
            return Results.Problem($"Error retrieving import run. Confirm the ImportRun container exists with partition key /tenantId. Details: {ex.Message}");
        }
    })
    .RequireAuthorization()
    .WithTags("Admin - Import Runs")
    .WithName("GetImportRun")
    .WithSummary("Get one import audit record")
    .WithDescription("Reads one tenant-scoped import audit record. Requires JWT authentication.");

// Admin: Save an import dry-run/result summary as an import run (JWT auth, no API key)
app.MapPost("/api/admin/{tenantId}/import-runs",
    async (IDatabaseService databaseService, string tenantId, ImportRun importRun, HttpContext context) =>
    {
        if (context.User?.Identity?.IsAuthenticated != true)
            return Results.Unauthorized();

        var userTenantId = context.User.FindFirst("tenantId")?.Value;
        var userRole = context.User.FindFirst(ClaimTypes.Role)?.Value;

        if (string.IsNullOrEmpty(userTenantId))
            return Results.BadRequest("User tenant ID not found in token");

        if (tenantId != userTenantId && userRole != "SuperAdmin")
            return Results.Forbid();

        try
        {
            var createdBy = context.User.FindFirst(ClaimTypes.Email)?.Value
                ?? context.User.FindFirst(ClaimTypes.Name)?.Value
                ?? context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? "Pumpkin CMS Admin";

            var preparedImportRun = ImportRunSanitizer.PrepareForSave(importRun, tenantId, createdBy);
            var savedImportRun = await databaseService.SaveImportRunAsync(tenantId, preparedImportRun);
            return Results.Created($"/api/admin/{tenantId}/import-runs/{savedImportRun.Id}", savedImportRun);
        }
        catch (ArgumentException ex)
        {
            return Results.BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            return Results.Problem($"Error saving import run. Confirm the ImportRun container exists with partition key /tenantId. Details: {ex.Message}");
        }
    })
    .RequireAuthorization()
    .WithTags("Admin - Import Runs")
    .WithName("CreateImportRun")
    .WithSummary("Create an import audit record")
    .WithDescription("Stores sanitized import dry-run/result metadata only. Does not execute imports, deploy, upload, purge, or run shell commands.");

// Admin: List media assets for a tenant (JWT auth, no API key)
app.MapGet("/api/admin/{tenantId}/media-assets",
    async (IDatabaseService databaseService, string tenantId, HttpContext context) =>
    {
        if (context.User?.Identity?.IsAuthenticated != true)
            return Results.Unauthorized();

        var userTenantId = context.User.FindFirst("tenantId")?.Value;
        var userRole = context.User.FindFirst(ClaimTypes.Role)?.Value;

        if (string.IsNullOrEmpty(userTenantId))
            return Results.BadRequest("User tenant ID not found in token");

        if (tenantId != userTenantId && userRole != "SuperAdmin")
            return Results.Forbid();

        try
        {
            var mediaAssets = await databaseService.GetMediaAssetsByTenantAsync(tenantId);
            return Results.Ok(new { mediaAssets, count = mediaAssets.Count, tenantId });
        }
        catch (Exception ex)
        {
            return Results.Problem($"Error retrieving media assets: {ex.Message}");
        }
    })
    .RequireAuthorization()
    .WithTags("Admin - Media Assets")
    .WithName("GetMediaAssets")
    .WithSummary("Get media assets for a tenant")
    .WithDescription("Lists tenant-scoped media asset metadata. Requires JWT authentication.");

// Admin: Get one media asset for a tenant (JWT auth, no API key)
app.MapGet("/api/admin/{tenantId}/media-assets/{id}",
    async (IDatabaseService databaseService, string tenantId, string id, HttpContext context) =>
    {
        if (context.User?.Identity?.IsAuthenticated != true)
            return Results.Unauthorized();

        var userTenantId = context.User.FindFirst("tenantId")?.Value;
        var userRole = context.User.FindFirst(ClaimTypes.Role)?.Value;

        if (string.IsNullOrEmpty(userTenantId))
            return Results.BadRequest("User tenant ID not found in token");

        if (tenantId != userTenantId && userRole != "SuperAdmin")
            return Results.Forbid();

        try
        {
            var mediaAsset = await databaseService.GetMediaAssetAsync(tenantId, id);
            return mediaAsset == null ? Results.NotFound("Media asset not found") : Results.Ok(mediaAsset);
        }
        catch (Exception ex)
        {
            return Results.Problem($"Error retrieving media asset: {ex.Message}");
        }
    })
    .RequireAuthorization()
    .WithTags("Admin - Media Assets")
    .WithName("GetMediaAsset")
    .WithSummary("Get one media asset")
    .WithDescription("Reads one tenant-scoped media asset metadata record. Requires JWT authentication.");

// Admin: Register media asset metadata for an existing URL (JWT auth, no API key)
app.MapPost("/api/admin/{tenantId}/media-assets",
    async (IDatabaseService databaseService, string tenantId, MediaAsset mediaAsset, HttpContext context) =>
    {
        if (context.User?.Identity?.IsAuthenticated != true)
            return Results.Unauthorized();

        var userTenantId = context.User.FindFirst("tenantId")?.Value;
        var userRole = context.User.FindFirst(ClaimTypes.Role)?.Value;

        if (string.IsNullOrEmpty(userTenantId))
            return Results.BadRequest("User tenant ID not found in token");

        if (tenantId != userTenantId && userRole != "SuperAdmin")
            return Results.Forbid();

        try
        {
            var createdBy = context.User.FindFirst(ClaimTypes.Email)?.Value
                ?? context.User.FindFirst(ClaimTypes.Name)?.Value
                ?? context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? "Pumpkin CMS Admin";

            var preparedMediaAsset = MediaAssetSanitizer.PrepareForCreate(mediaAsset, tenantId, createdBy);
            var savedMediaAsset = await databaseService.SaveMediaAssetAsync(tenantId, preparedMediaAsset);
            return Results.Created($"/api/admin/{tenantId}/media-assets/{savedMediaAsset.Id}", savedMediaAsset);
        }
        catch (ArgumentException ex)
        {
            return Results.BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            return Results.Problem($"Error saving media asset: {ex.Message}");
        }
    })
    .RequireAuthorization()
    .WithTags("Admin - Media Assets")
    .WithName("CreateMediaAsset")
    .WithSummary("Register media asset metadata")
    .WithDescription("Stores metadata for an existing image URL. Requires JWT authentication and tenant authorization.");

// Admin: Upload a binary image into configured media storage (JWT auth, no API key)
app.MapPost("/api/admin/{tenantId}/media-assets/upload",
    async (IDatabaseService databaseService, IMediaStorageService storageService, string tenantId, HttpContext context) =>
    {
        if (context.User?.Identity?.IsAuthenticated != true)
            return Results.Unauthorized();

        var userTenantId = context.User.FindFirst("tenantId")?.Value;
        var userRole = context.User.FindFirst(ClaimTypes.Role)?.Value;

        if (string.IsNullOrEmpty(userTenantId))
            return Results.BadRequest("User tenant ID not found in token");

        if (tenantId != userTenantId && userRole != "SuperAdmin")
            return Results.Forbid();

        if (!context.Request.HasFormContentType)
            return Results.BadRequest("Media upload must use multipart/form-data.");

        try
        {
            var form = await context.Request.ReadFormAsync(context.RequestAborted);
            var file = form.Files.GetFile("file");
            if (file == null)
                return Results.BadRequest("Upload field 'file' is required.");

            var mimeType = file.ContentType?.Trim().ToLowerInvariant() ?? string.Empty;
            MediaUploadPolicy.ValidateUpload(file.FileName, mimeType, file.Length, storageService.MaxUploadBytes);

            await using var buffer = new MemoryStream();
            await file.CopyToAsync(buffer, context.RequestAborted);
            var bytes = buffer.ToArray();
            var checksum = MediaUploadPolicy.ComputeSha256(bytes);
            var safeFileName = MediaUploadPolicy.BuildSafeFileName(file.FileName, checksum);
            var imageInfo = MediaUploadPolicy.InspectImage(bytes, mimeType);
            var stored = await storageService.StoreAsync(tenantId, safeFileName, mimeType, bytes, context.RequestAborted);

            var createdBy = context.User.FindFirst(ClaimTypes.Email)?.Value
                ?? context.User.FindFirst(ClaimTypes.Name)?.Value
                ?? context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? "Pumpkin CMS Admin";
            var now = DateTime.UtcNow.ToString("O");

            var mediaAsset = new MediaAsset
            {
                TenantId = tenantId,
                SiteKey = form["siteKey"].ToString(),
                AssetId = Path.GetFileNameWithoutExtension(safeFileName),
                Status = "draft",
                Url = stored.PublicUrl,
                PublicUrl = stored.PublicUrl,
                ThumbnailUrl = stored.ThumbnailUrl,
                FileName = file.FileName,
                OriginalFileName = file.FileName,
                SafeFileName = safeFileName,
                Title = form["title"].ToString(),
                Alt = form["altText"].ToString(),
                AltText = form["altText"].ToString(),
                Caption = form["caption"].ToString(),
                Notes = form["description"].ToString(),
                Source = form["credit"].ToString(),
                Credit = form["credit"].ToString(),
                License = form["license"].ToString(),
                SourceUrl = form["sourceUrl"].ToString(),
                UsageType = string.IsNullOrWhiteSpace(form["usageType"].ToString()) ? "inline" : form["usageType"].ToString(),
                LicenseStatus = string.IsNullOrWhiteSpace(form["licenseStatus"].ToString()) ? "needs_review" : form["licenseStatus"].ToString(),
                UsageStatus = "needs_review",
                Width = imageInfo.Width,
                Height = imageInfo.Height,
                MimeType = mimeType,
                Extension = Path.GetExtension(safeFileName).ToLowerInvariant(),
                FileSize = file.Length,
                SizeBytes = file.Length,
                Checksum = checksum,
                Hash = checksum,
                StorageProvider = stored.StorageProvider,
                StorageContainer = stored.StorageContainer,
                BlobPath = stored.BlobPath,
                UploadedBy = createdBy,
                Tags = form["tags"].ToString()
                    .Split(',', StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries)
                    .ToList(),
                Variants = new List<MediaAssetVariant>
                {
                    new()
                    {
                        Name = "original",
                        Url = stored.PublicUrl,
                        PublicUrl = stored.PublicUrl,
                        Width = imageInfo.Width,
                        Height = imageInfo.Height,
                        MimeType = mimeType,
                        SizeBytes = file.Length,
                        StorageProvider = stored.StorageProvider,
                        BlobPath = stored.BlobPath,
                        GeneratedAt = now,
                        Status = "available"
                    }
                }
            };

            var preparedMediaAsset = MediaAssetSanitizer.PrepareForCreate(mediaAsset, tenantId, createdBy);
            var savedMediaAsset = await databaseService.SaveMediaAssetAsync(tenantId, preparedMediaAsset);
            return Results.Created($"/api/admin/{tenantId}/media-assets/{savedMediaAsset.Id}", savedMediaAsset);
        }
        catch (ArgumentException ex)
        {
            return Results.BadRequest(ex.Message);
        }
        catch (InvalidOperationException ex)
        {
            return Results.Problem(ex.Message, statusCode: StatusCodes.Status501NotImplemented);
        }
        catch (Exception ex)
        {
            return Results.Problem($"Error uploading media asset: {ex.Message}");
        }
    })
    .RequireAuthorization()
    .WithTags("Admin - Media Assets")
    .WithName("UploadMediaAsset")
    .WithSummary("Upload media asset")
    .WithDescription("Uploads tenant-scoped JPEG, PNG, or WebP media through the configured storage provider. Requires JWT authentication.");

// Admin: Update media asset metadata only (JWT auth, no API key)
app.MapPatch("/api/admin/{tenantId}/media-assets/{id}",
    async (IDatabaseService databaseService, string tenantId, string id, MediaAsset mediaAsset, HttpContext context) =>
    {
        if (context.User?.Identity?.IsAuthenticated != true)
            return Results.Unauthorized();

        var userTenantId = context.User.FindFirst("tenantId")?.Value;
        var userRole = context.User.FindFirst(ClaimTypes.Role)?.Value;

        if (string.IsNullOrEmpty(userTenantId))
            return Results.BadRequest("User tenant ID not found in token");

        if (tenantId != userTenantId && userRole != "SuperAdmin")
            return Results.Forbid();

        try
        {
            var updatedBy = context.User.FindFirst(ClaimTypes.Email)?.Value
                ?? context.User.FindFirst(ClaimTypes.Name)?.Value
                ?? context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? "Pumpkin CMS Admin";

            var existingMediaAsset = await databaseService.GetMediaAssetAsync(tenantId, id);
            if (existingMediaAsset == null)
                return Results.NotFound("Media asset not found");

            var preparedMediaAsset = MediaAssetSanitizer.PrepareForUpdate(existingMediaAsset, mediaAsset, tenantId, updatedBy);
            var updatedMediaAsset = await databaseService.UpdateMediaAssetAsync(tenantId, existingMediaAsset.Id, preparedMediaAsset);
            return Results.Ok(updatedMediaAsset);
        }
        catch (ArgumentException ex)
        {
            return Results.BadRequest(ex.Message);
        }
        catch (KeyNotFoundException ex)
        {
            return Results.NotFound(ex.Message);
        }
        catch (UnauthorizedAccessException)
        {
            return Results.Forbid();
        }
        catch (Exception ex)
        {
            return Results.Problem($"Error updating media asset: {ex.Message}");
        }
    })
    .RequireAuthorization()
    .WithTags("Admin - Media Assets")
    .WithName("UpdateMediaAsset")
    .WithSummary("Update media asset metadata")
    .WithDescription("Updates safe media metadata only. Does not hard delete assets, deploy, or alter Cloudflare.");

// Admin: Archive media asset without hard deleting it
app.MapPost("/api/admin/{tenantId}/media-assets/{id}/archive",
    async (IDatabaseService databaseService, string tenantId, string id, HttpContext context) =>
    {
        if (context.User?.Identity?.IsAuthenticated != true)
            return Results.Unauthorized();

        var userTenantId = context.User.FindFirst("tenantId")?.Value;
        var userRole = context.User.FindFirst(ClaimTypes.Role)?.Value;

        if (string.IsNullOrEmpty(userTenantId))
            return Results.BadRequest("User tenant ID not found in token");

        if (tenantId != userTenantId && userRole != "SuperAdmin")
            return Results.Forbid();

        try
        {
            var actor = context.User.FindFirst(ClaimTypes.Email)?.Value
                ?? context.User.FindFirst(ClaimTypes.Name)?.Value
                ?? context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? "Pumpkin CMS Admin";
            var existingMediaAsset = await databaseService.GetMediaAssetAsync(tenantId, id);
            if (existingMediaAsset == null)
                return Results.NotFound("Media asset not found");

            existingMediaAsset.Status = "archived";
            existingMediaAsset.ArchivedAt = DateTime.UtcNow.ToString("O");
            existingMediaAsset.ArchivedBy = actor;
            var preparedMediaAsset = MediaAssetSanitizer.PrepareForUpdate(existingMediaAsset, existingMediaAsset, tenantId, actor);
            var updatedMediaAsset = await databaseService.UpdateMediaAssetAsync(tenantId, existingMediaAsset.Id, preparedMediaAsset);
            return Results.Ok(updatedMediaAsset);
        }
        catch (Exception ex)
        {
            return Results.Problem($"Error archiving media asset: {ex.Message}");
        }
    })
    .RequireAuthorization()
    .WithTags("Admin - Media Assets")
    .WithName("ArchiveMediaAsset")
    .WithSummary("Archive media asset")
    .WithDescription("Marks a tenant-scoped media asset as archived. Hard delete is intentionally not exposed.");

// Admin: Restore an archived media asset
app.MapPost("/api/admin/{tenantId}/media-assets/{id}/restore",
    async (IDatabaseService databaseService, string tenantId, string id, HttpContext context) =>
    {
        if (context.User?.Identity?.IsAuthenticated != true)
            return Results.Unauthorized();

        var userTenantId = context.User.FindFirst("tenantId")?.Value;
        var userRole = context.User.FindFirst(ClaimTypes.Role)?.Value;

        if (string.IsNullOrEmpty(userTenantId))
            return Results.BadRequest("User tenant ID not found in token");

        if (tenantId != userTenantId && userRole != "SuperAdmin")
            return Results.Forbid();

        try
        {
            var actor = context.User.FindFirst(ClaimTypes.Email)?.Value
                ?? context.User.FindFirst(ClaimTypes.Name)?.Value
                ?? context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? "Pumpkin CMS Admin";
            var existingMediaAsset = await databaseService.GetMediaAssetAsync(tenantId, id);
            if (existingMediaAsset == null)
                return Results.NotFound("Media asset not found");

            existingMediaAsset.Status = "active";
            existingMediaAsset.ArchivedAt = string.Empty;
            existingMediaAsset.ArchivedBy = string.Empty;
            var preparedMediaAsset = MediaAssetSanitizer.PrepareForUpdate(existingMediaAsset, existingMediaAsset, tenantId, actor);
            var updatedMediaAsset = await databaseService.UpdateMediaAssetAsync(tenantId, existingMediaAsset.Id, preparedMediaAsset);
            return Results.Ok(updatedMediaAsset);
        }
        catch (Exception ex)
        {
            return Results.Problem($"Error restoring media asset: {ex.Message}");
        }
    })
    .RequireAuthorization()
    .WithTags("Admin - Media Assets")
    .WithName("RestoreMediaAsset")
    .WithSummary("Restore media asset")
    .WithDescription("Restores an archived tenant-scoped media asset to active status.");

// Admin: Mark a media asset as replaced by another tenant-scoped media asset
app.MapPost("/api/admin/{tenantId}/media-assets/{id}/replace",
    async (IDatabaseService databaseService, string tenantId, string id, HttpContext context) =>
    {
        if (context.User?.Identity?.IsAuthenticated != true)
            return Results.Unauthorized();

        var userTenantId = context.User.FindFirst("tenantId")?.Value;
        var userRole = context.User.FindFirst(ClaimTypes.Role)?.Value;

        if (string.IsNullOrEmpty(userTenantId))
            return Results.BadRequest("User tenant ID not found in token");

        if (tenantId != userTenantId && userRole != "SuperAdmin")
            return Results.Forbid();

        try
        {
            var payload = await System.Text.Json.JsonSerializer.DeserializeAsync<Dictionary<string, string>>(context.Request.Body, cancellationToken: context.RequestAborted)
                ?? new Dictionary<string, string>();
            payload.TryGetValue("replacementMediaAssetId", out var replacementMediaAssetId);
            if (string.IsNullOrWhiteSpace(replacementMediaAssetId))
                return Results.BadRequest("replacementMediaAssetId is required.");

            var actor = context.User.FindFirst(ClaimTypes.Email)?.Value
                ?? context.User.FindFirst(ClaimTypes.Name)?.Value
                ?? context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? "Pumpkin CMS Admin";
            var existingMediaAsset = await databaseService.GetMediaAssetAsync(tenantId, id);
            if (existingMediaAsset == null)
                return Results.NotFound("Media asset not found");

            var replacementMediaAsset = await databaseService.GetMediaAssetAsync(tenantId, replacementMediaAssetId);
            if (replacementMediaAsset == null)
                return Results.BadRequest("Replacement media asset must exist in the same tenant.");

            existingMediaAsset.Status = "replaced";
            existingMediaAsset.ReplacedByMediaAssetId = replacementMediaAsset.AssetId;
            var preparedMediaAsset = MediaAssetSanitizer.PrepareForUpdate(existingMediaAsset, existingMediaAsset, tenantId, actor);
            var updatedMediaAsset = await databaseService.UpdateMediaAssetAsync(tenantId, existingMediaAsset.Id, preparedMediaAsset);
            return Results.Ok(updatedMediaAsset);
        }
        catch (Exception ex)
        {
            return Results.Problem($"Error replacing media asset: {ex.Message}");
        }
    })
    .RequireAuthorization()
    .WithTags("Admin - Media Assets")
    .WithName("ReplaceMediaAsset")
    .WithSummary("Replace media asset")
    .WithDescription("Marks a media asset as replaced by another tenant-scoped asset without deleting either record.");

// Admin: Get hub pages for a tenant
app.MapGet("/api/admin/tenants/{tenantId}/hubs",
    async (IDatabaseService databaseService, string tenantId, HttpContext context) =>
    {
        // Validate JWT authentication
        if (context.User?.Identity?.IsAuthenticated != true)
        {
            return Results.Unauthorized();
        }

        // Extract user info from JWT claims
        var userTenantId = context.User.FindFirst("tenantId")?.Value;
        var userRole = context.User.FindFirst(ClaimTypes.Role)?.Value;

        if (string.IsNullOrEmpty(userTenantId))
        {
            return Results.BadRequest("User tenant ID not found in token");
        }

        // If requesting different tenant data, verify SuperAdmin role
        if (tenantId != userTenantId && userRole != "SuperAdmin")
        {
            return Results.Forbid();
        }

        return await PumpkinManager.GetHubPagesAsync(databaseService, tenantId);
    })
    .RequireAuthorization()
    .WithTags("Admin")
    .WithName("GetHubPages")
    .WithSummary("Get all hub/pillar pages for a tenant")
    .WithDescription("Retrieves all pages marked as hubs (contentRelationships.isHub = true) for a specific tenant. Requires JWT authentication via Bearer token.");

// Admin: Get spoke pages for a hub
app.MapGet("/api/admin/tenants/{tenantId}/hubs/{hubPageSlug}/spokes",
    async (IDatabaseService databaseService, string tenantId, string hubPageSlug, HttpContext context) =>
    {
        // Validate JWT authentication
        if (context.User?.Identity?.IsAuthenticated != true)
        {
            return Results.Unauthorized();
        }

        // Extract user info from JWT claims
        var userTenantId = context.User.FindFirst("tenantId")?.Value;
        var userRole = context.User.FindFirst(ClaimTypes.Role)?.Value;

        if (string.IsNullOrEmpty(userTenantId))
        {
            return Results.BadRequest("User tenant ID not found in token");
        }

        // If requesting different tenant data, verify SuperAdmin role
        if (tenantId != userTenantId && userRole != "SuperAdmin")
        {
            return Results.Forbid();
        }

        // Decode hubPageSlug in case it's URL encoded
        var decodedHubPageSlug = Uri.UnescapeDataString(hubPageSlug);

        return await PumpkinManager.GetSpokePagesAsync(databaseService, tenantId, decodedHubPageSlug);
    })
    .RequireAuthorization()
    .WithTags("Admin")
    .WithName("GetSpokePages")
    .WithSummary("Get all spoke pages for a hub")
    .WithDescription("Retrieves all spoke/cluster pages linked to a specific hub page, ordered by spokePriority. Requires JWT authentication via Bearer token.");

// Admin: Get complete content hierarchy visualization
app.MapGet("/api/admin/tenants/{tenantId}/content-hierarchy",
    async (IDatabaseService databaseService, string tenantId, HttpContext context) =>
    {
        // Validate JWT authentication
        if (context.User?.Identity?.IsAuthenticated != true)
        {
            return Results.Unauthorized();
        }

        // Extract user info from JWT claims
        var userTenantId = context.User.FindFirst("tenantId")?.Value;
        var userRole = context.User.FindFirst(ClaimTypes.Role)?.Value;

        if (string.IsNullOrEmpty(userTenantId))
        {
            return Results.BadRequest("User tenant ID not found in token");
        }

        // If requesting different tenant data, verify SuperAdmin role
        if (tenantId != userTenantId && userRole != "SuperAdmin")
        {
            return Results.Forbid();
        }

        return await PumpkinManager.GetContentHierarchyAsync(databaseService, tenantId);
    })
    .RequireAuthorization()
    .WithTags("Admin")
    .WithName("GetContentHierarchy")
    .WithSummary("Get complete content hierarchy visualization")
    .WithDescription("Retrieves a comprehensive view of the content architecture including hubs, spokes, clusters, and orphan pages. Perfect for visualizing internal linking structure. Requires JWT authentication via Bearer token.");

// ===== ADMIN: THEME ENDPOINTS =====

// Admin: Get all themes for a tenant
app.MapGet("/api/admin/themes/{tenantId}",
    async (IDatabaseService databaseService, string tenantId, HttpContext context) =>
    {
        if (context.User?.Identity?.IsAuthenticated != true)
            return Results.Unauthorized();

        var userTenantId = context.User.FindFirst("tenantId")?.Value;
        var userRole = context.User.FindFirst(ClaimTypes.Role)?.Value;

        if (string.IsNullOrEmpty(userTenantId))
            return Results.BadRequest("User tenant ID not found in token");

        if (tenantId != userTenantId && userRole != "SuperAdmin")
            return Results.Forbid();

        return await PumpkinManager.GetThemesByTenantAsync(databaseService, tenantId);
    })
    .RequireAuthorization()
    .WithTags("Admin - Themes")
    .WithName("GetThemesByTenant")
    .WithSummary("Get all themes for a tenant")
    .WithDescription("Retrieves all themes for a specific tenant. Requires JWT authentication.");

// Admin: Get the active theme for a tenant
app.MapGet("/api/admin/themes/{tenantId}/active",
    async (IDatabaseService databaseService, string tenantId, HttpContext context) =>
    {
        if (context.User?.Identity?.IsAuthenticated != true)
            return Results.Unauthorized();

        var userTenantId = context.User.FindFirst("tenantId")?.Value;
        var userRole = context.User.FindFirst(ClaimTypes.Role)?.Value;

        if (string.IsNullOrEmpty(userTenantId))
            return Results.BadRequest("User tenant ID not found in token");

        if (tenantId != userTenantId && userRole != "SuperAdmin")
            return Results.Forbid();

        return await PumpkinManager.GetActiveThemeAdminAsync(databaseService, tenantId);
    })
    .RequireAuthorization()
    .WithTags("Admin - Themes")
    .WithName("GetActiveThemeAdmin")
    .WithSummary("Get the active theme for a tenant (admin)")
    .WithDescription("Retrieves the active theme for a tenant. Requires JWT authentication.");

// Admin: Get a specific theme by ID
app.MapGet("/api/admin/themes/{tenantId}/{themeId}",
    async (IDatabaseService databaseService, string tenantId, string themeId, HttpContext context) =>
    {
        if (context.User?.Identity?.IsAuthenticated != true)
            return Results.Unauthorized();

        var userTenantId = context.User.FindFirst("tenantId")?.Value;
        var userRole = context.User.FindFirst(ClaimTypes.Role)?.Value;

        if (string.IsNullOrEmpty(userTenantId))
            return Results.BadRequest("User tenant ID not found in token");

        if (tenantId != userTenantId && userRole != "SuperAdmin")
            return Results.Forbid();

        return await PumpkinManager.GetThemeAdminAsync(databaseService, tenantId, themeId);
    })
    .RequireAuthorization()
    .WithTags("Admin - Themes")
    .WithName("GetThemeAdmin")
    .WithSummary("Get a specific theme by ID (admin)")
    .WithDescription("Retrieves a specific theme by its ID. Returns full theme including header, footer, block styles, and menu. Requires JWT authentication.");

// Admin: Create a new theme
app.MapPost("/api/admin/themes/{tenantId}",
    async (IDatabaseService databaseService, string tenantId, Theme theme, HttpContext context) =>
    {
        if (context.User?.Identity?.IsAuthenticated != true)
            return Results.Unauthorized();

        var userTenantId = context.User.FindFirst("tenantId")?.Value;
        var userRole = context.User.FindFirst(ClaimTypes.Role)?.Value;

        if (string.IsNullOrEmpty(userTenantId))
            return Results.BadRequest("User tenant ID not found in token");

        if (tenantId != userTenantId && userRole != "SuperAdmin")
            return Results.Forbid();

        return await PumpkinManager.CreateThemeAsync(databaseService, tenantId, theme);
    })
    .RequireAuthorization()
    .WithTags("Admin - Themes")
    .WithName("CreateTheme")
    .WithSummary("Create a new theme")
    .WithDescription("Creates a new theme for a specific tenant. Requires JWT authentication.");

// Admin: Update an existing theme
app.MapPut("/api/admin/themes/{tenantId}/{themeId}",
    async (IDatabaseService databaseService, string tenantId, string themeId, Theme theme, HttpContext context) =>
    {
        if (context.User?.Identity?.IsAuthenticated != true)
            return Results.Unauthorized();

        var userTenantId = context.User.FindFirst("tenantId")?.Value;
        var userRole = context.User.FindFirst(ClaimTypes.Role)?.Value;

        if (string.IsNullOrEmpty(userTenantId))
            return Results.BadRequest("User tenant ID not found in token");

        if (tenantId != userTenantId && userRole != "SuperAdmin")
            return Results.Forbid();

        return await PumpkinManager.UpdateThemeAsync(databaseService, tenantId, themeId, theme);
    })
    .RequireAuthorization()
    .WithTags("Admin - Themes")
    .WithName("UpdateTheme")
    .WithSummary("Update an existing theme")
    .WithDescription("Updates a theme by ID for a specific tenant. Requires JWT authentication.");

// Admin: Delete a theme
app.MapDelete("/api/admin/themes/{tenantId}/{themeId}",
    async (IDatabaseService databaseService, string tenantId, string themeId, HttpContext context) =>
    {
        if (context.User?.Identity?.IsAuthenticated != true)
            return Results.Unauthorized();

        var userTenantId = context.User.FindFirst("tenantId")?.Value;
        var userRole = context.User.FindFirst(ClaimTypes.Role)?.Value;

        if (string.IsNullOrEmpty(userTenantId))
            return Results.BadRequest("User tenant ID not found in token");

        if (tenantId != userTenantId && userRole != "SuperAdmin")
            return Results.Forbid();

        return await PumpkinManager.DeleteThemeAsync(databaseService, tenantId, themeId);
    })
    .RequireAuthorization()
    .WithTags("Admin - Themes")
    .WithName("DeleteTheme")
    .WithSummary("Delete a theme")
    .WithDescription("Deletes a theme by ID for a specific tenant. Requires JWT authentication.");

app.Run();
