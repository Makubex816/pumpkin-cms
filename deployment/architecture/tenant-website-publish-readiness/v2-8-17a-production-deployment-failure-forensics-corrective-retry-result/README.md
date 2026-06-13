# V2.8.17A Production Deployment Failure Forensics Corrective Retry Result

Status: complete; classified `blocked_token_target_ambiguous`.

This package records the V2.8.17A forensic review of the failed V2.8.17 production static deployment attempt for IceSkatingRinkRentals.com. It also records why the approved corrective retry was not sent.

The production target remained exactly `swa-ice-static-staging` in `rg-ice-static-staging`. The static artifact rebuilt and validated locally. The corrective retry stopped because the non-deploying SWA CLI dry-run rejected the current `SWA_CLI_DEPLOYMENT_TOKEN` as invalid.

No production deployment, DNS change, custom-domain mutation, indexing action, contact-form submission, CMS/provider write, Azure infrastructure creation, Azure configuration mutation, protected config read, token print/list/export, keys/listKeys, connection string, SAS, broad retry, or second corrective retry occurred in V2.8.17A.
