# Risk And Boundary Register

| Risk | Boundary | Required Control |
| --- | --- | --- |
| Backup misses original source package | Backup completeness | Source package registry and checksum reference |
| Backup misses overlay patch | Rebuild drift | Patch/overlay registry |
| Backup contains secrets | Security | Redaction, secret reference schema, exact-value scans |
| FormEntry PII mishandled | Privacy | Protected bundle and explicit restore approval |
| ZIP compiler runs unsafe scripts | Supply-chain/runtime | Copied workspace, scripts disabled by default, explicit render policy |
| ZIP compiler stores raw protected config | Security | Quarantine source, redact output, exclude protected files |
| Operator thinks validation is approval to deploy | Product safety | Disabled future actions and approval gates |
| Responsive issue reaches cutover | UX/regression | Mandatory V2.8.60V responsive gate |
| DomainBinding state not recoverable | Launch recovery | Include DomainBinding and DNS packet state in backup |
| Restore writes wrong tenant | Cross-tenant safety | tenantId hard checks and SuperAdmin approval |

