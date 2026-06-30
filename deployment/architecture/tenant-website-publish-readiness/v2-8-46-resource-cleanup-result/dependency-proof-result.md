# Dependency Proof Result

Dependency proof result: pass for primary empty fallback cleanup, defer for legacy static form endpoint.

Repo/source search:

| Candidate | Total reference files | Non-doc/source reference files | Interpretation |
| --- | ---: | ---: | --- |
| `rg-pumpkin-api-prod-eastus` | 58 | 0 | Historical East US Pumpkin API target/fallback docs; V2.8.35 cleanup candidate |
| `rg-pumpkin-api-prod-eastus2` | 8 | 0 | Historical East US 2 fallback docs; V2.8.35 cleanup candidate |
| `rg-ice-static-form-endpoint` | 67 | 0 | Historical/current legacy static form endpoint docs and registry records |

Current registry-style evidence from V2.8.35:

- `rg-pumpkin-api-prod-eastus`: empty fallback group.
- `rg-pumpkin-api-prod-eastus2`: empty fallback group.
- `rg-ice-static-form-endpoint`: running Function App, plan, and storage remain.

Decision:

- Delete the two primary groups only after empty-list and lock proof.
- Defer `rg-ice-static-form-endpoint` because it is non-empty and referenced as a legacy stack.
