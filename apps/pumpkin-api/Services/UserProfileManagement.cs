using pumpkin_net_models.Models;
using System.Text.RegularExpressions;

namespace pumpkin_api.Services;

public sealed class AdminUserProfileResponse
{
    public required string Id { get; set; }
    public required string TenantId { get; set; }
    public required string Email { get; set; }
    public required string Username { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public required string DisplayName { get; set; }
    public required string Role { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedDate { get; set; }
    public DateTime? LastLogin { get; set; }
    public List<string> Permissions { get; set; } = new();
}

public sealed class UpdateUserProfileRequest
{
    public string Email { get; set; } = string.Empty;
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
}

public sealed class ChangeUserPasswordRequest
{
    public string CurrentPassword { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}

public enum UserProfileUpdateStatus
{
    Updated,
    BadRequest,
    NotFound,
    Conflict
}

public enum UserPasswordUpdateStatus
{
    Updated,
    BadRequest,
    NotFound,
    CurrentPasswordRejected
}

public sealed record UserProfileUpdateResult(
    UserProfileUpdateStatus Status,
    AdminUserProfileResponse? User = null,
    string? Message = null);

public sealed record UserPasswordUpdateResult(
    UserPasswordUpdateStatus Status,
    AdminUserProfileResponse? User = null,
    string? Message = null);

public static class UserProfileManagementService
{
    private static readonly Regex EmailPattern = new(
        @"^[^@\s]+@[^@\s]+\.[^@\s]+$",
        RegexOptions.Compiled | RegexOptions.CultureInvariant);

    public static bool IsSuperAdminRole(string? role)
    {
        return string.Equals(role, UserRole.SuperAdmin.ToString(), StringComparison.Ordinal);
    }

    public static AdminUserProfileResponse ToResponse(User user)
    {
        return new AdminUserProfileResponse
        {
            Id = user.Id,
            TenantId = user.TenantId,
            Email = user.Email,
            Username = user.Username,
            FirstName = user.FirstName,
            LastName = user.LastName,
            DisplayName = BuildDisplayName(user),
            Role = user.Role.ToString(),
            IsActive = user.IsActive,
            CreatedDate = user.CreatedDate,
            LastLogin = user.LastLogin,
            Permissions = user.Permissions.ToList()
        };
    }

    public static async Task<List<AdminUserProfileResponse>> ListUsersAsync(
        IDatabaseService databaseService,
        string? tenantId = null)
    {
        var users = await databaseService.GetUsersAsync(NormalizeOptionalTenantId(tenantId));
        return users.Select(ToResponse).ToList();
    }

    public static async Task<UserProfileUpdateResult> UpdateUserProfileAsync(
        IDatabaseService databaseService,
        string tenantId,
        string userId,
        UpdateUserProfileRequest request)
    {
        var normalizedTenantId = NormalizeTenantId(tenantId);
        if (string.IsNullOrWhiteSpace(normalizedTenantId))
        {
            return BadRequest("Tenant ID is required.");
        }

        if (string.IsNullOrWhiteSpace(userId))
        {
            return BadRequest("User ID is required.");
        }

        var normalizedEmail = NormalizeEmail(request.Email);
        if (!IsValidEmail(normalizedEmail))
        {
            return BadRequest("Email is invalid.");
        }

        var user = await databaseService.GetUserByIdAsync(normalizedTenantId, userId);
        if (user == null)
        {
            return new UserProfileUpdateResult(
                UserProfileUpdateStatus.NotFound,
                Message: "User was not found.");
        }

        var existingEmailUser = await databaseService.GetUserByEmailAsync(normalizedEmail);
        if (existingEmailUser != null &&
            (!string.Equals(existingEmailUser.Id, user.Id, StringComparison.Ordinal) ||
             !string.Equals(existingEmailUser.TenantId, user.TenantId, StringComparison.OrdinalIgnoreCase)))
        {
            return new UserProfileUpdateResult(
                UserProfileUpdateStatus.Conflict,
                Message: "A user with that email already exists.");
        }

        user.Email = normalizedEmail;
        user.FirstName = NormalizeOptionalText(request.FirstName);
        user.LastName = NormalizeOptionalText(request.LastName);

        var updated = await databaseService.UpdateUserAsync(user);
        return new UserProfileUpdateResult(
            UserProfileUpdateStatus.Updated,
            ToResponse(updated));
    }

    public static async Task<UserPasswordUpdateResult> ChangeUserPasswordAsync(
        IDatabaseService databaseService,
        string tenantId,
        string userId,
        ChangeUserPasswordRequest request)
    {
        var normalizedTenantId = NormalizeTenantId(tenantId);
        if (string.IsNullOrWhiteSpace(normalizedTenantId))
        {
            return PasswordBadRequest("Tenant ID is required.");
        }

        if (string.IsNullOrWhiteSpace(userId))
        {
            return PasswordBadRequest("User ID is required.");
        }

        var validationError = ValidatePasswordRequest(request);
        if (validationError != null)
        {
            return PasswordBadRequest(validationError);
        }

        var user = await databaseService.GetUserByIdAsync(normalizedTenantId, userId);
        if (user == null)
        {
            return new UserPasswordUpdateResult(
                UserPasswordUpdateStatus.NotFound,
                Message: "User was not found.");
        }

        if (!user.IsActive || !BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash))
        {
            return new UserPasswordUpdateResult(
                UserPasswordUpdateStatus.CurrentPasswordRejected,
                Message: "Current password was rejected.");
        }

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);

        var updated = await databaseService.UpdateUserAsync(user);
        return new UserPasswordUpdateResult(
            UserPasswordUpdateStatus.Updated,
            ToResponse(updated));
    }

    private static UserProfileUpdateResult BadRequest(string message)
    {
        return new UserProfileUpdateResult(UserProfileUpdateStatus.BadRequest, Message: message);
    }

    private static UserPasswordUpdateResult PasswordBadRequest(string message)
    {
        return new UserPasswordUpdateResult(UserPasswordUpdateStatus.BadRequest, Message: message);
    }

    private static string? ValidatePasswordRequest(ChangeUserPasswordRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.CurrentPassword))
        {
            return "Current password is required.";
        }

        if (string.IsNullOrWhiteSpace(request.NewPassword))
        {
            return "New password is required.";
        }

        if (request.NewPassword.Length < 12)
        {
            return "New password must be at least 12 characters.";
        }

        if (request.NewPassword == request.CurrentPassword)
        {
            return "New password must differ from current password.";
        }

        return null;
    }

    private static string BuildDisplayName(User user)
    {
        var parts = new[] { user.FirstName, user.LastName }
            .Where(part => !string.IsNullOrWhiteSpace(part))
            .Select(part => part!.Trim());
        var displayName = string.Join(" ", parts);
        return string.IsNullOrWhiteSpace(displayName) ? user.Username : displayName;
    }

    private static bool IsValidEmail(string email)
    {
        return !string.IsNullOrWhiteSpace(email) && EmailPattern.IsMatch(email);
    }

    private static string NormalizeTenantId(string tenantId)
    {
        return tenantId.Trim().ToLowerInvariant();
    }

    private static string? NormalizeOptionalTenantId(string? tenantId)
    {
        return string.IsNullOrWhiteSpace(tenantId) ? null : NormalizeTenantId(tenantId);
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
