# Isolated Staging Target Verification

Result: pass.

Command class:

- Read-only Azure Static Web Apps metadata and hostname checks.

Observed isolated staging metadata:

- Name: `swa-ice-static-isolated-staging`
- Resource group: `rg-ice-static-staging`
- Default hostname: `kind-island-0a85a740f.7.azurestaticapps.net`
- Location: `East US 2`
- SKU tier: `Free`
- Custom domains: `[]`

Conclusion:

The isolated staging target exists, has no custom domains attached, and is the only deployment target used by V2.8.19G.
