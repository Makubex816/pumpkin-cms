# Azure Resource Inventory Plan

The registry should track Azure resources by non-secret identifiers.

## Resource Families

- Subscription
- Resource group
- Cosmos account
- Cosmos database
- Cosmos container
- Storage account
- Storage container
- Static web app
- Function app
- Managed identity
- Role assignment reference

## Fields

- Azure environment
- Subscription ID or approved subscription hint
- Subscription display name
- Tenant ID if approved for non-secret registry use
- Resource group name
- Region
- Provider namespace
- Resource type
- Resource name
- Resource ID
- Provisioning status
- Last readback status
- Related tenant/site/runtime profiles
- Credential references

## Ice Known Non-Secret Entries

- Subscription: `Azure subscription 1`
- Subscription ID: `ff887def-fd83-4a19-9298-13d4b1687873`
- Azure tenant ID: `38b16667-a82c-4ff8-98d8-aeebbec4536a`
- Resource group: `rg-ice-production-cosmos`
- Region: `eastus`

## Future Validation

Future read-only inventory refresh must be separately approved before any Azure command runs.

