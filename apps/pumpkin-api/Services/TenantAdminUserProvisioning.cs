using pumpkin_net_models.Models;

namespace pumpkin_api.Services;

public sealed class CreateTenantAdminUserRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string? Username { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
}

public sealed class TenantAdminUserResponse
{
    public required string Id { get; set; }
    public required string TenantId { get; set; }
    public required string Email { get; set; }
    public required string Username { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public required string Role { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedDate { get; set; }
    public List<string> Permissions { get; set; } = new();
}

public enum TenantAdminUserProvisioningStatus
{
    Created,
    BadRequest,
    TenantNotFound,
    Conflict
}

public sealed record TenantAdminUserProvisioningResult(
    TenantAdminUserProvisioningStatus Status,
    TenantAdminUserResponse? User = null,
    string? Message = null);

public static class TenantAdminUserProvisioningService
{
    public static readonly string[] DefaultTenantAdminPermissions =
    [
        "pages:create",
        "pages:read",
        "pages:update",
        "pages:delete",
        "users:create",
        "users:read",
        "users:update",
        "forms:read"
    ];

    public static bool IsSuperAdminRole(string? role)
    {
        return string.Equals(role, UserRole.SuperAdmin.ToString(), StringComparison.Ordinal);
    }

    public static async Task<TenantAdminUserProvisioningResult> CreateTenantAdminAsync(
        IDatabaseService databaseService,
        string tenantId,
        CreateTenantAdminUserRequest request)
    {
        var normalizedTenantId = NormalizeTenantId(tenantId);
        if (string.IsNullOrWhiteSpace(normalizedTenantId))
        {
            return BadRequest("Tenant ID is required.");
        }

        var validationError = ValidateRequest(request);
        if (validationError != null)
        {
            return BadRequest(validationError);
        }

        var tenant = await databaseService.GetTenantAsync(normalizedTenantId);
        if (tenant == null)
        {
            return new TenantAdminUserProvisioningResult(
                TenantAdminUserProvisioningStatus.TenantNotFound,
                Message: $"Tenant '{normalizedTenantId}' was not found.");
        }

        var normalizedEmail = NormalizeEmail(request.Email);
        var existing = await databaseService.GetUserByEmailAsync(normalizedEmail);
        if (existing != null)
        {
            return new TenantAdminUserProvisioningResult(
                TenantAdminUserProvisioningStatus.Conflict,
                Message: "A user with that email already exists.");
        }

        var user = BuildTenantAdminUser(normalizedTenantId, request);
        var created = await databaseService.CreateUserAsync(user);
        return new TenantAdminUserProvisioningResult(
            TenantAdminUserProvisioningStatus.Created,
            ToResponse(created));
    }

    public static User BuildTenantAdminUser(string tenantId, CreateTenantAdminUserRequest request)
    {
        var normalizedTenantId = NormalizeTenantId(tenantId);
        var normalizedEmail = NormalizeEmail(request.Email);
        var username = string.IsNullOrWhiteSpace(request.Username)
            ? normalizedEmail
            : request.Username.Trim();

        return new User
        {
            Id = Guid.NewGuid().ToString(),
            TenantId = normalizedTenantId,
            Email = normalizedEmail,
            Username = username,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            FirstName = NormalizeOptionalText(request.FirstName),
            LastName = NormalizeOptionalText(request.LastName),
            Role = UserRole.TenantAdmin,
            IsActive = true,
            CreatedDate = DateTime.UtcNow,
            LastLogin = null,
            Permissions = DefaultTenantAdminPermissions.ToList()
        };
    }

    public static TenantAdminUserResponse ToResponse(User user)
    {
        return new TenantAdminUserResponse
        {
            Id = user.Id,
            TenantId = user.TenantId,
            Email = user.Email,
            Username = user.Username,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Role = user.Role.ToString(),
            IsActive = user.IsActive,
            CreatedDate = user.CreatedDate,
            Permissions = user.Permissions.ToList()
        };
    }

    private static TenantAdminUserProvisioningResult BadRequest(string message)
    {
        return new TenantAdminUserProvisioningResult(TenantAdminUserProvisioningStatus.BadRequest, Message: message);
    }

    private static string? ValidateRequest(CreateTenantAdminUserRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email))
        {
            return "Email is required.";
        }

        if (!request.Email.Contains('@', StringComparison.Ordinal))
        {
            return "Email is invalid.";
        }

        if (string.IsNullOrWhiteSpace(request.Password))
        {
            return "Password is required.";
        }

        if (request.Password.Length < 12)
        {
            return "Password must be at least 12 characters.";
        }

        return null;
    }

    private static string NormalizeTenantId(string tenantId)
    {
        return tenantId.Trim().ToLowerInvariant();
    }

    private static string NormalizeEmail(string email)
    {
        return email.Trim().ToLowerInvariant();
    }

    private static string? NormalizeOptionalText(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    }
}
