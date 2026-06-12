# Staging Deployment Target Approval Packet

Status: blocked; exact staging target approval required.

Candidate values from V2.8.4 are planning candidates only:

- candidate staging domain: `ice-dev.iceskatingrinkrentals.com`
- candidate Azure Static Web App: `swa-ice-rink-rentals-staging`
- candidate resource group: `rg-pumpkin-static-staging`

## Required Exact Target Values

| Field | Current state | Required closure |
| --- | --- | --- |
| Staging hostname | candidate only | exact approved hostname |
| Deployment platform | candidate only | exact approved platform |
| Resource group | candidate only | exact approved resource group |
| Target resource name | candidate only | exact approved static site/SWA/storage target |
| Upload root | missing | exact folder root/package mapping |
| Auth mode | missing | safe approved deployment auth mode without keys/listKeys/connection strings/SAS |
| Operator | missing | named operator |
| Approver | missing | named approver |
| Rollback target | missing | rollback package or abort behavior |

No deployment target is approved by V2.8.6.
