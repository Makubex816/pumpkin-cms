# Support Packet Result

Support packet export is implemented through the existing offline validator.

## Command

```powershell
node src/builder-cli.mjs --answers fixtures/example-event-rentals.answers.json --out .tmp/generated-example --validate --support-packet
```

## Local Files Written

The support packet run writes these local report files into the generated package folder:

- `validation-report.json`
- `VALIDATION_REPORT.md`
- `support-packet.json`
- `OPERATOR_HANDOFF.md`
- `NON_TECHNICAL_SUMMARY.md`
- `NEXT_ACTIONS.md`
- `PACKAGE_FILE_INVENTORY.md`

## Boundary

The support packet is local file output only. It does not send email, create tickets, upload files, create tenants, write CMS data, change deployment infrastructure, submit sitemaps, request indexing, or perform external checks.
