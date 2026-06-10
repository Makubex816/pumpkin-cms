# API Write Action QA Result

API write-action QA generated and validated 14 local/fake/sandbox evidence packages.

Applied local/fake cases:

- approve review decision
- block review decision
- ignore review decision
- disable global link
- disable specific instance
- policy update
- scan-run creation
- bulk domain disable with approval reference
- redacted URL trace case

Blocked cases:

- bulk domain disable without approval reference
- viewer role write attempt
- wrong tenant write attempt
- live-readonly write attempt
- live-write-approved write attempt

Standalone validators:

- all 14 `validate-api-write-preflight` runs passed
- failure count: 0 for each generated package

API build and focused runners:

- `dotnet build pumpkin-api.Tests.csproj -p:BaseOutputPath=bin\phase-2h15-build\`: passed, 0 warnings, 0 errors
- `PumpkinApiTestRunner.dll --phase-2h14`: passed
- `PumpkinApiTestRunner.dll --phase-2h9`: passed
