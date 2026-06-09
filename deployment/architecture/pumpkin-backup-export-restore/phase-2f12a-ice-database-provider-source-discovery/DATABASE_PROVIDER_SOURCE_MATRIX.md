# Database Provider Source Matrix

| Candidate source | Evidence | Status | Backup decision |
| --- | --- | --- | --- |
| Azure Cosmos DB | Safe Ice production architecture docs identify Cosmos DB; API source defaults/supports `CosmosDb`. | Expected but not proven live | Do not execute live connector until account/database/container scope is identified. |
| MongoDB | API source supports `MongoDb`; no live env/provider hint found. | Possible fallback only | Do not implement/export live Mongo unless runtime provider evidence selects MongoDB. |
| Azure SQL | Prior and current Azure discovery returned no SQL resources in accessible scope. | Not discovered | Keep optional only; do not assume Ice uses SQL. |
| Other Azure database provider | Current Azure provider resource scan returned no `Microsoft.DBfor*` resources. | Not discovered | Treat as possible only if owner confirms or Azure scope changes. |
| Local/provider storage | No source evidence found for Ice production using local storage as DB source. | Not proven | Not acceptable for production restore proof without explicit operator evidence. |
| Undocumented database layer | Live API is reachable, but safe metadata does not reveal provider and auth verify returned `401`. | Possible blocker | Resolve with owner-confirmed source or a safe provider metadata endpoint. |

## Current Classification

Database provider source identified: partial.

The intended provider direction is Cosmos DB, but the live resource identity is not identified.
