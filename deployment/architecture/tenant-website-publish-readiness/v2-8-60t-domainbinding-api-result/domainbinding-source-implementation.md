# DomainBinding Source Implementation

Status: completed.

Source files added:

- `apps/pumpkin-net-models/Models/DomainBinding.cs`
- `apps/pumpkin-api/Services/DomainBindings/DomainBindingApiContracts.cs`
- `apps/pumpkin-api/Services/DomainBindings/DomainBindingAuthorization.cs`
- `apps/pumpkin-api/Services/DomainBindings/DomainBindingMutation.cs`
- `apps/pumpkin-api/Services/DomainBindings/DomainBindingDnsPacketService.cs`
- `apps/pumpkin-api/Services/DomainBindings/DomainBindingDnsValidationService.cs`
- `apps/pumpkin-api/Services/DomainBindings/DomainBindingEndpoints.cs`
- `apps/pumpkin-api.Tests/DomainBindingSourceTestRunner.cs`
- `packages/pumpkin-ts-models/src/models/DomainBinding.ts`

Source files updated:

- `apps/pumpkin-api/Program.cs`
- `apps/pumpkin-api/Services/IDatabaseService.cs`
- `apps/pumpkin-api/Services/IDataConnection.cs`
- `apps/pumpkin-api/Services/DatabaseService.cs`
- `apps/pumpkin-api/Services/CosmosDataConnection.cs`
- `apps/pumpkin-api/Services/MongoDataConnection.cs`
- `apps/pumpkin-api.Tests/Program.cs`
- `apps/pumpkin-api.Tests/TenantAdminProvisioningSourceTestRunner.cs`
- `apps/pumpkin-api.Tests/UserProfileManagementSourceTestRunner.cs`
- `packages/pumpkin-ts-models/src/index.ts`

Implementation notes:

- DomainBinding is a tenant-partitioned control-plane record.
- API routes enforce SuperAdmin server-side authorization.
- DNS packet generation creates public Azure App Service DNS record requirements only.
- DNS validation is read-only.
- Azure custom-domain binding, TLS binding, promotion, rollback, and Admin UI are not implemented in V2.8.60T.

