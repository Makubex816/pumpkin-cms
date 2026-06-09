# Risk Register

| Risk | Impact | Likelihood | Mitigation |
| --- | --- | --- | --- |
| Cosmos provider assumption is wrong | Database connector points at wrong source | Medium | Keep provider discovery first and treat Azure SQL as fallback only with evidence. |
| Tenant scope is ambiguous | Cross-tenant data could be exported | Medium | Require tenant/site scope before any export. Abort on ambiguity. |
| Platform backup evidence is mistaken for portable backup | Restore proof is overstated | Medium | Require separate status fields for platform evidence and portable JSON export. |
| Cosmos containers contain PII or auth records | Standard backup may include sensitive data | Medium | Classify collections and require owner decisions for sensitive classes. |
| Media metadata does not map cleanly to blob names | Restored pages may have broken media | Medium | Build and validate explicit MediaAsset-to-blob map. |
| Blob inventory is huge | Backup may be slow or expensive | Medium | Support scoped inventory, paging, progress reports, and copy planning before copy. |
| Public URLs differ from storage blob paths | Blob copy may miss assets | Medium | Normalize public host URLs and storage paths through tested mapping rules. |
| Protected config is accidentally read | Secret exposure | Low | Ban protected config sources and validate paths before command execution. |
| Env values leak in logs | Secret exposure | Low | Presence-only checks and redacted reports. |
| Generated backup artifacts are staged | Large or sensitive files enter Git | Medium | Keep outputs under ignored `.tmp` and add staged-path checks to operator workflow. |
| Restore plan implies real restore approval | Operator confusion | Low | Mark restore output as dry-run only until separate approval. |

## Current Risk Posture

Phase 2F-10B lowers planning risk by correcting the database direction and defining explicit connector contracts. It does not reduce production backup incompleteness because no implementation, export, or media copy is performed in this phase.
