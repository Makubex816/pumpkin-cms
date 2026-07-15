namespace pumpkin_api.Services.Identity;

public sealed class IdentityFeatureOptions
{
    public const string SectionName = "IdentityFoundation";
    public bool Enabled { get; set; }
    public bool DualReadEnabled { get; set; }
    public bool DualWriteEnabled { get; set; }
    public bool RenameExecutionEnabled { get; set; }
    public bool MigrationExecutionEnabled { get; set; }
    public bool ExternalNotificationProviderEnabled { get; set; }
    public bool ManagementEnabled { get; set; }
    public bool TenantSwitcherEnabled { get; set; }
    public bool PasswordAndSessionManagementEnabled { get; set; }
    public bool MembershipManagementEnabled { get; set; }
    public bool ContactManagementEnabled { get; set; }
    public bool SuperAdminManagementEnabled { get; set; }
    public bool ProviderAwareEmailRequestsEnabled { get; set; }
    public bool CapacityDiagnosticsEnabled { get; set; }

    public bool IsSafeV2_8_63A => !Enabled && !DualWriteEnabled && !RenameExecutionEnabled &&
        !MigrationExecutionEnabled && !ExternalNotificationProviderEnabled && !ManagementEnabled;
}
