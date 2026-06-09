# Owner-Confirmed Scope Worksheet

Provide these later as non-secret identifiers only. Do not provide keys, connection strings, tokens, SAS URLs, auth headers, cookies, or protected config values.

| Field | Owner value | Required before |
| --- | --- | --- |
| Azure tenant/directory display name | TBD | provisioning approval |
| Azure subscription display name or approved identifier | TBD | provisioning approval |
| Production resource group name | TBD | provisioning approval |
| Cosmos account name | TBD | provisioning approval |
| Cosmos database name | TBD | provisioning approval |
| Cosmos container names | TBD | provisioning approval |
| Primary region | TBD | provisioning approval |
| Backup policy mode | TBD | provisioning approval |
| Point-in-time restore requirement | TBD | provisioning approval |
| App runtime identity name | TBD | CMS wiring approval |
| Backup read identity name | TBD | live read-only/export preflight |
| Provisioning operator role | TBD | provisioning execution |
| Local-dev profile decision | TBD | provider resolver implementation |
| Live-readonly profile decision | TBD | live verification |

## Scope Decision Outcomes

- `approved`: owner confirms the future Cosmos target scope.
- `revise`: owner changes naming, region, containers, or backup policy.
- `blocked`: owner cannot confirm required non-secret identifiers.

## Required Rule

Owner-confirmed scope is not a credential. It is resource metadata only.
