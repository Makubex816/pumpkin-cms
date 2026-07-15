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

    public bool IsSafeV2_8_63A => !Enabled && !DualWriteEnabled && !RenameExecutionEnabled &&
        !MigrationExecutionEnabled && !ExternalNotificationProviderEnabled;
}
