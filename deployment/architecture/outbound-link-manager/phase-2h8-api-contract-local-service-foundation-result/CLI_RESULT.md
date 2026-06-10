# CLI Result

CLI commands added:

- `api-list-links`
- `api-get-link`
- `api-list-instances`
- `api-list-policies`
- `api-list-scan-runs`
- `api-list-audit`
- `api-dashboard-summary`
- `api-request-write`
- `validate-api-response`

Validated commands:

```powershell
node src/outbound-link-cli.mjs api-list-links --store .tmp/test-api-contract-local-service/local-store-merged --tenant fixture-tenant --site fixture-site --out .tmp/test-api-contract-local-service/cli-list-links
node src/outbound-link-cli.mjs api-dashboard-summary --store .tmp/test-api-contract-local-service/local-store-merged --tenant fixture-tenant --site fixture-site --out .tmp/test-api-contract-local-service/cli-dashboard-summary
node src/outbound-link-cli.mjs api-request-write --store .tmp/test-api-contract-local-service/local-store-merged --action set-link-status --tenant fixture-tenant --site fixture-site --out .tmp/test-api-contract-local-service/cli-write-blocked
node src/outbound-link-cli.mjs validate-api-response --response .tmp/test-api-contract-local-service/cli-list-links
```

All generated CLI outputs remain under ignored `.tmp`.

