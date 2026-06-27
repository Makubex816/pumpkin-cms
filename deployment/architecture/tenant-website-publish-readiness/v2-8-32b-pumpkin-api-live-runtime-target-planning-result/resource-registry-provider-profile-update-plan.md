# Resource Registry Provider Profile Update Plan

## Current provider metadata source state

`ProviderMetadataService` reports the Ice profile as:

- `profile`: `future-target-cosmos-provisioned`
- `providerType`: `cosmos`
- `providerStatus`: `future-target`
- `provisioningStatus`: `provisioned`
- `runtimeStatus`: `metadata-endpoint-runtime-wiring-required`
- account: `cosmos-pumpkin-prod-eastus`
- database: `pumpkin-prod-cms`
- secret material included flag is `false`

## Update trigger

Update Resource Registry and provider profile only after:

1. New App Service host exists.
2. Pumpkin API deploy passes health.
3. Provider metadata is returned from the live API.
4. Admin read-only form-entry list succeeds.
5. Isolated static contact write-read proof succeeds.

## Planned registry additions

| Field | Planned value |
| --- | --- |
| API runtime resource id | Web App resource id for `app-pumpkin-api-prod-eastus-001` |
| API base URL | `https://app-pumpkin-api-prod-eastus-001.azurewebsites.net` |
| Runtime status | `live-bound-after-qa` only after proof |
| Provider status | `production-cosmos-bound` only after proof |
| Binding consumers | Admin, isolated static contact, production static contact after approval |
| Secret status | `secrets-excluded` |

## Do not update early

Do not mark the provider profile live-bound at API host creation alone. It must wait for health, provider metadata, Admin read, and isolated write-read proof.
