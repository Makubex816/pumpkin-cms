# Remediation Options

Generated: 2026-06-06

## Option A: Rotate Exposed Storage Key And Update Function Settings

Recommended.

Future Azure mutations required:

- identify the exposed storage account key without printing key material
- rotate the exposed key for `iceforms20260605`
- update only the affected storage connection settings for `func-ice-static-contact-20260605`
- restart the Function App only if required
- validate the endpoint in dry-run/no-email mode

Affected setting names:

- `AzureWebJobsStorage`
- `WEBSITE_CONTENTAZUREFILECONNECTIONSTRING`
- `AzureWebJobsDashboard`

Risk:

- brief Function downtime during setting update/restart
- runtime failure if one storage connection setting is missed or malformed

Rollback:

- use the non-rotated storage account key to rebuild the Function storage connection settings
- restore only the affected setting names
- restart and revalidate

## Option B: Migrate To Identity-Based Storage Settings

Possible later, not recommended as the immediate remediation.

Future Azure mutations required:

- enable or confirm a managed identity for the Function App
- grant the required storage data-plane roles to that identity
- replace connection-string settings with identity-based storage setting names
- validate Functions host startup and trigger/runtime storage behavior

Risk:

- larger change surface than a key rotation
- role propagation delay
- possible Functions host startup errors if any storage role or setting is missing

Rollback:

- restore connection-string settings from approved secure source
- restart and revalidate

## Option C: Recreate Function Runtime Storage

Not recommended unless key rotation cannot be performed safely.

Future Azure mutations required:

- create replacement storage resources
- update Function runtime/content storage settings
- migrate or accept loss of runtime artifacts as applicable
- restart and validate

Risk:

- highest downtime and configuration risk
- possible loss of host/runtime state artifacts

Rollback:

- restore previous storage settings from approved secure source if still safe
- or complete cutover to replacement storage

## Option D: Document Only, No Rotation

Not recommended.

Risk:

- leaves an exposed live storage account key valid
- keeps real email delivery readiness blocked

