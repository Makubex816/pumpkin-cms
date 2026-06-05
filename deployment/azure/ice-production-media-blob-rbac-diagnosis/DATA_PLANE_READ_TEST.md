# Data-Plane Read Test

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

## Container Show Test

Command:

```powershell
az storage container show --account-name iceskatingmedia --name ice-rink-rentals-media --auth-mode login --query "{name:name, leaseState:properties.lease.state}" -o table
```

Result:

```text
Name: ice-rink-rentals-media
Lease state: available
```

## Blob List Test

Command:

```powershell
az storage blob list --account-name iceskatingmedia --container-name ice-rink-rentals-media --auth-mode login --num-results 1 --query "[].{name:name}" -o table
```

Result:

```text
FAILED
```

Error category:

```text
insufficient Blob data-plane permissions for the current principal
```

Azure CLI indicated one of the Storage Blob data roles is required for the operation. It also suggested key auth as an alternative, but key auth was not used.

## Interpretation

The current principal can verify the container exists with login auth, but cannot list blobs with login auth.

Blob data-plane upload readiness:

```text
no
```

## Safety Result

No blobs were uploaded.

No storage keys, connection strings, or SAS URLs were requested or printed.
