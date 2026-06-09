# Risk Register

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Database artifact contains sensitive data | Credential/customer data exposure | Encrypt, access-limit, never stage, checksum, retention cleanup |
| Connection string handling leaks | Secret exposure | Prefer Azure identity; if unavoidable, env-only presence checks and no logging |
| Export runs during incompatible migration | Inconsistent backup | require operator migration hold and timestamp capture |
| Media blobs are copied without license/access review | Compliance issue | treat media as sensitive, private output only |
| SAS/storage keys are written to reports | Secret exposure | redact and scan generated files |
| Output path is outside ignored `.tmp` | accidental Git exposure | path guard and Git ignore check before execution |
| Media metadata count does not match copied blobs | incomplete restore | validator count comparison and failure report |
| Platform evidence is mistaken for portable restore proof | false readiness | classify evidence-only mode as partial unless owner waives artifact requirement |
| Restore validation is skipped | unproven backup | require validator and restore dry-run before go/no-go |
| Live systems are accidentally mutated | production incident | dry-run/sandbox boundary and explicit no-write gates |

