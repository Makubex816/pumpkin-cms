# Operator Handoff Packet Manifest Contract

Schema version: `pumpkin.operatorHandoffPacket.v1`.

Packet type: `multi_tenant_onboarding_operator_handoff`.

Required fields:

- `handoffPacketId`
- `schemaVersion`
- `packetType`
- `tenantKey`
- `siteKey`
- `domain`
- `tenantState`
- `packageHash`
- `approvalManifestId`
- `executionRunId`
- `targetMode`
- `readbackSummary`
- `entityMappingSummary`
- `operatorProjectionRef`
- `backupCenterRefs`
- `resourceRegistryRefs`
- `providerProfileRefs`
- `runtimeQaRefs`
- `auditJobRefs`
- `olmCarryforwardRefs`
- `hardStops`
- `deferredGates`
- `securityBoundary`
- `redactionPolicy`
- `nextGates`
- `createdAt`

Validator:

`deployment/architecture/multi-tenant-onboarding/import-package-governance-implementation/src/operator-handoff-parity.mjs`

CLI:

`npm run validate-operator-handoff -- fixtures/valid-operator-handoff-ice.operator-handoff.json`
