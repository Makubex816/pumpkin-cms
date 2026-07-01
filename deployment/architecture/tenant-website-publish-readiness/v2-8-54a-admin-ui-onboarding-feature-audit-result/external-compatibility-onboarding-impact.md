# External Compatibility Onboarding Impact

V2.8.53S established the external SDI-AI compatibility baseline that real tenant onboarding must preserve.

Required onboarding impacts:

- The external reference repository remains immutable for current-build work.
- Current build adapts through compatibility aliases rather than changing the external repo or dependent external systems.
- Public submit aliases must remain represented in package and form planning.
- Admin FormEntry aliases must remain represented in readback planning.
- Live container contract uses singular Pascal-style names and must not be renamed without a separate migration approval.
- Hard-locked external values must be preserved during real tenant intake.

Relevant durable docs:

- `deployment/architecture/pumpkin-platform/PUMPKIN_IMMUTABLE_EXTERNAL_CONTRACT_V2_8_53S.md`
- `deployment/architecture/pumpkin-platform/PUMPKIN_HARD_LOCKED_EXTERNAL_VALUES_V2_8_53S.md`
- `deployment/architecture/pumpkin-platform/PUMPKIN_EXTERNAL_ADAPTER_MAP_V2_8_53S.md`
- `deployment/architecture/pumpkin-platform/PUMPKIN_CURRENT_LIVE_CONTAINER_CONTRACT_V2_8_53S.md`
- `deployment/architecture/pumpkin-platform/PUMPKIN_SECONDARY_TENANT_COMPATIBILITY_PRECONDITIONS_V2_8_53S.md`

Current status: api_workflow_proven from V2.8.53S, with no external mutation in V2.8.54A.

