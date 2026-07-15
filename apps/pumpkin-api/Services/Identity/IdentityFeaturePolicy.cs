namespace pumpkin_api.Services.Identity;

public static class IdentityFeaturePolicy
{
    public static bool Foundation(IdentityFeatureOptions options) => options.Enabled;
    public static bool ManagementRead(IdentityFeatureOptions options) =>
        Foundation(options) && options.DualReadEnabled && options.ManagementEnabled;
    public static bool ManagementMutation(IdentityFeatureOptions options) =>
        ManagementRead(options) && options.DualWriteEnabled;
    public static bool TenantSwitcher(IdentityFeatureOptions options) =>
        ManagementMutation(options) && options.TenantSwitcherEnabled;
    public static bool PasswordAndSessions(IdentityFeatureOptions options) =>
        ManagementMutation(options) && options.PasswordAndSessionManagementEnabled;
    public static bool Memberships(IdentityFeatureOptions options) =>
        ManagementMutation(options) && options.MembershipManagementEnabled;
    public static bool Contacts(IdentityFeatureOptions options) =>
        ManagementMutation(options) && options.ContactManagementEnabled;
    public static bool SuperAdmin(IdentityFeatureOptions options) =>
        ManagementMutation(options) && options.SuperAdminManagementEnabled;
    public static bool ProviderAwareEmail(IdentityFeatureOptions options) =>
        ManagementMutation(options) && options.ProviderAwareEmailRequestsEnabled;
}
