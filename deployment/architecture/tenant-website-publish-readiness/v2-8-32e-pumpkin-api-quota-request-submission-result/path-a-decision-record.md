# Path A Decision Record

Date: 2026-06-27

## Decision

Path A is selected.

Path A means the Pumpkin API remains on the planned East US Azure App Service target, and the blocker is resolved by waiting for quota approval.

## Rationale

V2.8.32D showed the target resource group exists and the deployment blocker is specifically the East US Total VMs quota limit of `0`.

The minimum required limit is `1`, and the operator-submitted quota request asks for that increase.

## Alternatives Not Selected

| Alternative | Status |
| --- | --- |
| Alternate Azure region | Not selected |
| Alternate App Service SKU | Not selected |
| Alternate hosting target | Not selected |
| Protected provider binding before health deployment | Not selected |
| Contact POST before health deployment | Not selected |

## Result

The deployment retry remains gated on quota approval and renewed approval for V2.8.32D retry.
