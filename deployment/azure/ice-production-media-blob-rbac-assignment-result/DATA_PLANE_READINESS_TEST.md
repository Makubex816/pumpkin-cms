# Data-Plane Readiness Test

Generated: 2026-06-04

## Auth Mode

All data-plane checks used:

```text
--auth-mode login
```

No key auth was used.

## Container Exists Test

Command:

```powershell
az storage container exists --account-name iceskatingmedia --name ice-rink-rentals-media --auth-mode login --query "{exists:exists}" -o table
```

Result:

```text
Exists: True
```

## Blob List Test

The Windows Azure CLI wrapper had previously had trouble with the exact `length(@)` query syntax, so the validation used a read-only blob-name query and counted the returned array locally without printing blob names:

```powershell
az storage blob list --account-name iceskatingmedia --container-name ice-rink-rentals-media --auth-mode login --query "[].name" -o json
```

Result:

```text
attempt=1 blobListSucceeded=False
attempt=2 blobListSucceeded=False
attempt=3 blobListSucceeded=True blobCount=0
```

## Interpretation

The first two blob-list attempts failed while the role assignment propagated. The third attempt succeeded.

Blob data-plane upload readiness:

```text
yes
```

Media upload readiness:

```text
pending explicit approval
```

## Safety Result

No blobs were uploaded.

No blob names were printed.

No storage keys, connection strings, or SAS URLs were requested or printed.
