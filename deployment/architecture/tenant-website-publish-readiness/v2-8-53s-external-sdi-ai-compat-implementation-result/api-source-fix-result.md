# API Source Fix Result

Source files modified:

- `apps/pumpkin-api/Program.cs`
- `apps/pumpkin-api/Managers/PumpkinManager.cs`
- `apps/pumpkin-api/Services/FormSubmissionGuard.cs`
- `apps/pumpkin-api.Tests/Program.cs`
- `apps/pumpkin-api.Tests/ExternalSdiAiCompatibilitySourceTestRunner.cs`

Implementation summary:

- Added route registration for the external public submit alias.
- Added wrapper/flat payload normalization for alias submissions.
- Added Admin FormEntry read aliases with the existing tenant/SuperAdmin authorization boundary.
- Added manager path `SaveFormEntrySubmitAliasAsync`.
- Added dynamic FormDefinition-scoped sanitization while preserving existing default contact/quote guard behavior.
- Added V2.8.53S source regression checks.
