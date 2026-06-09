# Provider Resolver Fixtures

## Fixtures

| Fixture | Meaning |
| --- | --- |
| `fixtures/provider-source.cosmos.configured.json` | Safe configured Cosmos metadata. |
| `fixtures/provider-source.ice.missing.json` | Ice current blocker state; no source identified; Cosmos selected as target. |
| `fixtures/provider-source.ice.future-target-cosmos.json` | Ice Cosmos is provisioned as a future target, but CMS runtime wiring and live export remain blocked. |
| `fixtures/provider-source.local-provider.json` | Local development provider, not production proof. |
| `fixtures/provider-source.forbidden-field.json` | Negative fixture proving forbidden fields fail validation. |

## Fixture Boundary

Fixtures contain no real account keys, connection strings, tokens, SAS URLs, protected config values, database documents, blob contents, or CMS payloads.
