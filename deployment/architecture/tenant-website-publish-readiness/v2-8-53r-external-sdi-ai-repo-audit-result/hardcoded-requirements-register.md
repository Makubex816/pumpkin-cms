# Hard-Coded Requirements Register

| Priority | Requirement | Evidence | Required Action |
| --- | --- | --- | --- |
| P0 | Preserve external route contract | External Program routes | Add missing route aliases in current build. |
| P0 | Keep source container compatibility | External/current source use singular container names | Reconcile provider metadata naming before tenant creation. |
| P0 | Make provider metadata tenant-profile driven | Current ProviderMetadataService is Ice-only | Replace hard-coded Ice map with registry-backed metadata. |
| P0 | Make static site keys tenant-profile driven | Current static render mode allows Ice/Roller only | Add package-driven site profile lookup. |
| P0 | Make static contact default tenant-profile driven | Current default endpoint is Ice-only | Use tenant contact package/config. |
| P0 | Make publish profiles tenant-profile driven | Admin publish profiles are Ice/Roller only | Move to tenant package or registry. |
| P1 | Preserve external simplified contact expectations | External contact prompt uses simplified payload | Add adapter/defaulting if needed. |
| P1 | Keep current added models optional | Current models are much wider | Avoid requiring current-only fields for external payloads. |
