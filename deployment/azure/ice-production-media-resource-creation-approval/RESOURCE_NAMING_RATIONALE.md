# Resource Naming Rationale

Generated: 2026-06-04

## Resource Group

Proposed resource group:

```text
rg-ice-production-media
```

Rationale:

- readable in Azure portal and CLI listings
- Ice-specific
- scoped to production media
- avoids Roller or unrelated Pumpkin resources
- uses a conventional `rg-` prefix

## Storage Account

Proposed storage account:

```text
iceskatingmedia
```

Azure Storage account naming constraints:

- 3 to 24 characters
- lowercase letters and numbers only
- globally unique
- no hyphens
- no underscores

Constraint check:

| Constraint | Result |
| --- | --- |
| 3 to 24 characters | yes, 15 characters |
| lowercase letters/numbers only | yes |
| no hyphens or underscores | yes |
| globally unique | unknown until future approved Azure check/create |

Rationale:

- matches the IceSkatingRinkRentals.com media purpose
- short enough to leave room for Azure endpoint prefixes/suffixes in docs
- avoids dates that could imply rotation
- avoids customer data, secrets, tenant IDs, and subscription identifiers

## Blob Container

Proposed Blob container:

```text
ice-rink-rentals-media
```

Azure Blob container naming constraints:

- 3 to 63 characters
- lowercase letters, numbers, and hyphens
- starts and ends with a letter or number
- no consecutive hyphens

Constraint check:

| Constraint | Result |
| --- | --- |
| 3 to 63 characters | yes, 22 characters |
| lowercase letters/numbers/hyphens only | yes |
| starts and ends with letter or number | yes |
| no consecutive hyphens | yes |

Rationale:

- reuses the existing Ice site slug
- makes the container purpose clear
- aligns with the target Blob path prefix `ice-rink-rentals/assets/...`

## Region

Proposed region:

```text
eastus
```

Rationale:

- suitable default US East region for the Ice production media origin
- simple Azure CLI location identifier
- keeps the resource plan concrete for approval

Uncertainty:

- final region should be approved by the user before creation
- if a billing, compliance, latency, or existing-subscription policy requires another region, stop and update this package before creation
